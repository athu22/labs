const { supabaseAdmin } = require('../config/supabaseAdmin');

const logEventAudit = async ({
  eventId = null,
  registrationId = null,
  ticketId = null,
  action,
  actor = null,
  metadata = {},
}) => {
  try {
    await supabaseAdmin.from('event_audit_logs').insert([
      {
        event_id: eventId,
        registration_id: registrationId,
        ticket_id: ticketId,
        action,
        actor_id: actor?.id || null,
        actor_email: actor?.email || null,
        actor_role: actor?.role || 'public',
        metadata,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('[EventAudit] Failed to record audit log:', err.message);
  }
};

const formatEvent = (ev, featuredIds = []) => {
  if (!ev) return null;
  const totalCapacity = Number(ev.total_capacity ?? 100);
  const regLimit = ev.registration_limit ? Number(ev.registration_limit) : totalCapacity;
  const effectiveLimit = Math.min(totalCapacity, regLimit);
  const bookedCount = Number(ev.booked_count ?? 0);
  const availableTickets = Math.max(effectiveLimit - bookedCount, 0);

  const rawDate = ev.date || ev.event_date || '';
  const isMulti = Boolean(
    (ev.event_end_date && ev.event_end_date !== ev.event_date) ||
    (typeof rawDate === 'string' && rawDate.includes(' to '))
  );
  const startDate = ev.event_date || (typeof rawDate === 'string' && rawDate.includes(' to ') ? rawDate.split(' to ')[0].trim() : rawDate) || '';
  const endDate = ev.event_end_date || (typeof rawDate === 'string' && rawDate.includes(' to ') ? rawDate.split(' to ')[1].trim() : '') || '';

  const isFeatured = Boolean(
    ev.is_featured ||
    ev.isFeatured ||
    (Array.isArray(featuredIds) && featuredIds.includes(ev.id))
  );

  return {
    id: ev.id,
    title: ev.title,
    description: ev.description || '',
    imageUrl: ev.image_url || '',
    eventDate: startDate,
    eventEndDate: endDate,
    isMultiDay: isMulti,
    date: rawDate || startDate,
    startTime: ev.start_time || '',
    endTime: ev.end_time || '',
    venue: ev.venue || ev.location || '',
    location: ev.venue || ev.location || '',
    address: ev.address || '',
    category: ev.category || 'Clinical Workshop',
    district: ev.district || '',
    adminEmail: ev.admin_email || '',
    registrationStartDate: ev.registration_start_date || null,
    registrationEndDate: ev.registration_end_date || null,
    totalCapacity,
    registrationLimit: ev.registration_limit ?? null,
    bookedCount,
    availableTickets,
    status: ev.status || 'published',
    isFeatured,
    registrationType: ev.registration_type || 'both',
    memberFee: Number(ev.member_fee ?? 0),
    nonMemberFee: Number(ev.non_member_fee ?? 0),
    isFree: Boolean(ev.is_free),
    allowCashPayment: ev.allow_cash_payment !== false,
    allowOnlinePayment: ev.allow_online_payment !== false,
    maxTicketsPerPerson: Number(ev.max_tickets_per_person ?? 1),
    createdAt: ev.created_at,
    updatedAt: ev.updated_at,
  };
};

const isUuid = (val) =>
  typeof val === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

module.exports = {
  logEventAudit,
  formatEvent,
  isUuid,
};
