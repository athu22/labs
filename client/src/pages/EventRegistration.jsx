import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, MapPin, Clock, User, Mail, Phone, 
  CreditCard, CheckCircle2, ChevronRight, Loader2, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const districts = [
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
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [memberType, setMemberType] = useState('old'); // 'new' or 'old'
  
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    email: currentUser?.email || '',
    phone: userData?.phone || '',
    membershipId: userData?.membershipId || '',
    organization: userData?.organization || '',
    designation: userData?.designation || '',
    district: userData?.district || '',
    transactionId: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setEvent({ id: snap.id, ...snap.data() });
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await addDoc(collection(db, 'event_registrations'), {
        eventId: eventId,
        eventTitle: event.title,
        eventDistrict: event.district || '',
        eventAdminEmail: event.adminEmail || '',
        uid: currentUser?.uid || 'anonymous',
        ...formData,
        memberType,
        status: 'pending', // Now goes to pending for approval
        registeredAt: serverTimestamp(),
        enteredBy: currentUser?.uid || 'public',
        isAdminEntry: userData?.role === 'admin' || userData?.role === 'superadmin'
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Event Not Found</h2>
        <button onClick={() => navigate('/events')} className="text-primary-600 font-bold uppercase tracking-widest text-xs">Back to Events</button>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md border border-slate-100"
       >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
             <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Request Sent</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            Your registration for <strong>{event.title}</strong> has been submitted. It is now pending approval by the admin team.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            Return Home
          </button>
       </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 rounded-l-[5rem] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-20">
        
        {/* Event Details Column */}
        <div className="lg:col-span-5">
           <div className="sticky top-40">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 hover:text-primary-600 transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
              </button>
              
              <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em] mb-4 inline-block">Event Registration</span>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
                {event.title}
              </h1>
              
              <div className="space-y-6 mb-12">
                 <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                       <Calendar size={18} />
                    </div>
                    <span className="text-sm font-bold">{new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                 </div>
                 <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                       <MapPin size={18} />
                    </div>
                    <span className="text-sm font-bold">{event.location}</span>
                 </div>
              </div>

              <div className="p-8 bg-primary-600 rounded-[2.5rem] text-white shadow-2xl shadow-primary-600/30">
                 <h3 className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">Registration Fee</h3>
                 <div className="text-4xl font-black mb-4">₹ {event.fee || '500.00'}</div>
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-relaxed">
                    Includes workshop materials, digital certificate, and networking lunch.
                 </p>
              </div>
           </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7">
           {!currentUser && (
              <div className="mb-6 px-6 py-4 bg-primary-50 rounded-2xl border border-primary-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                       <User size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-primary-900 uppercase tracking-tight">Already have a member account?</p>
                 </div>
                 <Link 
                   to="/login" 
                   state={{ from: location }}
                   className="text-[10px] font-black text-primary-600 uppercase tracking-widest border-b-2 border-primary-600/20 pb-0.5 hover:border-primary-600 transition-all"
                 >
                   Login to Auto-fill
                 </Link>
              </div>
           )}
           {/* Member Type Selection */}
           <div className="flex gap-4 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <button 
                onClick={() => setMemberType('old')}
                className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${memberType === 'old' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Old Member
              </button>
              <button 
                onClick={() => setMemberType('new')}
                className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${memberType === 'new' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                New Member
              </button>
           </div>

           <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-slate-900/5">
              <div className="space-y-12">
                 
                 {/* Section: Registrant */}
                 <div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                       <User size={14} /> 01. Attendee Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                           <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                        </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit number" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>

                       {memberType === 'old' ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Membership ID</label>
                              <input required name="membershipId" value={formData.membershipId} onChange={handleChange} placeholder="Enter Membership ID" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your District</label>
                              <select required name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none appearance-none">
                                <option value="">Select District</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </div>
                          </>
                       ) : (
                          <>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                              <input required name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Lab Technician" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lab/Hospital Name</label>
                              <input required name="organization" value={formData.organization} onChange={handleChange} placeholder="Enter institution name" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                              <select required name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none appearance-none">
                                <option value="">Select District</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </div>
                          </>
                       )}
                    </div>
                 </div>

                 {/* Section: Payment */}
                 <div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                       <CreditCard size={14} /> 02. Payment Details
                    </h2>
                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                       <p className="text-[11px] text-slate-500 font-medium mb-4">Please complete the payment via UPI and enter the Transaction ID / UTR below.</p>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                             <div className="w-6 h-6 bg-primary-600/10 rounded flex items-center justify-center text-primary-600 font-bold text-[8px]">QR</div>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-900 uppercase">UPI: aclap.maha@bank</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">ACLAP MAHARASHTRA STATE</p>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction ID / UTR</label>
                       <input required name="transactionId" value={formData.transactionId} onChange={handleChange} placeholder="Enter 12-digit UPI Ref No." className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                    </div>
                 </div>

              </div>

              <div className="mt-16">
                 <button 
                   disabled={submitting}
                   className="w-full py-5 bg-primary-600 text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                 >
                    {submitting ? (
                      <>Submitting... <Loader2 className="animate-spin" size={18} /></>
                    ) : (
                      <>Submit Registration <ChevronRight size={18} strokeWidth={3} /></>
                    )}
                 </button>
              </div>
           </form>
        </div>

      </div>
    </div>
  );
};

export default EventRegistration;
