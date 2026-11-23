import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import {
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  User,
  Shield,
  Copy,
  Check,
  Building,
  QrCode as QrIcon,
} from 'lucide-react';

const DigitalTicket = ({
  ticket,
  registration,
  event,
  isProvisional = false,
  showActions = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const ticketRef = useRef(null);

  const ticketCode = ticket?.ticket_code || ticket?.ticketCode || '';
  const registrationCode =
    registration?.registration_code ||
    registration?.registrationCode ||
    registration?.id?.slice(0, 8);
  const qrPayload = ticket?.qr_token || ticketCode || registrationCode || 'ACLAP-TICKET';

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => console.error('[DigitalTicket] QR generation failed:', err));

    return () => {
      isMounted = false;
    };
  }, [qrPayload]);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${ticketCode || registrationCode}-QR.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      // Background card
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(6, 6, 136, 198, 4, 4, 'F');

      // Top banner bar
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(6, 6, 136, 26, 4, 4, 'F');
      doc.rect(6, 24, 136, 8, 'F');

      // Header Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('ACLAP MAHARASHTRA', 74, 14, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        isProvisional ? 'PROVISIONAL REGISTRATION PASS' : 'OFFICIAL E-TICKET',
        74,
        21,
        { align: 'center' }
      );

      // Event Info Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(event?.title || 'Scientific Event', 124);
      doc.text(titleLines, 12, 40);

      const titleHeight = (titleLines.length || 1) * 6;
      let y = 40 + titleHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Date & Time: ${event?.date || event?.eventDate || 'TBD'} ${event?.startTime ? `at ${event.startTime}` : ''}`, 12, y);
      y += 5;
      doc.text(`Venue: ${event?.venue || event?.location || 'Maharashtra'}`, 12, y);
      y += 8;

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(12, y, 136, y);
      doc.setLineDashPattern([], 0);
      y += 7;

      // Attendee Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('ATTENDEE NAME', 12, y);
      doc.text('CATEGORY', 84, y);
      y += 4.5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(registration?.full_name || registration?.fullName || 'Attendee', 12, y);
      doc.text(
        registration?.category === 'member' ? 'Verified Member' : 'Non-Member',
        84,
        y
      );
      y += 7;

      if (registration?.member_id || registration?.membership_id) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('MEMBER ID', 12, y);
        doc.text('BUSINESS / LAB', 84, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(registration?.member_id || registration?.membership_id, 12, y);
        doc.text(registration?.business_name || registration?.organization || '—', 84, y);
        y += 7;
      }

      // Ticket ID / Reference
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(isProvisional ? 'PROVISIONAL REG ID' : 'TICKET CODE', 12, y);
      doc.text('PAYMENT STATUS', 84, y);
      y += 4.5;

      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(37, 99, 235);
      doc.text(ticketCode || registrationCode, 12, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(isProvisional ? 217 : 22, isProvisional ? 119 : 163, isProvisional ? 6 : 74);
      doc.text(isProvisional ? 'Cash Pending' : 'Paid / Confirmed', 84, y);
      y += 8;

      // QR Code Image
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', 46, y, 56, 56);
        y += 59;
      }

      // Footer note
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        isProvisional
          ? 'Present this pass at venue desk for cash verification & ticket activation.'
          : 'Please display this QR code at the event entrance for digital verification.',
        74,
        y,
        { align: 'center', maxWidth: 120 }
      );

      doc.save(`${ticketCode || registrationCode || 'ACLAP-Ticket'}.pdf`);
    } catch (err) {
      console.error('[DigitalTicket] PDF Export error:', err);
      alert('Unable to generate PDF at this moment.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${event?.title || 'Event'} Ticket`,
          text: `My ticket for ${event?.title || 'ACLAP Event'} (${ticketCode || registrationCode})`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isConfirmed = !isProvisional && (ticket?.ticket_status === 'active' || ticket?.ticket_status === 'checked_in');

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Printable Ticket Container */}
      <div
        ref={ticketRef}
        className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative font-sans print:border-none print:shadow-none"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-black">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                  ACLAP Maharashtra
                </p>
                <h3 className="text-base font-black tracking-tight leading-none uppercase">
                  {isProvisional ? 'Provisional Entry Pass' : 'Official Smart Ticket'}
                </h3>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                isConfirmed
                  ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/40'
                  : 'bg-amber-400/20 text-amber-100 border border-amber-300/40'
              }`}
            >
              {isConfirmed ? (ticket?.ticket_status === 'checked_in' ? 'Checked In' : 'Confirmed') : 'Cash Pending'}
            </span>
          </div>

          <p className="text-xl font-black mt-5 leading-snug line-clamp-2">
            {event?.title || 'Scientific Event'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-white/90 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="opacity-75" />
              {event?.date || event?.eventDate || 'Date TBD'}
              {event?.startTime ? ` • ${event.startTime}` : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="opacity-75" />
              {event?.venue || event?.location || 'Maharashtra'}
            </span>
          </div>
        </div>

        {/* Perforated Divider Styling */}
        <div className="relative h-6 bg-slate-50 flex items-center">
          <div className="absolute -left-3 w-6 h-6 bg-slate-900 rounded-full" />
          <div className="w-full border-b-2 border-dashed border-slate-300 mx-4" />
          <div className="absolute -right-3 w-6 h-6 bg-slate-900 rounded-full" />
        </div>

        {/* Ticket Details & QR Body */}
        <div className="p-6 md:p-8 bg-white space-y-6">
          {/* Attendee Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendee Name</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {registration?.full_name || registration?.fullName || 'Attendee'}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</p>
              <p className="text-sm font-black text-primary-600 mt-0.5 uppercase">
                {registration?.category === 'member' ? 'Verified Member' : 'Non-Member'}
              </p>
            </div>

            {registration?.member_id && (
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Member ID</p>
                <p className="text-xs font-black text-slate-800 mt-0.5 font-mono">
                  {registration.member_id}
                </p>
              </div>
            )}

            {registration?.dob && (
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {registration.dob}
                </p>
              </div>
            )}

            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {isProvisional ? 'Provisional Reg ID' : 'Unique Ticket ID'}
              </p>
              <p className="text-xs font-black text-slate-900 mt-0.5 font-mono">
                {ticketCode || registrationCode}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {registration?.ticket_quantity || 1} Ticket(s)
              </p>
            </div>

            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {Number(registration?.total_amount || 0) <= 0 ? 'FREE' : `₹${registration?.total_amount}`}
              </p>
            </div>
          </div>

          {/* QR Code Centerpiece */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center">
            {qrDataUrl ? (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <img
                  src={qrDataUrl}
                  alt="Ticket QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>
            ) : (
              <div className="w-44 h-44 bg-slate-200 animate-pulse rounded-2xl flex items-center justify-center">
                <QrIcon size={32} className="text-slate-400" />
              </div>
            )}

            <div className="mt-3">
              <span className="text-[10px] font-black font-mono tracking-widest text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-md">
                {ticketCode || registrationCode}
              </span>
              <p className="text-[10px] text-slate-500 font-medium mt-2 max-w-xs">
                {isProvisional
                  ? 'Show this provisional QR at the desk for cash payment & activation.'
                  : 'Display this digital QR token at the event check-in counter.'}
              </p>
            </div>
          </div>

          {/* Status Message */}
          {isProvisional ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-medium">
              <Clock size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Registration Status: Cash Pending</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Your registration is pending cash payment verification. Please pay at the registration counter to receive your confirmed ticket.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>Verified & Paid. Digital ticket is active for venue check-in.</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
          >
            <Download size={14} /> PDF Ticket
          </button>

          <button
            onClick={handleDownloadQr}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
          >
            <QrIcon size={14} /> Save QR
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Printer size={14} /> Print
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DigitalTicket;
