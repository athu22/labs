const { supabaseAdmin } = require('../config/supabaseAdmin');
const {
  getRazorpayClient,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} = require('../config/razorpay');
const { signTicketToken } = require('../utils/ticketSigner');
const { logEventAudit, formatEvent } = require('../utils/eventAudit');
const { generateUniqueTicketCode } = require('./eventController');
const { sendRegistrationConfirmation } = require('../utils/whatsappService');
const { generateAndUploadTicketPdf } = require('../utils/ticketPdfGenerator');

// Helper to trigger registration confirmation WhatsApp asynchronously
const triggerRegistrationWhatsApp = async (reg, event, ticket) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const ticketLink = `${clientUrl}/ticket/${ticket.ticket_code}`;
    const qrToken = ticket.qr_token || ticket.ticket_code;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrToken)}`;

    // Generate downloadable PDF ticket with crisp QR code uploaded to Supabase Storage
    let pdfUrl = null;
    try {
      pdfUrl = await generateAndUploadTicketPdf({
        ticketCode: ticket.ticket_code,
        qrToken,
        attendeeName: reg.full_name,
        eventName: event?.title || reg.event_title || 'ACLAP Event',
        eventDate: event?.date || event?.event_date || '',
        eventVenue: event?.venue || event?.location || '',
        memberId: reg.member_id || reg.membership_id,
        category: reg.category,
        businessName: reg.business_name || reg.organization,
        paymentStatus: 'Paid / Confirmed',
      });
    } catch (pdfErr) {
      console.warn('[triggerRegistrationWhatsApp] PDF creation error:', pdfErr.message);
    }

    await sendRegistrationConfirmation({
      toPhone: reg.phone,
      attendeeName: reg.full_name,
      eventName: event?.title || reg.event_title || 'ACLAP Event',
      ticketCode: ticket.ticket_code,
      qrToken,
      qrImageUrl,
      eventDate: event?.date || event?.event_date || '',
      eventVenue: event?.venue || event?.location || '',
      ticketLink,
      pdfUrl,
      eventId: reg.event_id,
      registrationId: reg.id,
      ticketId: ticket.id,
    });
  } catch (err) {
    console.error('[WhatsApp Trigger Error]:', err);
  }
};

// Helper: Issue ticket idempotently after verified payment
const issueTicketForVerifiedRegistration = async (registrationId, eventId) => {
  const { data: existingTicket } = await supabaseAdmin
    .from('event_tickets')
    .select('*')
    .eq('registration_id', registrationId)
    .single();

  if (existingTicket) return existingTicket;

  const ticketCode = await generateUniqueTicketCode();
  const qrToken = signTicketToken({ ticketCode, eventId, registrationId });

  let ticket = null;
  const { data: rpcTicket, error } = await supabaseAdmin.rpc('issue_event_ticket', {
    p_registration_id: registrationId,
    p_ticket_code: ticketCode,
    p_qr_token: qrToken,
  });

  if (!error && rpcTicket) {
    ticket = rpcTicket;
  } else {
    console.warn('[issueConfirmedTicket] issue_event_ticket RPC fallback:', error?.message);
    await supabaseAdmin
      .from('event_registrations')
      .update({
        payment_status: 'paid',
        registration_status: 'confirmed',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId);

    const { data: directTicket, error: dtErr } = await supabaseAdmin
      .from('event_tickets')
      .insert([
        {
          ticket_code: ticketCode,
          registration_id: registrationId,
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

  return ticket;
};

// --- Verify Razorpay Online Payment & Generate Ticket ---
const verifyOnlinePayment = async (req, res) => {
  try {
    const {
      registrationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!registrationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required Razorpay verification fields.' });
    }

    // 1. Verify Razorpay HMAC signature
    const isValidSig = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!isValidSig) {
      await logEventAudit({
        registrationId,
        action: 'ONLINE_PAYMENT_SIGNATURE_FAILED',
        actor: req.user,
        metadata: { razorpay_order_id, razorpay_payment_id },
      });
      return res.status(400).json({ error: 'Invalid payment signature. Verification rejected.' });
    }

    // 2. Load registration & payment record
    const { data: reg, error: regErr } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regErr || !reg) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    const { data: paymentRow } = await supabaseAdmin
      .from('event_payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (!paymentRow || paymentRow.registration_id !== registrationId) {
      return res.status(400).json({ error: 'Order does not match registration.' });
    }

    // Idempotent check: already paid & confirmed
    if (paymentRow.status === 'paid' && reg.payment_status === 'paid') {
      const existingTicket = await issueTicketForVerifiedRegistration(reg.id, reg.event_id);
      const { data: eventRow } = await supabaseAdmin.from('events').select('*').eq('id', reg.event_id).single();
      return res.json({
        verified: true,
        alreadyProcessed: true,
        registration: reg,
        ticket: existingTicket,
        event: formatEvent(eventRow),
      });
    }

    // 3. Verify actual payment status directly from Razorpay API
    const razorpay = getRazorpayClient();
    const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);

    const expectedPaise = Math.round(Number(reg.total_amount) * 100);
    if (
      !rzpPayment ||
      rzpPayment.order_id !== razorpay_order_id ||
      rzpPayment.status !== 'captured' ||
      Number(rzpPayment.amount) !== expectedPaise
    ) {
      await logEventAudit({
        eventId: reg.event_id,
        registrationId: reg.id,
        action: 'ONLINE_PAYMENT_NOT_CAPTURED',
        actor: req.user,
        metadata: {
          razorpay_payment_id,
          status: rzpPayment?.status,
          amount: rzpPayment?.amount,
          expectedPaise,
        },
      });
      return res.status(400).json({
        error: `Payment is not captured (status: ${rzpPayment?.status || 'unknown'}). Ticket cannot be issued yet.`,
      });
    }

    // 4. Update payment record (unique constraint on razorpay_payment_id prevents replay)
    const { error: payUpdateErr } = await supabaseAdmin
      .from('event_payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
        paid_at: new Date().toISOString(),
        gateway_response: rzpPayment,
      })
      .eq('id', paymentRow.id);

    if (payUpdateErr) throw payUpdateErr;

    // 5. Issue unique Ticket ID & signed QR code atomically
    const ticket = await issueTicketForVerifiedRegistration(reg.id, reg.event_id);

    const { data: updatedReg } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('id', reg.id)
      .single();

    const { data: eventRow } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', reg.event_id)
      .single();

    await logEventAudit({
      eventId: reg.event_id,
      registrationId: reg.id,
      ticketId: ticket?.id,
      action: 'ONLINE_PAYMENT_VERIFIED',
      actor: req.user,
      metadata: {
        razorpay_order_id,
        razorpay_payment_id,
        amount: reg.total_amount,
        ticketCode: ticket?.ticket_code,
      },
    });

    // Trigger WhatsApp Registration Confirmation asynchronously
    triggerRegistrationWhatsApp(updatedReg || reg, eventRow, ticket);

    res.json({
      verified: true,
      registration: updatedReg,
      ticket,
      event: formatEvent(eventRow),
    });
  } catch (err) {
    console.error('[verifyOnlinePayment]', err);
    res.status(500).json({ error: err.message || 'Payment verification failed.' });
  }
};

// --- Razorpay Webhook (Reconciliation for captured/failed/refunded payments) ---
const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ error: 'Invalid Razorpay webhook signature' });
    }

    const payload = Buffer.isBuffer(req.body) ? JSON.parse(rawBody) : req.body;
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return res.json({ status: 'ignored' });
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    const { data: paymentRow } = await supabaseAdmin
      .from('event_payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (!paymentRow) {
      return res.json({ status: 'order_not_found' });
    }

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      if (paymentRow.status !== 'paid') {
        await supabaseAdmin
          .from('event_payments')
          .update({
            razorpay_payment_id: paymentId,
            status: 'paid',
            paid_at: new Date().toISOString(),
            gateway_response: paymentEntity,
          })
          .eq('id', paymentRow.id);

        const ticket = await issueTicketForVerifiedRegistration(
          paymentRow.registration_id,
          paymentRow.event_id
        );

        await logEventAudit({
          eventId: paymentRow.event_id,
          registrationId: paymentRow.registration_id,
          ticketId: ticket?.id,
          action: 'WEBHOOK_PAYMENT_CAPTURED',
          metadata: { orderId, paymentId, ticketCode: ticket?.ticket_code },
        });

        // Trigger WhatsApp confirmation
        const { data: hookReg } = await supabaseAdmin.from('event_registrations').select('*').eq('id', paymentRow.registration_id).single();
        const { data: hookEvent } = await supabaseAdmin.from('events').select('*').eq('id', paymentRow.event_id).single();
        if (hookReg && ticket) {
          triggerRegistrationWhatsApp(hookReg, hookEvent, ticket);
        }
      }
    } else if (eventType === 'payment.failed') {
      if (paymentRow.status !== 'paid') {
        await supabaseAdmin
          .from('event_payments')
          .update({ status: 'failed', gateway_response: paymentEntity })
          .eq('id', paymentRow.id);

        const { data: reg } = await supabaseAdmin
          .from('event_registrations')
          .select('id, event_id, ticket_quantity, registration_status')
          .eq('id', paymentRow.registration_id)
          .single();

        if (reg && reg.registration_status === 'pending_payment') {
          await supabaseAdmin
            .from('event_registrations')
            .update({ payment_status: 'failed', registration_status: 'cancelled', status: 'cancelled' })
            .eq('id', reg.id);

          const { data: ev } = await supabaseAdmin.from('events').select('booked_count').eq('id', reg.event_id).single();
          if (ev) {
            await supabaseAdmin
              .from('events')
              .update({ booked_count: Math.max((ev.booked_count || 0) - (reg.ticket_quantity || 1), 0) })
              .eq('id', reg.event_id);
          }
        }

        await logEventAudit({
          eventId: paymentRow.event_id,
          registrationId: paymentRow.registration_id,
          action: 'WEBHOOK_PAYMENT_FAILED',
          metadata: { orderId, paymentId },
        });
      }
    } else if (eventType === 'refund.processed' || eventType === 'payment.refunded') {
      await supabaseAdmin
        .from('event_payments')
        .update({ status: 'refunded', gateway_response: paymentEntity })
        .eq('id', paymentRow.id);

      await supabaseAdmin
        .from('event_registrations')
        .update({ payment_status: 'refunded', registration_status: 'cancelled', status: 'cancelled' })
        .eq('id', paymentRow.registration_id);

      await supabaseAdmin
        .from('event_tickets')
        .update({ ticket_status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('registration_id', paymentRow.registration_id);

      await logEventAudit({
        eventId: paymentRow.event_id,
        registrationId: paymentRow.registration_id,
        action: 'WEBHOOK_PAYMENT_REFUNDED',
        metadata: { orderId, paymentId },
      });
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[handleRazorpayWebhook]', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};

// --- Super Admin / Assigned Staff: List Pending Cash Registrations ---
// --- Two-Tier Cash Registrations (District Admin -> Super Admin) ---
const getPendingCashRegistrations = async (req, res) => {
  try {
    let query = supabaseAdmin
      .from('event_registrations')
      .select(`
        *,
        events (id, title, event_date, venue, admin_email)
      `)
      .in('payment_status', ['cash_pending', 'district_verified'])
      .in('registration_status', [
        'pending_district_approval',
        'pending_super_admin',
        'pending_verification',
        'district_verified',
      ])
      .order('created_at', { ascending: false });

    const isSuperAdmin = req.user?.role === 'super-admin';
    const userDistrict = (req.user?.district || '').trim();

    if (!isSuperAdmin) {
      // District Admin (role: 'admin'):
      // Filter by attendee's selected district or chapter_name, or event admin email
      if (userDistrict) {
        query = query.or(
          `district.ilike.%${userDistrict}%,chapter_name.ilike.%${userDistrict}%,city.ilike.%${userDistrict}%,event_admin_email.eq.${req.user.email}`
        );
      } else {
        query = query.eq('event_admin_email', req.user.email);
      }
    }

    const { data: rawData, error } = await query;
    if (error) throw error;

    // Attach latest verification audit note (e.g. from district admin)
    const regIds = (rawData || []).map((r) => r.id);
    const verificationsMap = {};
    if (regIds.length > 0) {
      const { data: verifs } = await supabaseAdmin
        .from('event_cash_verifications')
        .select('*')
        .in('registration_id', regIds)
        .order('verified_at', { ascending: false });

      (verifs || []).forEach((v) => {
        if (!verificationsMap[v.registration_id]) {
          verificationsMap[v.registration_id] = v;
        }
      });
    }

    const enriched = (rawData || []).map((r) => {
      const verif = verificationsMap[r.id] || null;
      const isDistrictApproved =
        r.registration_status === 'pending_super_admin' ||
        r.payment_status === 'district_verified' ||
        Boolean(verif);

      return {
        ...r,
        districtVerification: verif,
        isDistrictApproved,
        approvalStage: isDistrictApproved ? 'pending_super_admin' : 'pending_district_approval',
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('[getPendingCashRegistrations]', err);
    res.status(500).json({ error: err.message || 'Failed to load pending cash registrations' });
  }
};

// --- Verify Cash Payment: Stage 1 (District Admin) or Stage 2 (Super Admin) ---
const verifyCashPayment = async (req, res) => {
  try {
    const { regId } = req.params;
    const { amountReceived, receiptNotes = '', action } = req.body;

    const { data: reg, error: regErr } = await supabaseAdmin
      .from('event_registrations')
      .select(`*, events (id, title, admin_email)`)
      .eq('id', regId)
      .single();

    if (regErr || !reg) {
      return res.status(404).json({ error: 'Cash registration not found.' });
    }

    if (reg.payment_status === 'paid' && reg.registration_status === 'confirmed') {
      return res.status(409).json({ error: 'This registration has already been verified and paid.' });
    }

    const expectedAmount = Number(reg.total_amount || 0);
    const received = Number(amountReceived);
    if (Number.isNaN(received) || received < expectedAmount) {
      return res.status(400).json({
        error: `Amount received (₹${received || 0}) cannot be less than the registration fee (₹${expectedAmount}).`,
      });
    }

    const isSuperAdmin = req.user?.role === 'super-admin';
    const userDistrict = (req.user?.district || '').toLowerCase().trim();
    const regDistrict = (reg.district || reg.chapter_name || reg.city || '').toLowerCase().trim();
    const isAssignedEventAdmin = (reg.events?.admin_email || reg.event_admin_email) === req.user.email;
    const isDistrictAdmin = userDistrict && regDistrict.includes(userDistrict);

    if (!isSuperAdmin && !isAssignedEventAdmin && !isDistrictAdmin) {
      return res.status(403).json({
        error: `You are authorized for ${req.user.district || 'your'} district only. This attendee registered from ${reg.district || 'another district'}.`,
      });
    }

    // Determine Stage:
    // If not super-admin OR explicit action is 'district_approve', run Stage 1
    const runDistrictApproval =
      !isSuperAdmin ||
      action === 'district_approve' ||
      (reg.registration_status === 'pending_district_approval' && action !== 'super_admin_override' && action !== 'final_approve');

    if (!isSuperAdmin && reg.registration_status === 'pending_super_admin') {
      return res.status(400).json({
        error: 'This registration has already received District approval and is awaiting Super Admin final approval.',
      });
    }

    if (runDistrictApproval) {
      // =========================================================================
      // STAGE 1: DISTRICT ADMIN VERIFICATION (पहिली पायरी: जिल्हा प्रतिनिधी मंजुरी)
      // =========================================================================
      const districtPrefix = `[जिल्हा प्रतिनिधी पडताळणी: ${req.user?.district || 'District Admin'}]`;
      const fullNotes = receiptNotes ? `${districtPrefix} ${receiptNotes}` : districtPrefix;

      await supabaseAdmin.from('event_cash_verifications').insert([
        {
          registration_id: reg.id,
          event_id: reg.event_id,
          expected_amount: expectedAmount,
          amount_received: received,
          receipt_notes: fullNotes,
          verified_by: req.user.id,
          verified_by_email: req.user.email,
          verified_at: new Date().toISOString(),
        },
      ]);

      await supabaseAdmin
        .from('event_registrations')
        .update({
          payment_status: 'district_verified',
          registration_status: 'pending_super_admin',
          status: 'pending_super_admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reg.id);

      await supabaseAdmin
        .from('event_payments')
        .update({
          status: 'district_verified',
        })
        .eq('registration_id', reg.id);

      await logEventAudit({
        eventId: reg.event_id,
        registrationId: reg.id,
        action: 'CASH_DISTRICT_VERIFIED',
        actor: req.user,
        metadata: {
          district: req.user?.district || reg.district,
          amountReceived: received,
          notes: receiptNotes,
        },
      });

      return res.json({
        verified: true,
        stage: 'district_verified',
        message: `रोख शुल्क ${req.user?.district || reg.district} जिल्हा प्रतिनिधीकडून मंजूर झाले आहे! आता मुख्य Super Admin कडे अंतिम मंजुरीसाठी पाठवले आहे.`,
      });
    }

    // =========================================================================
    // STAGE 2: MAIN SUPER ADMIN FINAL APPROVAL (दुसरी पायरी: मुख्य Super Admin अंतिम मंजुरी)
    // =========================================================================
    const superAdminPrefix = `[मुख्य Super Admin अंतिम मंजुरी]`;
    const fullNotes = receiptNotes ? `${superAdminPrefix} ${receiptNotes}` : superAdminPrefix;

    const { data: verification } = await supabaseAdmin
      .from('event_cash_verifications')
      .insert([
        {
          registration_id: reg.id,
          event_id: reg.event_id,
          expected_amount: expectedAmount,
          amount_received: received,
          receipt_notes: fullNotes,
          verified_by: req.user.id,
          verified_by_email: req.user.email,
          verified_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    // Update payment record to paid
    const { data: existingPay } = await supabaseAdmin
      .from('event_payments')
      .select('id')
      .eq('registration_id', reg.id)
      .limit(1);

    if (existingPay && existingPay.length > 0) {
      await supabaseAdmin
        .from('event_payments')
        .update({
          payment_method: 'cash',
          amount: received,
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', existingPay[0].id);
    } else {
      await supabaseAdmin.from('event_payments').insert([
        {
          registration_id: reg.id,
          event_id: reg.event_id,
          payment_method: 'cash',
          amount: received,
          currency: 'INR',
          status: 'paid',
          paid_at: new Date().toISOString(),
        },
      ]);
    }

    // Update registration to confirmed & paid
    await supabaseAdmin
      .from('event_registrations')
      .update({
        payment_status: 'paid',
        registration_status: 'confirmed',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reg.id);

    // Issue unique Ticket ID & signed QR code
    const ticket = await issueTicketForVerifiedRegistration(reg.id, reg.event_id);

    await logEventAudit({
      eventId: reg.event_id,
      registrationId: reg.id,
      ticketId: ticket?.id,
      action: 'CASH_FINAL_SUPER_ADMIN_VERIFIED',
      actor: req.user,
      metadata: {
        expectedAmount,
        amountReceived: received,
        receiptNotes,
        ticketCode: ticket?.ticket_code,
      },
    });

    // Trigger WhatsApp Confirmation
    triggerRegistrationWhatsApp(reg, reg.events, ticket);

    res.json({
      verified: true,
      stage: 'final_approved',
      message: 'मुख्य Super Admin कडून अंतिम मंजुरी पूर्ण झाली आणि डिजिटल QR तिकीट सक्रिय करण्यात आले!',
      verification,
      ticket,
    });
  } catch (err) {
    console.error('[verifyCashPayment]', err);
    res.status(500).json({ error: err.message || 'Failed to verify cash payment.' });
  }
};

// --- Super Admin / Assigned Staff: Cash Verification Audit History ---
const getCashVerificationLogs = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_cash_verifications')
      .select(`
        *,
        event_registrations (registration_code, full_name, phone, category, member_id),
        events (title, admin_email)
      `)
      .order('verified_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const filtered =
      req.user.role === 'super-admin'
        ? data || []
        : (data || []).filter((row) => row.events?.admin_email === req.user.email);

    res.json(filtered);
  } catch (err) {
    console.error('[getCashVerificationLogs]', err);
    res.status(500).json({ error: err.message || 'Failed to load cash verification history' });
  }
};

module.exports = {
  verifyOnlinePayment,
  handleRazorpayWebhook,
  getPendingCashRegistrations,
  verifyCashPayment,
  getCashVerificationLogs,
};
