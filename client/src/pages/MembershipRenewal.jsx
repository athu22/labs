import React, { useState, useEffect, useContext } from 'react';
import { CreditCard, Calendar, ShieldCheck, AlertCircle, Loader2, CheckCircle2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';

// Translations for Membership Renewal
const translations = {
  en: {
    // Loading
    loadingStatus: 'Loading membership status...',

    // No Membership
    noActiveMembership: 'No Active Membership',
    noMembershipDesc: 'We couldn\'t find an approved membership linked to',
    registerNow: 'Register Now',

    // Left Column
    membershipStatus: 'Membership Status',
    statusDesc: 'View and manage your association membership.',
    active: 'Active',
    expired: 'Expired',
    validUntil: 'Valid Until',
    memberType: 'Member Type',
    renewalHistory: 'Renewal History',
    noPreviousRenewals: 'No previous renewal requests found.',

    // Right Column
    renewMembership: 'Renew Membership',
    renewalFee: 'Renewal Fee',
    includesExtension: 'Includes 1 year extension',
    upiTransactionId: 'UPI Transaction ID',
    refNoUtr: 'Ref No. / UTR',
    paymentDate: 'Payment Date',
    submitRenewal: 'Submit Renewal Request',
    submitting: 'Submitting...',

    // Success
    requestSubmitted: 'Request Submitted!',
    successDesc: 'Admin will verify your payment and update your expiry date shortly.',
    submitAnother: 'Submit another request',

    // Notice
    noticeText: 'After submission, please allow 24-48 hours for admin verification and status update.',

    // Statuses
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  },
  mr: {
    // Loading
    loadingStatus: 'सदस्यत्व स्थिती लोड करत आहे...',

    // No Membership
    noActiveMembership: 'सक्रिय सदस्यत्व नाही',
    noMembershipDesc: 'आम्हाला याच्याशी जोडलेले मंजूर सदस्यत्व सापडले नाही',
    registerNow: 'आता नोंदणी करा',

    // Left Column
    membershipStatus: 'सदस्यत्व स्थिती',
    statusDesc: 'तुमचे संघटना सदस्यत्व पहा आणि व्यवस्थापित करा.',
    active: 'सक्रिय',
    expired: 'कालबाह्य',
    validUntil: 'पर्यंत वैध',
    memberType: 'सदस्य प्रकार',
    renewalHistory: 'नूतनीकरण इतिहास',
    noPreviousRenewals: 'कोणत्याही पूर्वीच्या नूतनीकरण विनंत्या सापडल्या नाहीत.',

    // Right Column
    renewMembership: 'सदस्यत्व नूतनीकरण',
    renewalFee: 'नूतनीकरण शुल्क',
    includesExtension: '१ वर्ष विस्तार समाविष्ट',
    upiTransactionId: 'UPI व्यवहार आयडी',
    refNoUtr: 'संदर्भ क्र. / UTR',
    paymentDate: 'पेमेंट तारीख',
    submitRenewal: 'नूतनीकरण विनंती सबमिट करा',
    submitting: 'सबमिट करत आहे...',

    // Success
    requestSubmitted: 'विनंती सबमिट केली!',
    successDesc: 'प्रशासक तुमचे पेमेंट सत्यापित करेल आणि लवकरच तुमची कालबाह्य तारीख अद्यतनित करेल.',
    submitAnother: 'दुसरी विनंती सबमिट करा',

    // Notice
    noticeText: 'सबमिशननंतर, कृपया प्रशासक सत्यापन आणि स्थिती अद्यतनासाठी २४-४८ तास मुदत द्या.',

    // Statuses
    pending: 'प्रलंबित',
    approved: 'मंजूर',
    rejected: 'नाकारलेले',
  }
};

const MembershipRenewal = () => {
  const { currentUser } = useAuth();
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [membership, setMembership] = useState(null);
  const [renewalHistory, setRenewalHistory] = useState([]);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    upiTransactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (currentUser) {
      fetchMembershipData();
    }
  }, [currentUser]);

  // Get status display text
  const getStatusDisplay = (status) => {
    if (language === 'mr') {
      switch (status) {
        case 'approved': return t.approved;
        case 'rejected': return t.rejected;
        case 'pending': return t.pending;
        default: return status;
      }
    }
    return status;
  };

  // Get status color classes
  const getStatusClasses = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-amber-500/10 text-amber-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-slate-500/10 text-slate-500';
    }
  };

  const fetchMembershipData = async () => {
    setLoading(true);
    try {
      // Find the approved registration for this user's email
      const { data: regData, error: regErr } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', currentUser.email)
        .eq('status', 'approved')
        .limit(1);

      if (regErr) throw regErr;

      if (regData && regData.length > 0) {
        const r = regData[0];
        const data = {
          ...r,
          fullName: r.fullName || r.full_name || '',
          membershipId: r.membershipId || r.registration_no || r.id,
          expiryDate: r.expiryDate || r.expiry_date,
        };
        setMembership(data);

        // Fetch renewal history
        const { data: historyData, error: histErr } = await supabase
          .from('renewals')
          .select('*')
          .eq('registration_id', r.id)
          .order('submitted_at', { ascending: false });

        if (!histErr && historyData) {
          setRenewalHistory(historyData.map(h => ({
            ...h,
            upiTransactionId: h.upiTransactionId || h.transaction_id,
            paymentDate: h.paymentDate || h.payment_date,
          })));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const rawUid = currentUser?.id || currentUser?.uid;
      const isUuid =
        typeof rawUid === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUid);

      const { error } = await supabase.from('renewals').insert([{
        registration_id: membership.id,
        uid: isUuid ? rawUid : null,
        member_name: membership.fullName,
        email: currentUser.email,
        transaction_id: formData.upiTransactionId,
        payment_date: formData.paymentDate,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      }]);
      if (error) throw error;
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert('Failed to submit renewal request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="pt-40 text-center text-slate-400">{t.loadingStatus}</div>;

  if (!membership) return (
    <div className="pt-40 text-center px-4">
      <h2 className="text-2xl font-bold text-white mb-2">{t.noActiveMembership}</h2>
      <p className="text-slate-400 mb-8">{t.noMembershipDesc} {currentUser?.email}.</p>
      <Link to="/signup" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold inline-block">{t.registerNow}</Link>
    </div>
  );

  const isExpired = membership.expiryDate ? new Date(membership.expiryDate) < new Date() : false;

  return (
    <div className="pt-32 pb-24 px-4 bg-slate-950 min-h-screen">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">

        {/* Left Column: Status & History */}
        <div className="space-y-8">
          <header>
            <h1 className="text-4xl font-bold text-white mb-4">{t.membershipStatus}</h1>
            <p className="text-slate-400">{t.statusDesc}</p>
          </header>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {isExpired ? t.expired : t.active}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-500 font-bold text-2xl">
                {membership.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{membership.fullName}</h3>
                <p className="text-primary-500 font-mono text-sm font-bold">{membership.membershipId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.validUntil}</p>
                <p className="text-white font-bold">{membership.expiryDate || 'Dec 31, 2026'}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.memberType}</p>
                <p className="text-white font-bold">{membership.membershipType?.split(' ')[0] || 'Life Member'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <History size={18} className="text-primary-500" /> {t.renewalHistory}
            </h3>
            <div className="space-y-4">
              {renewalHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">{t.noPreviousRenewals}</p>
              ) : (
                renewalHistory.map(renewal => (
                  <div key={renewal.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                    <div>
                      <div className="text-sm font-bold text-white">{renewal.paymentDate}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{renewal.upiTransactionId}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusClasses(renewal.status)}`}>
                      {getStatusDisplay(renewal.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Renewal Form */}
        <div className="lg:pt-16">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-center"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.requestSubmitted}</h2>
                <p className="text-slate-400 mb-8">{t.successDesc}</p>
                <button onClick={() => setSuccess(false)} className="text-primary-500 font-bold hover:underline">{t.submitAnother}</button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <CreditCard size={24} className="text-primary-500" /> {t.renewMembership}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">{t.renewalFee}</span>
                      <span className="text-xl font-black text-white">₹ 5,000.00</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t.includesExtension}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">{t.upiTransactionId}</label>
                      <input
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-primary-500 outline-none transition-colors"
                        placeholder={t.refNoUtr}
                        value={formData.upiTransactionId}
                        onChange={(e) => setFormData({ ...formData, upiTransactionId: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">{t.paymentDate}</label>
                      <input
                        type="date"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-primary-500 outline-none transition-colors"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    disabled={submitting}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : t.submitRenewal}
                  </button>

                  <div className="flex items-center gap-3 p-4 bg-primary-900/10 rounded-2xl text-[10px] text-primary-400 font-bold uppercase tracking-widest leading-relaxed">
                    <AlertCircle size={20} className="shrink-0" />
                    {t.noticeText}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default MembershipRenewal;