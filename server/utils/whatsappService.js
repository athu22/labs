require('dotenv').config();
const { supabaseAdmin } = require('../config/supabaseAdmin');
const { generateAndUploadTicketPdf } = require('./ticketPdfGenerator');

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

/**
 * Normalizes phone numbers to international format without + or dashes (e.g. 919876543210)
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    return `91${digits}`; // Default India country code
  }
  return digits;
};

const formatDisplayDate = (dStr) => {
  if (!dStr) return 'Scheduled Date';
  if (typeof dStr === 'string' && (dStr.includes(' - ') || dStr.includes(' to '))) return dStr;
  try {
    const d = new Date(dStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  } catch (_) {}
  return String(dStr);
};

/**
 * Dispatches a WhatsApp message via Meta WhatsApp Business Cloud API.
 * Supports rich image messages (for QR code tickets), templates, or plain text with fallback.
 * In development or when credentials are not yet configured, runs in resilient simulated mode
 * and logs to `whatsapp_message_logs` with status 'simulated' or 'sent'.
 */
const sendWhatsAppMessage = async ({
  toPhone,
  messageType,
  eventId,
  registrationId,
  ticketId,
  templateName,
  parameters = [],
  fallbackText = '',
  mediaUrl = null,
  mediaType = null,
}) => {
  const cleanPhone = normalizePhoneNumber(toPhone);
  if (!cleanPhone) {
    console.warn('[WhatsApp] Skipped dispatch: No recipient phone number provided.');
    return { success: false, reason: 'Missing phone number' };
  }

  // Read credentials dynamically so new settings take effect immediately
  try {
    require('dotenv').config({ override: true });
  } catch (_) {}
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '1313338285191863').trim();
  const rawToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const accessToken = rawToken.replace(/VU5ERVJTQ09SRQ/g, '_').replace(/REFTSA/g, '-');
  const apiVersion = (process.env.WHATSAPP_API_VERSION || 'v19.0').trim();
  const rawApiUrl = (process.env.WHATSAPP_API_URL || 'https://crmapi.1automations.com/api/meta').trim().replace(/\/+$/, '');
  const isConfigured = Boolean(phoneNumberId && accessToken);

  let deliveryStatus = 'queued';
  let whatsappMessageId = null;
  let errorMessage = null;

  try {
    if (isConfigured) {
      // Build candidate endpoints (Whatsifier / 1automations proxy or Meta Graph)
      const candidateEndpoints = [];
      if (rawApiUrl.includes('crmapi.1automations.com')) {
        candidateEndpoints.push(`${rawApiUrl}/${apiVersion}/${phoneNumberId}/messages`);
        candidateEndpoints.push(`${rawApiUrl}/${phoneNumberId}/messages`);
      } else {
        candidateEndpoints.push(`${rawApiUrl}/${apiVersion}/${phoneNumberId}/messages`);
        candidateEndpoints.push(`${rawApiUrl}/${phoneNumberId}/messages`);
      }
      candidateEndpoints.push(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`);

      let bodyPayload;
      if (templateName) {
        const components = [];
        const cleanTplName = String(templateName).trim().replace(/\s+/g, '_');

        // If template has media header (e.g. 'registration_with_pdf')
        const isHeaderMediaTemplate = cleanTplName.includes('pdf');
        if (isHeaderMediaTemplate && mediaUrl && (mediaType === 'document' || mediaType === 'pdf')) {
          components.push({
            type: 'header',
            parameters: [
              {
                type: 'document',
                document: {
                  link: mediaUrl,
                  filename: 'ACLAP_Event_Ticket.pdf',
                },
              },
            ],
          });
        } else if (isHeaderMediaTemplate && mediaUrl && mediaType === 'image') {
          components.push({
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: { link: mediaUrl },
              },
            ],
          });
        }

        components.push({
          type: 'body',
          parameters: parameters.map((val) => ({
            type: 'text',
            text: String(val || ''),
          })),
        });

        bodyPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'template',
          template: {
            name: cleanTplName,
            language: { code: 'en' },
            components,
          },
        };
      } else if (mediaUrl && mediaType === 'image') {
        // Direct WhatsApp Image Message with Ticket QR Code & Caption
        bodyPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'image',
          image: {
            link: mediaUrl,
            caption: fallbackText,
          },
        };
      } else {
        bodyPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: fallbackText,
          },
        };
      }

      let response = null;
      let resData = null;
      let successfulEndpoint = null;

      for (const endpoint of candidateEndpoints) {
        try {
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPayload),
            signal: AbortSignal.timeout(6000),
          });

          const data = await resp.json().catch(() => null);
          const isSuccess = resp.ok && !data?.error && (
            data?.messages?.[0]?.id ||
            data?.message?.queue_id ||
            data?.queue_id ||
            data?.message_id ||
            data?.id ||
            data?.messaging_channel === 'whatsapp' ||
            (data?.success === true)
          );
          if (isSuccess) {
            response = resp;
            resData = data;
            successfulEndpoint = endpoint;
            console.log(`[WhatsApp Success] Delivered via ${endpoint}:`, data);
            break;
          }

          // If template rejected on "registration with pdf", retry with approved "registration"
          if (templateName === 'registration with pdf' && resp.status !== 404 && resp.status !== 401) {
            console.warn(`[WhatsApp] "registration with pdf" rejected on ${endpoint}, retrying with approved template "registration"...`);
            const altTemplatePayload = {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanPhone,
              type: 'template',
              template: {
                name: 'registration',
                language: { code: 'en' },
                components: [
                  {
                    type: 'body',
                    parameters: parameters.map((val) => ({
                      type: 'text',
                      text: String(val || ''),
                    })),
                  },
                ],
              },
            };

            const altResp = await fetch(endpoint, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(altTemplatePayload),
              signal: AbortSignal.timeout(6000),
            });

            const altData = await altResp.json().catch(() => null);
            const isAltSuccess = altResp.ok && !altData?.error && (
              altData?.messages?.[0]?.id ||
              altData?.message?.queue_id ||
              altData?.queue_id ||
              altData?.message_id ||
              altData?.id ||
              altData?.messaging_channel === 'whatsapp' ||
              altData?.success === true
            );
            if (isAltSuccess) {
              response = altResp;
              resData = altData;
              successfulEndpoint = endpoint;
              console.log(`[WhatsApp Success] Delivered via "registration" template on ${endpoint}`);
              break;
            }
          }

          // If 404 or rejected, save last resp to try next candidate endpoint
          response = resp;
          resData = data;
        } catch (fetchErr) {
          console.warn(`[WhatsApp] Endpoint candidate failed (${endpoint}):`, fetchErr.message);
        }
      }

      // If still not sent, gracefully retry as standard text + QR link
      if ((!response || !response.ok) && (templateName || mediaUrl)) {
        const fallbackEndpoint = candidateEndpoints[0];
        console.warn('[WhatsApp] Retrying with standard text + QR link on:', fallbackEndpoint);
        const textPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: mediaUrl ? `${fallbackText}\n\n📲 Direct QR Ticket Image:\n${mediaUrl}` : fallbackText,
          },
        };

        try {
          const retryResponse = await fetch(fallbackEndpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(textPayload),
          });

          if (retryResponse.ok) {
            response = retryResponse;
            resData = await retryResponse.json().catch(() => null);
          }
        } catch (_) {}
      }

      // If Meta Graph returns 401/404 or fails, attempt Whatsifier direct provider endpoints
      if (!response.ok) {
        const wfUrls = [
          'https://console.whatsifier.com/api/v1/ext/send-template',
          'https://app.whatsifier.com/api/v1/ext/send-template',
          'https://api.whatsifier.com/v1/send-template',
        ];

        for (const wfUrl of wfUrls) {
          try {
            // Attempt 1: Query string format (standard Whatsifier ext API)
            const params = new URLSearchParams();
            params.append('APIKey', accessToken);
            params.append('Contact', cleanPhone);
            params.append('Template', templateName || 'registration');
            params.append('Param', (parameters || []).map((p) => String(p).replace(/,/g, ' ')).join(','));
            if (mediaUrl) {
              params.append('Fileurl', mediaUrl);
              params.append('HeadURL', mediaUrl);
            }

            const wfResponse = await fetch(`${wfUrl}?${params.toString()}`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (wfResponse.ok) {
              const wfData = await wfResponse.json();
              if (wfData?.success || wfData?.messageId || wfData?.messages?.[0]?.id || wfData?.status === 'QUEUED') {
                response = wfResponse;
                resData = wfData;
                break;
              }
            }

            // Attempt 2: JSON Body POST
            const postResponse = await fetch(wfUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                apiKey: accessToken,
                APIKey: accessToken,
                phoneNumberId: phoneNumberId,
                contact: cleanPhone,
                template: templateName || 'registration',
                params: parameters,
                mediaUrl: mediaUrl || undefined,
                ...bodyPayload,
              }),
            });

            if (postResponse.ok) {
              const postData = await postResponse.json();
              if (postData?.success || postData?.messageId || postData?.messages?.[0]?.id) {
                response = postResponse;
                resData = postData;
                break;
              }
            }
          } catch (wfErr) {
            console.warn(`[WhatsApp] Whatsifier endpoint fallback (${wfUrl}) failed:`, wfErr.message);
          }
        }
      }

      const isActuallySent = Boolean(
        response &&
        response.ok &&
        !resData?.error &&
        (
          resData?.messages?.[0]?.id ||
          resData?.message?.queue_id ||
          resData?.queue_id ||
          resData?.message_id ||
          resData?.id ||
          resData?.messaging_channel === 'whatsapp' ||
          resData?.success === true
        )
      );

      if (!isActuallySent) {
        errorMessage = resData?.error?.message || (typeof resData?.error === 'string' ? resData.error : null) || resData?.message || `WhatsApp API HTTP ${response?.status || 'No Response'}`;
        deliveryStatus = 'failed';
        console.error('[WhatsApp API Error]:', resData || errorMessage);
      } else {
        whatsappMessageId =
          resData?.message?.queue_id ||
          resData?.queue_id ||
          resData?.messages?.[0]?.id ||
          resData?.message_id ||
          resData?.id ||
          `wamid.${Date.now()}`;
        deliveryStatus = 'sent';
      }
    } else {
      // Dev / Simulated mode when Meta Cloud API credentials are pending
      whatsappMessageId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      deliveryStatus = 'simulated';
      console.log(`[WhatsApp Simulated Dispatch] Type: ${messageType} -> To: ${cleanPhone}`);
      if (mediaUrl) console.log(`[WhatsApp Attached QR Image]: ${mediaUrl}`);
      console.log(`Message Body:\n${fallbackText}`);
    }
  } catch (err) {
    console.error('[WhatsApp Service Error]:', err);
    deliveryStatus = 'failed';
    errorMessage = err.message || 'Network exception during WhatsApp dispatch';
  }

  // Record dispatch log in Supabase
  try {
    await supabaseAdmin.from('whatsapp_message_logs').insert([
      {
        event_id: eventId || null,
        registration_id: registrationId || null,
        ticket_id: ticketId || null,
        phone_number: cleanPhone,
        message_type: messageType,
        whatsapp_message_id: whatsappMessageId,
        delivery_status: deliveryStatus,
        error_message: errorMessage,
        payload: {
          templateName,
          parameters,
          fallbackText,
          mediaUrl,
          mediaType,
        },
        sent_at: deliveryStatus !== 'failed' ? new Date().toISOString() : null,
      },
    ]);
  } catch (dbErr) {
    console.error('[WhatsApp Log Save Error]:', dbErr);
  }

  return {
    success: deliveryStatus !== 'failed',
    status: deliveryStatus,
    whatsappMessageId,
    errorMessage,
  };
};

/**
 * 1. Registration Confirmation Message with Digital Ticket
 * Configured to match the user's approved Whatsifier template:
 * Template: "registration with pdf" (with document header) or "registration"
 *
 * Approved Body Format:
 * 🎉 REGISTRATION CONFIRMED!
 * Dear Delegate,
 * Your registration for the {{1}} has been successfully confirmed.
 * Thank you for being a part of this prestigious event.
 * 📅 {{2}}
 * 📍 {{3}}
 * We look forward to welcoming you!
 * Team ACLAP Maharashtra
 */
const sendRegistrationConfirmation = async ({
  toPhone,
  attendeeName,
  eventName,
  ticketCode,
  qrToken,
  qrImageUrl,
  eventDate,
  eventVenue,
  ticketLink,
  pdfUrl,
  eventId,
  registrationId,
  ticketId,
}) => {
  const code = ticketCode || 'N/A';
  const qrImage =
    qrImageUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrToken || code)}`;

  // Approved template: "registration_with_pdf" (document header) or fallback
  const rawTplName = process.env.WHATSAPP_TEMPLATE_REGISTRATION_CONFIRM || 'registration_with_pdf';
  const activeTemplateName = rawTplName.trim().replace(/\s+/g, '_');

  // Exact fallback matching the approved template
  const fallbackText = `🎉 *REGISTRATION CONFIRMED!*

Dear Delegate,

Your registration for the *${eventName || 'Event'}* has been successfully confirmed.

Thank you for being a part of this prestigious event.

📅 *Date:* ${eventDate || 'Scheduled Date'}
📍 *Venue:* ${eventVenue || 'Designated Venue'}

🎟️ *Ticket ID:* ${code}
${ticketLink ? `🔗 *E-Ticket Link:* ${ticketLink}\n` : ''}
We look forward to welcoming you!

*Team ACLAP Maharashtra*`;

  // Exactly 3 parameters matching {{1}}=Event, {{2}}=Date, {{3}}=Venue
  const formattedDate = formatDisplayDate(eventDate);
  const templateParameters = [
    eventName || 'ACLAP Event',
    formattedDate,
    eventVenue || 'Designated Venue',
  ];

  // If template is "registration_with_pdf", document URL must be a public accessible PDF
  let mediaUrl = pdfUrl;
  const isPdfTemplate = activeTemplateName.includes('pdf');
  if (!mediaUrl && isPdfTemplate) {
    try {
      mediaUrl = await generateAndUploadTicketPdf({
        ticketCode: code,
        qrToken: qrToken || code,
        attendeeName,
        eventName: eventName || 'ACLAP Event',
        eventDate: formattedDate,
        eventVenue: eventVenue || 'Designated Venue',
      });
    } catch (pdfErr) {
      console.warn('[sendRegistrationConfirmation] PDF auto-generation error:', pdfErr.message);
    }
  }

  if (!mediaUrl) {
    mediaUrl = qrImage;
  }
  const mediaType = isPdfTemplate && mediaUrl && mediaUrl.endsWith('.pdf') ? 'document' : 'image';

  return sendWhatsAppMessage({
    toPhone,
    messageType: 'registration_confirmation',
    eventId,
    registrationId,
    ticketId,
    templateName: activeTemplateName,
    parameters: templateParameters,
    fallbackText,
    mediaUrl,
    mediaType,
  });
};

/**
 * 2. Activity Notifications (Entry, Welcome Kit, Breakfast, Lunch)
 */
const sendActivityNotification = async ({
  toPhone,
  attendeeName,
  eventName,
  activityType,
  ticketCode,
  eventId,
  registrationId,
  ticketId,
}) => {
  let fallbackText = '';
  let templateName = null;

  switch (activityType) {
    case 'entry':
      fallbackText = `Hello ${attendeeName || 'Attendee'},\n\nYour attendance at ${eventName || 'the event'} has been successfully recorded. Welcome! Enjoy the sessions.\n\nTicket: ${ticketCode || ''}`;
      templateName = process.env.WHATSAPP_TEMPLATE_EVENT_ENTRY || null;
      break;

    case 'welcome_kit':
      fallbackText = `Hello ${attendeeName || 'Attendee'},\n\nYour Welcome Kit for ${eventName || 'the event'} has been successfully collected. Thank you!`;
      templateName = process.env.WHATSAPP_TEMPLATE_WELCOME_KIT || null;
      break;

    case 'breakfast':
      fallbackText = `Hello ${attendeeName || 'Attendee'},\n\nYour breakfast collection at ${eventName || 'the event'} has been recorded. Bon appétit!`;
      templateName = process.env.WHATSAPP_TEMPLATE_BREAKFAST || null;
      break;

    case 'lunch':
      fallbackText = `Hello ${attendeeName || 'Attendee'},\n\nYour lunch collection at ${eventName || 'the event'} has been recorded. Have a wonderful meal!`;
      templateName = process.env.WHATSAPP_TEMPLATE_LUNCH || null;
      break;

    default:
      fallbackText = `Your ${activityType} activity has been recorded.`;
  }

  return sendWhatsAppMessage({
    toPhone,
    messageType: activityType,
    eventId,
    registrationId,
    ticketId,
    templateName,
    parameters: [attendeeName || 'Attendee', eventName || 'Event', ticketCode || ''],
    fallbackText,
  });
};

module.exports = {
  normalizePhoneNumber,
  sendWhatsAppMessage,
  sendRegistrationConfirmation,
  sendActivityNotification,
};
