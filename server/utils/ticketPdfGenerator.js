const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { supabaseAdmin } = require('../config/supabaseAdmin');

/**
 * Generates a clean, professional PDF ticket with QR code
 * and uploads it to Supabase Storage (public bucket: uploads).
 * Returns the public CDN URL for WhatsApp document template delivery.
 */
const generateAndUploadTicketPdf = async ({
  ticketCode,
  qrToken,
  attendeeName,
  eventName,
  eventDate,
  eventVenue,
  memberId,
  category,
  businessName,
  paymentStatus = 'Paid / Confirmed',
}) => {
  try {
    const code = ticketCode || `TKT-${Date.now()}`;
    const token = qrToken || code;

    // 1. Generate QR Code image as Buffer
    const qrBuffer = await QRCode.toBuffer(token, {
      width: 250,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    // 2. Generate PDF using PDFKit in memory
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [420, 595], // A5 portrait in points
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header Banner (Navy blue #1e293b)
      doc.rect(0, 0, 420, 80).fill('#1e293b');

      // Title & Org
      doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold');
      doc.text('ACLAP MAHARASHTRA', 30, 22, { align: 'center', width: 360 });

      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica');
      doc.text('ASSOCIATION OF CLINICAL LABORATORY ANALYSTS & PRACTITIONERS', 30, 40, {
        align: 'center',
        width: 360,
      });

      doc.fillColor('#38bdf8').fontSize(8).font('Helvetica-Bold');
      doc.text('OFFICIAL EVENT ENTRY PASS / E-TICKET', 30, 55, {
        align: 'center',
        width: 360,
      });

      // Event Details Card
      let y = 100;
      doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold');
      doc.text(eventName || 'Scientific Event', 30, y, { width: 360 });
      y += doc.heightOfString(eventName || 'Scientific Event', { width: 360 }) + 6;

      doc.fillColor('#475569').fontSize(9).font('Helvetica');
      doc.text(`📅 Date: ${eventDate || 'Scheduled Date'}`, 30, y);
      y += 14;
      doc.text(`📍 Venue: ${eventVenue || 'Designated Venue'}`, 30, y);
      y += 20;

      // Dashed divider line
      doc
        .strokeColor('#cbd5e1')
        .lineWidth(1)
        .dash(3, { space: 3 })
        .moveTo(30, y)
        .lineTo(390, y)
        .stroke();
      doc.undash();
      y += 15;

      // Two-column layout for Attendee Details
      const col1 = 30;
      const col2 = 220;

      // Row 1: Attendee Name & Category
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold');
      doc.text('ATTENDEE NAME', col1, y);
      doc.text('CATEGORY', col2, y);
      y += 11;

      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold');
      doc.text(attendeeName || 'Delegate', col1, y);
      doc.fillColor('#2563eb').fontSize(9).font('Helvetica-Bold');
      doc.text(category === 'member' ? 'Verified Member' : 'Non-Member Delegate', col2, y);
      y += 18;

      // Row 2: Ticket Code & Payment Status
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold');
      doc.text('TICKET CODE', col1, y);
      doc.text('PAYMENT STATUS', col2, y);
      y += 11;

      doc.fillColor('#2563eb').fontSize(12).font('Courier-Bold');
      doc.text(code, col1, y);
      doc.fillColor('#16a34a').fontSize(10).font('Helvetica-Bold');
      doc.text(paymentStatus, col2, y);
      y += 20;

      if (memberId || businessName) {
        doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold');
        if (memberId) doc.text('MEMBER ID', col1, y);
        if (businessName) doc.text('ORGANIZATION / LAB', col2, y);
        y += 11;

        doc.fillColor('#0f172a').fontSize(9).font('Helvetica');
        if (memberId) doc.text(memberId, col1, y);
        if (businessName) doc.text(businessName, col2, y, { width: 170 });
        y += 18;
      }

      // QR Code in center
      y = Math.max(y, 280);
      const qrSize = 140;
      const qrX = (420 - qrSize) / 2;
      doc.image(qrBuffer, qrX, y, { width: qrSize, height: qrSize });
      y += qrSize + 12;

      // Instruction note
      doc.fillColor('#64748b').fontSize(8).font('Helvetica');
      doc.text(
        'Please display this QR Code at the registration desk for verification & entry badge.',
        30,
        y,
        { align: 'center', width: 360 }
      );
      y += 16;

      // Footer
      doc.fillColor('#94a3b8').fontSize(7).font('Helvetica');
      doc.text('Team ACLAP Maharashtra • E-Ticket generated securely', 30, y, {
        align: 'center',
        width: 360,
      });

      doc.end();
    });

    // 3. Upload to Supabase Storage (bucket: uploads)
    const storagePath = `tickets/${code}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('[TicketPdf] Supabase storage upload error:', uploadError);
      throw uploadError;
    }

    // 4. Retrieve Public URL
    const { data: pubData } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(storagePath);

    const publicUrl = pubData?.publicUrl;
    console.log(`[TicketPdf] Generated and uploaded ticket PDF successfully: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error('[TicketPdf] Error creating ticket PDF:', err);
    return null;
  }
};

module.exports = {
  generateAndUploadTicketPdf,
};
