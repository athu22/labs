import React, { useState, useEffect, useContext, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import {
   User, Shield, CreditCard, Clock, CheckCircle2,
   AlertCircle, ChevronRight, FileText, Download, UserPlus, Calendar, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import MembershipFormPDF from "../components/MembershipFormPDF"; // Import the PDF component

// Translations for Member Portal
const translations = {
   en: {
      // Loading
      loadingPortal: 'Loading Member Portal',

      // Header
      memberEcosystem: 'Member Ecosystem',
      practitionerPortal: 'Practitioner',
      portal: 'Portal',
      welcomeBack: 'Welcome back,',
      accessNode: 'Access your professional node.',

      // Registry Status
      registryStatus: 'Registry Status',
      registered: 'Registered',
      notRegistered: 'Not Registered',
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending',

      // Empty State
      completeProfile: 'Complete Your Profile',
      emptyStateDesc: 'Your practitioner node is currently empty. To join the official registry and access member benefits, please fill out the membership application form.',
      fillApplication: 'Fill Application Form',

      // Application Summary
      applicationSummary: 'Application Summary',
      registrationNo: 'Registration No',
      organization: 'Organization',
      qualification: 'Qualification',
      experience: 'Experience',
      emailNode: 'Email Node',
      phoneLine: 'Phone Line',
      years: 'Years',
      activeMembership: 'Active Membership',
      validUntil: 'Valid until Dec 2026',
      downloadIdCard: 'Download ID Card',
      printing: 'Printing...',

      // Renewal Banner
      annualRenewal: 'Annual Renewal 2026',
      renewalDesc: 'Keep your professional credentials active and up-to-date.',
      secureRenewal: 'Secure Renewal',

      // Sidebar
      systemAccess: 'System Access',
      upcomingEvents: 'Upcoming Events',
      feeSettlement: 'Fee Settlement',
      identitySettings: 'Identity Settings',

      // Notice Board
      noticeBoard: 'Notice Board',
      noticeDesc: 'Important updates regarding clinical lab regulations in Maharashtra will appear here.',
      noUrgentUpdates: 'No urgent updates at this time.',

      // Statuses
      approvedStatus: 'approved',
      rejectedStatus: 'rejected',
      pendingStatus: 'pending',

      // Print
      printIdCard: 'Print ID Card / Certificate',
   },
   mr: {
      // Loading
      loadingPortal: 'सदस्य पोर्टल लोड करत आहे',

      // Header
      memberEcosystem: 'सदस्य परिसंस्था',
      practitionerPortal: 'व्यावसायिक',
      portal: 'पोर्टल',
      welcomeBack: 'पुन्हा स्वागत आहे,',
      accessNode: 'तुमचा व्यावसायिक नोड प्रवेश करा.',

      // Registry Status
      registryStatus: 'नोंदणी स्थिती',
      registered: 'नोंदणीकृत',
      notRegistered: 'नोंदणीकृत नाही',
      approved: 'मंजूर',
      rejected: 'नाकारलेले',
      pending: 'प्रलंबित',

      // Empty State
      completeProfile: 'तुमची प्रोफाइल पूर्ण करा',
      emptyStateDesc: 'तुमचा व्यावसायिक नोड सध्या रिक्त आहे. अधिकृत नोंदणीमध्ये सामील होण्यासाठी आणि सदस्य लाभ मिळवण्यासाठी, कृपया सदस्यत्व अर्ज फॉर्म भरा.',
      fillApplication: 'अर्ज फॉर्म भरा',

      // Application Summary
      applicationSummary: 'अर्ज सारांश',
      registrationNo: 'नोंदणी क्रमांक',
      organization: 'संस्था',
      qualification: 'पात्रता',
      experience: 'अनुभव',
      emailNode: 'ईमेल नोड',
      phoneLine: 'फोन लाइन',
      years: 'वर्षे',
      activeMembership: 'सक्रिय सदस्यत्व',
      validUntil: 'डिसेंबर २०२६ पर्यंत वैध',
      downloadIdCard: 'आयडी कार्ड डाउनलोड करा',
      printing: 'प्रिंट होत आहे...',

      // Renewal Banner
      annualRenewal: 'वार्षिक नूतनीकरण २०२६',
      renewalDesc: 'तुमची व्यावसायिक प्रमाणपत्रे सक्रिय आणि अद्ययावत ठेवा.',
      secureRenewal: 'सुरक्षित नूतनीकरण',

      // Sidebar
      systemAccess: 'प्रणाली प्रवेश',
      upcomingEvents: 'आगामी कार्यक्रम',
      feeSettlement: 'शुल्क निपटारा',
      identitySettings: 'ओळख सेटिंग्ज',

      // Notice Board
      noticeBoard: 'सूचना फलक',
      noticeDesc: 'महाराष्ट्रातील नैदानिक प्रयोगशाळा नियमांबाबत महत्त्वाच्या अद्यतने येथे दिसतील.',
      noUrgentUpdates: 'सध्या कोणत्याही तातडीच्या अद्यतना नाहीत.',

      // Statuses
      approvedStatus: 'मंजूर',
      rejectedStatus: 'नाकारलेले',
      pendingStatus: 'प्रलंबित',

      // Print
      printIdCard: 'आयडी कार्ड / प्रमाणपत्र प्रिंट करा',
   }
};

const MemberPortal = () => {
   const { currentUser, userData } = useAuth();
   const { language } = useContext(LanguageContext);
   const t = translations[language];
   const [registration, setRegistration] = useState(null);
   const [loading, setLoading] = useState(true);
   const [isPrinting, setIsPrinting] = useState(false);
   const printRef = useRef();
   const navigate = useNavigate();

   useEffect(() => {
      const fetchMemberData = async () => {
         if (!currentUser) return;
         try {
            const q = query(
               collection(db, 'registrations'),
               where('uid', '==', currentUser.uid),
               limit(1)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
               setRegistration({ id: snap.docs[0].id, ...snap.docs[0].data() });
            }
         } catch (err) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      };
      fetchMemberData();
   }, [currentUser]);

   // Handle print/PDF download
   const handlePrintCertificate = () => {
      if (!registration) return;

      setIsPrinting(true);

      // Use window.print() to print the entire page with certificate
      // Or we can use a more sophisticated approach with html2canvas + jsPDF

      // Method 1: Simple window.print()
      setTimeout(() => {
         window.print();
         setIsPrinting(false);
      }, 500);

      // Method 2: For better PDF generation, we can use html2canvas + jsPDF
      // but that requires additional libraries
   };

   // Get status display text
   const getStatusDisplay = (status) => {
      if (language === 'mr') {
         switch (status) {
            case 'approved': return t.approvedStatus;
            case 'rejected': return t.rejectedStatus;
            case 'pending': return t.pendingStatus;
            default: return status;
         }
      }
      return status;
   };

   // Get status color classes
   const getStatusClasses = (status) => {
      switch (status) {
         case 'approved':
            return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
         case 'rejected':
            return 'bg-rose-50 text-rose-600 border border-rose-100';
         case 'pending':
            return 'bg-amber-50 text-amber-600 border border-amber-100';
         default:
            return 'bg-slate-50 text-slate-600 border border-slate-100';
      }
   };

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.loadingPortal}</p>
         </div>
      </div>
   );

   // Prepare data for certificate
   const certificateData = {
      fullName: userData?.fullName || registration?.fullName || '',
      district: registration?.district || userData?.district || '',
      registrationNo: registration?.registrationNo || '',
      qualification: registration?.qualification || '',
      organization: registration?.organization || '',
      address: registration?.address || '',
      phone: registration?.phone || '',
      email: registration?.email || '',
      dob: registration?.dob || '',
      pincode: registration?.pincode || '',
      officePhone: registration?.officePhone || '',
      profilePhoto: registration?.profilePhoto || '',
      degreeCertificate: registration?.degreeCertificate || '',
   };

   return (
      <>
         {/* Hidden Print Area - Contains the full certificate */}
         <div className="hidden print:block">
            <MembershipFormPDF ref={printRef} data={certificateData} />
         </div>

         <div className="min-h-screen bg-[#fdfcf5] pt-32 pb-24 relative overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/5 blur-[120px] rounded-full -mr-96 -mt-96" />

            <div className="max-w-7xl mx-auto px-2 relative z-10">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                  <div className="space-y-4">
                     <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">{t.memberEcosystem}</span>
                     <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        {t.practitionerPortal} <span className="text-primary-600">{t.portal}</span>
                     </h1>
                     <p className="text-slate-500 font-medium">{t.welcomeBack} {userData?.fullName}. {t.accessNode}</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="bg-white border border-slate-100 p-4 rounded-3xl flex items-center gap-4 shadow-xl shadow-slate-900/5">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                           <Shield size={20} />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.registryStatus}</p>
                           <p className={`text-[11px] font-black uppercase tracking-widest ${registration ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {registration ? getStatusDisplay(registration.status) : t.notRegistered}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid lg:grid-cols-12 gap-8">

                  {/* Main Status Area */}
                  <div className="lg:col-span-8 space-y-8">

                     {!registration ? (
                        /* Empty State: Prompt to Register */
                        <motion.div
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="bg-white border-2 border-primary-100 p-12 rounded-[3rem] shadow-2xl shadow-primary-600/5 text-center"
                        >
                           <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                              <UserPlus size={40} />
                           </div>
                           <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t.completeProfile}</h2>
                           <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-md mx-auto">
                              {t.emptyStateDesc}
                           </p>
                           <Link
                              to="/register"
                              className="inline-flex items-center gap-3 px-12 py-5 bg-primary-600 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-600/30 active:scale-95"
                           >
                              {t.fillApplication} <ChevronRight size={18} />
                           </Link>
                        </motion.div>
                     ) : (
                        /* State: Show Registration Summary */
                        <div className="space-y-8">
                           <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/5">
                              <div className="flex items-center justify-between mb-10">
                                 <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <FileText className="text-primary-600" size={24} /> {t.applicationSummary}
                                 </h3>
                                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusClasses(registration.status)}`}>
                                    {getStatusDisplay(registration.status)}
                                 </span>
                              </div>

                              <div className="grid md:grid-cols-2 gap-10">
                                 <div className="space-y-6">
                                    <InfoRow label={t.registrationNo} value={registration.registrationNo} />
                                    <InfoRow label={t.organization} value={registration.organization} />
                                    <InfoRow label={t.qualification} value={registration.qualification} />
                                 </div>
                                 <div className="space-y-6">
                                    <InfoRow label={t.experience} value={`${registration.experience} ${t.years}`} />
                                    <InfoRow label={t.emailNode} value={registration.email} />
                                    <InfoRow label={t.phoneLine} value={registration.phone} />
                                 </div>
                              </div>

                              {registration.status === 'approved' && (
                                 <div className="mt-12 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                          <CheckCircle2 size={24} />
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.activeMembership}</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.validUntil}</p>
                                       </div>
                                    </div>
                                    <button
                                       onClick={handlePrintCertificate}
                                       disabled={isPrinting}
                                       className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                       {isPrinting ? (
                                          <>
                                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                             {t.printing}
                                          </>
                                       ) : (
                                          <>
                                             <Printer size={18} /> {t.downloadIdCard}
                                          </>
                                       )}
                                    </button>
                                 </div>
                              )}
                           </div>

                           {/* Renewal Banner if needed */}
                           <div className="bg-accent-maroon text-white p-10 rounded-[3rem] relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
                              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                 <div className="space-y-4">
                                    <h3 className="text-2xl font-black tracking-tight leading-none">{t.annualRenewal}</h3>
                                    <p className="text-white/60 text-sm font-medium">{t.renewalDesc}</p>
                                 </div>
                                 <button className="bg-secondary-yellow text-accent-maroon px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95">
                                    {t.secureRenewal}
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                  </div>

                  {/* Sidebar: Quick Links & Status */}
                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/5">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">{t.systemAccess}</h4>
                        <div className="space-y-4">
                           <SidebarLink icon={<Calendar />} label={t.upcomingEvents} path="/events" />
                           <SidebarLink icon={<CreditCard />} label={t.feeSettlement} path="/membership" />
                           <SidebarLink icon={<User />} label={t.identitySettings} path="#" />
                        </div>
                     </div>

                     <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white">
                        <AlertCircle size={32} className="mb-6 text-white/40" />
                        <h4 className="text-lg font-black tracking-tight mb-3">{t.noticeBoard}</h4>
                        <p className="text-white/70 text-xs leading-relaxed mb-6">{t.noticeDesc}</p>
                        <div className="h-[1px] bg-white/10 w-full mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">{t.noUrgentUpdates}</p>
                     </div>
                  </div>

               </div>

            </div>
         </div>

         {/* Print CSS - Hidden in screen, visible in print */}
         <style jsx>{`
            @media print {
               .print\\:block {
                  display: block !important;
               }
               .min-h-screen {
                  min-height: 100vh !important;
               }
               body * {
                  visibility: hidden;
               }
               .print\\:block, .print\\:block * {
                  visibility: visible !important;
               }
               .print\\:block {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
               }
               .bg-\\[\\#fdfcf5\\] {
                  background: white !important;
               }
               .shadow-2xl {
                  box-shadow: none !important;
               }
            }
         `}</style>
      </>
   );
};

const InfoRow = ({ label, value }) => (
   <div className="space-y-1.5">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{value || '---'}</p>
   </div>
);

const SidebarLink = ({ icon, label, path }) => (
   <Link to={path} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-primary-50 transition-all">
      <div className="flex items-center gap-4 text-slate-500 group-hover:text-primary-600 transition-colors">
         {React.cloneElement(icon, { size: 18 })}
         <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-600 transition-all group-hover:translate-x-1" />
   </Link>
);

export default MemberPortal;