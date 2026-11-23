import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import eventApi from '../../../services/eventApi';
import {
  QrCode as QrIcon,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Search,
  UserCheck,
  Calendar,
  History,
  RefreshCw,
  Building,
  User,
  Gift,
  Coffee,
  Utensils,
  Phone,
  Mail,
  ShieldCheck,
  Lock,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventCheckinSection = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [manualTicketInput, setManualTicketInput] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [processingActivity, setProcessingActivity] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [activeCounterFilter, setActiveCounterFilter] = useState('all'); // 'all', 'entry', 'welcome_kit', 'breakfast', 'lunch'

  // Fetch staff events & initial recent activities
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventApi.get('/public');
      const list = res.data || [];
      setEvents(list);
      if (list.length > 0 && !selectedEventId) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error('[fetchEvents]', err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchRecentActivities();
    }
  }, [selectedEventId]);

  const fetchRecentActivities = async () => {
    try {
      const res = await eventApi.get(`/checkin/recent?eventId=${selectedEventId}`);
      setRecentActivities(res.data || []);
    } catch (err) {
      console.error('[fetchRecentActivities]', err);
    }
  };

  // Setup / Teardown HTML5 QR Scanner
  useEffect(() => {
    let html5QrcodeScanner = null;

    if (cameraActive) {
      setScannerError('');
      try {
        html5QrcodeScanner = new Html5QrcodeScanner(
          'qr-reader-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            rememberLastUsedCamera: true,
          },
          false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            handleScanPayload(decodedText);
            setCameraActive(false);
          },
          (errorMessage) => {
            // Frame-by-frame miss
          }
        );
      } catch (e) {
        console.error('[EventCheckin] Scanner init failed:', e);
        setScannerError('Could not access camera. Please allow camera permissions or enter Ticket ID manually.');
      }
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch((e) => console.warn(e));
      }
    };
  }, [cameraActive]);

  // Call secure backend verification on scanned payload or ticket code
  const handleScanPayload = async (rawText) => {
    if (!rawText || !rawText.trim()) return;
    setLoadingVerify(true);
    setScanResult(null);

    try {
      let trimmed = rawText.trim();
      if (trimmed.includes('/ticket/')) {
        trimmed = trimmed.split('/ticket/').pop().split('?')[0].split('/')[0].trim();
      }
      const isSigned = trimmed.startsWith('ACLAP1.');
      const payload = isSigned
        ? { qrToken: trimmed, eventId: selectedEventId }
        : { ticketCode: trimmed, eventId: selectedEventId };

      const res = await eventApi.post('/checkin/scan', payload);
      setScanResult(res.data);
    } catch (err) {
      console.error('[handleScanPayload]', err);
      setScanResult({
        status: 'invalid',
        color: 'red',
        title: 'Verification Failed',
        reason: err.response?.data?.reason || err.response?.data?.error || 'Server rejected verification.',
      });
    } finally {
      setLoadingVerify(false);
    }
  };

  // Staff clicks an activity action button (Entry, Kit, Breakfast, Lunch)
  const handleRecordActivity = async (activityType) => {
    if (!scanResult?.details?.ticketId) return;
    setProcessingActivity(activityType);

    try {
      const res = await eventApi.post('/activities/record', {
        ticketId: scanResult.details.ticketId,
        activityType,
      });

      if (res.data?.success) {
        // Update local activity state immediately
        const updatedActivities = {
          ...scanResult.details.activities,
          [activityType]: {
            status: 'completed',
            completedAt: res.data.completedAt,
            completedBy: res.data.completedBy || 'You',
          },
        };

        setScanResult({
          ...scanResult,
          details: {
            ...scanResult.details,
            activities: updatedActivities,
            ticketStatus: activityType === 'entry' ? 'checked_in' : scanResult.details.ticketStatus,
          },
        });

        fetchRecentActivities();
      }
    } catch (err) {
      console.error('[handleRecordActivity]', err);
      const errData = err.response?.data;
      if (errData?.status === 'already_completed') {
        alert(`${activityType.replace('_', ' ').toUpperCase()} already completed at ${new Date(errData.completedAt).toLocaleTimeString()} by ${errData.completedBy}!`);
        // Refresh local activity map to completed
        const updatedActivities = {
          ...scanResult.details.activities,
          [activityType]: {
            status: 'completed',
            completedAt: errData.completedAt,
            completedBy: errData.completedBy,
          },
        };
        setScanResult({
          ...scanResult,
          details: {
            ...scanResult.details,
            activities: updatedActivities,
          },
        });
      } else {
        alert(errData?.error || 'Action failed. Please try again.');
      }
    } finally {
      setProcessingActivity(null);
    }
  };

  const details = scanResult?.details;
  const activities = details?.activities || {};
  const perms = details?.permissions || {};

  // Operational Activities Config
  const activityConfigs = [
    {
      key: 'entry',
      title: 'Event Entry',
      icon: <UserCheck size={20} />,
      btnLabel: 'Check In Attendee',
      completedLabel: 'Attendee Already Checked In',
      canPerform: perms.canCheckin !== false,
      status: activities.entry?.status || 'pending',
      completedAt: activities.entry?.completedAt,
      completedBy: activities.entry?.completedBy,
      color: 'emerald',
    },
    {
      key: 'welcome_kit',
      title: 'Welcome Kit Distribution',
      icon: <Gift size={20} />,
      btnLabel: 'Give Welcome Kit',
      completedLabel: 'Welcome Kit Already Distributed',
      canPerform: perms.canDistributeWelcomeKit !== false,
      status: activities.welcome_kit?.status || 'pending',
      completedAt: activities.welcome_kit?.completedAt,
      completedBy: activities.welcome_kit?.completedBy,
      color: 'blue',
    },
    {
      key: 'breakfast',
      title: 'Breakfast Distribution',
      icon: <Coffee size={20} />,
      btnLabel: 'Mark Breakfast Given',
      completedLabel: 'Breakfast Already Collected',
      canPerform: perms.canDistributeBreakfast !== false,
      status: activities.breakfast?.status || 'pending',
      completedAt: activities.breakfast?.completedAt,
      completedBy: activities.breakfast?.completedBy,
      color: 'amber',
    },
    {
      key: 'lunch',
      title: 'Lunch Distribution',
      icon: <Utensils size={20} />,
      btnLabel: 'Mark Lunch Given',
      completedLabel: 'Lunch Already Collected',
      canPerform: perms.canDistributeLunch !== false,
      status: activities.lunch?.status || 'pending',
      completedAt: activities.lunch?.completedAt,
      completedBy: activities.lunch?.completedBy,
      color: 'orange',
    },
  ];

  const visibleActivityConfigs =
    activeCounterFilter === 'all'
      ? activityConfigs
      : activityConfigs.filter((cfg) => cfg.key === activeCounterFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <QrIcon className="text-primary-600" size={24} />
              Smart Event Attendance & QR Scanner Desk
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Venue Station Ready
            </span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Single QR Code • Multi-Activity Venue Management (Entry, Welcome Kit, Breakfast & Lunch)
          </p>
        </div>

        {/* Selected Event Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Calendar size={16} />
          </div>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-900 outline-none pr-3 cursor-pointer"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.date || ev.eventDate || 'Active Event'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Counter Focus Mode Segmented Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 shadow-inner">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
          Counter Mode:
        </span>
        {[
          { id: 'all', label: 'All Operations (Unified)', icon: <ShieldCheck size={13} /> },
          { id: 'entry', label: 'Event Entry Desk', icon: <UserCheck size={13} /> },
          { id: 'welcome_kit', label: 'Welcome Kit Desk', icon: <Gift size={13} /> },
          { id: 'breakfast', label: 'Breakfast Counter', icon: <Coffee size={13} /> },
          { id: 'lunch', label: 'Lunch Counter', icon: <Utensils size={13} /> },
        ].map((counter) => (
          <button
            key={counter.id}
            onClick={() => setActiveCounterFilter(counter.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeCounterFilter === counter.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {counter.icon}
            <span>{counter.label}</span>
          </button>
        ))}
      </div>

      {/* Main Scanner & Attendee Details Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Camera Scanner & Manual Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Camera size={16} className="text-primary-600" />
                Mobile QR Scanner Terminal
              </h3>
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 ${
                  cameraActive
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-primary-600 text-white shadow-md shadow-primary-600/30 hover:bg-primary-500'
                }`}
              >
                <Camera size={14} />
                {cameraActive ? 'Stop Camera' : 'Start Camera Scanner'}
              </button>
            </div>

            {/* Camera Viewport */}
            {cameraActive && (
              <div className="overflow-hidden rounded-2xl border-2 border-primary-500 bg-slate-950 p-2 shadow-inner relative">
                <div id="qr-reader-container" className="w-full rounded-xl overflow-hidden" />
                <p className="text-[10px] text-center text-slate-400 font-mono mt-2">
                  Point camera at Attendee QR Code • Auto-verifies on detection
                </p>
              </div>
            )}

            {scannerError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium">
                {scannerError}
              </div>
            )}

            {/* Manual Ticket ID Fallback Input */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                Universal Search: Registration Code, Ticket Code, or Mobile No
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. REG-2026-..., EVT-..., Mobile No"
                  value={manualTicketInput}
                  onChange={(e) => setManualTicketInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleScanPayload(manualTicketInput);
                  }}
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-primary-600 outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  disabled={loadingVerify || !manualTicketInput.trim()}
                  onClick={() => handleScanPayload(manualTicketInput)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95 shadow-md"
                >
                  {loadingVerify ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Attendee Information Screen & 4 Activities */}
        <div className="lg:col-span-7 space-y-6">
          {loadingVerify ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
              <Loader2 className="animate-spin text-primary-600 mx-auto mb-3" size={36} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Verifying Cryptographic Ticket & Fetching Attendee Activities...
              </p>
            </div>
          ) : scanResult ? (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`rounded-3xl p-6 sm:p-8 border-2 shadow-xl space-y-6 ${
                scanResult.color === 'green'
                  ? 'bg-white border-emerald-300'
                  : scanResult.color === 'amber'
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-rose-50/70 border-rose-300'
              }`}
            >
              {/* Top Warning Banner for Invalid/Unpaid/Cancelled/Mismatch */}
              {scanResult.color !== 'green' && (
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
                    scanResult.color === 'amber'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-rose-100/70 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scanResult.color === 'amber' ? (
                      <AlertTriangle size={24} className="shrink-0 text-amber-600" />
                    ) : (
                      <XCircle size={24} className="shrink-0 text-rose-600" />
                    )}
                    <div>
                      <h4 className="font-black text-sm uppercase">{scanResult.title}</h4>
                      <p className="text-xs font-semibold">{scanResult.reason}</p>
                    </div>
                  </div>

                  {details?.eventMismatch && details?.registeredEventId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEventId(details.registeredEventId);
                        handleScanPayload(details.ticketCode || manualTicketInput);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-sm transition-all shrink-0 uppercase tracking-wider"
                    >
                      Switch Scanner to {details.registeredEventTitle}
                    </button>
                  )}
                </div>
              )}

              {/* Attendee Profile Dossier */}
              {details && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-slate-200/60 pb-5">
                    {/* Profile Photo or Fallback Avatar */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-100 border-2 border-primary-300 flex items-center justify-center shrink-0 shadow-sm">
                      {details.profilePhoto ? (
                        <img
                          src={details.profilePhoto}
                          alt={details.attendeeName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={36} className="text-primary-600" />
                      )}
                    </div>

                    {/* Prominent Large Attendee Name & Status Badges */}
                    <div className="space-y-1 flex-grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            details.category === 'member'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {details.category === 'member'
                            ? `Member (${details.memberId || 'Verified'})`
                            : 'Non-Member'}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            details.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          Payment: {details.paymentStatus}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                          {details.ticketCode}
                        </span>
                      </div>

                      {/* Attendee Name - Clearly visible in large text */}
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {details.attendeeName}
                      </h1>

                      {details.businessName && (
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Building size={14} className="text-slate-400 shrink-0" />
                          {details.businessName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row: Mobile, Email, Event */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span className="font-semibold">{details.mobileNumber || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="font-semibold truncate">{details.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span className="font-semibold truncate">
                        {details.eventName || '—'}
                        {details.eventDate ? ` (${details.eventDate})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Four Independent Sections: Event Entry, Welcome Kit, Breakfast, Lunch */}
              {details && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">
                      Independent Activity Operations
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Single QR • Independent State Tracking
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {visibleActivityConfigs.map((act) => {
                      const isCompleted = act.status === 'completed';
                      const isProcessing = processingActivity === act.key;
                      const hasPermission = act.canPerform;
                      const isTicketValid =
                        scanResult.status === 'valid' ||
                        (scanResult.status === 'different_event' && (details?.ticketStatus === 'active' || details?.paymentStatus === 'paid'));

                      return (
                        <div
                          key={act.key}
                          className={`p-5 rounded-2xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {act.icon}
                              </div>
                              <div>
                                <h4 className="font-black text-xs text-slate-900 tracking-tight">
                                  {act.title}
                                </h4>
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider ${
                                    isCompleted ? 'text-emerald-700' : 'text-slate-400'
                                  }`}
                                >
                                  Status: {isCompleted ? 'Completed' : 'Pending'}
                                </span>
                              </div>
                            </div>

                            {isCompleted ? (
                              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Clock size={16} className="text-slate-300 shrink-0" />
                            )}
                          </div>

                          {/* Completed Details Display */}
                          {isCompleted ? (
                            <div className="bg-white/80 border border-emerald-100 rounded-xl p-3 text-[11px] space-y-1 mb-2">
                              <p className="font-black text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                {act.completedLabel}
                              </p>
                              {act.completedAt && (
                                <p className="text-slate-500 font-mono text-[10px]">
                                  Time: {new Date(act.completedAt).toLocaleString()}
                                </p>
                              )}
                              {act.completedBy && (
                                <p className="text-slate-500 font-semibold text-[10px]">
                                  Staff: {act.completedBy}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="pt-2">
                              {!hasPermission ? (
                                <div className="p-2.5 bg-slate-100 rounded-xl text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                                  <Lock size={12} />
                                  No Staff Permission for this Desk
                                </div>
                              ) : !isTicketValid ? (
                                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-center text-[10px] font-bold text-rose-600">
                                  Ticket Inactive / Unpaid
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => handleRecordActivity(act.key)}
                                  className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
                                    act.key === 'entry'
                                      ? 'bg-emerald-600 hover:bg-emerald-700'
                                      : act.key === 'welcome_kit'
                                      ? 'bg-blue-600 hover:bg-blue-700'
                                      : act.key === 'breakfast'
                                      ? 'bg-amber-600 hover:bg-amber-700'
                                      : 'bg-orange-600 hover:bg-orange-700'
                                  }`}
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      {act.icon}
                                      {act.btnLabel}
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                    <QrIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Venue Station Ready & Listening
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Waiting for next attendee QR scan or ID input
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Operational Deck
                </span>
              </div>

              {/* 4 Counter Readiness Cards */}
              <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">1. Venue Gate Entry</p>
                    <p className="text-[10px] text-slate-500 font-medium">Auto-marks attendance on first entry</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Gift size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">2. Welcome Kit Counter</p>
                    <p className="text-[10px] text-slate-500 font-medium">Conference kit & identity badge</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Coffee size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">3. Breakfast Session</p>
                    <p className="text-[10px] text-slate-500 font-medium">Single-scan refreshment validation</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Utensils size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">4. Lunch Banquet</p>
                    <p className="text-[10px] text-slate-500 font-medium">Tamper-proof meal verification</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-primary-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Smart Multi-Counter Security:</strong> Each QR ticket is digitally signed. An attendee can claim each of the 4 benefits only once. The live audit feed below records every staff timestamp in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Venue Activities Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-primary-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">
              Live Activity Audit Feed ({recentActivities.length})
            </h3>
          </div>
          <button
            onClick={fetchRecentActivities}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Activity</th>
                <th className="px-4 py-2.5">Ticket Code</th>
                <th className="px-4 py-2.5">Attendee</th>
                <th className="px-4 py-2.5">Staff Email</th>
                <th className="px-4 py-2.5">Completed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                          act.activity_type === 'entry'
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.activity_type === 'welcome_kit'
                            ? 'bg-blue-100 text-blue-800'
                            : act.activity_type === 'breakfast'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {act.activity_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-primary-600">
                      {act.event_tickets?.ticket_code || '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {act.event_registrations?.full_name || 'Attendee'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {act.staff_email || 'Staff'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {new Date(act.completed_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-xs italic">
                    No activity logs recorded yet for this session.
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

export default EventCheckinSection;
