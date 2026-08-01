import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Users, ShieldCheck, Calendar, CreditCard, LayoutDashboard, 
  Bell, Search, LogOut, Settings, TrendingUp, Filter, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Sections
import PendingRegistrations from './sections/PendingRegistrations';
import RenewalsView from './sections/RenewalsView';
import MemberManagement from './sections/MemberManagement';
import EventApprovals from './sections/EventApprovals';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    members: 0,
    renewals: 12,
    events: 8
  });

  const { logout, currentUser, userData } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'registrations'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrations(data);

      const membersSnap = await getDocs(query(collection(db, 'registrations'), where('status', '==', 'approved')));
      
      // Get event registration stats assigned to this admin
      const eventQ = query(
        collection(db, 'event_registrations'), 
        where('eventAdminEmail', '==', currentUser?.email || 'None'), 
        where('status', '==', 'pending')
      );
      const eventSnap = await getDocs(eventQ);

      setStats({
        pending: data.length,
        members: membersSnap.size,
        renewals: 12, // Mock for now
        events: eventSnap.size
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'pending', name: 'Approvals', icon: <ShieldCheck size={18} />, count: stats.pending },
    { id: 'members', name: 'Directory', icon: <Users size={18} />, count: stats.members },
    { id: 'renewals', name: 'Renewals', icon: <CreditCard size={18} />, count: stats.renewals },
    { id: 'events', name: 'Event Regs', icon: <Calendar size={18} />, count: stats.events },
  ];

  if (loading) return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Loading Interface</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      
      {/* 1. Sidebar - Software Aesthetic */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col relative z-20 border-r border-slate-800 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
              <LayoutDashboard size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-none uppercase">Admin Node</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">{userData?.adminId ? `ID: ${userData.adminId}` : 'Terminal 01'}</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 mb-2">Management</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[12px] font-bold transition-all duration-300 group ${activeTab === item.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-all duration-300 ${activeTab === item.id ? 'scale-110' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800/50 bg-slate-900/50">
          <div className="p-3 bg-slate-800/40 rounded-xl mb-4 border border-slate-800/50 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-500 font-black text-xs">
                {currentUser?.email?.[0].toUpperCase()}
             </div>
             <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-300 truncate tracking-tight">{currentUser?.email}</p>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Active Admin</p>
             </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all border border-rose-500/10 hover:border-rose-500/30"
          >
            <LogOut size={14} /> Exit System
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Header - Glassmorphism style */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                {menuItems.find(t => t.id === activeTab)?.name} Control
              </h2>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input 
                 type="text" 
                 placeholder="Search registry..." 
                 className="bg-slate-100 border-none rounded-lg py-2 pl-9 pr-4 text-[11px] font-bold text-slate-600 focus:ring-2 focus:ring-primary-600/20 w-64 outline-none transition-all"
               />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-all">
              <RefreshCw size={16} />
            </button>
            <div className="w-8 h-8 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 cursor-pointer transition-all">
              <Bell size={16} />
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
              A1
            </div>
          </div>
        </header>

        {/* Dynamic Workspace */}
        <div className="flex-grow overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: 'Pending Approvals', val: stats.pending, color: 'text-primary-600', icon: <ShieldCheck size={16} /> },
                 { label: 'Active Members', val: stats.members, color: 'text-emerald-600', icon: <Users size={16} /> },
                 { label: 'Renewals Due', val: stats.renewals, color: 'text-amber-600', icon: <CreditCard size={16} /> },
                 { label: 'Recent Events', val: stats.events, color: 'text-indigo-600', icon: <Calendar size={16} /> },
               ].map((s, idx) => (
                 <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                       <div className={`p-2 rounded-lg bg-slate-50 ${s.color} group-hover:scale-110 transition-transform`}>
                          {s.icon}
                       </div>
                       <TrendingUp className="text-slate-200" size={14} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color} mt-1 tracking-tight`}>{s.val}</p>
                 </div>
               ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden min-h-[600px]">
               <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-8"
                >
                  {activeTab === 'pending' && <PendingRegistrations registrations={registrations} refresh={fetchData} />}
                  {activeTab === 'renewals' && <RenewalsView />}
                  {activeTab === 'members' && <MemberManagement />}
                  {activeTab === 'events' && <EventApprovals />}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
