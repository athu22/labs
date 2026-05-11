import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  TrendingUp, Shield, Users, Layout, Calendar, FileText, Settings, Loader2, LogOut, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Section Components
import OverviewSection from './sections/OverviewSection';
import AdminsSection from './sections/AdminsSection';
import MembersSection from './sections/MembersSection';
import GallerySection from './sections/GallerySection';
import CMSSection from './sections/CMSSection';
import EventsManagementSection from './sections/EventsManagementSection';
import RenewalsSection from './sections/RenewalsSection';
import AccountingSection from './sections/AccountingSection';
import SuperAdminEventApprovals from './sections/SuperAdminEventApprovals';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalMembers: 0,
    approvedMembers: 0,
    pendingApprovals: 0,
    upcomingEvents: 0,
    activeAdmins: 0,
    renewalsDue: 0
  });

  const [admins, setAdmins] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const { logout, currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Real Data from Firestore Collections
      const [membersSnap, adminsSnap, eventsSnap, renewalsSnap] = await Promise.all([
        getDocs(collection(db, 'registrations')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'admin'))),
        getDocs(collection(db, 'events')),
        getDocs(query(collection(db, 'renewals'), where('status', '==', 'pending')))
      ]);

      const allMembers = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pending = allMembers.filter(m => m.status === 'pending' || m.status === 'verified');
      const approved = allMembers.filter(m => m.status === 'approved');

      // 2. Set Stats with REAL values (No static fallbacks)
      setStats({
        totalMembers: allMembers.length,
        approvedMembers: approved.length,
        pendingApprovals: pending.length,
        upcomingEvents: eventsSnap.size,
        activeAdmins: adminsSnap.size,
        renewalsDue: renewalsSnap.size
      });

      setPendingMembers(pending);
      setAdmins(adminsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error("Firebase fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: <TrendingUp size={18} /> },
    { id: 'admins', name: 'Manage Admins', icon: <Shield size={18} /> },
    { id: 'members', name: 'Member Database', icon: <Users size={18} /> },
    { id: 'gallery', name: 'Media Gallery', icon: <ImageIcon size={18} /> },
    { id: 'content', name: 'Website Editor', icon: <Layout size={18} /> },
    { id: 'events', name: 'Event Planner', icon: <Calendar size={18} /> },
    { id: 'event-approvals', name: 'Event Approvals', icon: <FileText size={18} /> },
    { id: 'renewals', name: 'Renewals Center', icon: <FileText size={18} /> },
    { id: 'accounting', name: 'Accounting (Tally)', icon: <TrendingUp size={18} /> },
  ];

  if (loading) return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Real-time Data</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* 1. Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col relative z-20 border-r border-slate-800 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
              <Shield size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-none uppercase">ACLAP</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Control Center</p>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 group ${activeTab === tab.id
                    ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'
                  }`}
              >
                <span className={`transition-all duration-300 ${activeTab === tab.id ? 'text-primary-500 scale-110' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  {React.cloneElement(tab.icon, { size: 16, strokeWidth: 2.5 })}
                </span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800/50">
          <div className="p-3.5 bg-slate-800/30 rounded-xl mb-4 border border-slate-800/50">
            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5 opacity-50">Master Identity</p>
            <p className="text-[11px] font-semibold text-slate-300 truncate tracking-tight">{currentUser?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all border border-rose-500/10 hover:border-rose-500/30 active:scale-95"
          >
            <LogOut size={14} /> Exit Portal
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                {tabs.find(t => t.id === activeTab)?.name}
              </h2>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Node 01-A / Live</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={fetchData}
              className="p-2 text-slate-400 hover:text-primary-600 transition-colors bg-slate-50 border border-slate-100 rounded-lg"
              title="Refresh Global State"
            >
              <TrendingUp size={14} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto bg-slate-50/50 p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.005 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-7xl mx-auto min-h-full"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm premium-shadow min-h-[calc(100vh-10rem)]">
                {activeTab === 'overview' && <OverviewSection stats={stats} />}
                {activeTab === 'admins' && <AdminsSection admins={admins} refresh={fetchData} />}
                {activeTab === 'members' && <MembersSection pending={pendingMembers} refresh={fetchData} />}
                {activeTab === 'gallery' && <GallerySection />}
                {activeTab === 'content' && <CMSSection />}
                {activeTab === 'events' && <EventsManagementSection events={events} refresh={fetchData} admins={admins} />}
                {activeTab === 'event-approvals' && <SuperAdminEventApprovals />}
                {activeTab === 'renewals' && <RenewalsSection />}
                {activeTab === 'accounting' && <AccountingSection />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
