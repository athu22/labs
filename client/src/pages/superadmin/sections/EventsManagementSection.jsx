import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import eventApi from '../../../services/eventApi';
import { supabase } from '../../../services/supabase';
import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  Upload,
  Loader2,
  X,
  Save,
  Users,
  Eye,
  Download,
  IndianRupee,
  Clock,
  Tag,
  ToggleLeft,
  ToggleRight,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Banknote,
  ShieldCheck,
  Building,
  Star,
} from 'lucide-react';
import { compressImage } from '../../../utils/imageOptimizer';
import { motion, AnimatePresence } from 'framer-motion';

const EventsManagementSection = ({ events = [], refresh, admins = [] }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'

  // Attendee drawer state
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const initialFormState = {
    title: '',
    description: '',
    category: 'Clinical Workshop',
    isMultiDay: false,
    eventDate: '',
    eventEndDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    address: '',
    district: '',
    adminEmail: '',
    registrationStartDate: '',
    registrationEndDate: '',
    totalCapacity: 100,
    registrationLimit: '',
    status: 'published',
    registrationType: 'both',
    memberFee: 0,
    nonMemberFee: 0,
    isFree: false,
    allowCashPayment: true,
    allowOnlinePayment: true,
    maxTicketsPerPerson: 1,
    isFeatured: false,
  };

  const [form, setForm] = useState(initialFormState);

  const districts = [
    'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana',
    'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dhule', 'Gadchiroli',
    'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
    'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
    'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
    'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane',
    'Wardha', 'Washim', 'Yavatmal'
  ];

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(initialFormState);
    setImageFile(null);
    setExistingImageUrl('');
  };

  const handleEditClick = (event) => {
    setEditingId(event.id);
    const rawDate = event.date || event.eventDate || '';
    let sDate = event.eventDate || '';
    let eDate = event.eventEndDate || '';
    let multi = Boolean(event.isMultiDay);

    if (typeof rawDate === 'string' && rawDate.includes(' to ')) {
      const parts = rawDate.split(' to ');
      sDate = parts[0]?.trim() || '';
      eDate = parts[1]?.trim() || '';
      multi = true;
    } else if (eDate && eDate !== sDate) {
      multi = true;
    }

    setForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'Clinical Workshop',
      isMultiDay: multi,
      eventDate: sDate,
      eventEndDate: eDate,
      startTime: event.startTime || event.start_time || '',
      endTime: event.endTime || event.end_time || '',
      venue: event.venue || event.location || '',
      address: event.address || '',
      district: event.district || '',
      adminEmail: event.adminEmail || event.admin_email || '',
      registrationStartDate: (event.registrationStartDate || event.registration_start_date) ? (event.registrationStartDate || event.registration_start_date).slice(0, 16) : '',
      registrationEndDate: (event.registrationEndDate || event.registration_end_date) ? (event.registrationEndDate || event.registration_end_date).slice(0, 16) : '',
      totalCapacity: event.totalCapacity ?? event.total_capacity ?? 100,
      registrationLimit: event.registrationLimit ?? event.registration_limit ?? '',
      status: event.status || 'published',
      registrationType: event.registrationType || event.registration_type || 'both',
      memberFee: event.memberFee ?? event.member_fee ?? 0,
      nonMemberFee: event.nonMemberFee ?? event.non_member_fee ?? 0,
      isFree: Boolean(event.isFree ?? event.is_free),
      allowCashPayment: (event.allowCashPayment ?? event.allow_cash_payment) !== false,
      allowOnlinePayment: (event.allowOnlinePayment ?? event.allow_online_payment) !== false,
      maxTicketsPerPerson: event.maxTicketsPerPerson ?? event.max_tickets_per_person ?? 1,
      isFeatured: Boolean(event.isFeatured ?? event.is_featured),
    });
    setExistingImageUrl(event.imageUrl || event.image_url || '');
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.title || (!imageFile && !existingImageUrl)) {
      alert('Please provide an Event Name and Banner Image.');
      return;
    }
    if (!form.eventDate) {
      alert('Please select an Event Start Date.');
      return;
    }
    if (form.isMultiDay && !form.eventEndDate) {
      alert('Please select an End Date for 2-Day / Multi-Day Event.');
      return;
    }
    if (form.isMultiDay && form.eventEndDate < form.eventDate) {
      alert('End Date cannot be before Start Date.');
      return;
    }

    setAdding(true);
    try {
      let imageUrl = existingImageUrl;

      if (imageFile) {
        const optimizedFile = await compressImage(imageFile, 1920, 0.8);
        const safeName = (optimizedFile.name || 'banner.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `events/${Date.now()}_${safeName}`;

        const { error: uploadErr } = await supabase.storage.from('uploads').upload(filePath, optimizedFile);
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const isMultiDay = Boolean(form.isMultiDay && form.eventEndDate && form.eventEndDate !== form.eventDate);
      const dateDisplay = isMultiDay ? `${form.eventDate} to ${form.eventEndDate}` : form.eventDate;

      const payload = {
        ...form,
        imageUrl,
        date: dateDisplay,
        eventDate: form.eventDate,
        eventEndDate: isMultiDay ? form.eventEndDate : null,
        isMultiDay,
        memberFee: form.isFree ? 0 : Number(form.memberFee) || 0,
        nonMemberFee: form.isFree ? 0 : Number(form.nonMemberFee) || 0,
        totalCapacity: parseInt(form.totalCapacity, 10) || 100,
        registrationLimit: form.registrationLimit ? parseInt(form.registrationLimit, 10) : null,
        maxTicketsPerPerson: parseInt(form.maxTicketsPerPerson, 10) || 1,
        isFeatured: Boolean(form.isFeatured),
      };

      if (editingId) {
        await eventApi.put(`/${editingId}`, payload);
        alert('Event updated successfully!');
      } else {
        await eventApi.post('/', payload);
        alert('Event published successfully!');
      }

      resetForm();
      if (refresh) refresh();
    } catch (e) {
      console.error(e);
      alert('Error saving event: ' + (e.response?.data?.error || e.message));
    } finally {
      setAdding(false);
    }
  };

  const handleToggleFeatured = async (event) => {
    const nextVal = !event.isFeatured;
    try {
      // 1. Call backend API
      await eventApi.patch(`/${event.id}/featured`, { isFeatured: nextVal });

      // 2. Direct Supabase update for immediate reactivity
      try {
        const { data: cData } = await supabase.from('content').select('banner_url').eq('id', 'main').single();
        let featList = [];
        if (cData?.banner_url) {
          try {
            featList = JSON.parse(cData.banner_url) || [];
          } catch (_) {}
        }
        if (nextVal) {
          if (!featList.includes(event.id)) featList.push(event.id);
        } else {
          featList = featList.filter((x) => x !== event.id);
        }
        await supabase.from('content').update({ banner_url: JSON.stringify(featList) }).eq('id', 'main');
      } catch (_) {}

      if (refresh) refresh();
    } catch (e) {
      console.error('[handleToggleFeatured]', e);
      alert('Failed to update hero slide status: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return;
    try {
      await eventApi.delete(`/${event.id}`);
      if (refresh) refresh();
      alert('Event deleted successfully.');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete event.');
    }
  };

  const handleToggleStatus = async (event) => {
    const nextStatus = event.status === 'published' ? 'unpublished' : 'published';
    try {
      await eventApi.patch(`/${event.id}/status`, { status: nextStatus });
      if (refresh) refresh();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to update status.');
    }
  };

  const openAttendeeList = async (event) => {
    setSelectedEventForAttendees(event);
    setLoadingAttendees(true);
    try {
      const res = await eventApi.get(`/${event.id}/registrations`);
      setAttendees(res.data || []);
    } catch (e) {
      console.error(e);
      alert('Failed to load attendee list.');
    } finally {
      setLoadingAttendees(false);
    }
  };

  const downloadAttendeeExcel = () => {
    if (!attendees || attendees.length === 0) {
      alert('No attendees found to download.');
      return;
    }

    const rows = attendees.map((a, i) => {
      const ticket = Array.isArray(a.event_tickets) ? a.event_tickets[0] : a.event_tickets;
      return {
        '#': i + 1,
        'Reg Code': a.registration_code || a.id.slice(0, 8),
        'Ticket Code': ticket?.ticket_code || 'N/A',
        'Attendee Name': a.full_name,
        Category: a.category === 'member' ? 'Member' : 'Non-Member',
        'Member ID': a.member_id || 'N/A',
        Email: a.email,
        Phone: a.phone,
        'Business / Lab': a.business_name,
        City: a.city,
        District: a.district || a.chapter_name || '',
        'Payment Method': a.payment_method,
        'Payment Status': a.payment_status,
        'Ticket Status': ticket?.ticket_status || 'not_issued',
        'Registered Date': a.created_at ? new Date(a.created_at).toLocaleString() : '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendees');
    XLSX.writeFile(wb, `${selectedEventForAttendees?.title || 'Event'}-Attendees.xlsx`);
  };

  const filteredEvents = events.filter((ev) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      ev.title?.toLowerCase().includes(s) ||
      ev.venue?.toLowerCase().includes(s) ||
      ev.district?.toLowerCase().includes(s);

    if (!matchesSearch) return false;

    if (statusFilter === 'published') return ev.status === 'published';
    if (statusFilter === 'draft') return ev.status !== 'published';
    return true;
  });

  const totalCapacity = events.reduce((acc, ev) => acc + (ev.totalCapacity ?? ev.total_capacity ?? 100), 0);
  const totalBooked = events.reduce((acc, ev) => acc + (ev.bookedCount ?? ev.booked_count ?? 0), 0);
  const publishedCount = events.filter((ev) => ev.status === 'published').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Header & KPI Metrics */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Smart Event Operations & Management
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                Multi-counter venue logistics, digital QR ticketing, and registration tiers
              </p>
            </div>
          </div>

          {!showAdd && (
            <button
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
              className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-primary-600/30 active:scale-95"
            >
              <Plus size={16} /> Create New Event
            </button>
          )}
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100/60 text-primary-700 flex items-center justify-center font-black">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Events</p>
              <h4 className="text-lg font-black text-slate-900 font-mono">{events.length}</h4>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center font-black">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Published Active</p>
              <h4 className="text-lg font-black text-slate-900 font-mono">{publishedCount}</h4>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-700 flex items-center justify-center font-black">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Booked Attendees</p>
              <h4 className="text-lg font-black text-slate-900 font-mono">{totalBooked} Registrations</h4>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/60 text-amber-700 flex items-center justify-center font-black">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Capacity</p>
              <h4 className="text-lg font-black text-slate-900 font-mono">{totalCapacity} Seats</h4>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Create / Edit Event Drawer Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border-2 border-primary-500/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-7 relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center font-black">
                  {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {editingId ? 'Edit Event Configuration' : 'Configure & Publish New Smart Event'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Full venue scheduling, digital ticketing rules, and registration tiers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Section A: Event Identity & Banner */}
            <div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sparkles size={14} className="text-primary-600" />
                1. Event Identity & Visual Media
              </h4>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Event Title / Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra Clinical Laboratory Annual Symposium 2026"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                      >
                        <option value="Clinical Workshop">Clinical Workshop</option>
                        <option value="State Conference">State Conference</option>
                        <option value="CME Seminar">CME Seminar</option>
                        <option value="Annual General Meeting">Annual General Meeting</option>
                        <option value="District Assembly">District Assembly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                        Event Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                      >
                        <option value="published">Published (Live & Open)</option>
                        <option value="unpublished">Unpublished (Hidden)</option>
                        <option value="draft">Draft (Work in Progress)</option>
                        <option value="closed">Closed (Sold Out)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Description / Agenda
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed agenda, key speakers, clinical topics..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:border-primary-600 outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Banner Image Preview / Upload Box */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Event Banner Poster *
                  </label>
                  <div className="relative h-44 bg-white border-2 border-dashed border-slate-300 hover:border-primary-600 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : existingImageUrl ? (
                      <img src={existingImageUrl} alt="Existing" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload size={22} className="mx-auto text-primary-600 mb-1.5" />
                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Upload Banner</p>
                        <p className="text-[9px] text-slate-400 mt-1">PNG, JPG up to 10MB (Auto-compressed)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feature on Hero Slide Option */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={Boolean(form.isFeatured)}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-5 h-5 rounded-lg accent-amber-600 cursor-pointer shrink-0"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-black text-amber-950 cursor-pointer flex flex-wrap items-center gap-2 select-none">
                    <Star size={16} className="text-amber-500 fill-amber-500 shrink-0" />
                    <span>⭐ Mark as Important Event (महत्त्वाचा कार्यक्रम - होम पेज मुख्य स्लाइडरवर दाखवा)</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Hero Slider
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Section B: Dates, Time & Venue */}
            <div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Calendar size={14} className="text-primary-600" />
                2. Scheduling, Duration & Venue Location
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Duration Mode Switcher */}
                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Event Duration Type:
                  </span>
                  <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isMultiDay: false, eventEndDate: '' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        !form.isMultiDay ? 'bg-primary-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      1 Day Event (१ दिवस)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextEnd = form.eventEndDate || form.eventDate || '';
                        setForm({ ...form, isMultiDay: true, eventEndDate: nextEnd });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        form.isMultiDay ? 'bg-primary-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      2-Day / Multi-Day (२ दिवस)
                    </button>
                  </div>
                </div>

                {/* Event Dates */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    {form.isMultiDay ? 'Start Date (Day 1) *' : 'Event Date *'}
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                  />
                </div>

                {form.isMultiDay && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      End Date (Day 2) *
                    </label>
                    <input
                      type="date"
                      min={form.eventDate || undefined}
                      value={form.eventEndDate}
                      onChange={(e) => setForm({ ...form, eventEndDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                    />
                  </div>
                )}

                {/* Timings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                    />
                  </div>
                </div>

                {/* Venue & District */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Event Venue / Hall Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sayaji Hotel, Kolhapur"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Host District
                  </label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                  >
                    <option value="">Select District / जिल्हा निवडा</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Assigned Admin / Staff Email
                  </label>
                  <select
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                  >
                    <option value="">Select Event Admin (Optional)</option>
                    {admins.map((a) => (
                      <option key={a.id} value={a.email}>
                        {a.email} {a.district ? `(${a.district})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Full Venue Address
                  </label>
                  <input
                    type="text"
                    placeholder="Complete address for ticket & maps"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Section C: Fee Structure, Capacity & Payment Options */}
            <div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <IndianRupee size={14} className="text-primary-600" />
                  3. Pricing, Capacity & Payment Gateways
                </h4>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                    className="rounded text-primary-600"
                  />
                  <span>Free Event (No Fees)</span>
                </label>
              </div>

              {!form.isFree && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Member Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.memberFee}
                      onChange={(e) => setForm({ ...form, memberFee: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Non-Member Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.nonMemberFee}
                      onChange={(e) => setForm({ ...form, nonMemberFee: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                    />
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Total Venue Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.totalCapacity}
                    onChange={(e) => setForm({ ...form, totalCapacity: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Max Tickets Per Person
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.maxTicketsPerPerson}
                    onChange={(e) => setForm({ ...form, maxTicketsPerPerson: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                    Registration Scope
                  </label>
                  <select
                    value={form.registrationType}
                    onChange={(e) => setForm({ ...form, registrationType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600"
                  >
                    <option value="both">Both Member & Non-Member</option>
                    <option value="member_only">Member Only</option>
                    <option value="non_member_only">Non-Member Only</option>
                  </select>
                </div>
              </div>

              {/* Payment Gateways Checkboxes */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 cursor-pointer shadow-sm">
                  <input
                    type="checkbox"
                    checked={form.allowOnlinePayment}
                    onChange={(e) => setForm({ ...form, allowOnlinePayment: e.target.checked })}
                    className="rounded text-primary-600 w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-primary-600" /> Enable Online Payment
                    </p>
                    <p className="text-[10px] text-slate-500">Razorpay UPI, Cards, Net Banking (Instant QR ticket)</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 cursor-pointer shadow-sm">
                  <input
                    type="checkbox"
                    checked={form.allowCashPayment}
                    onChange={(e) => setForm({ ...form, allowCashPayment: e.target.checked })}
                    className="rounded text-amber-600 w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Banknote size={14} className="text-amber-600" /> Enable Two-Tier Cash Payment
                    </p>
                    <p className="text-[10px] text-slate-500">District Admin verifies cash ➔ Super Admin issues ticket</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={adding}
                onClick={handleSave}
                className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-primary-600 hover:bg-primary-500 transition-all shadow-md shadow-primary-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {adding ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                {editingId ? 'Save Changes' : 'Publish Smart Event'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Search Bar & Status Filter Chips */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search events by title, venue, or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              statusFilter === 'draft'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Drafts ({events.length - publishedCount})
          </button>
        </div>
      </div>

      {/* 4. Events Cards Grid */}
      <div className="grid gap-5">
        {filteredEvents.map((event) => {
          const booked = Number(event.bookedCount ?? event.booked_count ?? 0);
          const capacity = Number(event.totalCapacity ?? event.total_capacity ?? 100);
          const percent = Math.min(100, Math.round((booked / (capacity || 1)) * 100));

          return (
            <div
              key={event.id}
              className="bg-white border border-slate-200/90 hover:border-primary-300 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Event Image & Info */}
              <div className="flex items-start gap-5 min-w-0">
                <div className="w-32 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200 relative shadow-sm">
                  {event.imageUrl || event.image_url ? (
                    <img src={event.imageUrl || event.image_url} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                      <Calendar size={28} />
                    </div>
                  )}
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      event.status === 'published'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    {event.status}
                  </span>
                  {event.isFeatured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-md flex items-center gap-1">
                      <Star size={10} className="fill-white" />
                      Hero
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug truncate max-w-md">
                      {event.title}
                    </h3>
                    {(event.isMultiDay || (event.eventEndDate && event.eventEndDate !== event.eventDate) || (typeof event.date === 'string' && event.date.includes(' to '))) && (
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        2 Days
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Calendar size={13} className="text-primary-600" />
                      {event.date || event.eventDate || 'Scheduled Event'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin size={13} className="text-primary-600" />
                      {event.venue || event.location || 'Maharashtra'}
                    </span>
                    {event.district && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {event.district}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-mono text-xs font-black text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                      {event.isFree ? 'FREE ATTENDANCE' : `Member: ₹${event.memberFee ?? event.member_fee ?? 0} | Non-Member: ₹${event.nonMemberFee ?? event.non_member_fee ?? 0}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity Gauge & Control Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 shrink-0">
                {/* Visual Capacity Gauge */}
                <div className="w-full sm:w-44 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-slate-400">Capacity</span>
                    <span className="text-slate-900 font-mono">{booked} / {capacity}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent > 85 ? 'bg-rose-500' : percent > 50 ? 'bg-amber-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-right">{percent}% Booked</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Feature on Hero Slider Toggle Button */}
                  <button
                    onClick={() => handleToggleFeatured(event)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow-sm border ${
                      event.isFeatured
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/25 ring-2 ring-amber-300'
                        : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200'
                    }`}
                    title={event.isFeatured ? 'Featured on Home Hero Slider (Click to remove)' : 'Feature on Home Hero Slider as Important Event'}
                  >
                    <Star size={14} className={event.isFeatured ? 'fill-white text-white' : 'text-amber-500'} />
                    <span>{event.isFeatured ? 'Hero Slide' : 'Mark Imp'}</span>
                  </button>

                  {/* View Attendees */}
                  <button
                    onClick={() => openAttendeeList(event)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                    title="View Registered Attendees"
                  >
                    <Users size={14} /> Attendees
                  </button>

                  {/* Toggle Status */}
                  <button
                    onClick={() => handleToggleStatus(event)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      event.status === 'published'
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={event.status === 'published' ? 'Unpublish Event' : 'Publish Event'}
                  >
                    {event.status === 'published' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEditClick(event)}
                    className="p-2.5 text-slate-500 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-xl transition-all"
                    title="Edit Event"
                  >
                    <Edit3 size={16} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(event)}
                    className="p-2.5 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all"
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center shadow-sm space-y-3">
            <Calendar size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
              No matching events found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first smart event or adjust your search filter to display active conferences.
            </p>
          </div>
        )}
      </div>

      {/* 5. Attendee Drawer Modal */}
      <AnimatePresence>
        {selectedEventForAttendees && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">
                      {selectedEventForAttendees.title} • Attendees
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {attendees.length} Registered Attendees
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadAttendeeExcel}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Download size={14} /> Export Excel
                  </button>
                  <button
                    onClick={() => setSelectedEventForAttendees(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {loadingAttendees ? (
                  <div className="py-20 text-center">
                    <Loader2 className="animate-spin text-primary-600 mx-auto mb-2" size={24} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading attendee roster...</p>
                  </div>
                ) : attendees.length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px]">#</th>
                          <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px]">Attendee</th>
                          <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px]">Category</th>
                          <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px]">District</th>
                          <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px]">Payment</th>
                          <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px]">Ticket</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendees.map((a, i) => {
                          const ticket = Array.isArray(a.event_tickets) ? a.event_tickets[0] : a.event_tickets;
                          return (
                            <tr key={a.id || i} className="hover:bg-slate-50/60">
                              <td className="px-4 py-3 font-mono text-slate-400">{i + 1}</td>
                              <td className="px-4 py-3">
                                <p className="font-bold text-slate-900">{a.full_name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{a.phone} • {a.email}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  a.category === 'member' ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {a.category === 'member' ? `Member (${a.member_id || 'ID'})` : 'Non-Member'}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-700">
                                {a.district || a.city || '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  a.payment_status === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {a.payment_method} ({a.payment_status})
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-primary-600">
                                {ticket?.ticket_code || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No attendees registered yet for this event</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsManagementSection;
