import React, { useState, useEffect } from 'react';
import eventApi from '../../../services/eventApi';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Gift,
  Coffee,
  Utensils,
  UserCheck,
  MessageSquare,
  RefreshCw,
  Search,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const EventActivityDashboardSection = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activityFilter, setActivityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventApi.get('/public');
      const list = res.data || [];
      setEvents(list);
      if (list.length > 0) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error('[fetchEvents]', err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadDashboard();
      loadReports();
    }
  }, [selectedEventId]);

  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await eventApi.get(`/activities/dashboard?eventId=${selectedEventId}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error('[loadDashboard]', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      let url = `/activities/reports?eventId=${selectedEventId}`;
      if (activityFilter) url += `&activityType=${activityFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      const res = await eventApi.get(url);
      setReports(res.data || []);
    } catch (err) {
      console.error('[loadReports]', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleExportCsv = () => {
    if (!reports || reports.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Activity Type',
      'Ticket Code',
      'Attendee Name',
      'Category',
      'Member ID',
      'Phone',
      'Email',
      'Staff Email',
      'Completed Date & Time',
    ];

    const rows = reports.map((r) => [
      r.activity_type,
      r.event_tickets?.ticket_code || '',
      `"${(r.event_registrations?.full_name || '').replace(/"/g, '""')}"`,
      r.event_registrations?.category || '',
      r.event_registrations?.member_id || '',
      r.event_registrations?.phone || '',
      r.event_registrations?.email || '',
      r.staff_email || '',
      new Date(r.completed_at).toLocaleString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Event-Activity-Report-${selectedEventId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const entry = dashboardData?.entry || { totalRequired: 0, completed: 0, pending: 0, rate: 0 };
  const kit = dashboardData?.welcomeKit || { totalRequired: 0, completed: 0, pending: 0, rate: 0 };
  const breakfast = dashboardData?.breakfast || { totalRequired: 0, completed: 0, pending: 0, rate: 0 };
  const lunch = dashboardData?.lunch || { totalRequired: 0, completed: 0, pending: 0, rate: 0 };
  const wa = dashboardData?.whatsapp || { total: 0, sent: 0, delivered: 0, failed: 0, queued: 0 };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-primary-600" size={24} />
            Live Event Activity & Tracking Dashboard
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Real-time venue metrics for Event Entry, Welcome Kits, Meals & WhatsApp Automation
          </p>
        </div>

        {/* Event Selector & Refresh */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-600 shrink-0" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-primary-600"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.date || ev.eventDate || 'TBD'})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              loadDashboard();
              loadReports();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
            title="Refresh Metrics"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loadingDashboard ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <Loader2 className="animate-spin text-primary-600 mx-auto mb-3" size={32} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Calculating Live Venue Activity Metrics...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Event Entry */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Event Entry
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <UserCheck size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{entry.completed}</span>
                <span className="text-xs font-bold text-slate-400">/ {entry.totalRequired} Total</span>
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-1">
                {entry.rate}% Checked In ({entry.pending} Pending)
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${entry.rate}%` }}
              />
            </div>
          </div>

          {/* 2. Welcome Kit */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Welcome Kit
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Gift size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{kit.completed}</span>
                <span className="text-xs font-bold text-slate-400">/ {kit.totalRequired} Required</span>
              </div>
              <p className="text-xs font-bold text-blue-600 mt-1">
                {kit.rate}% Distributed ({kit.pending} Pending)
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${kit.rate}%` }}
              />
            </div>
          </div>

          {/* 3. Breakfast */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Breakfast
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Coffee size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{breakfast.completed}</span>
                <span className="text-xs font-bold text-slate-400">/ {breakfast.totalRequired} Total</span>
              </div>
              <p className="text-xs font-bold text-amber-600 mt-1">
                {breakfast.rate}% Collected ({breakfast.pending} Pending)
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${breakfast.rate}%` }}
              />
            </div>
          </div>

          {/* 4. Lunch */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:border-orange-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Lunch
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Utensils size={16} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900">{lunch.completed}</span>
                <span className="text-xs font-bold text-slate-400">/ {lunch.totalRequired} Total</span>
              </div>
              <p className="text-xs font-bold text-orange-600 mt-1">
                {lunch.rate}% Collected ({lunch.pending} Pending)
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-orange-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${lunch.rate}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Automation Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">
              WhatsApp Automation Activity
            </h3>
            <p className="text-xs font-semibold text-slate-400">
              Automated registration & activity notifications dispatched via Meta Cloud API
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 text-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sent</p>
            <p className="text-lg font-black text-slate-800">{wa.sent}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Delivered</p>
            <p className="text-lg font-black text-emerald-600">{wa.delivered}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Failed</p>
            <p className="text-lg font-black text-rose-600">{wa.failed}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Queued</p>
            <p className="text-lg font-black text-slate-500">{wa.queued}</p>
          </div>
        </div>
      </div>

      {/* Activity Reports & Export Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
              Activity Reports & Audit History ({reports.length})
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">
              Filter and export verified check-in, kit and meal records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Activity */}
            <select
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setTimeout(loadReports, 50);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="">All Activities</option>
              <option value="entry">Event Entry</option>
              <option value="welcome_kit">Welcome Kit</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search attendee or ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadReports();
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-slate-800 outline-none w-48 focus:w-64 transition-all"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">Attendee Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Staff Verified</th>
                <th className="px-4 py-3">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingReports ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2 text-primary-600" size={20} />
                    Loading report entries...
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                          r.activity_type === 'entry'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.activity_type === 'welcome_kit'
                            ? 'bg-blue-100 text-blue-800'
                            : r.activity_type === 'breakfast'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {r.activity_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-primary-600">
                      {r.event_tickets?.ticket_code || '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {r.event_registrations?.full_name || 'Attendee'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {r.event_registrations?.category || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {r.event_registrations?.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {r.staff_email || 'Staff'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {new Date(r.completed_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 italic">
                    No activity records found matching the filter criteria.
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

export default EventActivityDashboardSection;
