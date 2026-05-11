import React from 'react';
import { db } from '../../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { FileText, Check, X, Users, Printer, Eye, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MembershipFormPDF from '../../../components/MembershipFormPDF';

const MembersSection = ({ pending, refresh }) => {
  const [viewingReg, setViewingReg] = React.useState(null);
  const printRef = React.useRef();

  const handleAction = async (id, status) => {
    await updateDoc(doc(db, 'registrations', id), { status });
    refresh();
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;
    
    // Create a temporary style for printing
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        .print-container, .print-container * { visibility: visible; }
        .print-container { position: absolute; left: 0; top: 0; width: 100%; }
        @page { size: A4; margin: 0; }
      }
    `;
    document.head.appendChild(style);

    window.print();
    
    // Cleanup
    document.head.removeChild(style);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-primary-600" size={24} /> 
            Member Verification
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Review and approve new practitioner registrations</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{pending.length} Awaiting Review</span>
        </div>
      </div>

      <div className="grid gap-6">
        {pending.map(reg => (
          <div key={reg.id} className="group bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:border-primary-200 hover:shadow-sm">
            <div className="flex items-center gap-4 cursor-pointer flex-grow" onClick={() => setViewingReg(reg)}>
              <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                 {reg.profilePhoto ? (
                   <img src={reg.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <Users className="text-slate-200" size={24} />
                 )}
              </div>
              <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h4 className="text-base font-black text-slate-800 tracking-tight">{reg.fullName}</h4>
                {reg.status === 'verified' && (
                  <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 uppercase font-black tracking-widest">Pre-Verified</span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText size={12} className="text-slate-400" /> {reg.qualification}
                </div>
                <div className="h-3 w-px bg-slate-200 hidden sm:block" />
                <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="text-slate-400">Org:</span> {reg.organization}
                </div>
              </div>
              
              <div className="text-slate-400 text-[10px] font-bold flex items-center gap-4 mt-1">
                <span>{reg.email}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span>{reg.phone}</span>
              </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setViewingReg(reg)}
                className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                title="View Full Form"
              >
                <Eye size={18} />
              </button>
              <div className="h-6 w-px bg-slate-100 mx-1 hidden md:block" />
              <button 
                onClick={() => handleAction(reg.id, 'approved')} 
                className="flex-grow md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
              >
                <Check size={14} /> Approve
              </button>
              <button 
                onClick={() => handleAction(reg.id, 'rejected')} 
                className="flex-grow md:flex-none bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <X size={14} /> Reject
              </button>
            </div>
          </div>
        ))}

        {pending.length === 0 && (
          <div className="py-24 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
             <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Check size={20} />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">Queue empty. All registrations processed.</p>
          </div>
        )}
      </div>

      {/* Full Form Modal Overlay */}
      <AnimatePresence>
        {viewingReg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
               {/* Modal Header */}
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <FileText size={20} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Membership Document Preview</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Physical Compliance Format (A4)</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={handlePrint}
                       className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                     >
                        <Printer size={14} /> Download / Print
                     </button>
                     <button 
                       onClick={() => setViewingReg(null)}
                       className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                     >
                        <X size={20} />
                     </button>
                  </div>
               </div>

               {/* Modal Content - Scrollable Form */}
               <div className="flex-grow overflow-y-auto p-12 bg-slate-200/50 custom-scrollbar flex justify-center">
                  <div className="print-container">
                    <MembershipFormPDF ref={printRef} data={viewingReg} />
                  </div>
               </div>

               {/* Modal Footer */}
               <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Registry Data Match</span>
                  </div>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => { handleAction(viewingReg.id, 'rejected'); setViewingReg(null); }}
                       className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                     >
                       Reject Application
                     </button>
                     <button 
                       onClick={() => { handleAction(viewingReg.id, 'approved'); setViewingReg(null); }}
                       className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/10"
                     >
                       Approve & Grant ID
                     </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MembersSection;
