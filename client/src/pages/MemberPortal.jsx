import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  User, Shield, CreditCard, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, FileText, Download, UserPlus, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const MemberPortal = () => {
  const { currentUser, userData } = useAuth();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'registrations'), 
          where('uid', '==', currentUser.uid),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setRegistration({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, [currentUser]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Member Portal</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfcf5] pt-32 pb-24 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/5 blur-[120px] rounded-full -mr-96 -mt-96" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
           <div className="space-y-4">
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Member Ecosystem</span>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                Practitioner <span className="text-primary-600">Portal</span>
              </h1>
              <p className="text-slate-500 font-medium">Welcome back, {userData?.fullName}. Access your professional node.</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="bg-white border border-slate-100 p-4 rounded-3xl flex items-center gap-4 shadow-xl shadow-slate-900/5">
                 <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                    <Shield size={20} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry Status</p>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${registration ? 'text-emerald-600' : 'text-rose-500'}`}>
                       {registration ? registration.status : 'Not Registered'}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           
           {/* Main Status Area */}
           <div className="lg:col-span-8 space-y-8">
              
              {!registration ? (
                /* Empty State: Prompt to Register */
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-2 border-primary-100 p-12 rounded-[3rem] shadow-2xl shadow-primary-600/5 text-center"
                >
                   <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                      <UserPlus size={40} />
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Complete Your Profile</h2>
                   <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-md mx-auto">
                      Your practitioner node is currently empty. To join the official registry and access member benefits, please fill out the membership application form.
                   </p>
                   <Link 
                     to="/register"
                     className="inline-flex items-center gap-3 px-12 py-5 bg-primary-600 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-600/30 active:scale-95"
                   >
                     Fill Application Form <ChevronRight size={18} />
                   </Link>
                </motion.div>
              ) : (
                /* State: Show Registration Summary */
                <div className="space-y-8">
                   <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/5">
                      <div className="flex items-center justify-between mb-10">
                         <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <FileText className="text-primary-600" size={24} /> Application Summary
                         </h3>
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            registration.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            registration.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                         }`}>
                            {registration.status}
                         </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-10">
                         <div className="space-y-6">
                            <InfoRow label="Registration No" value={registration.registrationNo} />
                            <InfoRow label="Organization" value={registration.organization} />
                            <InfoRow label="Qualification" value={registration.qualification} />
                         </div>
                         <div className="space-y-6">
                            <InfoRow label="Experience" value={`${registration.experience} Years`} />
                            <InfoRow label="Email Node" value={registration.email} />
                            <InfoRow label="Phone Line" value={registration.phone} />
                         </div>
                      </div>

                      {registration.status === 'approved' && (
                        <div className="mt-12 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                 <CheckCircle2 size={24} />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Membership</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valid until Dec 2026</p>
                              </div>
                           </div>
                           <button className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                              <Download size={18} /> Download ID Card
                           </button>
                        </div>
                      )}
                   </div>

                   {/* Renewal Banner if needed */}
                   <div className="bg-accent-maroon text-white p-10 rounded-[3rem] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                         <div className="space-y-4">
                            <h3 className="text-2xl font-black tracking-tight leading-none">Annual Renewal 2026</h3>
                            <p className="text-white/60 text-sm font-medium">Keep your professional credentials active and up-to-date.</p>
                         </div>
                         <button className="bg-secondary-yellow text-accent-maroon px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95">
                            Secure Renewal
                         </button>
                      </div>
                   </div>
                </div>
              )}

           </div>

           {/* Sidebar: Quick Links & Status */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/5">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">System Access</h4>
                 <div className="space-y-4">
                    <SidebarLink icon={<Calendar />} label="Upcoming Events" path="/events" />
                    <SidebarLink icon={<CreditCard />} label="Fee Settlement" path="/membership" />
                    <SidebarLink icon={<User />} label="Identity Settings" path="#" />
                 </div>
              </div>

              <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white">
                 <AlertCircle size={32} className="mb-6 text-white/40" />
                 <h4 className="text-lg font-black tracking-tight mb-3">Notice Board</h4>
                 <p className="text-white/70 text-xs leading-relaxed mb-6">Important updates regarding clinical lab regulations in Maharashtra will appear here.</p>
                 <div className="h-[1px] bg-white/10 w-full mb-6" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">No urgent updates at this time.</p>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="space-y-1.5">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{value || '---'}</p>
  </div>
);

const SidebarLink = ({ icon, label, path }) => (
  <Link to={path} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-primary-50 transition-all">
    <div className="flex items-center gap-4 text-slate-500 group-hover:text-primary-600 transition-colors">
       {React.cloneElement(icon, { size: 18 })}
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-600 transition-all group-hover:translate-x-1" />
  </Link>
);

export default MemberPortal;
