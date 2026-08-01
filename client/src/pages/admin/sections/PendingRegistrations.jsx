import React from 'react';
import { db } from '../../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Check, X, User, Briefcase, Mail, Phone, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const PendingRegistrations = ({ registrations, refresh }) => {
  const handleVerify = async (id) => {
    try {
      await updateDoc(doc(db, 'registrations', id), {
        status: 'verified', // Admin verifies, moves to Super Admin
        verifiedByAdminAt: new Date()
      });
      refresh();
    } catch (error) {
      console.error("Error verifying:", error);
    }
  };

  const handleReject = async (id) => {
    if (confirm('Are you sure you want to reject this application?')) {
      try {
        await updateDoc(doc(db, 'registrations', id), {
          status: 'rejected'
        });
        refresh();
      } catch (error) {
        console.error("Error rejecting:", error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-primary-600" size={24} /> 
            Member Verification
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Reviewing {registrations.length} incoming applications</p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="py-24 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
           <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm">
              <ShieldCheck size={24} />
           </div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending verification requests</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {registrations.map((reg) => (
            <motion.div
              layout
              key={reg.id}
              className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                
                {/* Profile Identity */}
                <div className="flex items-start gap-5">
                   <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-50 transition-colors">
                      <User size={24} strokeWidth={2.5} />
                   </div>
                   <div>
                      <h3 className="text-base font-black text-slate-800 tracking-tight">{reg.fullName}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                         <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Briefcase size={12} className="text-slate-300" /> {reg.organization || 'Independent'}
                         </span>
                         <span className="w-1 h-1 bg-slate-200 rounded-full" />
                         <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <MapPin size={12} className="text-slate-300" /> {reg.district || 'Location N/A'}
                         </span>
                      </div>
                   </div>
                </div>

                {/* Contact Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                         <Mail size={14} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Email Address</p>
                         <p className="text-xs font-bold text-slate-600 mt-1">{reg.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                         <Phone size={14} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Phone Contact</p>
                         <p className="text-xs font-bold text-slate-600 mt-1">{reg.phone}</p>
                      </div>
                   </div>
                </div>

                {/* Control Action */}
                <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                  <button
                    onClick={() => handleVerify(reg.id)}
                    className="flex-grow lg:flex-none px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/10 active:scale-95"
                  >
                    <Check size={14} strokeWidth={3} /> Verify Application
                  </button>
                  <button
                    onClick={() => handleReject(reg.id)}
                    className="w-12 h-12 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all flex items-center justify-center shadow-sm active:scale-95"
                    title="Reject Entry"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRegistrations;
