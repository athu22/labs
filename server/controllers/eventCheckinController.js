const { supabaseAdmin } = require('../config/supabaseAdmin');
const fs = require('fs');
const path = require('path');
const { verifyTicketToken } = require('../utils/ticketSigner');
const { logEventAudit, formatEvent } = require('../utils/eventAudit');
const { sendActivityNotification, sendWhatsAppMessage, sendRegistrationConfirmation } = require('../utils/whatsappService');

/**
 * Resolves activity permissions for the requesting user on a specific event.
 * Open by default: Any staff or volunteer can scan and perform operations without pre-assigning employee accounts!
 */
const resolveStaffPermissions = async (user, eventId, eventAdminEmail) => {
  // If specific custom permissions are configured in event_staff_permissions, respect them
  if (user) {
    try {
      const { data: perm } = await supabaseAdmin
        .from('event_staff_permissions')
        .select('*')
        .eq('event_id', eventId)
        .or(`staff_user_id.eq.${user.id},staff_email.ilike.${user.email}`)
        .limit(1)
        .maybeSingle();

      if (perm) {
        return {
          canCheckin: Boolean(perm.can_checkin),
          canDistributeWelcomeKit: Boolean(perm.can_distribute_welcome_kit),
          canDistributeBreakfast: Boolean(perm.can_distribute_breakfast),
          canDistributeLunch: Boolean(perm.can_distribute_lunch),
          hasAnyPermission: true,
          role: 'event-staff',
        };
      }
    } catch (err) {
      console.error('[resolveStaffPermissions] Error:', err);
    }
  }

  // Open Venue Default: Anyone scanning at the venue has full operational rights!
  return {
    canCheckin: true,
    canDistributeWelcomeKit: true,
    canDistributeBreakfast: true,
    canDistributeLunch: true,
    hasAnyPermission: true,
    role: user?.role || 'staff',
  };
};

/**
 * 1. Scan QR Token or Manual Ticket ID & Return Complete Attendee Information Dossier
 * Features:
 * - One QR Code per attendee
 * - Validates HMAC signature
 * - Displays Attendee Name, Photo, Member ID, Business Name, Mobile, Email, Event, Ticket ID, Payment & Reg status
 * - Returns statuses of all 4 activities: Entry, Welcome Kit, Breakfast, Lunch
 * - Warns if invalid, unpaid, cancelled, or already checked in
 */
const scanTicket = async (req, res) => {
  try {
    const { qrToken, ticketCode, eventId } = req.body;
    let lookupTicketCode = (ticketCode || '').trim();
    let expectedEventIdFromToken = null;

    if (qrToken) {
      const trimmed = qrToken.trim();
      if (trimmed.startsWith('ACLAP1.')) {
        const verified = verifyTicketToken(trimmed);
        if (!verified.valid) {
          return res.json({
            status: 'invalid',
            color: 'red',
            title: 'Invalid Ticket',
            reason: verified.reason || 'Cryptographic QR code verification failed.',
          });
        }
        lookupTicketCode = verified.ticketCode;
        expectedEventIdFromToken = verified.eventId;
      } else {
        lookupTicketCode = trimmed;
      }
    }

    if (lookupTicketCode.includes('/ticket/')) {
      lookupTicketCode = lookupTicketCode.split('/ticket/').pop().split('?')[0].split('/')[0].trim();
    }

    if (!lookupTicketCode) {
      return res.status(400).json({
        status: 'invalid',
        color: 'red',
        title: 'Invalid Ticket',
        reason: 'Please scan a valid QR code or enter a Ticket ID.',
      });
    }

    // 1. Fetch ticket + registration + event (Supports Ticket Code EVT-..., Registration Code REG-..., Phone, or Email)
    let ticket = null;
    const cleanLookup = lookupTicketCode.trim();

    // 1a. Try finding directly by ticket_code (case-insensitive)
    const { data: ticketByCode } = await supabaseAdmin
      .from('event_tickets')
      .select(`
        *,
        event_registrations (*),
        events (*)
      `)
      .ilike('ticket_code', cleanLookup)
      .maybeSingle();

    if (ticketByCode) {
      ticket = ticketByCode;
    } else {
      // 1b. Check event_registrations by Registration Code (REG-...), Phone, or Email
      // Note: We search across all events without restricting by eventId so we can always locate the attendee
      const { data: regList, error: regSearchErr } = await supabaseAdmin
        .from('event_registrations')
        .select(`*, events (*)`)
        .or(`registration_code.ilike.${cleanLookup},phone.ilike.${cleanLookup},email.ilike.${cleanLookup}`)
        .order('created_at', { ascending: false });

      if (regList && regList.length > 0) {
        // Prefer registration matching selected eventId if present, else most recent registration
        const foundReg = (eventId ? regList.find((r) => r.event_id === eventId) : null) || regList[0];

        // Fetch ticket for this registration
        const { data: tRow } = await supabaseAdmin
          .from('event_tickets')
          .select(`*, event_registrations (*), events (*)`)
          .eq('registration_id', foundReg.id)
          .maybeSingle();

        if (tRow) {
          ticket = tRow;
        } else {
          // If registration is active / confirmed / paid / verified, auto-issue the ticket
          const isPaidOrActive =
            foundReg.payment_status === 'paid' ||
            foundReg.payment_status === 'free' ||
            foundReg.registration_status === 'confirmed' ||
            foundReg.status === 'confirmed' ||
            foundReg.status === 'active';

          if (isPaidOrActive) {
            try {
              const { generateUniqueTicketCode } = require('./eventController');
              const { signTicketToken } = require('../utils/ticketSigner');
              const tCode = await generateUniqueTicketCode();
              const qToken = signTicketToken({ ticketCode: tCode, eventId: foundReg.event_id, registrationId: foundReg.id });

              const { data: newT } = await supabaseAdmin
                .from('event_tickets')
                .insert([
                  {
                    ticket_code: tCode,
                    registration_id: foundReg.id,
                    event_id: foundReg.event_id,
                    qr_token: qToken,
                    ticket_status: 'active',
                    issued_at: new Date().toISOString(),
                  },
                ])
                .select(`*, event_registrations (*), events (*)`)
                .maybeSingle();

              if (newT) {
                ticket = newT;
              }
            } catch (issueErr) {
              console.error('[scanTicket] Auto-issue ticket error:', issueErr);
            }
          }

          // If still no ticket and payment is pending verification
          if (!ticket) {
            return res.json({
              status: 'warning',
              color: 'amber',
              title: 'Payment Pending Verification',
              reason: `Registration ${foundReg.registration_code} is currently "${foundReg.payment_status}". Ticket will activate once payment is verified in Cash Verification.`,
              details: {
                ticketId: null,
                ticketCode: foundReg.registration_code,
                registrationId: foundReg.id,
                registrationCode: foundReg.registration_code,
                attendeeName: foundReg.full_name,
                category: foundReg.category || (foundReg.member_type === 'old' ? 'member' : 'non_member'),
                memberId: foundReg.member_id || '',
                businessName: foundReg.business_name || '',
                mobileNumber: foundReg.phone || '',
                email: foundReg.email || '',
                eventId: foundReg.event_id,
                eventName: foundReg.events?.title || 'Event',
                paymentStatus: foundReg.payment_status,
                registrationStatus: foundReg.registration_status,
                ticketStatus: 'pending_verification',
                activities: {},
                permissions: { canCheckin: false, canDistributeWelcomeKit: false, canDistributeBreakfast: false, canDistributeLunch: false },
              },
            });
          }
        }
      }
    }

    if (!ticket) {
      return res.json({
        status: 'invalid',
        color: 'red',
        title: 'Invalid Ticket',
        reason: `Ticket not found for "${cleanLookup}". Please check the Ticket ID (EVT-...), Registration Code (REG-...), or Mobile Number.`,
      });
    }

    // Safely dereference joined registration & event records (with fallback queries if needed)
    let reg = Array.isArray(ticket.event_registrations) ? ticket.event_registrations[0] : ticket.event_registrations;
    if (!reg && ticket.registration_id) {
      const { data: fallbackReg } = await supabaseAdmin
        .from('event_registrations')
        .select('*')
        .eq('id', ticket.registration_id)
        .maybeSingle();
      reg = fallbackReg;
    }

    let ev = Array.isArray(ticket.events) ? ticket.events[0] : ticket.events;
    if (!ev && ticket.event_id) {
      const { data: fallbackEv } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', ticket.event_id)
        .maybeSingle();
      ev = fallbackEv;
    }

    // Cross-check token eventId vs DB eventId
    if (expectedEventIdFromToken && expectedEventIdFromToken !== ticket.event_id) {
      return res.json({
        status: 'invalid',
        color: 'red',
        title: 'Event Mismatch',
        reason: 'QR token belongs to a different event than the recorded ticket.',
      });
    }

    // Check staff permissions on this event
    const permissions = await resolveStaffPermissions(req.user, ticket.event_id, ev?.admin_email);
    if (!permissions.hasAnyPermission) {
      return res.status(403).json({
        status: 'invalid',
        color: 'red',
        title: 'Unauthorized Staff',
        reason: 'You do not have staff permissions assigned for this event.',
      });
    }

    // 2. Fetch attendee profile photo (if available from member registration or user record)
    let profilePhoto = null;
    try {
      if (reg?.member_registration_id) {
        const { data: memReg } = await supabaseAdmin
          .from('registrations')
          .select('profile_photo, photo_url')
          .eq('id', reg.member_registration_id)
          .maybeSingle();
        profilePhoto = memReg?.profile_photo || memReg?.photo_url || null;
      }
      if (!profilePhoto && reg?.user_id) {
        const { data: uRow } = await supabaseAdmin
          .from('users')
          .select('profile_photo, photo_url')
          .eq('auth_id', reg.user_id)
          .maybeSingle();
        profilePhoto = uRow?.profile_photo || uRow?.photo_url || null;
      }
    } catch (photoErr) {
      console.warn('[scanTicket] Photo fetch notice:', photoErr.message);
    }

    // 3. Fetch existing activity completion records for this registration
    const { data: activityRows } = await supabaseAdmin
      .from('event_attendee_activities')
      .select('*')
      .eq('registration_id', reg.id);

    const activitiesMap = {};
    (activityRows || []).forEach((act) => {
      activitiesMap[act.activity_type] = act;
    });

    // Sync entry with ticket.ticket_status if already checked in previously
    const entryCompleted =
      Boolean(activitiesMap.entry) || ticket.ticket_status === 'checked_in';
    const entryCompletedAt =
      activitiesMap.entry?.completed_at || ticket.checked_in_at || null;
    const entryCompletedBy =
      activitiesMap.entry?.staff_email || activitiesMap.entry?.completed_by || 'Staff';

    const activities = {
      entry: {
        status: entryCompleted ? 'completed' : 'pending',
        completedAt: entryCompletedAt,
        completedBy: entryCompleted ? entryCompletedBy : null,
      },
      welcome_kit: {
        status: activitiesMap.welcome_kit ? 'completed' : 'pending',
        completedAt: activitiesMap.welcome_kit?.completed_at || null,
        completedBy: activitiesMap.welcome_kit?.staff_email || activitiesMap.welcome_kit?.completed_by || null,
      },
      breakfast: {
        status: activitiesMap.breakfast ? 'completed' : 'pending',
        completedAt: activitiesMap.breakfast?.completed_at || null,
        completedBy: activitiesMap.breakfast?.staff_email || activitiesMap.breakfast?.completed_by || null,
      },
      lunch: {
        status: activitiesMap.lunch ? 'completed' : 'pending',
        completedAt: activitiesMap.lunch?.completed_at || null,
        completedBy: activitiesMap.lunch?.staff_email || activitiesMap.lunch?.completed_by || null,
      },
    };

    const details = {
      ticketId: ticket.id,
      ticketCode: ticket.ticket_code,
      registrationId: reg?.id,
      registrationCode: reg?.registration_code || reg?.id?.slice(0, 8),
      attendeeName: reg?.full_name || 'Attendee',
      profilePhoto,
      category: reg?.category || (reg?.member_type === 'old' ? 'member' : 'non_member'),
      memberId: reg?.member_id || reg?.membership_id || '',
      businessName: reg?.business_name || reg?.organization || '',
      mobileNumber: reg?.phone || '',
      email: reg?.email || '',
      eventId: ticket.event_id,
      eventName: ev?.title || 'ACAP Event',
      eventDate: ev?.date || ev?.event_date || '',
      eventEndDate: ev?.event_end_date || '',
      isMultiDay: Boolean((ev?.event_end_date && ev?.event_end_date !== ev?.event_date) || (typeof ev?.date === 'string' && ev?.date.includes(' to '))),
      paymentStatus: reg?.payment_status,
      registrationStatus: reg?.registration_status,
      ticketStatus: ticket.ticket_status,
      activities,
      permissions,
    };

    // 4. Validate payment & registration status
    if (
      ticket.ticket_status === 'cancelled' ||
      reg?.registration_status === 'cancelled' ||
      reg?.payment_status === 'failed' ||
      reg?.payment_status === 'refunded'
    ) {
      return res.json({
        status: 'cancelled',
        color: 'red',
        title: 'Ticket Cancelled / Refunded',
        reason: 'This ticket was cancelled or refunded and cannot be used.',
        details,
      });
    }

    const isPaid =
      reg?.payment_status === 'paid' ||
      reg?.payment_status === 'free' ||
      ticket.ticket_status === 'active' ||
      ticket.ticket_status === 'checked_in';

    if (!isPaid) {
      return res.json({
        status: 'unpaid',
        color: 'amber',
        title: 'Payment / Verification Pending',
        reason: `Payment status is "${reg?.payment_status || 'pending'}". Ticket will activate after cash or online payment is verified.`,
        details,
      });
    }

    // 5. Notice if scanner venue dropdown is currently set to a different event
    if (eventId && ticket.event_id !== eventId) {
      return res.json({
        status: 'different_event',
        color: 'amber',
        title: 'Event Mismatch Notice',
        reason: `Attendee is registered for "${ev?.title || 'Another Event'}", but your scanner dropdown is set to another event.`,
        details: {
          ...details,
          eventMismatch: true,
          registeredEventTitle: ev?.title,
          registeredEventId: ticket.event_id,
        },
      });
    }

    // Ticket is valid and confirmed
    return res.json({
      status: 'valid',
      color: 'green',
      title: 'Valid Confirmed Ticket',
      reason: 'Confirmed & Paid. Ready for venue activities.',
      details,
    });
  } catch (err) {
    console.error('[scanTicket] Error:', err);
    res.status(500).json({ error: err.message || 'Ticket scanning failed' });
  }
};

/**
 * 2. Record Activity Operation (Event Entry, Welcome Kit, Breakfast, Lunch)
 * Features:
 * - Uses atomic Postgres RPC `record_attendee_activity`
 * - Strict duplicate prevention via DB transaction and unique constraint
 * - Enforces staff permissions for that specific activity
 * - Triggers optional automated WhatsApp notification if enabled for that activity
 */
const recordActivity = async (req, res) => {
  try {
    const { ticketId, activityType, notes = '' } = req.body;
    if (!ticketId || !activityType) {
      return res.status(400).json({ error: 'ticketId and activityType are required.' });
    }

    const validActivities = ['entry', 'welcome_kit', 'breakfast', 'lunch'];
    if (!validActivities.includes(activityType)) {
      return res.status(400).json({ error: `Invalid activityType. Must be one of: ${validActivities.join(', ')}` });
    }

    // 1. Fetch ticket, event, registration
    const { data: ticketRow, error: ticketErr } = await supabaseAdmin
      .from('event_tickets')
      .select(`
        *,
        events (*),
        event_registrations (*)
      `)
      .eq('id', ticketId)
      .single();

    if (ticketErr || !ticketRow) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ev = ticketRow.events;
    const reg = ticketRow.event_registrations;

    // 2. Verify staff permissions for this specific activity
    const permissions = await resolveStaffPermissions(req.user, ticketRow.event_id, ev?.admin_email);

    let isAuthorized = false;
    if (activityType === 'entry' && permissions.canCheckin) isAuthorized = true;
    if (activityType === 'welcome_kit' && permissions.canDistributeWelcomeKit) isAuthorized = true;
    if (activityType === 'breakfast' && permissions.canDistributeBreakfast) isAuthorized = true;
    if (activityType === 'lunch' && permissions.canDistributeLunch) isAuthorized = true;

    if (!isAuthorized) {
      return res.status(403).json({
        error: `You do not have permission to perform "${activityType}" for this event.`,
      });
    }

    // 3. Execute atomic PostgreSQL RPC to record the activity
    const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc('record_attendee_activity', {
      p_event_id: ticketRow.event_id,
      p_ticket_id: ticketRow.id,
      p_activity_type: activityType,
      p_staff_id: req.user.id || req.user.email,
      p_staff_email: req.user.email || 'Staff',
    });

    if (rpcErr) throw rpcErr;

    // Handle duplicate or already completed
    if (rpcResult?.result === 'already_completed') {
      return res.status(409).json({
        success: false,
        status: 'already_completed',
        activityType,
        error: `${activityType.replace('_', ' ').toUpperCase()} has already been completed.`,
        completedAt: rpcResult.completed_at,
        completedBy: rpcResult.completed_by,
      });
    }

    if (rpcResult?.result !== 'success') {
      return res.status(400).json({
        success: false,
        error: rpcResult?.reason || 'Unable to record activity.',
      });
    }

    // 4. Log Event Audit
    await logEventAudit({
      eventId: ticketRow.event_id,
      registrationId: ticketRow.registration_id,
      ticketId: ticketRow.id,
      action: `ACTIVITY_${activityType.toUpperCase()}_COMPLETED`,
      actor: req.user,
      metadata: {
        activityType,
        ticketCode: ticketRow.ticket_code,
        completedAt: rpcResult.completed_at,
        notes,
      },
    });

    // 5. Check if automated WhatsApp notification is enabled for this activity
    try {
      const { data: notifSettings } = await supabaseAdmin
        .from('event_notification_settings')
        .select('*')
        .eq('event_id', ticketRow.event_id)
        .maybeSingle();

      const shouldNotify =
        (activityType === 'entry' && notifSettings?.notify_entry) ||
        (activityType === 'welcome_kit' && notifSettings?.notify_welcome_kit) ||
        (activityType === 'breakfast' && notifSettings?.notify_breakfast) ||
        (activityType === 'lunch' && notifSettings?.notify_lunch);

      if (shouldNotify && reg?.phone) {
        sendActivityNotification({
          toPhone: reg.phone,
          attendeeName: reg.full_name,
          eventName: ev?.title || 'Event',
          activityType,
          ticketCode: ticketRow.ticket_code,
          eventId: ticketRow.event_id,
          registrationId: reg.id,
          ticketId: ticketRow.id,
        }).catch((err) => console.error('[WhatsApp Activity Trigger Error]:', err));
      }
    } catch (notifErr) {
      console.warn('[recordActivity] WhatsApp notification check notice:', notifErr.message);
    }

    res.json({
      success: true,
      activityType,
      activityId: rpcResult.activity_id,
      completedAt: rpcResult.completed_at,
      completedBy: rpcResult.completed_by,
      message: `${activityType.replace('_', ' ').toUpperCase()} successfully recorded!`,
    });
  } catch (err) {
    console.error('[recordActivity] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to record activity' });
  }
};

/**
 * 3. Legacy Check-in Confirmation Endpoint (Kept for backward compatibility)
 */
const confirmCheckin = async (req, res) => {
  req.body.activityType = 'entry';
  return recordActivity(req, res);
};

/**
 * 4. Recent Check-ins / Activity Log Feed
 */
const getRecentCheckins = async (req, res) => {
  try {
    const { eventId, activityType } = req.query;
    let query = supabaseAdmin
      .from('event_attendee_activities')
      .select(`
        *,
        event_tickets (ticket_code),
        event_registrations (full_name, category, member_id, phone, business_name),
        events (title, admin_email)
      `)
      .order('completed_at', { ascending: false })
      .limit(60);

    if (eventId) query = query.eq('event_id', eventId);
    if (activityType) query = query.eq('activity_type', activityType);

    const { data, error } = await query;
    if (error) throw error;

    const filtered =
      req.user.role === 'super-admin'
        ? data || []
        : (data || []).filter(
            (c) =>
              c.events?.admin_email === req.user.email ||
              c.staff_email === req.user.email ||
              c.completed_by === req.user.id
          );

    res.json(filtered);
  } catch (err) {
    console.error('[getRecentCheckins]', err);
    res.status(500).json({ error: err.message || 'Failed to load recent activities' });
  }
};

/**
 * 5. Live Event Activity Dashboard Metrics
 * Calculates:
 * - Event Entry: Total Confirmed Attendees, Total Checked In, Pending Entry
 * - Welcome Kit: Total Required, Distributed, Pending
 * - Breakfast: Total Collected, Pending
 * - Lunch: Total Collected, Pending
 * - WhatsApp: Sent, Delivered, Failed, Pending
 */
const getEventActivityDashboard = async (req, res) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    // 1. Fetch event metadata & confirmed registrations
    const [
      { data: eventData, error: evErr },
      { data: regsData, error: regErr },
      { data: activitiesData, error: actErr },
      { data: waLogsData, error: waErr },
    ] = await Promise.all([
      supabaseAdmin.from('events').select('*').eq('id', eventId).single(),
      supabaseAdmin
        .from('event_registrations')
        .select('id, full_name, category, member_id, payment_status, registration_status')
        .eq('event_id', eventId)
        .eq('registration_status', 'confirmed')
        .eq('payment_status', 'paid'),
      supabaseAdmin
        .from('event_attendee_activities')
        .select('*')
        .eq('event_id', eventId),
      supabaseAdmin
        .from('whatsapp_message_logs')
        .select('*')
        .eq('event_id', eventId),
    ]);

    if (evErr) throw evErr;
    if (regErr) throw regErr;
    if (actErr) throw actErr;

    const totalConfirmed = (regsData || []).length;
    const activities = activitiesData || [];
    const waLogs = waLogsData || [];

    // Distinct completions per activity type
    const entrySet = new Set();
    const kitSet = new Set();
    const breakfastSet = new Set();
    const lunchSet = new Set();

    activities.forEach((a) => {
      if (a.activity_type === 'entry') entrySet.add(a.registration_id);
      if (a.activity_type === 'welcome_kit') kitSet.add(a.registration_id);
      if (a.activity_type === 'breakfast') breakfastSet.add(a.registration_id);
      if (a.activity_type === 'lunch') lunchSet.add(a.registration_id);
    });

    const entryCheckedIn = entrySet.size;
    const kitsDistributed = kitSet.size;
    const breakfastCollected = breakfastSet.size;
    const lunchCollected = lunchSet.size;

    const waStats = {
      total: waLogs.length,
      sent: waLogs.filter((w) => w.delivery_status === 'sent' || w.delivery_status === 'simulated').length,
      delivered: waLogs.filter((w) => w.delivery_status === 'delivered' || w.delivery_status === 'read').length,
      failed: waLogs.filter((w) => w.delivery_status === 'failed').length,
      queued: waLogs.filter((w) => w.delivery_status === 'queued').length,
    };

    const dashboard = {
      event: formatEvent(eventData),
      totalAttendees: totalConfirmed,
      entry: {
        totalRequired: totalConfirmed,
        completed: entryCheckedIn,
        pending: Math.max(totalConfirmed - entryCheckedIn, 0),
        rate: totalConfirmed > 0 ? Math.round((entryCheckedIn / totalConfirmed) * 100) : 0,
      },
      welcomeKit: {
        totalRequired: totalConfirmed,
        completed: kitsDistributed,
        pending: Math.max(totalConfirmed - kitsDistributed, 0),
        rate: totalConfirmed > 0 ? Math.round((kitsDistributed / totalConfirmed) * 100) : 0,
      },
      breakfast: {
        totalRequired: totalConfirmed,
        completed: breakfastCollected,
        pending: Math.max(totalConfirmed - breakfastCollected, 0),
        rate: totalConfirmed > 0 ? Math.round((breakfastCollected / totalConfirmed) * 100) : 0,
      },
      lunch: {
        totalRequired: totalConfirmed,
        completed: lunchCollected,
        pending: Math.max(totalConfirmed - lunchCollected, 0),
        rate: totalConfirmed > 0 ? Math.round((lunchCollected / totalConfirmed) * 100) : 0,
      },
      whatsapp: waStats,
    };

    res.json(dashboard);
  } catch (err) {
    console.error('[getEventActivityDashboard] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to compute dashboard metrics' });
  }
};

/**
 * 6. Activity Reports & Export Data
 */
const getActivityReports = async (req, res) => {
  try {
    const { eventId, activityType, startDate, endDate, search } = req.query;

    let query = supabaseAdmin
      .from('event_attendee_activities')
      .select(`
        *,
        event_tickets (ticket_code, ticket_status),
        event_registrations (full_name, category, member_id, phone, email, business_name),
        events (title)
      `)
      .order('completed_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (activityType) query = query.eq('activity_type', activityType);
    if (startDate) query = query.gte('completed_at', startDate);
    if (endDate) query = query.lte('completed_at', `${endDate}T23:59:59.999Z`);

    const { data, error } = await query;
    if (error) throw error;

    let records = data || [];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      records = records.filter(
        (r) =>
          r.event_registrations?.full_name?.toLowerCase().includes(q) ||
          r.event_tickets?.ticket_code?.toLowerCase().includes(q) ||
          r.event_registrations?.phone?.includes(q) ||
          r.event_registrations?.member_id?.toLowerCase().includes(q) ||
          r.staff_email?.toLowerCase().includes(q)
      );
    }

    res.json(records);
  } catch (err) {
    console.error('[getActivityReports] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch activity reports' });
  }
};

/**
 * 7. Staff Permission Management (Super Admin)
 */
const getStaffPermissions = async (req, res) => {
  try {
    const { eventId } = req.query;
    let query = supabaseAdmin
      .from('event_staff_permissions')
      .select(`
        *,
        events (title)
      `)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('[getStaffPermissions] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to load staff permissions' });
  }
};

const saveStaffPermissions = async (req, res) => {
  try {
    const {
      eventId,
      staffUserId,
      staffEmail,
      canCheckin = false,
      canDistributeWelcomeKit = false,
      canDistributeBreakfast = false,
      canDistributeLunch = false,
    } = req.body;

    if (!eventId || !staffEmail) {
      return res.status(400).json({ error: 'eventId and staffEmail are required.' });
    }

    const payload = {
      event_id: eventId,
      staff_user_id: staffUserId || staffEmail,
      staff_email: staffEmail.trim().toLowerCase(),
      can_checkin: Boolean(canCheckin),
      can_distribute_welcome_kit: Boolean(canDistributeWelcomeKit),
      can_distribute_breakfast: Boolean(canDistributeBreakfast),
      can_distribute_lunch: Boolean(canDistributeLunch),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('event_staff_permissions')
      .upsert(payload, { onConflict: 'event_id,staff_user_id' })
      .select()
      .single();

    if (error) throw error;

    await logEventAudit({
      eventId,
      action: 'STAFF_PERMISSIONS_UPDATED',
      actor: req.user,
      metadata: payload,
    });

    res.json({ success: true, permissions: data });
  } catch (err) {
    console.error('[saveStaffPermissions] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to save staff permissions' });
  }
};

const deleteStaffPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('event_staff_permissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Staff permission removed' });
  } catch (err) {
    console.error('[deleteStaffPermission] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete staff permission' });
  }
};

/**
 * 8. Event WhatsApp Notification Settings (Super Admin)
 */
const getNotificationSettings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('event_notification_settings')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw error;

    res.json(
      data || {
        event_id: eventId,
        notify_registration: true,
        notify_entry: false,
        notify_welcome_kit: false,
        notify_breakfast: false,
        notify_lunch: false,
      }
    );
  } catch (err) {
    console.error('[getNotificationSettings] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch notification settings' });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      notifyRegistration = true,
      notifyEntry = false,
      notifyWelcomeKit = false,
      notifyBreakfast = false,
      notifyLunch = false,
    } = req.body;

    const payload = {
      event_id: eventId,
      notify_registration: Boolean(notifyRegistration),
      notify_entry: Boolean(notifyEntry),
      notify_welcome_kit: Boolean(notifyWelcomeKit),
      notify_breakfast: Boolean(notifyBreakfast),
      notify_lunch: Boolean(notifyLunch),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('event_notification_settings')
      .upsert(payload, { onConflict: 'event_id' })
      .select()
      .single();

    if (error) throw error;

    await logEventAudit({
      eventId,
      action: 'NOTIFICATION_SETTINGS_UPDATED',
      actor: req.user,
      metadata: payload,
    });

    res.json({ success: true, settings: data });
  } catch (err) {
    console.error('[updateNotificationSettings] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to update notification settings' });
  }
};

/**
 * 9. WhatsApp Logs & Retry
 */
const getWhatsAppLogs = async (req, res) => {
  try {
    const { eventId, status } = req.query;
    let query = supabaseAdmin
      .from('whatsapp_message_logs')
      .select(`
        *,
        events (title),
        event_registrations (full_name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('delivery_status', status);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('[getWhatsAppLogs] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to load WhatsApp logs' });
  }
};

const retryWhatsAppMessage = async (req, res) => {
  try {
    const { logId } = req.params;
    const { data: logRow, error: fetchErr } = await supabaseAdmin
      .from('whatsapp_message_logs')
      .select('*, event_registrations (*), events (*)')
      .eq('id', logId)
      .single();

    if (fetchErr || !logRow) {
      return res.status(404).json({ error: 'Message log not found' });
    }

    const payload = logRow.payload || {};
    const result = await sendWhatsAppMessage({
      toPhone: logRow.phone_number,
      messageType: logRow.message_type,
      eventId: logRow.event_id,
      registrationId: logRow.registration_id,
      ticketId: logRow.ticket_id,
      templateName: payload.templateName,
      parameters: payload.parameters,
      fallbackText: payload.fallbackText,
      mediaUrl: payload.mediaUrl,
      mediaType: payload.mediaType,
    });

    res.json({ success: result.success, result });
  } catch (err) {
    console.error('[retryWhatsAppMessage] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to retry WhatsApp message' });
  }
};

/**
 * 10. Existing Analytics (Backward compatibility)
 */
const getEventAnalytics = async (req, res) => {
  try {
    const {
      eventId,
      startDate,
      endDate,
      category,
      paymentMethod,
      paymentStatus,
      registrationStatus,
      checkinStatus,
    } = req.query;

    const [
      { data: eventsData, error: evErr },
      { data: regsData, error: regErr },
    ] = await Promise.all([
      supabaseAdmin.from('events').select('*').order('event_date', { ascending: false }),
      supabaseAdmin
        .from('event_registrations')
        .select(`
          *,
          events (id, title, event_date, venue),
          event_tickets (id, ticket_code, ticket_status, checked_in_at),
          event_payments (id, payment_method, razorpay_payment_id, amount, status, paid_at)
        `)
        .order('created_at', { ascending: false }),
    ]);

    if (evErr) throw evErr;
    if (regErr) throw regErr;

    const allEvents = (eventsData || []).map(formatEvent);
    const allRegs = (regsData || []).map((r) => {
      const ticket = Array.isArray(r.event_tickets) ? r.event_tickets[0] : r.event_tickets;
      const payment = Array.isArray(r.event_payments) ? r.event_payments[0] : r.event_payments;
      return {
        id: r.id,
        registrationCode: r.registration_code || r.id.slice(0, 8),
        eventId: r.event_id,
        eventName: r.events?.title || r.event_title || 'N/A',
        eventDate: r.events?.event_date || '',
        fullName: r.full_name || '',
        email: r.email || '',
        phone: r.phone || '',
        category: r.category || (r.member_type === 'old' ? 'member' : 'non_member'),
        memberId: r.member_id || r.membership_id || '',
        businessName: r.business_name || r.organization || '',
        city: r.city || r.district || '',
        ticketQuantity: Number(r.ticket_quantity || 1),
        totalAmount: Number(r.total_amount || 0),
        paymentMethod: r.payment_method || 'online',
        paymentStatus: r.payment_status || 'pending',
        registrationStatus: r.registration_status || r.status || 'pending',
        ticketCode: ticket?.ticket_code || '—',
        ticketStatus: ticket?.ticket_status || 'not_issued',
        checkedInAt: ticket?.checked_in_at || null,
        razorpayPaymentId: payment?.razorpay_payment_id || '',
        createdAt: r.created_at || r.registered_at,
      };
    });

    let filtered = allRegs;
    if (eventId) filtered = filtered.filter((r) => r.eventId === eventId);
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((r) => new Date(r.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.createdAt) <= end);
    }
    if (category) filtered = filtered.filter((r) => r.category === category);
    if (paymentMethod) filtered = filtered.filter((r) => r.paymentMethod === paymentMethod);
    if (paymentStatus) filtered = filtered.filter((r) => r.paymentStatus === paymentStatus);
    if (registrationStatus) filtered = filtered.filter((r) => r.registrationStatus === registrationStatus);
    if (checkinStatus) {
      if (checkinStatus === 'checked_in') {
        filtered = filtered.filter((r) => r.ticketStatus === 'checked_in');
      } else if (checkinStatus === 'not_checked_in') {
        filtered = filtered.filter((r) => r.ticketStatus !== 'checked_in');
      }
    }

    const scopedEvents = eventId ? allEvents.filter((e) => e.id === eventId) : allEvents;

    const kpis = {
      totalEvents: scopedEvents.length,
      totalRegistrations: filtered.length,
      totalMembers: filtered.filter((r) => r.category === 'member').length,
      totalNonMembers: filtered.filter((r) => r.category === 'non_member').length,
      onlinePayments: filtered.filter((r) => r.paymentMethod === 'online' && r.paymentStatus === 'paid').length,
      cashPayments: filtered.filter((r) => r.paymentMethod === 'cash' && r.paymentStatus === 'paid').length,
      pendingCashVerification: filtered.filter((r) => r.paymentStatus === 'cash_pending').length,
      totalRevenue: filtered
        .filter((r) => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + r.totalAmount, 0),
      checkedInAttendees: filtered.filter((r) => r.ticketStatus === 'checked_in').length,
      remainingTickets: scopedEvents.reduce((sum, e) => sum + e.availableTickets, 0),
    };

    res.json({
      kpis,
      events: allEvents,
      records: filtered,
    });
  } catch (err) {
    console.error('[getEventAnalytics]', err);
    res.status(500).json({ error: err.message || 'Failed to compute event analytics' });
  }
};

/**
 * 11. WhatsApp API Credentials Management
 */
const getWhatsAppApiConfig = async (req, res) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1313338285191863';
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1018349050966653';
    const apiUrl = process.env.WHATSAPP_API_URL || 'https://crmapi.1automations.com/api/meta';
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v19.0';
    const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);

    res.json({
      phoneNumberId,
      businessAccountId,
      apiUrl,
      apiVersion,
      hasToken,
      isConfigured: Boolean(phoneNumberId && hasToken),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const saveWhatsAppApiConfig = async (req, res) => {
  try {
    const { phoneNumberId, accessToken, businessAccountId, apiUrl, apiVersion } = req.body;

    if (phoneNumberId !== undefined) process.env.WHATSAPP_PHONE_NUMBER_ID = (phoneNumberId || '').trim();
    if (accessToken) process.env.WHATSAPP_ACCESS_TOKEN = accessToken.trim();
    if (businessAccountId !== undefined) process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = (businessAccountId || '').trim();
    if (apiUrl !== undefined) process.env.WHATSAPP_API_URL = (apiUrl || '').trim();
    if (apiVersion !== undefined) process.env.WHATSAPP_API_VERSION = (apiVersion || 'v19.0').trim();

    // Persist to server/.env if available
    try {
      const envPath = path.resolve(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');

        if (phoneNumberId !== undefined) {
          if (envContent.includes('WHATSAPP_PHONE_NUMBER_ID=')) {
            envContent = envContent.replace(/WHATSAPP_PHONE_NUMBER_ID=.*/, `WHATSAPP_PHONE_NUMBER_ID=${(phoneNumberId || '').trim()}`);
          } else {
            envContent += `\nWHATSAPP_PHONE_NUMBER_ID=${(phoneNumberId || '').trim()}`;
          }
        }

        if (accessToken) {
          if (envContent.includes('WHATSAPP_ACCESS_TOKEN=')) {
            envContent = envContent.replace(/WHATSAPP_ACCESS_TOKEN=.*/, `WHATSAPP_ACCESS_TOKEN=${accessToken.trim()}`);
          } else {
            envContent += `\nWHATSAPP_ACCESS_TOKEN=${accessToken.trim()}`;
          }
        }

        if (businessAccountId !== undefined) {
          if (envContent.includes('WHATSAPP_BUSINESS_ACCOUNT_ID=')) {
            envContent = envContent.replace(/WHATSAPP_BUSINESS_ACCOUNT_ID=.*/, `WHATSAPP_BUSINESS_ACCOUNT_ID=${(businessAccountId || '').trim()}`);
          } else {
            envContent += `\nWHATSAPP_BUSINESS_ACCOUNT_ID=${(businessAccountId || '').trim()}`;
          }
        }

        if (apiUrl !== undefined) {
          if (envContent.includes('WHATSAPP_API_URL=')) {
            envContent = envContent.replace(/WHATSAPP_API_URL=.*/, `WHATSAPP_API_URL=${(apiUrl || '').trim()}`);
          } else {
            envContent += `\nWHATSAPP_API_URL=${(apiUrl || '').trim()}`;
          }
        }

        fs.writeFileSync(envPath, envContent, 'utf8');
      }
    } catch (fsErr) {
      console.warn('[saveWhatsAppApiConfig] Error updating .env file:', fsErr.message);
    }

    res.json({
      success: true,
      message: 'WhatsApp API credentials saved successfully!',
      isConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendTestWhatsAppMessage = async (req, res) => {
  try {
    const { testPhone } = req.body;
    if (!testPhone) {
      return res.status(400).json({ error: 'Phone number is required for test send' });
    }

    const result = await sendRegistrationConfirmation({
      toPhone: testPhone,
      attendeeName: 'Dr. Test Member',
      eventName: 'ACLAP Maharashtra Annual Symposium 2026',
      ticketCode: 'TKT-TEST-999',
      qrToken: 'test-qr-token',
      eventDate: '19 Jan 2027',
      eventVenue: 'Sayaji Hotel, Kolhapur',
      ticketLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/ticket/TKT-TEST-999`,
    });

    res.json(result);
  } catch (err) {
    console.error('[sendTestWhatsAppMessage]', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch test message' });
  }
};

module.exports = {
  scanTicket,
  recordActivity,
  confirmCheckin,
  getRecentCheckins,
  getEventActivityDashboard,
  getActivityReports,
  getStaffPermissions,
  saveStaffPermissions,
  deleteStaffPermission,
  getNotificationSettings,
  updateNotificationSettings,
  getWhatsAppLogs,
  retryWhatsAppMessage,
  getWhatsAppApiConfig,
  saveWhatsAppApiConfig,
  sendTestWhatsAppMessage,
  getEventAnalytics,
};
