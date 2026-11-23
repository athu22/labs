import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { Check, X, User, Calendar, CreditCard, Filter, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

const EventApprovals = () => {
  const { currentUser, userData } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, verified, rejected

  const [events, setEvents] = useState([]);

  const fetchAssignedData = async () => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }
    try {
      const [
        { data: eventsData, error: eventsErr },
        { data: regsData, error: regsErr }
      ] = await Promise.all([
        supabase.from('events').select('*').eq('admin_email', currentUser.email),
        supabase.from('event_registrations').select('*').eq('event_admin_email', currentUser.email)
      ]);

      if (eventsErr) console.error("Events fetch error:", eventsErr);
      if (regsErr) console.error("Event regs fetch error:", regsErr);

      setEvents(eventsData || []);
      setRegistrations((regsData || []).map(reg => ({
        ...reg,
        fullName: reg.fullName || reg.full_name,
        eventTitle: reg.eventTitle || reg.event_title,
        transactionId: reg.transactionId || reg.transaction_id,
      })));
    } catch (error) {
      console.error("Error fetching assigned events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedData();

    if (!currentUser?.email) return;

    const channel = supabase
      .channel('admin-event-approvals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations' },
        () => fetchAssignedData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.email]);

  const handleVerify = async (id) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'verified' })
        .eq('id', id);

      if (error) throw error;
      fetchAssignedData();
    } catch (error) {
      console.error("Error verifying:", error);
      alert("Failed to verify registration.");
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
        fetchAssignedData();
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Assigned Events & Approvals</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Managing events and entries assigned to you
          </p>
        </div>
      </div>

      {/* Events Assigned to Admin */}
      <div className="mb-8">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Your Active Events</h3>
         {events.length === 0 ? (
           <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No events assigned yet</p>
           </div>
         ) : (
           <div className="grid md:grid-cols-2 gap-4">
             {events.map(ev => (
               <div key={ev.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                     <Calendar size={20} />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-slate-800">{ev.title}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{ev.date} | {ev.location}</p>
                  </div>
               </div>
             ))}
           </div>
         )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-8">
        <div>
           <h3 className="text-sm font-black text-slate-800 tracking-tight">Registration Requests</h3>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           {['pending', 'verified', 'rejected'].map((s) => (
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
        <div className="py-20 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No registrations found in this category</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredData.map((reg) => (
            <div key={reg.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary-600/5 transition-all">
               <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                        <User size={20} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-800">{reg.fullName}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reg.eventTitle}</p>
                     </div>
                  </div>

                  <div className="flex-grow grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">Contact</p>
                        <p className="text-xs font-bold text-slate-600">{reg.phone}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">Transaction ID</p>
                        <p className="text-xs font-bold text-slate-600">{reg.transactionId}</p>
                     </div>
                  </div>

                  {filter === 'pending' && (
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleVerify(reg.id)}
                         className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                       >
                          <Check size={16} strokeWidth={3} />
                       </button>
                       <button 
                         onClick={() => handleReject(reg.id)}
                         className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                       >
                          <X size={16} strokeWidth={3} />
                       </button>
                    </div>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventApprovals;
