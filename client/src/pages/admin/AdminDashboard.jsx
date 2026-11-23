import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
  Users, ShieldCheck, Calendar, CreditCard, LayoutDashboard, 
  Bell, Search, LogOut, Settings, TrendingUp, Filter, RefreshCw,
  Banknote, QrCode as QrIcon, BarChart3, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import usePreventBack from '../../hooks/usePreventBack';

// Sections
import PendingRegistrations from './sections/PendingRegistrations';
import RenewalsView from './sections/RenewalsView';
import MemberManagement from './sections/MemberManagement';
import EventApprovals from './sections/EventApprovals';
import CashVerificationSection from '../superadmin/sections/CashVerificationSection';
import EventCheckinSection from '../superadmin/sections/EventCheckinSection';
import EventActivityDashboardSection from '../superadmin/sections/EventActivityDashboardSection';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    members: 0,
    renewals: 12,
    events: 8
  });

  const { logout, currentUser, userData } = useAuth();
  usePreventBack(Boolean(currentUser));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: pendingData, error: pendingErr },
        { count: approvedCount, error: approvedErr },
        { count: renewalsCount, error: renewalsErr },
        { count: eventRegsCount, error: eventRegsErr }
      ] = await Promise.all([
        supabase.from('registrations').select('*').eq('status', 'pending'),
        supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('renewals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_admin_email', currentUser?.email || 'None')
          .eq('status', 'pending')
      ]);

      if (pendingErr) console.error("Pending fetch error:", pendingErr);
      if (approvedErr) console.error("Approved count error:", approvedErr);
      if (renewalsErr) console.error("Renewals count error:", renewalsErr);
      if (eventRegsErr) console.error("Event regs count error:", eventRegsErr);

      const normalizedPending = (pendingData || []).map(reg => ({
        ...reg,
        fullName:
          reg.fullName ||
          reg.full_name ||
          [reg.firstName || reg.first_name, reg.fatherName || reg.father_name, reg.surname || reg.last_name]
            .filter(Boolean)
            .join(' '),
      }));

      setRegistrations(normalizedPending);

      setStats({
        pending: normalizedPending.length,
        members: approvedCount || 0,
        renewals: renewalsCount || 0,
        events: eventRegsCount || 0
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
    { id: 'cash-verify', name: 'Cash Verify', icon: <Banknote size={18} /> },
    { id: 'event-checkin', name: 'Check-in & Kits', icon: <QrIcon size={18} /> },
    { id: 'activity-dashboard', name: 'Live Dashboard', icon: <BarChart3 size={18} /> },
  ];

  if (loading) return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Loading Interface</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      
      {/* 1. Desktop Sidebar (hidden on mobile, lg:flex) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-400 flex-col relative z-20 border-r border-slate-800 shadow-2xl shrink-0">
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
                {currentUser?.email?.[0]?.toUpperCase() || 'A'}
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

      {/* Mobile Slide-Out Drawer (< lg) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-slate-300 z-50 flex flex-col shadow-2xl border-r border-slate-800 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Admin Terminal</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{userData?.adminId ? `ID: ${userData.adminId}` : 'District Node'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Navigation</p>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === item.id
                        ? 'bg-primary-600 text-white font-black shadow-lg shadow-primary-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={activeTab === item.id ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
                        activeTab === item.id ? 'bg-white text-primary-700' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="truncate max-w-[150px]">
                  <p className="text-[11px] font-black text-slate-200 truncate">{currentUser?.email}</p>
                  <p className="text-[8px] text-slate-500 font-black uppercase">District Admin</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center gap-1 text-[10px] font-black uppercase"
                >
                  <LogOut size={13} /> Exit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Main Workspace Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden relative">
        
        {/* Header - Glassmorphism style */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Hamburger for mobile (< lg) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
              aria-label="Open Navigation"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse shrink-0" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider sm:tracking-[0.2em] truncate">
                {menuItems.find(t => t.id === activeTab)?.name} Control
              </h2>
            </div>
            
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            
            <div className="relative hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input 
                 type="text" 
                 placeholder="Search registry..." 
                 className="bg-slate-100 border-none rounded-lg py-2 pl-9 pr-4 text-[11px] font-bold text-slate-600 focus:ring-2 focus:ring-primary-600/20 w-48 lg:w-64 outline-none transition-all"
               />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button onClick={fetchData} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-all">
              <RefreshCw size={15} />
            </button>
            <div className="w-8 h-8 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 cursor-pointer transition-all">
              <Bell size={15} />
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
              {currentUser?.email?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Dynamic Workspace */}
        <div className="flex-grow overflow-y-auto bg-slate-50 p-3.5 sm:p-6 md:p-8 pb-24 lg:pb-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
               {[
                 { label: 'Pending Approvals', val: stats.pending, color: 'text-primary-600', icon: <ShieldCheck size={16} /> },
                 { label: 'Active Members', val: stats.members, color: 'text-emerald-600', icon: <Users size={16} /> },
                 { label: 'Renewals Due', val: stats.renewals, color: 'text-amber-600', icon: <CreditCard size={16} /> },
                 { label: 'Recent Events', val: stats.events, color: 'text-indigo-600', icon: <Calendar size={16} /> },
               ].map((s, idx) => (
                 <div key={idx} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                       <div className={`p-1.5 sm:p-2 rounded-lg bg-slate-50 ${s.color} group-hover:scale-110 transition-transform`}>
                          {s.icon}
                       </div>
                       <TrendingUp className="text-slate-200 hidden sm:block" size={14} />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider sm:tracking-widest truncate">{s.label}</p>
                    <p className={`text-xl sm:text-2xl font-black ${s.color} mt-1 tracking-tight`}>{s.val}</p>
                 </div>
               ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-[2rem] shadow-sm overflow-hidden min-h-[500px]">
               <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-6 md:p-8"
                >
                  {activeTab === 'pending' && <PendingRegistrations registrations={registrations} refresh={fetchData} />}
                  {activeTab === 'renewals' && <RenewalsView />}
                  {activeTab === 'members' && <MemberManagement />}
                  {activeTab === 'events' && <EventApprovals />}
                  {activeTab === 'cash-verify' && <CashVerificationSection refreshParent={fetchData} />}
                  {activeTab === 'event-checkin' && <EventCheckinSection />}
                  {activeTab === 'activity-dashboard' && <EventActivityDashboardSection />}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Mobile Bottom Quick Navigation Bar (< lg) */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around z-30 shadow-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all relative ${
              activeTab === 'pending' ? 'text-primary-600 font-black' : 'text-slate-500'
            }`}
          >
            <ShieldCheck size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Approvals</span>
            {stats.pending > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-primary-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
              activeTab === 'members' ? 'text-primary-600 font-black' : 'text-slate-500'
            }`}
          >
            <Users size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
              activeTab === 'events' ? 'text-primary-600 font-black' : 'text-slate-500'
            }`}
          >
            <Calendar size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Events</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cash-verify')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
              activeTab === 'cash-verify' ? 'text-primary-600 font-black' : 'text-slate-500'
            }`}
          >
            <Banknote size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Cash Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-slate-500 hover:text-slate-900 transition-all"
          >
            <Menu size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Menu</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
