import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Search, Mail, Phone, MapPin, MoreVertical, Users, UserCheck, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'registrations'), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        setMembers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-primary-600" size={24} /> 
            Member Directory
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Registry of all authorized clinical practitioners</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative w-full lg:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input 
               type="text" 
               placeholder="Search by name or email..." 
               className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-primary-500 outline-none transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm">
              <Download size={16} />
           </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
           <div className="w-8 h-8 border-2 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <motion.div 
              layout
              key={member.id} 
              className="group bg-white border border-slate-100 rounded-3xl p-6 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 transition-all"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 font-black text-lg group-hover:bg-primary-50 transition-colors">
                  {member.fullName?.charAt(0)}
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">
                   <UserCheck size={10} strokeWidth={3} />
                   <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>
                </div>
              </div>
              
              <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">{member.fullName}</h3>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-6">{member.organization || 'Individual Member'}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                     <Mail size={12} />
                  </div>
                  <span className="text-[11px] font-bold truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                     <Phone size={12} />
                  </div>
                  <span className="text-[11px] font-bold">{member.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                     <MapPin size={12} />
                  </div>
                  <span className="text-[11px] font-bold">{member.city || 'N/A'}, {member.state || 'N/A'}</span>
                </div>
              </div>
              
              <div className="pt-5 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Master Registry Node</span>
                <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors">Full Report</button>
              </div>
            </motion.div>
          ))}
          
          {filteredMembers.length === 0 && (
             <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No members found matching search criteria</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
