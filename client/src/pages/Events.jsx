import React, { useState, useEffect, useContext } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Calendar, MapPin, Clock, Users, ArrowRight, Sparkles, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LanguageContext } from '../context/LanguageContext';

// Translations for Events Page
const translations = {
   en: {
      // Header
      knowledgeEcosystem: 'Knowledge Ecosystem',
      eventsTitle: 'Clinical',
      eventsTitleHighlight: 'Workshops',
      eventsTitleEnd: '& Annual Conferences',
      eventsDesc: 'Stay ahead in clinical laboratory science with our expert-led webinars, hands-on training sessions, and networking events.',

      // Filter
      sortArchitecture: 'Sort Architecture',
      latestScheduled: 'Latest Scheduled',
      pastEvents: 'Past Events',
      searchPlaceholder: 'Search by topic or speaker...',

      // Event Cards
      nodeRegistry: 'Node Registry',
      reserveSeat: 'Reserve Seat',
      morePhotos: 'More Photos',
      clinicalWorkshop: 'Clinical Workshop',

      // Empty State
      noEvents: 'No active events scheduled for current cycle',

      // Bottom CTA
      proposeEvent: 'Propose a Scientific Event',
      proposeEventDesc: 'Are you a subject matter expert? Partner with ACLAP to host clinical webinars and workshops for our pan-India community.',
      inquirePartnership: 'Inquire Partnership',

      // Loading
      loading: 'Loading...',
   },
   mr: {
      // Header
      knowledgeEcosystem: 'ज्ञान परिसंस्था',
      eventsTitle: 'नैदानिक',
      eventsTitleHighlight: 'कार्यशाळा',
      eventsTitleEnd: 'आणि वार्षिक परिषदा',
      eventsDesc: 'आमच्या तज्ज्ञ-नेतृत्वाखालील वेबिनार, हँड्स-ऑन प्रशिक्षण सत्रे आणि नेटवर्किंग इव्हेंट्ससह नैदानिक प्रयोगशाळा विज्ञानात आघाडीवर राहा.',

      // Filter
      sortArchitecture: 'क्रमवारी रचना',
      latestScheduled: 'नवीनतम नियोजित',
      pastEvents: 'पूर्वीचे कार्यक्रम',
      searchPlaceholder: 'विषय किंवा वक्त्यानुसार शोधा...',

      // Event Cards
      nodeRegistry: 'नोड नोंदणी',
      reserveSeat: 'जागा राखून ठेवा',
      morePhotos: 'अधिक फोटो',
      clinicalWorkshop: 'नैदानिक कार्यशाळा',

      // Empty State
      noEvents: 'सध्याच्या सायकलसाठी कोणतेही सक्रिय कार्यक्रम नियोजित नाहीत',

      // Bottom CTA
      proposeEvent: 'वैज्ञानिक कार्यक्रम प्रस्तावित करा',
      proposeEventDesc: 'तुम्ही विषय तज्ज्ञ आहात का? आमच्या पॅन-इंडिया समुदायासाठी नैदानिक वेबिनार आणि कार्यशाळा आयोजित करण्यासाठी ACLAP सोबत भागीदार व्हा.',
      inquirePartnership: 'भागीदारी चौकशी',

      // Loading
      loading: 'लोड होत आहे...',
   }
};

const Events = () => {
   const { language } = useContext(LanguageContext);
   const t = translations[language];

   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchEvents = async () => {
         try {
            const q = query(collection(db, 'events'), orderBy('date', 'desc'));
            const snap = await getDocs(q);
            setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
         } catch (error) {
            console.error("Error fetching events:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchEvents();
   }, []);

   return (
      <div className="bg-white pt-40 pb-24">

         {/* 1. Header Section */}
         <section className="max-w-7xl mx-auto px-2 mb-20 text-center">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
            >
               <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em] mb-4 inline-block">{t.knowledgeEcosystem}</span>
               <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-tight">
                  {t.eventsTitle} <span className="text-primary-600">{t.eventsTitleHighlight}</span> & <br /> {t.eventsTitleEnd}
               </h1>
               <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                  {t.eventsDesc}
               </p>
            </motion.div>
         </section>

         {/* 2. Filter & Controls */}
         <section className="max-w-7xl mx-auto px-2 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-2 px-6">
                  <Filter className="text-slate-400" size={16} />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.sortArchitecture}</span>
                  <select className="bg-transparent border-none text-xs font-black text-slate-700 focus:ring-0 cursor-pointer uppercase">
                     <option>{t.latestScheduled}</option>
                     <option>{t.pastEvents}</option>
                  </select>
               </div>
               <div className="relative w-full md:w-96 mr-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                     type="text"
                     placeholder={t.searchPlaceholder}
                     className="w-full bg-white border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary-600/10 outline-none transition-all shadow-sm"
                  />
               </div>
            </div>
         </section>

         {/* 3. Events Grid */}
         <section className="max-w-7xl mx-auto px-2">
            {loading ? (
               <div className="py-24 text-center">
                  <div className="w-12 h-12 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin mx-auto" />
               </div>
            ) : (
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {events.length > 0 ? events.map((event, i) => (
                     <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-600/5 transition-all flex flex-col"
                     >
                        <div className="relative aspect-video overflow-hidden bg-slate-100 group/img">
                           {event.imageUrl || (event.imageUrls && event.imageUrls.length > 0) ? (
                              <div className="w-full h-full relative">
                                 <img
                                    src={event.imageUrl || event.imageUrls[0]}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                 />
                                 {event.imageUrls && event.imageUrls.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                       <Sparkles size={10} className="text-secondary-yellow" /> +{event.imageUrls.length - 1} {t.morePhotos}
                                    </div>
                                 )}
                              </div>
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                 <Calendar size={40} strokeWidth={1} />
                              </div>
                           )}
                           <div className="absolute top-4 left-4">
                              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-center shadow-lg border border-white/20">
                                 <p className="text-[10px] font-black text-primary-600 uppercase tracking-tighter leading-none mb-1">
                                    {new Date(event.date).toLocaleString(language === 'mr' ? 'mr-IN' : 'en-US', { month: 'short' })}
                                 </p>
                                 <p className="text-xl font-black text-slate-900 leading-none">
                                    {new Date(event.date).getDate()}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Event Body */}
                        <div className="p-8 flex-grow flex flex-col">
                           <div className="flex items-center gap-2 mb-4">
                              <span className="px-2.5 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                 {event.type || t.clinicalWorkshop}
                              </span>
                              <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                              <div className="flex items-center gap-1.5 text-slate-400">
                                 <Users size={12} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">{t.nodeRegistry}</span>
                              </div>
                           </div>

                           <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight leading-snug group-hover:text-primary-600 transition-colors">
                              {event.title}
                           </h3>

                           <div className="space-y-3 mb-8">
                              <div className="flex items-center gap-3 text-slate-500">
                                 <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                                    <MapPin size={14} />
                                 </div>
                                 <span className="text-xs font-bold">{event.location}</span>
                              </div>
                              <div className="flex items-center gap-3 text-slate-500">
                                 <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                                    <Clock size={14} />
                                 </div>
                                 <span className="text-xs font-bold">{event.time || '09:00 AM - 05:00 PM'}</span>
                              </div>
                           </div>

                           <Link
                              to={`/event-registration/${event.id}`}
                              className="mt-auto w-full py-4 bg-slate-50 hover:bg-primary-600 text-slate-500 hover:text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 group/btn"
                           >
                              {t.reserveSeat} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                           </Link>
                        </div>
                     </motion.div>
                  )) : (
                     <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm border border-slate-50">
                           <Sparkles size={24} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px]">{t.noEvents}</p>
                     </div>
                  )}
               </div>
            )}
         </section>

         {/* 4. Bottom CTA */}
         <section className="mt-32 max-w-7xl mx-auto px-2">
            <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />

               <div className="max-w-xl text-center lg:text-left">
                  <h2 className="text-3xl lg:text-4xl font-black text-white mb-6">{t.proposeEvent}</h2>
                  <p className="text-slate-400 font-medium leading-relaxed">
                     {t.proposeEventDesc}
                  </p>
               </div>
               <button className="px-10 py-5 bg-white text-slate-900 font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-xl">
                  {t.inquirePartnership}
               </button>
            </div>
         </section>

      </div>
   );
};

export default Events;