const crypto = require('crypto');

const getSigningSecret = () =>
  process.env.TICKET_SIGNING_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'aclap-event-ticket-secret-change-in-prod';

/**
 * Generates an opaque HMAC-SHA256 signed QR token containing only ticket reference IDs.
 * Never embeds personal information or payment secrets.
 */
const signTicketToken = ({ ticketCode, eventId, registrationId }) => {
  const payloadObj = {
    t: ticketCode,
    e: eventId,
    r: registrationId,
    v: 1,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url')
    .slice(0, 32);

  return `ACLAP1.${payloadB64}.${sig}`;
};

const verifyTicketToken = (token) => {
  if (!token || typeof token !== 'string') return { valid: false, reason: 'Empty QR token' };
  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'ACLAP1') {
    return { valid: false, reason: 'Unrecognized QR token format' };
  }

  const [, payloadB64, receivedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url')
    .slice(0, 32);

  const a = Buffer.from(expectedSig, 'utf8');
  const b = Buffer.from(receivedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: 'Invalid QR signature' };
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!parsed.t || !parsed.e || !parsed.r) {
      return { valid: false, reason: 'Malformed QR payload' };
    }
    return {
      valid: true,
      ticketCode: parsed.t,
      eventId: parsed.e,
      registrationId: parsed.r,
    };
  } catch {
    return { valid: false, reason: 'Corrupted QR payload' };
  }
};

module.exports = {
  signTicketToken,
  verifyTicketToken,
};
