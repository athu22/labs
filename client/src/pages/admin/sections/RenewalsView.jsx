import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { Calendar, CreditCard, User, Check, X, Loader2, FileText, IndianRupee, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const RenewalsView = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('renewals')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setRenewals((data || []).map(item => ({
        ...item,
        registrationId: item.registrationId || item.registration_id,
        memberName: item.memberName || item.member_name,
        membershipId: item.membershipId || item.membership_id || item.email,
        upiTransactionId: item.upiTransactionId || item.transaction_id,
        paymentDate: item.paymentDate || item.payment_date,
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (renewal) => {
    setProcessingId(renewal.id);
    try {
      const { error: renewErr } = await supabase
        .from('renewals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', renewal.id);

      if (renewErr) throw renewErr;

      if (renewal.registrationId) {
        const { data: memberData } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', renewal.registrationId)
          .single();

        if (memberData) {
          const existingExpiry = memberData.expiry_date || memberData.expiryDate;
          const currentExpiry = existingExpiry ? new Date(existingExpiry) : new Date();
          const newExpiry = new Date(currentExpiry);
          newExpiry.setFullYear(newExpiry.getFullYear() + 1);

          await supabase
            .from('registrations')
            .update({
              expiry_date: newExpiry.toISOString().split('T')[0],
              status: 'approved'
            })
            .eq('id', renewal.registrationId);
        }
      }

      fetchRenewals();
    } catch (e) {
      console.error(e);
      alert('Error approving renewal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (renewal) => {
    if (!confirm('Reject this renewal request?')) return;
    setProcessingId(renewal.id);
    try {
      const { error } = await supabase
        .from('renewals')
        .update({ status: 'rejected' })
        .eq('id', renewal.id);

      if (error) throw error;
      fetchRenewals();
    } catch (e) {
      console.error(e);
      alert('Error rejecting renewal');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="text-primary-600" size={24} /> 
            Membership Renewals
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Audit and process subscription renewals</p>
        </div>
        <button onClick={fetchRenewals} className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 rounded-xl transition-all">
           <Loader2 className={loading ? 'animate-spin' : ''} size={18} />
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
           <div className="w-8 h-8 border-2 border-primary-600/20 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Practitioner</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Node</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {renewals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No renewal requests found in logs</p>
                  </td>
                </tr>
              ) : (
                renewals.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 font-black group-hover:bg-primary-50 transition-colors">
                          {item.memberName?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800 tracking-tight">{item.memberName}</div>
                          <div className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-0.5">{item.membershipId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                          <CreditCard size={14} className="text-slate-300" /> {item.upiTransactionId}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[9px] font-medium mt-1">
                          <Calendar size={12} className="text-slate-200" /> Paid on {item.paymentDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-1 text-sm font-black text-slate-900">
                          <IndianRupee size={12} className="text-slate-400" /> 5,000
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                        item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                        item.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {item.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(item)}
                            disabled={processingId === item.id}
                            className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-primary-600/10 active:scale-95 disabled:opacity-50"
                          >
                            {processingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            disabled={processingId === item.id}
                            className="w-9 h-9 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 hover:border-rose-100 rounded-xl transition-all flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                      {item.status === 'approved' && (
                         <button className="p-2 text-slate-300 hover:text-primary-600 transition-colors">
                            <ExternalLink size={16} />
                         </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RenewalsView;
