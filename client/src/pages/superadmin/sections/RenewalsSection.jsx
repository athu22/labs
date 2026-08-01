import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, getDocs, doc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { CreditCard, Check, X, Loader2, History, User } from 'lucide-react';

const RenewalsSection = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'renewals'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      setRenewals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (renewal) => {
    setProcessingId(renewal.id);
    try {
      await updateDoc(doc(db, 'renewals', renewal.id), {
        status: 'approved',
        approvedAt: new Date()
      });

      const memberRef = doc(db, 'registrations', renewal.registrationId);
      const memberSnap = await getDoc(memberRef);
      
      if (memberSnap.exists()) {
        const currentData = memberSnap.data();
        const currentExpiry = currentData.expiryDate ? new Date(currentData.expiryDate) : new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        
        await updateDoc(memberRef, {
          expiryDate: newExpiry.toISOString().split('T')[0],
          status: 'approved'
        });
      }
      fetchRenewals();
    } catch (e) {
      console.error(e);
      alert('Error approving renewal');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-8 h-8 border-2 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <History className="text-primary-600" size={24} /> 
            Subscription Control
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage and audit membership renewal cycles</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-100">
             {renewals.filter(r => r.status === 'pending').length} Open Requests
           </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriber</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Node</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renewals.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                    No active renewal traffic detected
                  </td>
                </tr>
              ) : (
                renewals.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-primary-600 group-hover:bg-primary-50 transition-colors">
                           <User size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800 tracking-tight">{item.memberName}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em]">{item.membershipId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-slate-600 text-[11px] font-bold flex items-center gap-2">
                        <CreditCard size={12} className="text-slate-300" /> {item.upiTransactionId || 'N/A'}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">{item.paymentDate}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${item.status === 'approved' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {item.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(item)}
                            disabled={processingId === item.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-600/10 disabled:opacity-50"
                            title="Approve"
                          >
                            {processingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button 
                            className="bg-white hover:bg-rose-50 text-slate-300 hover:text-rose-600 border border-slate-200 hover:border-rose-200 p-2 rounded-lg transition-all active:scale-95"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Immutable Record</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RenewalsSection;
