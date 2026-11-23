const { supabaseAdmin } = require('../config/supabaseAdmin');
const { getRazorpayClient, isRazorpayConfigured } = require('../config/razorpay');
const { signTicketToken } = require('../utils/ticketSigner');
const { logEventAudit, formatEvent, isUuid } = require('../utils/eventAudit');
const { sendRegistrationConfirmation } = require('../utils/whatsappService');

// Helper: Generate unique ticket code via Postgres sequence RPC with safe fallback
const generateUniqueTicketCode = async () => {
  const { data, error } = await supabaseAdmin.rpc('generate_event_ticket_code');
  if (!error && data) return data;
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `EVT-${year}-${rand}`;
};

// Helper: Read featured event IDs from content table for 100% resilient persistence
const getFeaturedIdsHelper = async () => {
  try {
    const { data } = await supabaseAdmin.from('content').select('banner_url').eq('id', 'main').single();
    if (data && data.banner_url) {
      const parsed = JSON.parse(data.banner_url);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
};

// --- Public: List Published Events ---
const getPublicEvents = async (req, res) => {
  try {
    const [eventsRes, featuredIds] = await Promise.all([
      supabaseAdmin
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('event_date', { ascending: true, nullsFirst: false }),
      getFeaturedIdsHelper(),
    ]);

    if (eventsRes.error) throw eventsRes.error;
    res.json((eventsRes.data || []).map((ev) => formatEvent(ev, featuredIds)));
  } catch (err) {
    console.error('[getPublicEvents]', err);
    res.status(500).json({ error: err.message || 'Failed to load published events' });
  }
};

// --- Public: Single Published Event ---
const getPublicEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const [eventRes, featuredIds] = await Promise.all([
      supabaseAdmin.from('events').select('*').eq('id', id).single(),
      getFeaturedIdsHelper(),
    ]);

    const { data, error } = eventRes;
    if (error || !data) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (data.status !== 'published' && (!req.user || !['super-admin', 'admin', 'event-staff'].includes(req.user.role))) {
      return res.status(404).json({ error: 'Event is not published' });
    }

    res.json(formatEvent(data, featuredIds));
  } catch (err) {
    console.error('[getPublicEventById]', err);
    res.status(500).json({ error: err.message || 'Failed to load event' });
  }
};

// --- Admin / Super Admin: List All or Assigned Events ---
const getAllEvents = async (req, res) => {
  try {
    let query = supabaseAdmin
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (req.user.role !== 'super-admin') {
      query = query.eq('admin_email', req.user.email);
    }

    const [eventsRes, featuredIds] = await Promise.all([
      query,
      getFeaturedIdsHelper(),
    ]);

    if (eventsRes.error) throw eventsRes.error;
    res.json((eventsRes.data || []).map((ev) => formatEvent(ev, featuredIds)));
  } catch (err) {
    console.error('[getAllEvents]', err);
    res.status(500).json({ error: err.message || 'Failed to fetch events' });
  }
};

// --- Super Admin: Create Event ---
const createEvent = async (req, res) => {
  try {
    const b = req.body;
    if (!b.title || !b.title.trim()) {
      return res.status(400).json({ error: 'Event Name is required' });
    }

    const isFree = Boolean(b.isFree);
    const totalCapacity = Math.max(parseInt(b.totalCapacity, 10) || 100, 1);
    const registrationLimit = b.registrationLimit ? Math.max(parseInt(b.registrationLimit, 10), 1) : null;
    const maxTicketsPerPerson = Math.max(parseInt(b.maxTicketsPerPerson, 10) || 1, 1);

    const isMultiDay = Boolean(b.isMultiDay && b.eventEndDate && b.eventEndDate !== b.eventDate);
    const startDate = b.eventDate || (typeof b.date === 'string' && b.date.includes(' to ') ? b.date.split(' to ')[0].trim() : b.date) || null;
    const endDate = isMultiDay ? b.eventEndDate : null;
    const dateDisplay = isMultiDay ? `${startDate} to ${endDate}` : (startDate || null);

    const payload = {
      title: b.title.trim(),
      description: b.description || '',
      image_url: b.imageUrl || '',
      date: dateDisplay,
      event_date: startDate,
      event_end_date: endDate,
      start_time: b.startTime || null,
      end_time: b.endTime || null,
      venue: b.venue || b.location || '',
      location: b.venue || b.location || '',
      address: b.address || '',
      category: b.category || 'Clinical Workshop',
      district: b.district || '',
      admin_email: b.adminEmail || '',
      registration_start_date: b.registrationStartDate || null,
      registration_end_date: b.registrationEndDate || null,
      total_capacity: totalCapacity,
      registration_limit: registrationLimit,
      booked_count: 0,
      status: b.status || 'published',
      registration_type: b.registrationType || 'both',
      member_fee: isFree ? 0 : Math.max(Number(b.memberFee) || 0, 0),
      non_member_fee: isFree ? 0 : Math.max(Number(b.nonMemberFee) || 0, 0),
      is_free: isFree,
      allow_cash_payment: b.allowCashPayment !== false,
      allow_online_payment: b.allowOnlinePayment !== false,
      max_tickets_per_person: maxTicketsPerPerson,
      created_by: isUuid(req.user?.id) ? req.user.id : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabaseAdmin
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error && error.message && error.message.includes('event_end_date')) {
      delete payload.event_end_date;
      const retry = await supabaseAdmin
        .from('events')
        .insert([payload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    if (b.isFeatured) {
      try {
        const featIds = await getFeaturedIdsHelper();
        if (!featIds.includes(data.id)) {
          featIds.push(data.id);
          await supabaseAdmin.from('content').update({ banner_url: JSON.stringify(featIds) }).eq('id', 'main');
        }
      } catch (fErr) {
        console.warn('[createEvent] featured persist warning:', fErr.message);
      }
    }

    await logEventAudit({
      eventId: data.id,
      action: 'EVENT_CREATED',
      actor: req.user,
      metadata: { title: data.title, status: data.status, isFeatured: Boolean(b.isFeatured) },
    });

    const finalFeaturedIds = await getFeaturedIdsHelper();
    res.status(201).json(formatEvent(data, finalFeaturedIds));
  } catch (err) {
    console.error('[createEvent]', err);
    res.status(500).json({ error: err.message || 'Failed to create event' });
  }
};

// --- Super Admin: Update Event ---
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    const isFree = Boolean(b.isFree);

    const isMultiDay = Boolean(b.isMultiDay && b.eventEndDate && b.eventEndDate !== b.eventDate);
    const startDate = b.eventDate || (typeof b.date === 'string' && b.date.includes(' to ') ? b.date.split(' to ')[0].trim() : b.date) || null;
    const endDate = isMultiDay ? b.eventEndDate : null;
    const dateDisplay = isMultiDay ? `${startDate} to ${endDate}` : (startDate || null);

    const payload = {
      title: b.title?.trim(),
      description: b.description ?? '',
      image_url: b.imageUrl ?? '',
      date: dateDisplay,
      event_date: startDate,
      event_end_date: endDate,
      start_time: b.startTime || null,
      end_time: b.endTime || null,
      venue: b.venue || b.location || '',
      location: b.venue || b.location || '',
      address: b.address || '',
      category: b.category || 'Clinical Workshop',
      district: b.district || '',
      admin_email: b.adminEmail || '',
      registration_start_date: b.registrationStartDate || null,
      registration_end_date: b.registrationEndDate || null,
      total_capacity: Math.max(parseInt(b.totalCapacity, 10) || 100, 1),
      registration_limit: b.registrationLimit ? Math.max(parseInt(b.registrationLimit, 10), 1) : null,
      status: b.status || 'published',
      registration_type: b.registrationType || 'both',
      member_fee: isFree ? 0 : Math.max(Number(b.memberFee) || 0, 0),
      non_member_fee: isFree ? 0 : Math.max(Number(b.nonMemberFee) || 0, 0),
      is_free: isFree,
      allow_cash_payment: b.allowCashPayment !== false,
      allow_online_payment: b.allowOnlinePayment !== false,
      max_tickets_per_person: Math.max(parseInt(b.maxTicketsPerPerson, 10) || 1, 1),
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabaseAdmin
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error && error.message && error.message.includes('event_end_date')) {
      delete payload.event_end_date;
      const retry = await supabaseAdmin
        .from('events')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    if (b.isFeatured !== undefined) {
      try {
        let featIds = await getFeaturedIdsHelper();
        if (b.isFeatured) {
          if (!featIds.includes(id)) featIds.push(id);
        } else {
          featIds = featIds.filter((item) => item !== id);
        }
        await supabaseAdmin.from('content').update({ banner_url: JSON.stringify(featIds) }).eq('id', 'main');
      } catch (fErr) {
        console.warn('[updateEvent] featured persist warning:', fErr.message);
      }
    }

    await logEventAudit({
      eventId: id,
      action: 'EVENT_UPDATED',
      actor: req.user,
      metadata: { title: data.title, memberFee: data.member_fee, nonMemberFee: data.non_member_fee, isFeatured: b.isFeatured },
    });

    const finalFeaturedIds = await getFeaturedIdsHelper();
    res.json(formatEvent(data, finalFeaturedIds));
  } catch (err) {
    console.error('[updateEvent]', err);
    res.status(500).json({ error: err.message || 'Failed to update event' });
  }
};

// --- Super Admin: Publish / Unpublish / Close Event ---
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['draft', 'published', 'unpublished', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid event status' });
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logEventAudit({
      eventId: id,
      action: 'EVENT_STATUS_CHANGED',
      actor: req.user,
      metadata: { status },
    });

    res.json(formatEvent(data));
  } catch (err) {
    console.error('[updateEventStatus]', err);
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
};

// --- Super Admin: Delete Event ---
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const { count: paidCount } = await supabaseAdmin
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('payment_status', 'paid');

    if (paidCount > 0 && req.query.force !== 'true') {
      return res.status(409).json({
        error: `Cannot delete event with ${paidCount} paid registration(s). Unpublish or close it instead.`,
      });
    }

    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('[deleteEvent]', err);
    res.status(500).json({ error: err.message || 'Failed to delete event' });
  }
};

// --- Super Admin / Admin: Feature / Unfeature Event on Home Hero Slider ---
const toggleFeaturedEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const shouldFeature = Boolean(isFeatured);

    // 1. Try to update public.events is_featured column (gracefully ignore if column does not exist)
    try {
      await supabaseAdmin
        .from('events')
        .update({ is_featured: shouldFeature, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (colErr) {
      console.warn('[toggleFeaturedEvent] is_featured column update skipped:', colErr.message);
    }

    // 2. Persist in content table under 'banner_url' JSON list for 100% reliable fallback
    let featuredIds = await getFeaturedIdsHelper();

    if (shouldFeature) {
      if (!featuredIds.includes(id)) featuredIds.push(id);
    } else {
      featuredIds = featuredIds.filter((item) => item !== id);
    }

    await supabaseAdmin
      .from('content')
      .update({ banner_url: JSON.stringify(featuredIds) })
      .eq('id', 'main');

    // 3. Fetch event for response
    const { data: eventData } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    await logEventAudit({
      eventId: id,
      action: shouldFeature ? 'EVENT_FEATURED_ON_HERO' : 'EVENT_UNFEATURED_FROM_HERO',
      actor: req.user,
      metadata: { isFeatured: shouldFeature },
    });

    res.json({
      success: true,
      id,
      isFeatured: shouldFeature,
      featuredIds,
      event: eventData ? formatEvent(eventData, featuredIds) : null,
    });
  } catch (err) {
    console.error('[toggleFeaturedEvent]', err);
    res.status(500).json({ error: err.message || 'Failed to toggle featured status' });
  }
};

// --- Public: Verify Member ID against existing approved members ---
const verifyMemberId = async (req, res) => {
  try {
    const rawId = (req.body.memberId || '').trim();
    if (!rawId) {
      return res.status(400).json({ error: 'Please enter a valid Member ID.' });
    }

    // Match against registration_no OR membership_id (case-insensitive) for approved members
    const { data: matches, error } = await supabaseAdmin
      .from('registrations')
      .select('id, full_name, first_name, father_name, surname, email, phone, organization, district, city, registration_no, membership_id, status, dob')
      .eq('status', 'approved')
      .or(`registration_no.ilike.${rawId},membership_id.ilike.${rawId}`)
      .limit(1);

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return res.status(404).json({
        valid: false,
        error: 'Member ID not found or membership is not yet approved. Please check your Member ID or register as a Non-Member.',
      });
    }

    const m = matches[0];
    const fullName =
      m.full_name ||
      [m.first_name, m.father_name, m.surname].filter(Boolean).join(' ').trim();

    res.json({
      valid: true,
      member: {
        memberRegistrationId: m.id,
        memberId: m.membership_id || m.registration_no || rawId,
        fullName,
        businessName: m.organization || '',
        phone: m.phone || '',
        email: m.email || '',
        chapterName: m.district || '',
        city: m.city || '',
        dob: m.dob || '',
      },
    });
  } catch (err) {
    console.error('[verifyMemberId]', err);
    res.status(500).json({ error: 'Unable to verify Member ID right now.' });
  }
};

// --- Public / Member: Register for Event (Atomic Seat Reservation + Fee Calculation) ---
const registerForEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const {
      category,
      memberId,
      fullName,
      email,
      phone,
      businessName,
      organization,
      city,
      chapterName,
      district,
      ticketQuantity = 1,
      paymentMethod = 'online',
    } = req.body;

    if (!['member', 'non_member'].includes(category)) {
      return res.status(400).json({ error: 'Please select Member or Non-Member category.' });
    }

    let finalFullName = (fullName || '').trim();
    let finalEmail = (email || '').trim();
    let finalPhone = (phone || '').trim();
    let finalBusinessName = (businessName || '').trim();
    let finalOrg = (organization || businessName || '').trim();
    let finalCity = (city || '').trim();
    let finalChapter = (chapterName || district || city || '').trim();
    let finalDistrict = (district || chapterName || city || '').trim();
    let memberRegistrationId = null;
    let verifiedMemberId = null;

    // Server-side re-verification for Member registrations (never trust client)
    if (category === 'member') {
      const cleanMemberId = (memberId || '').trim();
      if (!cleanMemberId) {
        return res.status(400).json({ error: 'Verified Member ID is required for Member registration.' });
      }
      const { data: matches, error: memErr } = await supabaseAdmin
        .from('registrations')
        .select('id, full_name, first_name, father_name, surname, email, phone, organization, district, city, registration_no, membership_id, status, dob')
        .eq('status', 'approved')
        .or(`registration_no.ilike.${cleanMemberId},membership_id.ilike.${cleanMemberId}`)
        .limit(1);

      if (memErr) throw memErr;
      if (!matches || matches.length === 0) {
        return res.status(400).json({ error: 'Invalid or unapproved Member ID.' });
      }

      const m = matches[0];
      memberRegistrationId = m.id;
      verifiedMemberId = m.membership_id || m.registration_no;
      finalFullName = finalFullName || m.full_name || [m.first_name, m.father_name, m.surname].filter(Boolean).join(' ').trim();
      finalEmail = finalEmail || m.email;
      finalPhone = finalPhone || m.phone;
      finalBusinessName = finalBusinessName || m.organization;
      finalOrg = finalOrg || m.organization;
      finalDistrict = finalDistrict || m.district || m.city || 'Maharashtra';
      finalChapter = finalDistrict;
      finalCity = finalCity || m.city || finalDistrict;
      if (!req.body.dob && m.dob) req.body.dob = m.dob;
    } else {
      finalDistrict = finalDistrict || 'Maharashtra';
      // Validate required Non-Member fields
      if (!finalFullName || !finalPhone || !finalEmail || !finalBusinessName || !finalDistrict) {
        return res.status(400).json({
          error: 'Full Name, Mobile Number, Email, Business Name, and District are required.',
        });
      }
    }

    const qty = parseInt(ticketQuantity, 10) || 1;
    const userId = isUuid(req.user?.id) ? req.user.id : null;

    // Fetch event snapshot first
    const { data: eventRow, error: evErr } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (evErr || !eventRow) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (eventRow.status !== 'published') {
      return res.status(400).json({ error: 'Event is not currently open for registration.' });
    }

    const maxCap = eventRow.registration_limit || eventRow.total_capacity || 100;
    const booked = eventRow.booked_count || 0;
    if (booked + qty > maxCap) {
      return res.status(400).json({
        error: `Not enough tickets available. Remaining capacity: ${Math.max(maxCap - booked, 0)}`,
      });
    }

    // Atomic reservation & server-side fee calculation via PostgreSQL RPC with automatic JS fallback
    let reserved = null;
    const { data: rpcReserved, error: rpcError } = await supabaseAdmin.rpc('reserve_event_registration', {
      p_event_id: eventId,
      p_user_id: userId,
      p_category: category,
      p_member_registration_id: memberRegistrationId,
      p_member_id: verifiedMemberId,
      p_full_name: finalFullName,
      p_email: finalEmail,
      p_phone: finalPhone,
      p_business_name: finalBusinessName,
      p_organization: finalOrg,
      p_city: finalCity,
      p_chapter_name: finalChapter,
      p_ticket_quantity: qty,
      p_payment_method: paymentMethod,
    });

    if (!rpcError && rpcReserved) {
      reserved = rpcReserved;
    } else {
      console.warn('[registerForEvent] RPC reserve_event_registration fallback:', rpcError?.message);

      // Check duplicate registration
      const { data: dupes } = await supabaseAdmin
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .ilike('email', finalEmail)
        .in('registration_status', ['confirmed', 'pending_verification'])
        .limit(1);

      if (dupes && dupes.length > 0) {
        return res.status(400).json({
          error: 'An active registration already exists for this email address in this event.',
        });
      }

      // Compute authoritative fee
      let unitFee = 0;
      if (eventRow.is_free) {
        unitFee = 0;
      } else if (category === 'member') {
        unitFee = Number(eventRow.member_fee || 0);
      } else {
        unitFee = Number(eventRow.non_member_fee || 0);
      }

      const totalAmount = unitFee * qty;
      let paymentStatus = 'paid';
      let regStatus = 'confirmed';

      if (totalAmount <= 0) {
        paymentStatus = 'paid';
        regStatus = 'confirmed';
      } else if (paymentMethod === 'online') {
        paymentStatus = 'pending';
        regStatus = 'pending_payment';
      } else if (paymentMethod === 'cash') {
        paymentStatus = 'cash_pending';
        regStatus = 'pending_district_approval';
      }

      const regCode = `REG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const insertPayload = {
        registration_code: regCode,
        event_id: eventId,
        event_title: eventRow.title,
        event_district: eventRow.district,
        event_admin_email: eventRow.admin_email,
        user_id: userId,
        uid: userId || 'public',
        category,
        member_type: category === 'member' ? 'old' : 'new',
        member_id: verifiedMemberId,
        membership_id: verifiedMemberId,
        full_name: finalFullName,
        email: finalEmail,
        phone: finalPhone,
        dob: (req.body.dob || req.body.dateOfBirth || '').trim() || null,
        business_name: finalBusinessName,
        organization: finalOrg || finalBusinessName,
        city: finalCity,
        chapter_name: finalDistrict || finalChapter || finalCity,
        district: finalDistrict || finalChapter || finalCity,
        ticket_quantity: qty,
        unit_fee: unitFee,
        total_amount: totalAmount,
        payment_method: totalAmount <= 0 ? 'free' : paymentMethod,
        payment_status: paymentStatus,
        registration_status: regStatus,
        status: regStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let insertedReg = null;
      let insErr = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await supabaseAdmin
          .from('event_registrations')
          .insert([insertPayload])
          .select()
          .single();
        insertedReg = res.data;
        insErr = res.error;

        if (!insErr && insertedReg) break;

        // Auto-detect and remove any column missing from Postgres schema
        const errMsg = insErr?.message || '';
        const match = errMsg.match(/'([^']+)' column/) || errMsg.match(/column "([^"]+)" of relation/);
        const colToDrop = match?.[1];

        if (colToDrop && insertPayload[colToDrop] !== undefined) {
          console.warn(`[registerForEvent] Dropping column '${colToDrop}' not present in event_registrations and retrying...`);
          delete insertPayload[colToDrop];
          continue;
        }
        break;
      }

      if (insErr) {
        console.error('[registerForEvent] Direct registration insert error:', insErr);
        return res.status(400).json({ error: insErr.message || 'Unable to complete registration.' });
      }

      await supabaseAdmin
        .from('events')
        .update({ booked_count: booked + qty, updated_at: new Date().toISOString() })
        .eq('id', eventId);

      reserved = {
        id: insertedReg.id,
        registration_code: insertedReg.registration_code,
        event_id: eventId,
        unit_fee: unitFee,
        total_amount: totalAmount,
        payment_method: totalAmount <= 0 ? 'free' : paymentMethod,
        payment_status: paymentStatus,
        registration_status: regStatus,
      };
    }

    const formattedEvent = formatEvent(eventRow);

    // Case 1: Free Event -> Confirm immediately & issue ticket
    if (Number(reserved.total_amount) <= 0) {
      const ticketCode = await generateUniqueTicketCode();
      const qrToken = signTicketToken({
        ticketCode,
        eventId,
        registrationId: reserved.id,
      });

      let ticket = null;
      const { data: rpcTicket, error: ticketErr } = await supabaseAdmin.rpc('issue_event_ticket', {
        p_registration_id: reserved.id,
        p_ticket_code: ticketCode,
        p_qr_token: qrToken,
      });

      if (!ticketErr && rpcTicket) {
        ticket = rpcTicket;
      } else {
        console.warn('[registerForEvent] issue_event_ticket RPC fallback:', ticketErr?.message);
        await supabaseAdmin
          .from('event_registrations')
          .update({
            payment_status: 'paid',
            registration_status: 'confirmed',
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', reserved.id);

        const { data: directTicket, error: dtErr } = await supabaseAdmin
          .from('event_tickets')
          .insert([
            {
              ticket_code: ticketCode,
              registration_id: reserved.id,
              event_id: eventId,
              qr_token: qrToken,
              ticket_status: 'active',
              issued_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (dtErr) throw dtErr;
        ticket = directTicket;
      }

      await supabaseAdmin.from('event_payments').insert([
        {
          registration_id: reserved.id,
          event_id: eventId,
          payment_method: 'free',
          amount: 0,
          currency: 'INR',
          status: 'paid',
          paid_at: new Date().toISOString(),
        },
      ]);

      await logEventAudit({
        eventId,
        registrationId: reserved.id,
        ticketId: ticket?.id,
        action: 'FREE_TICKET_ISSUED',
        actor: req.user,
        metadata: { ticketCode, email: finalEmail },
      });

      // Trigger WhatsApp Registration Confirmation with Digital QR Ticket
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrToken || ticketCode)}`;

      sendRegistrationConfirmation({
        toPhone: finalPhone,
        attendeeName: finalFullName,
        eventName: formattedEvent?.title || 'Event',
        ticketCode,
        qrToken,
        qrImageUrl,
        eventDate: formattedEvent?.eventDate || formattedEvent?.date || '',
        eventVenue: formattedEvent?.venue || formattedEvent?.location || '',
        ticketLink: `${clientUrl}/ticket/${ticketCode}`,
        eventId,
        registrationId: reserved.id,
        ticketId: ticket?.id,
      }).catch((e) => console.error('[WhatsApp Free Reg Error]:', e));

      return res.status(201).json({
        mode: 'confirmed',
        registration: {
          ...reserved,
          full_name: finalFullName,
          email: finalEmail,
          phone: finalPhone,
          category,
          member_id: verifiedMemberId,
          ticket_quantity: qty,
        },
        ticket,
        event: formattedEvent,
      });
    }

    // Case 2: Cash Payment -> Provisional Registration (NO confirmed ticket yet!)
    if (reserved.payment_method === 'cash') {
      await supabaseAdmin.from('event_payments').insert([
        {
          registration_id: reserved.id,
          event_id: eventId,
          payment_method: 'cash',
          amount: reserved.total_amount,
          currency: 'INR',
          status: 'cash_pending',
        },
      ]);

      await logEventAudit({
        eventId,
        registrationId: reserved.id,
        action: 'CASH_REGISTRATION_CREATED',
        actor: req.user,
        metadata: {
          registrationCode: reserved.registration_code,
          amount: reserved.total_amount,
          email: finalEmail,
        },
      });

      return res.status(201).json({
        mode: 'cash_pending',
        message: `Your registration is pending cash verification by the ${finalDistrict || 'District'} Admin.`,
        registration: {
          ...reserved,
          district: finalDistrict || reserved.district,
          full_name: finalFullName,
          email: finalEmail,
          phone: finalPhone,
          category,
          member_id: verifiedMemberId,
          ticket_quantity: qty,
        },
        provisionalCode: reserved.registration_code,
        event: formattedEvent,
      });
    }

    // Case 3: Online Payment -> Create Razorpay Order on Backend
    if (!isRazorpayConfigured()) {
      // Rollback reservation so seat is not stranded if Razorpay keys aren't set yet
      await supabaseAdmin.from('event_registrations').delete().eq('id', reserved.id);
      await supabaseAdmin
        .from('events')
        .update({ booked_count: Math.max((eventRow?.booked_count || qty) - qty, 0) })
        .eq('id', eventId);

      return res.status(503).json({
        error: 'Online payment gateway (Razorpay) is not configured yet. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env or choose Cash Payment.',
      });
    }

    const razorpay = getRazorpayClient();
    const amountPaise = Math.round(Number(reserved.total_amount) * 100);

    let order;
    try {
      order = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: reserved.registration_code,
        notes: {
          registration_id: reserved.id,
          registration_code: reserved.registration_code,
          event_id: eventId,
          category,
        },
      });
    } catch (rzpErr) {
      // Rollback seat reservation on Razorpay order failure
      await supabaseAdmin.from('event_registrations').delete().eq('id', reserved.id);
      await supabaseAdmin
        .from('events')
        .update({ booked_count: Math.max((eventRow?.booked_count || qty) - qty, 0) })
        .eq('id', eventId);
      throw rzpErr;
    }

    await supabaseAdmin.from('event_payments').insert([
      {
        registration_id: reserved.id,
        event_id: eventId,
        payment_method: 'online',
        razorpay_order_id: order.id,
        amount: reserved.total_amount,
        currency: 'INR',
        status: 'created',
        gateway_response: order,
      },
    ]);

    await logEventAudit({
      eventId,
      registrationId: reserved.id,
      action: 'RAZORPAY_ORDER_CREATED',
      actor: req.user,
      metadata: { orderId: order.id, amount: reserved.total_amount },
    });

    res.status(201).json({
      mode: 'online_checkout',
      registration: {
        ...reserved,
        full_name: finalFullName,
        email: finalEmail,
        phone: finalPhone,
        category,
        member_id: verifiedMemberId,
        ticket_quantity: qty,
      },
      razorpayOrder: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      event: formattedEvent,
    });
  } catch (err) {
    console.error('[registerForEvent]', err);
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
};

// --- Super Admin / Assigned Staff: Event Registrations List ---
const getEventRegistrations = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    if (req.user.role !== 'super-admin') {
      const { data: ev } = await supabaseAdmin
        .from('events')
        .select('admin_email')
        .eq('id', eventId)
        .single();
      if (!ev || ev.admin_email !== req.user.email) {
        return res.status(403).json({ error: 'Not authorized for this event' });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        *,
        event_tickets (id, ticket_code, ticket_status, issued_at, checked_in_at),
        event_payments (id, payment_method, razorpay_order_id, razorpay_payment_id, amount, status, paid_at)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[getEventRegistrations]', err);
    res.status(500).json({ error: err.message || 'Failed to fetch registrations' });
  }
};

// --- Authenticated User: Registration & Ticket History ---
const getMyEventRegistrations = async (req, res) => {
  try {
    let query = supabaseAdmin
      .from('event_registrations')
      .select(`
        *,
        events (*),
        event_tickets (*),
        event_payments (id, payment_method, razorpay_payment_id, amount, status, paid_at)
      `)
      .order('created_at', { ascending: false });

    if (isUuid(req.user.id)) {
      query = query.or(`user_id.eq.${req.user.id},email.ilike.${req.user.email}`);
    } else {
      query = query.ilike('email', req.user.email);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formatted = (data || []).map((row) => ({
      ...row,
      event: formatEvent(row.events),
      ticket: Array.isArray(row.event_tickets) ? row.event_tickets[0] || null : row.event_tickets || null,
      payment: Array.isArray(row.event_payments) ? row.event_payments[0] || null : row.event_payments || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[getMyEventRegistrations]', err);
    res.status(500).json({ error: err.message || 'Failed to load ticket history' });
  }
};

// --- Fetch Digital Ticket or Provisional Pass by Code ---
const getTicketByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const cleanCode = (code || '').trim();

    // 1. Try confirmed ticket by ticket_code
    const { data: ticketRow } = await supabaseAdmin
      .from('event_tickets')
      .select(`
        *,
        event_registrations (*),
        events (*)
      `)
      .eq('ticket_code', cleanCode)
      .single();

    if (ticketRow) {
      return res.json({
        type: 'confirmed_ticket',
        ticket: {
          id: ticketRow.id,
          ticket_code: ticketRow.ticket_code,
          qr_token: ticketRow.qr_token,
          ticket_status: ticketRow.ticket_status,
          issued_at: ticketRow.issued_at,
          checked_in_at: ticketRow.checked_in_at,
        },
        registration: ticketRow.event_registrations,
        event: formatEvent(ticketRow.events),
      });
    }

    // 2. Fallback: Try provisional registration by registration_code
    const { data: regRow } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        *,
        events (*),
        event_tickets (*)
      `)
      .eq('registration_code', cleanCode)
      .single();

    if (regRow) {
      const issuedTicket = Array.isArray(regRow.event_tickets)
        ? regRow.event_tickets[0] || null
        : regRow.event_tickets || null;

      return res.json({
        type: issuedTicket ? 'confirmed_ticket' : 'provisional_pass',
        ticket: issuedTicket,
        registration: regRow,
        event: formatEvent(regRow.events),
      });
    }

    return res.status(404).json({ error: 'Ticket or registration pass not found.' });
  } catch (err) {
    console.error('[getTicketByCode]', err);
    res.status(500).json({ error: err.message || 'Failed to load ticket' });
  }
};

module.exports = {
  getPublicEvents,
  getPublicEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  toggleFeaturedEvent,
  verifyMemberId,
  registerForEvent,
  getEventRegistrations,
  getMyEventRegistrations,
  getTicketByCode,
  generateUniqueTicketCode,
};
