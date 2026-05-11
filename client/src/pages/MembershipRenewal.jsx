import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, ShieldCheck, AlertCircle, Loader2, CheckCircle2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

const MembershipRenewal = () => {
  const { currentUser } = useAuth();
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

  const fetchMembershipData = async () => {
    setLoading(true);
    try {
      // Find the approved registration for this user's email
      const q = query(
        collection(db, 'registrations'), 
        where('email', '==', currentUser.email),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setMembership(data);

        // Fetch renewal history
        const hq = query(
          collection(db, 'renewals'),
          where('registrationId', '==', snap.docs[0].id),
          orderBy('submittedAt', 'desc')
        );
        const hSnap = await getDocs(hq);
        setRenewalHistory(hSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      await addDoc(collection(db, 'renewals'), {
        registrationId: membership.id,
        memberEmail: currentUser.email,
        memberName: membership.fullName,
        membershipId: membership.membershipId,
        ...formData,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert('Failed to submit renewal request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="pt-40 text-center text-slate-400">Loading membership status...</div>;

  if (!membership) return (
    <div className="pt-40 text-center px-4">
      <h2 className="text-2xl font-bold text-white mb-2">No Active Membership</h2>
      <p className="text-slate-400 mb-8">We couldn't find an approved membership linked to {currentUser?.email}.</p>
      <Link to="/signup" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold inline-block">Register Now</Link>
    </div>
  );

  const isExpired = membership.expiryDate ? new Date(membership.expiryDate) < new Date() : false;

  return (
    <div className="pt-32 pb-24 px-4 bg-slate-950 min-h-screen">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
        
        {/* Left Column: Status & History */}
        <div className="space-y-8">
          <header>
            <h1 className="text-4xl font-bold text-white mb-4">Membership Status</h1>
            <p className="text-slate-400">View and manage your association membership.</p>
          </header>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {isExpired ? 'Expired' : 'Active'}
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
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valid Until</p>
                <p className="text-white font-bold">{membership.expiryDate || 'Dec 31, 2026'}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Member Type</p>
                <p className="text-white font-bold">{membership.membershipType?.split(' ')[0] || 'Life Member'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <History size={18} className="text-primary-500" /> Renewal History
            </h3>
            <div className="space-y-4">
              {renewalHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">No previous renewal requests found.</p>
              ) : (
                renewalHistory.map(renewal => (
                  <div key={renewal.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                    <div>
                      <div className="text-sm font-bold text-white">{renewal.paymentDate}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{renewal.upiTransactionId}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      renewal.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                      renewal.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {renewal.status}
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
                <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
                <p className="text-slate-400 mb-8">Admin will verify your payment and update your expiry date shortly.</p>
                <button onClick={() => setSuccess(false)} className="text-primary-500 font-bold hover:underline">Submit another request</button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <CreditCard size={24} className="text-primary-500" /> Renew Membership
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">Renewal Fee</span>
                      <span className="text-xl font-black text-white">₹ 5,000.00</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Includes 1 year extension</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">UPI Transaction ID</label>
                      <input 
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-primary-500 outline-none transition-colors"
                        placeholder="Ref No. / UTR"
                        value={formData.upiTransactionId}
                        onChange={(e) => setFormData({...formData, upiTransactionId: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">Payment Date</label>
                      <input 
                        type="date"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-primary-500 outline-none transition-colors"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={submitting}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : 'Submit Renewal Request'}
                  </button>

                  <div className="flex items-center gap-3 p-4 bg-primary-900/10 rounded-2xl text-[10px] text-primary-400 font-bold uppercase tracking-widest leading-relaxed">
                    <AlertCircle size={20} className="shrink-0" />
                    After submission, please allow 24-48 hours for admin verification and status update.
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
