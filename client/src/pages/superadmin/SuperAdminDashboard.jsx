import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabase';
import {
  TrendingUp, Shield, Users, Layout, Calendar, FileText, Settings, Loader2, LogOut, ChevronRight,
  Image as ImageIcon, Banknote, QrCode as QrIcon, BarChart3, ShieldCheck, MessageSquare, RefreshCw,
  Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import usePreventBack from '../../hooks/usePreventBack';

// Section Components
import OverviewSection from './sections/OverviewSection';
import AdminsSection from './sections/AdminsSection';
import MembersSection from './sections/MembersSection';
import GallerySection from './sections/GallerySection';
import CMSSection from './sections/CMSSection';
import EventsManagementSection from './sections/EventsManagementSection';
import CashVerificationSection from './sections/CashVerificationSection';
import EventCheckinSection from './sections/EventCheckinSection';
import EventAnalyticsSection from './sections/EventAnalyticsSection';
import EventActivityDashboardSection from './sections/EventActivityDashboardSection';
import WhatsAppAutomationSection from './sections/WhatsAppAutomationSection';
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
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Floating Flyout Dropdown State on Hover
  const [hoveredGroupId, setHoveredGroupId] = useState(null);
  const dropdownTimeoutRef = useRef(null);

  // Live Server Clock
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseEnterGroup = (groupId) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setHoveredGroupId(groupId);
  };

  const handleMouseLeaveGroup = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setHoveredGroupId(null);
    }, 150);
  };

  const { logout, currentUser } = useAuth();
  usePreventBack(Boolean(currentUser));

  useEffect(() => {
    fetchData();
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const normalizeRegistration = (reg) => ({
    ...reg,
    fullName:
      reg.fullName ||
      reg.full_name ||
      [reg.firstName || reg.first_name, reg.fatherName || reg.father_name, reg.surname || reg.last_name]
        .filter(Boolean)
        .join(' '),
    firstName: reg.firstName || reg.first_name,
    fatherName: reg.fatherName || reg.father_name,
    motherName: reg.motherName || reg.mother_name,
    surname: reg.surname || reg.last_name,
    phone: reg.phone || reg.mobile || reg.phone_number,
    officePhone: reg.officePhone || reg.office_phone,
    dob: reg.dob || reg.date_of_birth,
    registrationNo: reg.registrationNo || reg.registration_no,
    organization: reg.organization || reg.lab_name,
    address: reg.address || reg.lab_address,
    pincode: reg.pincode || reg.pin_code,
    profilePhoto: reg.profilePhoto || reg.profile_photo || reg.photo_url,
    degreeCertificate: reg.degreeCertificate || reg.degree_certificate,
    aadharCard: reg.aadharCard || reg.aadhar_card,
    panCard: reg.panCard || reg.pan_card,
    registrationCertificate: reg.registrationCertificate || reg.registration_certificate,
    bioWasteCertificate: reg.bioWasteCertificate || reg.bio_waste_certificate,
    awardCertificate: reg.awardCertificate || reg.award_certificate,
    shopActDocument: reg.shopActDocument || reg.shop_act_document,
    visitingCard: reg.visitingCard || reg.visiting_card,
    approvedAt: reg.approvedAt || reg.approved_at,
    createdAt: reg.createdAt || reg.created_at,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: membersData, error: membersErr },
        { data: adminsData, error: adminsErr },
        { data: eventsData, error: eventsErr },
        { data: renewalsData, error: renewalsErr }
      ] = await Promise.all([
        supabase.from('registrations').select('*'),
        supabase.from('users').select('*').eq('role', 'admin'),
        supabase.from('events').select('*'),
        supabase.from('renewals').select('*').eq('status', 'pending')
      ]);

      if (membersErr) console.error("Supabase registrations fetch error:", membersErr);
      if (adminsErr) console.error("Supabase admins fetch error:", adminsErr);
      if (eventsErr) console.error("Supabase events fetch error:", eventsErr);
      if (renewalsErr) console.error("Supabase renewals fetch error:", renewalsErr);

      const allMembers = (membersData || []).map(normalizeRegistration);
      const pending = allMembers.filter(m => {
        const s = (m.status || 'pending').toLowerCase();
        return s === 'pending' || s === 'verified';
      });
      const approved = allMembers.filter(m => (m.status || '').toLowerCase() === 'approved');

      // Fetch featured event IDs from content table for resilient Hero Slide synchronization
      let featuredEventIds = [];
      try {
        const { data: contentData } = await supabase.from('content').select('banner_url').eq('id', 'main').single();
        if (contentData?.banner_url) {
          const parsed = JSON.parse(contentData.banner_url);
          if (Array.isArray(parsed)) featuredEventIds = parsed;
        }
      } catch (_) {}

      const normalizedAdmins = (adminsData || []).map(a => ({
        ...a,
        adminId: a.adminId || a.admin_id,
      }));
      const normalizedEvents = (eventsData || []).map(ev => ({
        ...ev,
        adminEmail: ev.adminEmail || ev.admin_email || '',
        imageUrl: ev.imageUrl || ev.image_url || '',
        eventDate: ev.eventDate || ev.event_date || (typeof ev.date === 'string' && ev.date.includes(' to ') ? ev.date.split(' to ')[0].trim() : ev.date) || '',
        eventEndDate: ev.eventEndDate || ev.event_end_date || (typeof ev.date === 'string' && ev.date.includes(' to ') ? ev.date.split(' to ')[1].trim() : '') || '',
        isMultiDay: Boolean((ev.event_end_date && ev.event_end_date !== ev.event_date) || (typeof ev.date === 'string' && ev.date.includes(' to '))),
        startTime: ev.startTime || ev.start_time || '',
        endTime: ev.endTime || ev.end_time || '',
        totalCapacity: Number(ev.totalCapacity ?? ev.total_capacity ?? 100),
        bookedCount: Number(ev.bookedCount ?? ev.booked_count ?? 0),
        registrationType: ev.registrationType || ev.registration_type || 'both',
        memberFee: Number(ev.memberFee ?? ev.member_fee ?? 0),
        nonMemberFee: Number(ev.nonMemberFee ?? ev.non_member_fee ?? 0),
        isFree: Boolean(ev.isFree ?? ev.is_free),
        allowCashPayment: (ev.allowCashPayment ?? ev.allow_cash_payment) !== false,
        allowOnlinePayment: (ev.allowOnlinePayment ?? ev.allow_online_payment) !== false,
        maxTicketsPerPerson: Number(ev.maxTicketsPerPerson ?? ev.max_tickets_per_person ?? 1),
        isFeatured: Boolean(ev.is_featured || ev.isFeatured || (Array.isArray(featuredEventIds) && featuredEventIds.includes(ev.id))),
      }));
      const pendingRenewals = renewalsData || [];

      setStats({
        totalMembers: allMembers.length,
        approvedMembers: approved.length,
        pendingApprovals: pending.length,
        upcomingEvents: normalizedEvents.length,
        activeAdmins: normalizedAdmins.length,
        renewalsDue: pendingRenewals.length
      });

      setMembers(allMembers);
      setPendingMembers(pending);
      setAdmins(normalizedAdmins);
      setEvents(normalizedEvents);
    } catch (e) {
      console.error("Supabase fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Structured Main Menus and Sub-Menus
  const menuGroups = [
    {
      id: 'admin',
      title: 'Administration',
      marathiTitle: 'प्रशासन',
      icon: <Shield size={20} strokeWidth={2.2} />,
      items: [
        { id: 'overview', name: 'System Overview', icon: <TrendingUp size={16} /> },
        { id: 'admins', name: 'Manage Admins', icon: <Shield size={16} />, badge: stats.activeAdmins || null },
        { id: 'members', name: 'Member Database', icon: <Users size={16} />, badge: stats.totalMembers || null },
      ],
    },
    {
      id: 'events',
      title: 'Smart Events & Venues',
      marathiTitle: 'इव्हेंट्स व वेन्यू ऑपरेशन्स',
      icon: <Calendar size={20} strokeWidth={2.2} />,
      items: [
        { id: 'events', name: 'Event Management', icon: <Calendar size={16} />, badge: stats.upcomingEvents || null },
        { id: 'event-checkin', name: 'QR Check-in & Kits', icon: <QrIcon size={16} /> },
        { id: 'cash-verify', name: 'Cash Verification', icon: <Banknote size={16} /> },
        { id: 'activity-dashboard', name: 'Live Event Dashboard', icon: <BarChart3 size={16} /> },
        { id: 'whatsapp-automation', name: 'WhatsApp Automation', icon: <MessageSquare size={16} /> },
        { id: 'event-analytics', name: 'Event Analytics', icon: <BarChart3 size={16} /> },
      ],
    },
    {
      id: 'association',
      title: 'Approvals & Finance',
      marathiTitle: 'मान्यता व हिशोब',
      icon: <FileText size={20} strokeWidth={2.2} />,
      items: [
        { id: 'event-approvals', name: 'Event Approvals', icon: <ShieldCheck size={16} /> },
        { id: 'renewals', name: 'Renewals Center', icon: <FileText size={16} />, badge: stats.renewalsDue || null },
        { id: 'accounting', name: 'Accounting (Tally)', icon: <TrendingUp size={16} /> },
      ],
    },
    {
      id: 'media',
      title: 'Media & Portal',
      marathiTitle: 'वेबसाईट व मिडिया',
      icon: <Layout size={20} strokeWidth={2.2} />,
      items: [
        { id: 'content', name: 'Website Editor', icon: <Layout size={16} /> },
        { id: 'gallery', name: 'Media Gallery', icon: <ImageIcon size={16} /> },
      ],
    },
  ];

  const allTabs = menuGroups.flatMap((g) => g.items);
  const activeTabObj = allTabs.find((t) => t.id === activeTab) || allTabs[0];
  const activeGroup = menuGroups.find((g) => g.items.some((i) => i.id === activeTab)) || menuGroups[0];

  if (loading) return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Real-time Data</p>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex font-sans select-none">
      {/* 1. Permanent Slim Sidebar (Desktop only: lg:flex, hidden on mobile) */}
      <aside className="hidden lg:flex h-screen w-20 shrink-0 bg-slate-900 border-r border-slate-800 text-slate-400 flex-col items-center justify-between py-4 z-40 relative">
        {/* Top: Logo + Category Navigation Icons */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* ACLAP Logo with Tooltip */}
          <div className="relative group/logo flex flex-col items-center">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="w-12 h-12 bg-primary-600 hover:bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30 transition-transform active:scale-95"
            >
              <Shield size={24} strokeWidth={2.5} />
            </button>

            {/* Logo Hover Popup Tooltip */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl whitespace-nowrap shadow-2xl pointer-events-none opacity-0 group-hover/logo:opacity-100 transition-opacity z-50">
              <h4 className="text-xs font-black uppercase tracking-wider">ACLAP Maharashtra</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
          </div>

          <div className="w-8 h-[1px] bg-slate-800" />

          {/* 4 Category Icons with Floating Dropdown List on Hover */}
          <nav className="flex flex-col items-center gap-3 w-full">
            {menuGroups.map((group) => {
              const hasActiveItem = group.items.some((i) => i.id === activeTab);
              const isHovered = hoveredGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnterGroup(group.id)}
                  onMouseLeave={handleMouseLeaveGroup}
                >
                  {/* Slim Category Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const targetItem = group.items.find((i) => i.id === activeTab) || group.items[0];
                      setActiveTab(targetItem.id);
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${
                      hasActiveItem
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/40 ring-2 ring-primary-400/50 scale-105'
                        : isHovered
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {group.icon}

                    {/* Active Indicator Pip */}
                    {hasActiveItem && (
                      <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-primary-400 rounded-l-full shadow-sm" />
                    )}
                  </button>

                  {/* Floating Flyout Dropdown Menu (Opens next to the icon on hover) */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        onMouseEnter={() => handleMouseEnterGroup(group.id)}
                        onMouseLeave={handleMouseLeaveGroup}
                        className="absolute left-full top-0 ml-3 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 space-y-2 pointer-events-auto before:absolute before:-left-3 before:top-0 before:w-3 before:h-full before:content-['']"
                      >
                        {/* Flyout Header */}
                        <div className="px-2 pt-1 pb-2 border-b border-slate-800 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                              <span className="text-primary-400">{group.icon}</span>
                              <span>{group.title}</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                              {group.marathiTitle}
                            </p>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                            {group.items.length}
                          </span>
                        </div>

                        {/* Dropdown Items List */}
                        <div className="space-y-1 pt-1">
                          {group.items.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab(tab.id);
                                  setHoveredGroupId(null);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left group/item ${
                                  isActive
                                    ? 'bg-primary-600 text-white font-black shadow-md shadow-primary-600/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover/item:text-primary-400'}>
                                    {tab.icon}
                                  </span>
                                  <span className="truncate">{tab.name}</span>
                                </div>

                                {tab.badge !== undefined && tab.badge !== null && tab.badge > 0 && (
                                  <span
                                    className={`text-[10px] px-2 py-0.2 rounded-full font-black ml-2 ${
                                      isActive ? 'bg-white text-primary-700' : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {tab.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Exit / Logout with Tooltip */}
        <div className="relative group/exit flex flex-col items-center">
          <button
            type="button"
            onClick={logout}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all active:scale-95"
          >
            <LogOut size={20} />
          </button>

          {/* Logout Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-xl whitespace-nowrap shadow-2xl pointer-events-none opacity-0 group-hover/exit:opacity-100 transition-opacity z-50">
            <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Exit Portal</p>
            <p className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]">{currentUser?.email}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer (< lg) */}
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
              className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-900 text-slate-300 z-50 flex flex-col shadow-2xl border-r border-slate-800 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/30">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">ACLAP Maharashtra</h3>
                    <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest mt-0.5">Super Admin Terminal</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                {menuGroups.map((group) => (
                  <div key={group.id} className="space-y-1.5">
                    <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <span>{group.title}</span>
                      <span className="text-[9px] text-slate-600">{group.marathiTitle}</span>
                    </div>
                    <div className="space-y-1">
                      {group.items.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(tab.id);
                              setIsMobileDrawerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                              isActive
                                ? 'bg-primary-600 text-white font-black shadow-lg shadow-primary-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <span className={isActive ? 'text-white' : 'text-slate-400'}>
                                {tab.icon}
                              </span>
                              <span className="truncate">{tab.name}</span>
                            </div>
                            {tab.badge !== undefined && tab.badge !== null && tab.badge > 0 && (
                              <span
                                className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
                                  isActive ? 'bg-white text-primary-700' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {tab.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="truncate max-w-[170px]">
                  <p className="text-xs font-black text-white truncate">{currentUser?.email || 'admin@aclap.org'}</p>
                  <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest">Master Root</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase"
                >
                  <LogOut size={14} /> Exit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Main Content Area */}
      <main className="h-screen flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Stationary Top Header (Fixed at the top, does NOT move when content scrolls) */}
        <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between z-20 shadow-sm">
          {/* Left: Mobile Hamburger + Active Tab & System Breadcrumb */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Hamburger for mobile (< lg) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0 ring-4 ring-emerald-500/20" />
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider sm:tracking-widest truncate">
                    {activeTabObj?.name}
                  </h2>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                    {activeGroup?.title || 'System'}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Quick Live Telemetry Counters */}
            <div className="hidden lg:flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black">
                <Users size={12} className="text-primary-600" />
                <span>{stats.totalMembers || 0} Members</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black">
                <Calendar size={12} className="text-blue-600" />
                <span>{stats.upcomingEvents || 1} Events</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black">
                <Banknote size={12} className="text-amber-600" />
                <span>Two-Tier Cash Flow</span>
              </span>
            </div>
          </div>

          {/* Right: Clock & User Profile Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] font-mono font-black text-slate-800">
                {currentTimeStr || 'Live Telemetry'}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                System Synchronized
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <button
              type="button"
              onClick={fetchData}
              className="p-2 text-slate-500 hover:text-primary-600 transition-colors bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl"
              title="Refresh Global State"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-primary-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-primary-600/30">
                SA
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-[11px] font-black text-slate-900 leading-none truncate max-w-[130px]">
                  {currentUser?.email || 'admin@aclap.org'}
                </p>
                <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-0.5">
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Middle Content Section */}
        <div className="flex-1 overflow-y-auto bg-slate-100/70 p-3.5 sm:p-6 md:p-8 pb-24 lg:pb-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="max-w-7xl mx-auto min-h-full pb-8"
            >
              {activeTab === 'overview' && <OverviewSection stats={stats} setActiveTab={setActiveTab} />}
              {activeTab === 'admins' && <AdminsSection admins={admins} refresh={fetchData} />}
              {activeTab === 'members' && <MembersSection members={members} pending={pendingMembers} refresh={fetchData} />}
              {activeTab === 'events' && <EventsManagementSection events={events} refresh={fetchData} admins={admins} />}
              {activeTab === 'cash-verify' && <CashVerificationSection refreshParent={fetchData} />}
              {activeTab === 'event-checkin' && <EventCheckinSection />}
              {activeTab === 'activity-dashboard' && <EventActivityDashboardSection />}
              {activeTab === 'whatsapp-automation' && <WhatsAppAutomationSection />}
              {activeTab === 'event-analytics' && <EventAnalyticsSection />}
              {activeTab === 'gallery' && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <GallerySection />
                </div>
              )}
              {activeTab === 'content' && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <CMSSection />
                </div>
              )}
              {activeTab === 'event-approvals' && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <SuperAdminEventApprovals />
                </div>
              )}
              {activeTab === 'renewals' && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <RenewalsSection />
                </div>
              )}
              {activeTab === 'accounting' && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <AccountingSection />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Quick Navigation Bar (Sticky for fast 1-tap switching on mobile) */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 flex items-center justify-around z-30 shadow-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
              activeTab === 'overview' ? 'text-primary-600 font-black' : 'text-slate-500'
            }`}
          >
            <TrendingUp size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all relative ${
              activeTab === 'members' ? 'text-primary-600 font-black' : 'text-slate-500'
            }`}
          >
            <Users size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Members</span>
            {stats.totalMembers > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-primary-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all relative ${
              activeTab === 'events' ? 'text-primary-600 font-black' : 'text-slate-500'
            }`}
          >
            <Calendar size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Events</span>
            {stats.upcomingEvents > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('event-checkin')}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
              activeTab === 'event-checkin' ? 'text-primary-600 font-black' : 'text-slate-500'
            }`}
          >
            <QrIcon size={18} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Scanner</span>
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

export default SuperAdminDashboard;
