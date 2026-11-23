import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import eventApi from '../../../services/eventApi';
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Banknote,
  Clock,
  UserCheck,
  Ticket,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  IndianRupee,
  Loader2,
} from 'lucide-react';

const EventAnalyticsSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [checkinStatus, setCheckinStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEventId) params.append('eventId', selectedEventId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (category) params.append('category', category);
      if (paymentMethod) params.append('paymentMethod', paymentMethod);
      if (paymentStatus) params.append('paymentStatus', paymentStatus);
      if (registrationStatus) params.append('registrationStatus', registrationStatus);
      if (checkinStatus) params.append('checkinStatus', checkinStatus);

      const res = await eventApi.get(`/analytics?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error('[EventAnalyticsSection]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [
    selectedEventId,
    startDate,
    endDate,
    category,
    paymentMethod,
    paymentStatus,
    registrationStatus,
    checkinStatus,
  ]);

  const kpis = data?.kpis || {
    totalEvents: 0,
    totalRegistrations: 0,
    totalMembers: 0,
    totalNonMembers: 0,
    onlinePayments: 0,
    cashPayments: 0,
    pendingCashVerification: 0,
    totalRevenue: 0,
    checkedInAttendees: 0,
    remainingTickets: 0,
  };

  const records = (data?.records || []).filter((r) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      r.registrationCode?.toLowerCase().includes(s) ||
      r.ticketCode?.toLowerCase().includes(s) ||
      r.fullName?.toLowerCase().includes(s) ||
      r.email?.toLowerCase().includes(s) ||
      r.phone?.toLowerCase().includes(s) ||
      r.eventName?.toLowerCase().includes(s)
    );
  });

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (!records || records.length === 0) {
      alert('No records to export');
      return;
    }
    const rows = records.map((r, i) => ({
      '#': i + 1,
      'Registration Code': r.registrationCode,
      'Ticket Code': r.ticketCode,
      'Event Name': r.eventName,
      'Event Date': r.eventDate,
      'Attendee Name': r.fullName,
      Category: r.category === 'member' ? 'Member' : 'Non-Member',
      'Member ID': r.memberId || 'N/A',
      Email: r.email,
      Phone: r.phone,
      'Business / Lab': r.businessName,
      City: r.city,
      Tickets: r.ticketQuantity,
      'Total Fee (INR)': r.totalAmount,
      'Payment Method': r.paymentMethod,
      'Payment Status': r.paymentStatus,
      'Ticket Status': r.ticketStatus,
      'Checked In Time': r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : 'No',
      'Registered At': r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Event Attendees');
    XLSX.writeFile(wb, `ACLAP-Event-Report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export to PDF Report
  const handleExportPdf = () => {
    if (!records || records.length === 0) {
      alert('No records to export');
      return;
    }
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ACLAP Maharashtra — Event Attendance & Financial Report', 40, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Filtered Attendees: ${records.length}`, 40, 52);

    const headers = [
      ['#', 'Reg Code', 'Ticket Code', 'Event', 'Attendee', 'Category', 'Phone', 'Fee (INR)', 'Payment', 'Ticket', 'Check-In'],
    ];

    const body = records.map((r, i) => [
      i + 1,
      r.registrationCode,
      r.ticketCode,
      r.eventName,
      r.fullName,
      r.category === 'member' ? `Member (${r.memberId || ''})` : 'Non-Member',
      r.phone,
      `INR ${r.totalAmount}`,
      `${r.paymentMethod} / ${r.paymentStatus}`,
      r.ticketStatus,
      r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString() : 'No',
    ]);

    autoTable(doc, {
      head: headers,
      body,
      startY: 65,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`ACLAP-Event-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-primary-600" size={24} />
            Event Analytics & Reports
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Real-time KPIs, financial summaries, and attendee export tools
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* 10 Real-Time KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Events', val: kpis.totalEvents, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Registrations', val: kpis.totalRegistrations, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Members', val: kpis.totalMembers, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Non-Members', val: kpis.totalNonMembers, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Total Revenue', val: `₹${kpis.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Online Paid', val: kpis.onlinePayments, icon: CreditCard, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Cash Paid', val: kpis.cashPayments, icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Cash Pending', val: kpis.pendingCashVerification, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Checked In', val: kpis.checkedInAttendees, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Remaining Tickets', val: kpis.remainingTickets, icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{card.label}</span>
              <div className={`w-7 h-7 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                <card.icon size={14} />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight">{card.val}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Filter size={14} /> Filter Reports
          </span>
          <button
            onClick={() => {
              setSelectedEventId('');
              setStartDate('');
              setEndDate('');
              setCategory('');
              setPaymentMethod('');
              setPaymentStatus('');
              setRegistrationStatus('');
              setCheckinStatus('');
              setSearchTerm('');
            }}
            className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Event Filter */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">All Events</option>
            {(data?.events || []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">All Categories</option>
            <option value="member">Member</option>
            <option value="non_member">Non-Member</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">All Methods</option>
            <option value="online">Online (Razorpay)</option>
            <option value="cash">Cash</option>
            <option value="free">Free</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="cash_pending">Cash Pending</option>
            <option value="pending">Pending Payment</option>
            <option value="failed">Failed</option>
          </select>

          {/* Reg Status Filter */}
          <select
            value={registrationStatus}
            onChange={(e) => setRegistrationStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">All Reg Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Check-In Status Filter */}
          <select
            value={checkinStatus}
            onChange={(e) => setCheckinStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">All Check-in</option>
            <option value="checked_in">Checked In</option>
            <option value="not_checked_in">Not Checked In</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
            placeholder="From Date"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none"
            placeholder="To Date"
          />
        </div>

        {/* Text Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Filter by code, attendee name, email, phone, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-slate-800 focus:bg-white focus:border-primary-600 outline-none"
          />
        </div>
      </div>

      {/* Filtered Attendees Report Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-black uppercase tracking-wider text-slate-700">
            Filtered Attendees Directory ({records.length})
          </span>
          <button
            onClick={fetchAnalytics}
            className="p-1 hover:bg-slate-200 rounded text-slate-500"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Ticket / Reg Code</th>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Ticket Status</th>
                <th className="px-4 py-3">Check-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                    <Loader2 className="animate-spin text-primary-600 mx-auto mb-2" size={20} />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Loading records...</span>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono">
                      <p className="font-bold text-primary-600">{r.ticketCode !== '—' ? r.ticketCode : r.registrationCode}</p>
                      <p className="text-[9px] text-slate-400">{r.registrationCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{r.fullName}</p>
                      <p className="text-[10px] text-slate-400">{r.phone} • {r.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{r.eventName}</td>
                    <td className="px-4 py-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {r.category === 'member' ? `Member (${r.memberId})` : 'Non-Member'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900">₹{r.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          r.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-600'
                            : r.paymentStatus === 'cash_pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {r.paymentMethod} • {r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          r.ticketStatus === 'checked_in'
                            ? 'bg-purple-50 text-purple-600'
                            : r.ticketStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {r.ticketStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400 italic">
                    No attendees match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventAnalyticsSection;
