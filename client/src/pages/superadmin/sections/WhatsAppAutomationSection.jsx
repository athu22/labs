import React, { useState, useEffect } from 'react';
import eventApi from '../../../services/eventApi';
import {
  MessageSquare,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  RefreshCw,
  Loader2,
  Send,
  AlertTriangle,
  Smartphone,
  Check,
  Key,
  ShieldAlert,
} from 'lucide-react';

const WhatsAppAutomationSection = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [settings, setSettings] = useState({
    notify_registration: true,
    notify_entry: false,
    notify_welcome_kit: false,
    notify_breakfast: false,
    notify_lunch: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [retryingLogId, setRetryingLogId] = useState(null);

  // Meta Cloud API / Whatsfier Credentials State
  const [phoneNumberId, setPhoneNumberId] = useState('1313338285191863');
  const [accessToken, setAccessToken] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('1018349050966653');
  const [apiUrl, setApiUrl] = useState('https://crmapi.1automations.com/api/meta');
  const [apiVersion, setApiVersion] = useState('v19.0');
  const [hasToken, setHasToken] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);

  // Live Test Dispatch State
  const [testMobile, setTestMobile] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSendTestMessage = async (e) => {
    e.preventDefault();
    if (!testMobile) return alert('Please enter a 10-digit mobile number');
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await eventApi.post('/whatsapp/test-send', { testPhone: testMobile });
      setTestResult(res.data);
      loadLogs();
      if (res.data?.success) {
        alert('Test WhatsApp message dispatched successfully! Check your WhatsApp.');
      } else {
        alert('Test dispatch status: ' + (res.data?.errorMessage || res.data?.status || 'Failed'));
      }
    } catch (err) {
      console.error('[handleSendTestMessage]', err);
      alert('Error sending test message: ' + (err.response?.data?.error || err.message));
    } finally {
      setSendingTest(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    loadCredentials();
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

  const loadCredentials = async () => {
    try {
      const res = await eventApi.get('/whatsapp/config');
      if (res.data) {
        setPhoneNumberId(res.data.phoneNumberId || '1313338285191863');
        setBusinessAccountId(res.data.businessAccountId || '1018349050966653');
        setApiUrl(res.data.apiUrl || 'https://crmapi.1automations.com/api/meta');
        setApiVersion(res.data.apiVersion || 'v19.0');
        setHasToken(Boolean(res.data.hasToken));
      }
    } catch (err) {
      console.error('[loadCredentials]', err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadSettings();
      loadLogs();
    }
  }, [selectedEventId]);

  const loadSettings = async () => {
    try {
      const res = await eventApi.get(`/notification-settings/${selectedEventId}`);
      if (res.data) {
        setSettings({
          notify_registration: res.data.notify_registration !== false,
          notify_entry: Boolean(res.data.notify_entry),
          notify_welcome_kit: Boolean(res.data.notify_welcome_kit),
          notify_breakfast: Boolean(res.data.notify_breakfast),
          notify_lunch: Boolean(res.data.notify_lunch),
        });
      }
    } catch (err) {
      console.error('[loadSettings]', err);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await eventApi.get(`/whatsapp/logs?eventId=${selectedEventId}`);
      setLogs(res.data || []);
    } catch (err) {
      console.error('[loadLogs]', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setSavingCredentials(true);
    try {
      const res = await eventApi.post('/whatsapp/config', {
        phoneNumberId,
        accessToken,
        businessAccountId,
        apiUrl,
        apiVersion,
      });
      if (res.data?.success) {
        setAccessToken('');
        setHasToken(true);
        alert('WhatsApp API credentials saved successfully!');
      }
    } catch (err) {
      console.error('[handleSaveCredentials]', err);
      alert('Failed to save credentials');
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await eventApi.put(`/notification-settings/${selectedEventId}`, {
        notifyRegistration: settings.notify_registration,
        notifyEntry: settings.notify_entry,
        notifyWelcomeKit: settings.notify_welcome_kit,
        notifyBreakfast: settings.notify_breakfast,
        notifyLunch: settings.notify_lunch,
      });
      alert('WhatsApp notification settings updated successfully!');
    } catch (err) {
      console.error('[handleSaveSettings]', err);
      alert('Failed to update notification settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRetryMessage = async (logId) => {
    setRetryingLogId(logId);
    try {
      const res = await eventApi.post(`/whatsapp/retry/${logId}`);
      if (res.data?.success) {
        alert('Message retry triggered successfully!');
        loadLogs();
      } else {
        alert(res.data?.result?.errorMessage || 'Retry failed');
      }
    } catch (err) {
      console.error('[handleRetryMessage]', err);
      alert('Failed to retry WhatsApp message');
    } finally {
      setRetryingLogId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-emerald-600" size={24} />
            WhatsApp Automation & Message Tracking
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Meta Cloud API • Automated Registration Confirmations & Activity Notification Controls
          </p>
        </div>

        {/* Selected Event Selector */}
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
              loadSettings();
              loadLogs();
              loadCredentials();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
            title="Refresh Logs"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* WhatsApp Cloud API & Whatsifier Credentials Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Key size={18} />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span>WhatsApp Business API / Whatsifier Integration</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black">
                  app.whatsifier.com
                </span>
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                चॅनेल: <strong>Association of Clinical Laboratory analysts and Practitioners (918310569717)</strong>
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider self-start sm:self-auto ${
              hasToken && phoneNumberId
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            {hasToken && phoneNumberId ? '● Live WhatsApp Active' : '○ Pending Token / Simulated Mode'}
          </span>
        </div>

        {/* Approved Template Banner */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                Approved Template
              </span>
              <span className="font-mono font-black text-slate-900 text-xs">
                registration_with_pdf
              </span>
              <span className="text-[10px] font-bold text-slate-500">• Utility / English</span>
            </div>
            <p className="text-[11px] text-slate-600">
              मॅपिंग: <strong>{`{{1}}`}</strong> = Event Title, <strong>{`{{2}}`}</strong> = Date, <strong>{`{{3}}`}</strong> = Venue, <strong>Header</strong> = Digital PDF Ticket
            </p>
          </div>
          <span className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-xl font-black text-[10px] uppercase shrink-0">
            100% Configured
          </span>
        </div>

        <form onSubmit={handleSaveCredentials} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
              WhatsApp Phone Number ID
            </label>
            <input
              type="text"
              placeholder="e.g. 918310569717"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-primary-600 outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
              API Access Token / Bearer Key
            </label>
            <input
              type="password"
              placeholder={hasToken ? '•••••••• Token saved (leave blank to keep)' : 'Paste API Key from Whatsifier...'}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-primary-600 outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
              Channel ID / WABA ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 6af6d37c28b9df34f3f4d1bb"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-primary-600 outline-none shadow-sm"
              />
              <button
                type="submit"
                disabled={savingCredentials}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
              >
                {savingCredentials ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save
              </button>
            </div>
          </div>
        </form>

        {/* Live Test Dispatch */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-800">
                Live WhatsApp Test Dispatch (चाचणी मेसेज)
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                तुमचा मोबाईल नंबर टाकून मेसेज थेट येतो का ते लगेच तपासा
              </p>
            </div>
          </div>

          <form onSubmit={handleSendTestMessage} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="tel"
              placeholder="e.g. 9876543210 (10 Digits)"
              value={testMobile}
              onChange={(e) => setTestMobile(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-emerald-600 outline-none w-full md:w-56 shadow-sm"
            />
            <button
              type="submit"
              disabled={sendingTest || !testMobile}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {sendingTest ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              <span>Send Test</span>
            </button>
          </form>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Automated Notification Toggles */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-slate-800">
              <Send size={18} className="text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-widest">
                Activity Notification Toggles
              </h3>
            </div>
            <p className="text-[11px] font-semibold text-slate-400">
              Enable or disable WhatsApp alerts sent to attendees automatically upon activity verification:
            </p>

            <div className="space-y-3 pt-2">
              {/* 1. Registration Confirmation */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Registration Confirmation</h4>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Sends E-ticket ID, venue, date & QR link on paid booking
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notify_registration}
                  onChange={(e) =>
                    setSettings({ ...settings, notify_registration: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              {/* 2. Event Entry */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Event Entry Welcome</h4>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Sends welcome message when attendee enters venue gate
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notify_entry}
                  onChange={(e) =>
                    setSettings({ ...settings, notify_entry: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              {/* 3. Welcome Kit */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Welcome Kit Distribution</h4>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Confirms physical kit collection to attendee
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notify_welcome_kit}
                  onChange={(e) =>
                    setSettings({ ...settings, notify_welcome_kit: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              {/* 4. Breakfast */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Breakfast Collection</h4>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Confirms breakfast coupon verification
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notify_breakfast}
                  onChange={(e) =>
                    setSettings({ ...settings, notify_breakfast: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              {/* 5. Lunch */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Lunch Collection</h4>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Confirms lunch meal coupon verification
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notify_lunch}
                  onChange={(e) =>
                    setSettings({ ...settings, notify_lunch: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>
            </div>

            <button
              type="button"
              disabled={savingSettings}
              onClick={handleSaveSettings}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingSettings ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Notification Settings
            </button>
          </div>
        </div>

        {/* Right Column: WhatsApp Delivery Logs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <Smartphone size={16} className="text-emerald-600" />
                Message Dispatch & Delivery Logs ({logs.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Sent At</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-2 text-primary-600" size={20} />
                        Loading delivery logs...
                      </td>
                    </tr>
                  ) : logs.length > 0 ? (
                    logs.map((log) => {
                      const isRetrying = retryingLogId === log.id;
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                              {log.message_type?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">
                            {log.phone_number}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                log.delivery_status === 'sent' || log.delivery_status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.delivery_status === 'simulated'
                                  ? 'bg-blue-100 text-blue-800'
                                  : log.delivery_status === 'failed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {log.delivery_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                            {log.sent_at ? new Date(log.sent_at).toLocaleTimeString() : '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {log.delivery_status === 'failed' && (
                              <button
                                disabled={isRetrying}
                                onClick={() => handleRetryMessage(log.id)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ml-auto transition-all"
                              >
                                {isRetrying ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={10} />
                                )}
                                Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic">
                        No WhatsApp messages logged yet for this event.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAutomationSection;
