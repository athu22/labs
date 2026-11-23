import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  CreditCard,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Tag,
  IdCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import eventApi from '../services/eventApi';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';
import DigitalTicket from '../components/DigitalTicket';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana',
  'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dhule', 'Gadchiroli',
  'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
  'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
  'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane',
  'Wardha', 'Washim', 'Yavatmal'
];

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const { language } = useContext(LanguageContext);

  // Core state
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Event Details, 2: Category, 3: Details & Fee, 4: Payment, 5: Result

  // Category & Member verification
  const [category, setCategory] = useState('non_member');
  const [memberIdInput, setMemberIdInput] = useState('');
  const [verifyingMember, setVerifyingMember] = useState(false);
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [memberError, setMemberError] = useState('');

  // Non-member form fields
  const [nonMemberForm, setNonMemberForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    businessName: '',
    district: '',
    city: '',
    organization: '',
    dob: '',
  });

  // Ticket quantity & payment method
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cash'
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [registrationResult, setRegistrationResult] = useState(null);

  // Auto-fill existing member profile if signed in as approved member
  useEffect(() => {
    if (userData && userData.role === 'member') {
      const existingMemId = userData.adminId || userData.membershipId || userData.registrationNo || '';
      if (existingMemId) {
        setMemberIdInput(existingMemId);
        setCategory('member');
      }
      setNonMemberForm((prev) => ({
        ...prev,
        fullName: userData.fullName || prev.fullName,
        email: currentUser?.email || prev.email,
        phone: userData.phone || prev.phone,
        businessName: userData.organization || prev.businessName,
        organization: userData.organization || prev.organization,
        city: userData.district || prev.city,
        dob: userData.dob || prev.dob || '',
      }));
    }
  }, [userData, currentUser]);

  // Fetch Event Details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await eventApi.get(`/public/${eventId}`);
        setEvent(res.data);

        // Enforce event-level registration type default
        if (res.data.registrationType === 'member_only') {
          setCategory('member');
        } else if (res.data.registrationType === 'non_member_only') {
          setCategory('non_member');
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Event not found or closed.');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  // Member ID Verification against backend database
  const handleVerifyMember = async () => {
    const clean = memberIdInput.trim();
    if (!clean) {
      setMemberError('Please enter your Member ID');
      return;
    }
    setVerifyingMember(true);
    setMemberError('');
    try {
      const res = await eventApi.post('/verify-member', { memberId: clean });
      if (res.data?.valid && res.data?.member) {
        setMemberVerified(true);
        const m = res.data.member;
        setMemberData({
          memberId: m.memberId || clean,
          memberRegistrationId: m.memberRegistrationId,
          fullName: m.fullName || '',
          businessName: m.businessName || '',
          phone: m.phone || '',
          email: m.email || '',
          chapterName: m.chapterName || m.city || '',
          city: m.city || m.chapterName || '',
          dob: m.dob || '',
        });
      } else {
        setMemberVerified(false);
        setMemberData(null);
        setMemberError(res.data?.error || 'Member ID verification failed.');
      }
    } catch (err) {
      setMemberVerified(false);
      setMemberData(null);
      setMemberError(err.response?.data?.error || 'Invalid Member ID. Not found in verified registry.');
    } finally {
      setVerifyingMember(false);
    }
  };

  // Fee calculation (strictly mirrors backend fee calculation)
  const unitFee = event
    ? event.isFree
      ? 0
      : category === 'member'
      ? event.memberFee
      : event.nonMemberFee
    : 0;
  const totalAmount = unitFee * ticketQuantity;

  // Step 3 Next validation handler
  const handleStep3Continue = () => {
    setError('');
    setMemberError('');

    if (category === 'member') {
      if (!memberVerified || !memberData) {
        setMemberError('Please verify your Member ID before proceeding.');
        return;
      }
      if (!memberData.fullName?.trim()) {
        setError('Please enter Attendee Full Name.');
        return;
      }
      if (!memberData.phone?.trim()) {
        setError('Please enter Mobile Number for WhatsApp QR Ticket delivery.');
        return;
      }
      if (!memberData.district?.trim() && !memberData.chapterName?.trim() && !memberData.city?.trim()) {
        setError('Please select or verify attendee District.');
        return;
      }
    } else {
      const chosenDist = (nonMemberForm.district || nonMemberForm.city || '').trim();
      if (
        !nonMemberForm.fullName?.trim() ||
        !nonMemberForm.phone?.trim() ||
        !nonMemberForm.email?.trim() ||
        !nonMemberForm.businessName?.trim() ||
        !chosenDist
      ) {
        setError('Full Name, Mobile Number, Email, Business Name, and District are required.');
        return;
      }
    }

    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle final registration & payment submission
  const handleProceedToPayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        category,
        ticketQuantity,
        paymentMethod: totalAmount <= 0 ? 'online' : paymentMethod,
      };

      if (category === 'member') {
        if (!memberVerified || !memberData) {
          setError('Please verify your Member ID before proceeding.');
          setSubmitting(false);
          return;
        }
        const memberDist = memberData.district || memberData.chapterName || memberData.city || 'Maharashtra';
        payload.memberId = memberData.memberId;
        payload.fullName = memberData.fullName;
        payload.email = memberData.email;
        payload.phone = memberData.phone;
        payload.dob = memberData.dob || '';
        payload.businessName = memberData.businessName;
        payload.organization = memberData.businessName;
        payload.district = memberDist;
        payload.chapterName = memberDist;
        payload.city = memberData.city || memberDist;
      } else {
        const chosenDist = (nonMemberForm.district || nonMemberForm.city || '').trim();
        if (
          !nonMemberForm.fullName ||
          !nonMemberForm.phone ||
          !nonMemberForm.email ||
          !nonMemberForm.businessName ||
          !chosenDist
        ) {
          setError('Full Name, Mobile Number, Email, Business Name, and District are required.');
          setSubmitting(false);
          return;
        }
        payload.fullName = nonMemberForm.fullName.trim();
        payload.phone = nonMemberForm.phone.trim();
        payload.email = nonMemberForm.email.trim();
        payload.dob = (nonMemberForm.dob || '').trim();
        payload.businessName = nonMemberForm.businessName.trim();
        payload.organization = (nonMemberForm.organization || nonMemberForm.businessName).trim();
        payload.district = chosenDist;
        payload.chapterName = chosenDist;
        payload.city = nonMemberForm.city?.trim() || chosenDist;
      }

      // Step 1: Call secure backend registration endpoint
      const regRes = await eventApi.post(`/${eventId}/register`, payload);
      const data = regRes.data;

      // Case A: Free Event (Instant confirmation)
      if (data.mode === 'confirmed') {
        setRegistrationResult({
          type: 'confirmed',
          registration: data.registration,
          ticket: data.ticket,
          event: data.event,
        });
        setStep(5);
        setSubmitting(false);
        return;
      }

      // Case B: Cash Payment (Provisional Pass)
      if (data.mode === 'cash_pending') {
        setRegistrationResult({
          type: 'cash_pending',
          registration: data.registration,
          ticket: null,
          event: data.event,
        });
        setStep(5);
        setSubmitting(false);
        return;
      }

      // Case C: Online Payment (Razorpay Checkout)
      if (data.mode === 'online_checkout') {
        const attendeeInfo = {
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
        };

        await openRazorpayCheckout({
          order: data.razorpayOrder,
          eventTitle: event.title,
          attendee: attendeeInfo,
          onSuccess: async (rzpResponse) => {
            // Verify payment signature on backend
            const verifyRes = await eventApi.post('/payments/verify', {
              registrationId: data.registration.id,
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_signature: rzpResponse.razorpay_signature,
            });

            setRegistrationResult({
              type: 'confirmed',
              registration: verifyRes.data.registration,
              ticket: verifyRes.data.ticket,
              event: verifyRes.data.event,
            });
            setStep(5);
          },
          onDismiss: () => {
            setError('Payment was not completed. You can re-attempt payment or switch to Cash Payment.');
          },
        });
      }
    } catch (err) {
      console.error('[Registration Error Details]:', err.response?.data || err.message, err);
      const errMsg = err.response?.data?.error || err.message || 'Registration failed.';
      setError(errMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary-600" size={32} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Event Details</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-4 border border-rose-100">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">{error}</h2>
        <p className="text-xs text-slate-400 mb-6">The event you are looking for may be closed or unpublished.</p>
        <Link
          to="/events"
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-32 pb-24 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> All Events
          </Link>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            Step {step} of 5
          </span>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: EVENT DETAILS */}
        {/* ========================================================================= */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
          >
            {(event.imageUrl || event.image_url) && (
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                <img src={event.imageUrl || event.image_url} alt={event.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-5 sm:p-8 md:p-10">
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                {event.category || 'Clinical Event'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 mb-6">
                {event.title}
              </h1>

              {/* Event Metadata Grid */}
              <div className="grid sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Event Date</p>
                    <p className="font-bold text-slate-800">
                      {event.date || event.eventDate || 'TBD'}
                      {(event.isMultiDay || (event.eventEndDate && event.eventEndDate !== event.eventDate) || (typeof event.date === 'string' && event.date.includes(' to '))) && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                          2 Days
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Time</p>
                    <p className="font-bold text-slate-800">
                      {event.startTime ? `${event.startTime} - ${event.endTime || 'End'}` : '09:00 AM - 05:00 PM'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Venue & Address</p>
                    <p className="font-bold text-slate-800">
                      {event.venue || event.location || 'Maharashtra'}{' '}
                      {event.address ? `— ${event.address}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">About Event</h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              )}

              {/* Fee Snapshot */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registration Fee</p>
                  <div className="flex items-center gap-4 mt-1">
                    {event.isFree ? (
                      <span className="text-xl font-black text-emerald-400">FREE ENTRY</span>
                    ) : (
                      <>
                        <span className="text-sm">
                          Member: <strong className="text-emerald-400 text-base">₹{event.memberFee}</strong>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-sm">
                          Non-Member: <strong className="text-primary-400 text-base">₹{event.nonMemberFee}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Tickets</p>
                  <p className="text-xl font-black text-emerald-400">{event.availableTickets} / {event.totalCapacity}</p>
                </div>
              </div>

              <button
                disabled={event.availableTickets <= 0}
                onClick={() => setStep(2)}
                className="w-full py-4.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {event.availableTickets <= 0 ? 'Sold Out' : 'Register Now'} <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: REGISTRATION CATEGORY */}
        {/* ========================================================================= */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 md:p-10 shadow-xl"
          >
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Registration Category</h2>
            <p className="text-xs text-slate-400 mt-1 mb-8">
              Choose your participation type. ACLAP members enjoy exclusive discounted fees.
            </p>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              {/* Member Option */}
              <button
                type="button"
                disabled={event.registrationType === 'non_member_only'}
                onClick={() => setCategory('member')}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                  category === 'member'
                    ? 'border-primary-600 bg-primary-50/40 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                } ${event.registrationType === 'non_member_only' ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                  {category === 'member' && <CheckCircle2 className="text-primary-600" size={20} />}
                </div>

                <h3 className="text-base font-black text-slate-900 uppercase">ACLAP Member</h3>
                <p className="text-xs text-slate-500 mt-1">Requires verified Member ID from association registry.</p>
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Registration Fee:</span>
                  <p className="text-lg font-black text-primary-600">
                    {event.isFree || event.memberFee === 0 ? 'FREE' : `₹${event.memberFee}`}
                  </p>
                </div>
              </button>

              {/* Non-Member Option */}
              <button
                type="button"
                disabled={event.registrationType === 'member_only'}
                onClick={() => setCategory('non_member')}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                  category === 'non_member'
                    ? 'border-primary-600 bg-primary-50/40 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                } ${event.registrationType === 'member_only' ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                    <User size={22} />
                  </div>
                  {category === 'non_member' && <CheckCircle2 className="text-primary-600" size={20} />}
                </div>

                <h3 className="text-base font-black text-slate-900 uppercase">Non-Member</h3>
                <p className="text-xs text-slate-500 mt-1">Open to all medical practitioners, students, and guests.</p>
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Registration Fee:</span>
                  <p className="text-lg font-black text-slate-900">
                    {event.isFree || event.nonMemberFee === 0 ? 'FREE' : `₹${event.nonMemberFee}`}
                  </p>
                </div>
              </button>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ATTENDEE DETAILS (MEMBER OR NON-MEMBER) */}
        {/* ========================================================================= */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 md:p-10 shadow-xl"
          >
            {category === 'member' ? (
              // --- Step 3A: Member Verification ---
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Step 3 • Member Mode</span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Verify Your Member ID</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your P.M.C./A.H.P. Reg. No. or ACLAP Membership ID to auto-populate your details.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                    Enter Member ID / Registration No *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="e.g. WASH/25022/2603013"
                      value={memberIdInput}
                      onChange={(e) => {
                        setMemberIdInput(e.target.value);
                        setMemberVerified(false);
                        setMemberData(null);
                        setMemberError('');
                      }}
                      className="flex-grow bg-white border border-slate-300 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none uppercase font-mono"
                    />
                    <button
                      type="button"
                      disabled={verifyingMember || !memberIdInput.trim()}
                      onClick={handleVerifyMember}
                      className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {verifyingMember ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={16} />}
                      Verify ID
                    </button>
                  </div>

                  {memberError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{memberError}</span>
                    </div>
                  )}
                </div>

                {/* Display auto-fetched details upon successful verification with editable fields */}
                {memberVerified && memberData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Top Verified Summary Banner */}
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2.5 text-emerald-800 font-black text-xs uppercase tracking-wider">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <span>Member Verified Successfully</span>
                        <span className="text-[10px] font-black text-emerald-700 font-mono bg-white px-2.5 py-0.5 rounded border border-emerald-200">
                          {memberData.memberId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Applied Member Fee:</span>
                        <span className="font-black text-primary-600 text-sm">
                          {event.isFree || event.memberFee === 0 ? 'FREE' : `₹${event.memberFee}`}
                        </span>
                      </div>
                    </div>

                    {/* Editable Member Attendee Details Form */}
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <User size={16} className="text-primary-600" />
                          Attendee Information (उपस्थितांची माहिती)
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          Details pre-filled from your membership record. Please review or update your contact details for WhatsApp QR ticket delivery.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            Attendee Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={memberData.fullName}
                            onChange={(e) => setMemberData({ ...memberData, fullName: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            Mobile Number (For WhatsApp QR Ticket) *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="10-digit mobile number"
                            value={memberData.phone}
                            onChange={(e) => setMemberData({ ...memberData, phone: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            Date of Birth (जन्मतारीख)
                          </label>
                          <input
                            type="date"
                            value={memberData.dob || ''}
                            onChange={(e) => setMemberData({ ...memberData, dob: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="name@example.com"
                            value={memberData.email}
                            onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            Business / Laboratory Name
                          </label>
                          <input
                            type="text"
                            placeholder="Name of clinical lab"
                            value={memberData.businessName}
                            onChange={(e) => setMemberData({ ...memberData, businessName: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                            District (जिल्हा) *
                          </label>
                          <select
                            value={memberData.district || memberData.chapterName || memberData.city || ''}
                            onChange={(e) =>
                              setMemberData({
                                ...memberData,
                                district: e.target.value,
                                chapterName: e.target.value,
                                city: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none cursor-pointer"
                          >
                            <option value="">Select District / जिल्हा निवडा *</option>
                            {MAHARASHTRA_DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              // --- Step 3B: Non-Member Registration Form ---
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Step 3 • Non-Member Mode</span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Enter Attendee Details</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Please provide your contact and organization information for the ticket registry.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Dr. / Mr. / Ms."
                      value={nonMemberForm.fullName}
                      onChange={(e) => setNonMemberForm({ ...nonMemberForm, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Mobile Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={nonMemberForm.phone}
                      onChange={(e) => setNonMemberForm({ ...nonMemberForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Date of Birth (जन्मतारीख)
                    </label>
                    <input
                      type="date"
                      value={nonMemberForm.dob || ''}
                      onChange={(e) => setNonMemberForm({ ...nonMemberForm, dob: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="you@domain.com"
                      value={nonMemberForm.email}
                      onChange={(e) => setNonMemberForm({ ...nonMemberForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      District (जिल्हा) *
                    </label>
                    <select
                      required
                      value={nonMemberForm.district || nonMemberForm.city || ''}
                      onChange={(e) =>
                        setNonMemberForm({
                          ...nonMemberForm,
                          district: e.target.value,
                          city: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none cursor-pointer"
                    >
                      <option value="">Select District / जिल्हा निवडा *</option>
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Business / Laboratory Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Name of clinical lab"
                      value={nonMemberForm.businessName}
                      onChange={(e) =>
                        setNonMemberForm({
                          ...nonMemberForm,
                          businessName: e.target.value,
                          organization: nonMemberForm.organization || e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Organization / Company Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Organization name"
                      value={nonMemberForm.organization}
                      onChange={(e) => setNonMemberForm({ ...nonMemberForm, organization: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:border-primary-600 outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Applicable Non-Member Fee:</span>
                  <span className="font-black text-slate-900 text-sm">
                    {event.isFree || event.nonMemberFee === 0 ? 'FREE' : `₹${event.nonMemberFee}`}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Back / Next Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={category === 'member' && !memberVerified}
                onClick={handleStep3Continue}
                className="w-2/3 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Continue to Payment <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: PAYMENT METHOD SELECTION & CONFIRMATION */}
        {/* ========================================================================= */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 md:p-10 shadow-xl space-y-6"
          >
            <div>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Step 4 • Checkout</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Review & Payment</h2>
              <p className="text-xs text-slate-400 mt-1">Review your ticket summary and select your preferred payment mode.</p>
            </div>

            {/* Order Summary Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Event:</span>
                <span className="font-bold text-slate-900">{event.title}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Attendee:</span>
                <span className="font-bold text-slate-900">
                  {category === 'member' ? memberData?.fullName : nonMemberForm.fullName}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold uppercase text-primary-600">
                  {category === 'member' ? `Member (${memberData?.memberId})` : 'Non-Member'}
                </span>
              </div>

              {event.maxTicketsPerPerson > 1 && (
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Quantity:</span>
                  <select
                    value={ticketQuantity}
                    onChange={(e) => setTicketQuantity(parseInt(e.target.value, 10))}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1 font-bold text-xs"
                  >
                    {Array.from({ length: Math.min(event.maxTicketsPerPerson, event.availableTickets || 1) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} Ticket(s)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Fee per Ticket:</span>
                <span className="font-bold text-slate-900">{unitFee === 0 ? 'FREE' : `₹${unitFee}`}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200">
                <span className="text-sm font-black text-slate-900 uppercase">Total Amount:</span>
                <span className="text-2xl font-black text-primary-600">
                  {totalAmount <= 0 ? 'FREE' : `₹${totalAmount}`}
                </span>
              </div>
            </div>

            {/* Payment Method Selector (Only shown if fee > 0) */}
            {totalAmount > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                  Select Payment Option *
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Option A: Online Payment (Razorpay) */}
                  <label
                    className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                      paymentMethod === 'online'
                        ? 'border-primary-600 bg-primary-50/30 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!event.allowOnlinePayment ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      disabled={!event.allowOnlinePayment}
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-primary-600" />
                        <span className="font-black text-slate-900 text-xs uppercase">Online Payment</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        UPI, Debit / Credit Card, Net Banking via Razorpay. Instant confirmed E-Ticket.
                      </p>
                    </div>
                  </label>

                  {/* Option B: Cash Payment at Venue */}
                  <label
                    className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-primary-600 bg-primary-50/30 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!event.allowCashPayment ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      disabled={!event.allowCashPayment}
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-amber-600" />
                        <span className="font-black text-slate-900 text-xs uppercase">Cash Payment</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Pay cash at the event venue desk. Ticket is activated after verifier confirms payment.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Two-Tier Cash Approval Explanation */}
                {paymentMethod === 'cash' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs">
                    <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-amber-900 uppercase tracking-wider text-[11px]">
                        दोन-टप्पे रोख शुल्क पडताळणी (Two-Tier Cash Verification)
                      </h4>
                      <p className="text-slate-600 text-[11px] font-medium mt-1 leading-relaxed">
                        तुम्ही <strong>{category === 'member' ? (memberData?.district || memberData?.chapterName) : (nonMemberForm.district || nonMemberForm.city || 'निवडलेला')}</strong> जिल्हा निवडला आहे. 
                        रोख नोंदणी प्रथम संबंधित <strong>जिल्हा प्रतिनिधीकडे (District Admin)</strong> मंजुरीसाठी जाईल. जिल्हा प्रतिनिधीने रक्कम स्वीकारल्यानंतर <strong>मुख्य Super Admin</strong> कडून तुमचे डिजिटल QR तिकीट WhatsApp वर सक्रिय केले जाईल.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep(3)}
                className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleProceedToPayment}
                className="w-2/3 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Processing...
                  </>
                ) : totalAmount <= 0 ? (
                  'Confirm Free Registration'
                ) : paymentMethod === 'online' ? (
                  `Pay ₹${totalAmount} via Razorpay`
                ) : (
                  'Submit Cash Registration'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: DIGITAL TICKET / PROVISIONAL PASS RESULT */}
        {/* ========================================================================= */}
        {step === 5 && registrationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <DigitalTicket
              ticket={registrationResult.ticket}
              registration={registrationResult.registration}
              event={registrationResult.event}
              isProvisional={registrationResult.type === 'cash_pending'}
            />

            <div className="text-center pt-4">
              <Link
                to="/events"
                className="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Back to Event Listing
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;
