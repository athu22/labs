import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { Check, X, User, Calendar, CreditCard, Filter, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminEventApprovals = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('verified'); // pending (if direct), verified, approved, rejected

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      setRegistrations((data || []).map(reg => ({
        ...reg,
        fullName: reg.fullName || reg.full_name,
        eventTitle: reg.eventTitle || reg.event_title,
        memberType: reg.memberType || reg.member_type,
        transactionId: reg.transactionId || reg.transaction_id,
      })));
    } catch (error) {
      console.error("Error fetching event registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();

    const channel = supabase
      .channel('superadmin-event-registrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations' },
        () => fetchRegistrations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      fetchRegistrations();
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve registration.");
    }
  };

  const handleReject = async (id) => {
    if (confirm('Reject this event registration?')) {
      try {
        const { error } = await supabase
          .from('event_registrations')
          .update({ status: 'rejected' })
          .eq('id', id);

        if (error) throw error;
        fetchRegistrations();
      } catch (error) {
        console.error("Error rejecting:", error);
      }
    }
  };

  const filteredData = registrations.filter(r => r.status === filter);

  if (loading) return (
    <div className="py-20 flex justify-center">
      <Loader2 className="animate-spin text-primary-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Calendar className="text-primary-600" size={24} />
             Event Participation Approvals
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Reviewing all event registration requests
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           {['pending', 'verified', 'approved', 'rejected'].map((s) => (
             <button
               key={s}
               onClick={() => setFilter(s)}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="py-24 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No {filter} registrations found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredData.map((reg) => (
            <div key={reg.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-slate-900/5 transition-all group">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  
                  <div className="flex items-start gap-5">
                     <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-50 transition-colors">
                        <User size={28} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{reg.fullName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           <span>{reg.eventTitle}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span className={reg.memberType === 'new' ? 'text-amber-600' : 'text-emerald-600'}>
                             {reg.memberType === 'new' ? 'New Member' : 'Old Member'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-grow">
                     <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Organization</p>
                        <p className="text-xs font-bold text-slate-600 mt-1">{reg.organization || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Contact</p>
                        <p className="text-xs font-bold text-slate-600 mt-1">{reg.phone}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Transaction ID</p>
                        <p className="text-xs font-bold text-slate-700 mt-1 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">{reg.transactionId}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     {(filter === 'pending' || filter === 'verified') && (
                       <button 
                         onClick={() => handleApprove(reg.id)}
                         className="flex-grow lg:flex-none px-6 py-3 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
                       >
                          <CheckCircle size={16} /> Final Approve
                       </button>
                     )}
                     <button 
                       onClick={() => handleReject(reg.id)}
                       className="w-12 h-12 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 hover:border-rose-200 rounded-xl transition-all flex items-center justify-center active:scale-95"
                     >
                        <X size={20} />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminEventApprovals;
