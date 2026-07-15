import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import {
  Calendar, MapPin, Clock, User, Mail, Phone,
  CreditCard, CheckCircle2, ChevronRight, Loader2, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Translations for Event Registration
const translations = {
  en: {
    // General
    eventNotFound: 'Event Not Found',
    backToEvents: 'Back to Events',
    requestSent: 'Request Sent',
    registrationSubmitted: 'Your registration for',
    hasBeenSubmitted: 'has been submitted. It is now pending approval by the admin team.',
    returnHome: 'Return Home',
    back: 'Back',
    eventRegistration: 'Event Registration',
    registrationFee: 'Registration Fee',
    feeIncludes: 'Includes workshop materials, digital certificate, and networking lunch.',

    // Form Sections
    attendeeInformation: 'Attendee Information',
    paymentDetails: 'Payment Details',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    membershipId: 'Membership ID',
    yourDistrict: 'Your District',
    designation: 'Designation',
    labHospitalName: 'Lab/Hospital Name',
    district: 'District',

    // Member Types
    oldMember: 'Old Member',
    newMember: 'New Member',

    // Payment
    paymentInstructions: 'Please complete the payment via UPI and enter the Transaction ID / UTR below.',
    upiId: 'UPI: aclap.maha@bank',
    bankName: 'ACLAP MAHARASHTRA STATE',
    transactionId: 'Transaction ID / UTR',
    transactionPlaceholder: 'Enter 12-digit UPI Ref No.',

    // Buttons
    submitRegistration: 'Submit Registration',
    submitting: 'Submitting...',
    loginToAutoFill: 'Login to Auto-fill',
    alreadyHaveAccount: 'Already have a member account?',

    // Errors
    registrationFailed: 'Registration failed. Please try again.',
    selectDistrict: 'Select District',
    enterFullName: 'Enter full name',
    enterEmail: 'email@example.com',
    enterPhone: '10-digit number',
    enterMembershipId: 'Enter Membership ID',
    enterDesignation: 'e.g. Lab Technician',
    enterOrganization: 'Enter institution name',

    // Loading
    loading: 'Loading...',
  },
  mr: {
    // General
    eventNotFound: 'कार्यक्रम सापडला नाही',
    backToEvents: 'कार्यक्रमांकडे परत',
    requestSent: 'विनंती पाठविली',
    registrationSubmitted: 'साठी तुमची नोंदणी',
    hasBeenSubmitted: 'सबमिट केली गेली आहे. आता ती प्रशासक टीमच्या मंजुरीसाठी प्रलंबित आहे.',
    returnHome: 'मुख्यपृष्ठावर परत',
    back: 'मागे',
    eventRegistration: 'कार्यक्रम नोंदणी',
    registrationFee: 'नोंदणी शुल्क',
    feeIncludes: 'कार्यशाळा साहित्य, डिजिटल प्रमाणपत्र आणि नेटवर्किंग लंच समाविष्ट आहे.',

    // Form Sections
    attendeeInformation: 'सहभागी माहिती',
    paymentDetails: 'पेमेंट तपशील',
    fullName: 'पूर्ण नाव',
    emailAddress: 'ईमेल पत्ता',
    phoneNumber: 'फोन नंबर',
    membershipId: 'सदस्यत्व आयडी',
    yourDistrict: 'तुमचा जिल्हा',
    designation: 'पदनाम',
    labHospitalName: 'प्रयोगशाळा/रुग्णालयाचे नाव',
    district: 'जिल्हा',

    // Member Types
    oldMember: 'जुना सदस्य',
    newMember: 'नवीन सदस्य',

    // Payment
    paymentInstructions: 'कृपया UPI द्वारे पेमेंट पूर्ण करा आणि खाली व्यवहार आयडी / UTR प्रविष्ट करा.',
    upiId: 'UPI: aclap.maha@bank',
    bankName: 'ACLAP महाराष्ट्र राज्य',
    transactionId: 'व्यवहार आयडी / UTR',
    transactionPlaceholder: '12-अंकी UPI संदर्भ क्रमांक प्रविष्ट करा',

    // Buttons
    submitRegistration: 'नोंदणी सबमिट करा',
    submitting: 'सबमिट करत आहे...',
    loginToAutoFill: 'स्वयं-भरण्यासाठी लॉगिन करा',
    alreadyHaveAccount: 'आधीपासून सदस्य खाते आहे का?',

    // Errors
    registrationFailed: 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    selectDistrict: 'जिल्हा निवडा',
    enterFullName: 'पूर्ण नाव प्रविष्ट करा',
    enterEmail: 'email@example.com',
    enterPhone: '10-अंकी क्रमांक',
    enterMembershipId: 'सदस्यत्व आयडी प्रविष्ट करा',
    enterDesignation: 'उदा. प्रयोगशाळा तंत्रज्ञ',
    enterOrganization: 'संस्थेचे नाव प्रविष्ट करा',

    // Loading
    loading: 'लोड होत आहे...',
  }
};

const districts = [
  'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana',
  'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dhule', 'Gadchiroli',
  'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
  'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
  'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane',
  'Wardha', 'Washim', 'Yavatmal'
];

// Marathi translations for districts
const districtTranslations = {
  'Ahmednagar': 'अहमदनगर',
  'Akola': 'अकोला',
  'Amravati': 'अमरावती',
  'Beed': 'बीड',
  'Bhandara': 'भंडारा',
  'Buldhana': 'बुलढाणा',
  'Chandrapur': 'चंद्रपूर',
  'Chhatrapati Sambhajinagar': 'छत्रपती संभाजीनगर',
  'Dhule': 'धुळे',
  'Gadchiroli': 'गडचिरोली',
  'Gondia': 'गोंदिया',
  'Hingoli': 'हिंगोली',
  'Jalgaon': 'जळगाव',
  'Jalna': 'जालना',
  'Kolhapur': 'कोल्हापूर',
  'Latur': 'लातूर',
  'Mumbai City': 'मुंबई शहर',
  'Mumbai Suburban': 'मुंबई उपनगर',
  'Nagpur': 'नागपूर',
  'Nanded': 'नांदेड',
  'Nandurbar': 'नंदुरबार',
  'Nashik': 'नाशिक',
  'Osmanabad': 'उस्मानाबाद',
  'Palghar': 'पालघर',
  'Parbhani': 'परभणी',
  'Pune': 'पुणे',
  'Raigad': 'रायगड',
  'Ratnagiri': 'रत्नागिरी',
  'Sangli': 'सांगली',
  'Satara': 'सातारा',
  'Sindhudurg': 'सिंधुदुर्ग',
  'Solapur': 'सोलापूर',
  'Thane': 'ठाणे',
  'Wardha': 'वर्धा',
  'Washim': 'वाशिम',
  'Yavatmal': 'यवतमाळ'
};

const EventRegistration = () => {
  const { eventId } = useParams();
  const { currentUser, userData } = useAuth();
  const { language } = useContext(LanguageContext);
  const t = translations[language];
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
        status: 'pending',
        registeredAt: serverTimestamp(),
        enteredBy: currentUser?.uid || 'public',
        isAdminEntry: userData?.role === 'admin' || userData?.role === 'superadmin'
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Registration Error:", error);
      alert(t.registrationFailed);
    } finally {
      setSubmitting(false);
    }
  };

  // Get district display name based on language
  const getDistrictDisplay = (district) => {
    if (language === 'mr' && districtTranslations[district]) {
      return districtTranslations[district];
    }
    return district;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-4">{t.eventNotFound}</h2>
        <button onClick={() => navigate('/events')} className="text-primary-600 font-bold uppercase tracking-widest text-xs">{t.backToEvents}</button>
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
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t.requestSent}</h2>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          {t.registrationSubmitted} <strong>{event.title}</strong> {t.hasBeenSubmitted}
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
        >
          {t.returnHome}
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
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t.back}
            </button>

            <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em] mb-4 inline-block">{t.eventRegistration}</span>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
              {event.title}
            </h1>

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                  <Calendar size={18} />
                </div>
                <span className="text-sm font-bold">
                  {new Date(event.date).toLocaleDateString(
                    language === 'mr' ? 'mr-IN' : 'en-IN',
                    { day: '2-digit', month: 'long', year: 'numeric' }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                  <MapPin size={18} />
                </div>
                <span className="text-sm font-bold">{event.location}</span>
              </div>
            </div>

            <div className="p-8 bg-primary-600 rounded-[2.5rem] text-white shadow-2xl shadow-primary-600/30">
              <h3 className="text-xs font-black uppercase tracking-widest mb-2 opacity-60">{t.registrationFee}</h3>
              <div className="text-4xl font-black mb-4">₹ {event.fee || '500.00'}</div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-relaxed">
                {t.feeIncludes}
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
                <p className="text-[10px] font-bold text-primary-900 uppercase tracking-tight">{t.alreadyHaveAccount}</p>
              </div>
              <Link
                to="/login"
                state={{ from: location }}
                className="text-[10px] font-black text-primary-600 uppercase tracking-widest border-b-2 border-primary-600/20 pb-0.5 hover:border-primary-600 transition-all"
              >
                {t.loginToAutoFill}
              </Link>
            </div>
          )}
          {/* Member Type Selection */}
          <div className="flex gap-4 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button
              onClick={() => setMemberType('old')}
              className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${memberType === 'old' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.oldMember}
            </button>
            <button
              onClick={() => setMemberType('new')}
              className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${memberType === 'new' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.newMember}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-slate-900/5">
            <div className="space-y-12">

              {/* Section: Registrant */}
              <div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                  <User size={14} /> 01. {t.attendeeInformation}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.fullName}</label>
                    <input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder={t.enterFullName} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.emailAddress}</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t.enterEmail} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.phoneNumber}</label>
                    <input required name="phone" value={formData.phone} onChange={handleChange} placeholder={t.enterPhone} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                  </div>

                  {memberType === 'old' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.membershipId}</label>
                        <input required name="membershipId" value={formData.membershipId} onChange={handleChange} placeholder={t.enterMembershipId} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.yourDistrict}</label>
                        <select required name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none appearance-none">
                          <option value="">{t.selectDistrict}</option>
                          {districts.map(d => <option key={d} value={d}>{getDistrictDisplay(d)}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.designation}</label>
                        <input required name="designation" value={formData.designation} onChange={handleChange} placeholder={t.enterDesignation} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.labHospitalName}</label>
                        <input required name="organization" value={formData.organization} onChange={handleChange} placeholder={t.enterOrganization} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.district}</label>
                        <select required name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none appearance-none">
                          <option value="">{t.selectDistrict}</option>
                          {districts.map(d => <option key={d} value={d}>{getDistrictDisplay(d)}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section: Payment */}
              <div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                  <CreditCard size={14} /> 02. {t.paymentDetails}
                </h2>
                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium mb-4">{t.paymentInstructions}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <div className="w-6 h-6 bg-primary-600/10 rounded flex items-center justify-center text-primary-600 font-bold text-[8px]">QR</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase">{t.upiId}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{t.bankName}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.transactionId}</label>
                  <input required name="transactionId" value={formData.transactionId} onChange={handleChange} placeholder={t.transactionPlaceholder} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                </div>
              </div>

            </div>

            <div className="mt-16">
              <button
                disabled={submitting}
                className="w-full py-5 bg-primary-600 text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
              >
                {submitting ? (
                  <>{t.submitting} <Loader2 className="animate-spin" size={18} /></>
                ) : (
                  <>{t.submitRegistration} <ChevronRight size={18} strokeWidth={3} /></>
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