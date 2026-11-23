import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  Filter,
  Search,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import eventApi from '../services/eventApi';

const translations = {
  en: {
    knowledgeEcosystem: 'Knowledge Ecosystem',
    eventsTitle: 'Clinical',
    eventsTitleHighlight: 'Workshops',
    eventsTitleEnd: '& Annual Conferences',
    eventsDesc:
      'Stay ahead in clinical laboratory science with our expert-led webinars, hands-on training sessions, and networking events.',
    sortArchitecture: 'Filter Events',
    allEvents: 'All Events',
    upcomingEvents: 'Upcoming Events',
    freeEvents: 'Free Events',
    searchPlaceholder: 'Search by event title, venue, or category...',
    availableSeats: 'Available Tickets',
    soldOut: 'Sold Out',
    memberFee: 'Member Fee',
    nonMemberFee: 'Non-Member Fee',
    freeEvent: 'FREE ENTRY',
    registerNow: 'Register Now',
    noEvents: 'No active events scheduled for current cycle',
    loading: 'Loading Events...',
  },
  mr: {
    knowledgeEcosystem: 'ज्ञान परिसंस्था',
    eventsTitle: 'नैदानिक',
    eventsTitleHighlight: 'कार्यशाळा',
    eventsTitleEnd: 'आणि वार्षिक परिषदा',
    eventsDesc:
      'आमच्या तज्ज्ञ-नेतृत्वाखालील वेबिनार, हँड्स-ऑन प्रशिक्षण सत्रे आणि नेटवर्किंग इव्हेंट्ससह नैदानिक प्रयोगशाळा विज्ञानात आघाडीवर राहा.',
    sortArchitecture: 'फिल्टर करा',
    allEvents: 'सर्व कार्यक्रम',
    upcomingEvents: 'आगामी कार्यक्रम',
    freeEvents: 'विनामूल्य कार्यक्रम',
    searchPlaceholder: 'कार्यक्रमाचे नाव, ठिकाण किंवा वर्गवारीनुसार शोधा...',
    availableSeats: 'उपलब्ध तिकिटे',
    soldOut: 'तिकिटे संपली',
    memberFee: 'सदस्य शुल्क',
    nonMemberFee: 'गैर-सदस्य शुल्क',
    freeEvent: 'मोफत प्रवेश',
    registerNow: 'नोंदणी करा',
    noEvents: 'सध्याच्या सायकलसाठी कोणतेही सक्रिय कार्यक्रम नियोजित नाहीत',
    loading: 'कार्यक्रम लोड होत आहेत...',
  },
};

const Events = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language] || translations.en;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventApi.get('/public');
      setEvents(res.data || []);
    } catch (err) {
      console.error('[Events.jsx] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        !searchTerm ||
        ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.district?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'free') return ev.isFree || (ev.memberFee === 0 && ev.nonMemberFee === 0);
      if (filterType === 'upcoming') {
        if (!ev.eventDate) return true;
        return new Date(ev.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0));
      }
      return true;
    });
  }, [events, searchTerm, filterType]);

  return (
    <div className="bg-white pt-40 pb-24">
      {/* 1. Header Section */}
      <section className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em] mb-4 inline-block">
            {t.knowledgeEcosystem}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
            {t.eventsTitle}{' '}
            <span className="text-primary-600">{t.eventsTitleHighlight}</span> & <br className="hidden sm:block" />
            {t.eventsTitleEnd}
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {t.eventsDesc}
          </p>
        </motion.div>
      </section>

      {/* 2. Search & Filters Bar */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-4 w-full md:w-auto">
            <Filter className="text-slate-400 shrink-0" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
              {t.sortArchitecture}:
            </span>
            <div className="flex gap-1">
              {[
                { id: 'all', label: t.allEvents },
                { id: 'upcoming', label: t.upcomingEvents },
                { id: 'free', label: t.freeEvents },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    filterType === opt.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-primary-600/10 focus:border-primary-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* 3. Event Cards Grid */}
      <section className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="animate-spin text-primary-600 mx-auto mb-4" size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.loading}</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, i) => {
              const isSoldOut = (event.availableTickets ?? 1) <= 0;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-600/10 transition-all flex flex-col"
                >
                  {/* Banner & Badges */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {event.imageUrl || event.image_url ? (
                      <img
                        src={event.imageUrl || event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Calendar size={44} strokeWidth={1.5} />
                      </div>
                    )}

                    {/* Category pill */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-xl text-[9px] font-black text-primary-600 uppercase tracking-widest shadow-sm">
                        {event.category || 'Clinical Workshop'}
                      </span>
                    </div>

                    {/* Availability pill */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          isSoldOut
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {isSoldOut ? t.soldOut : `${event.availableTickets} ${t.availableSeats}`}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-7 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      <div className="space-y-2 mb-6 text-xs text-slate-600">
                        <div className="flex items-center gap-2.5">
                          <Calendar size={14} className="text-primary-600 shrink-0" />
                          <span className="font-bold">
                            {event.date || event.eventDate || 'TBD'}
                            {event.startTime ? ` • ${event.startTime}` : ''}
                            {(event.isMultiDay || (event.eventEndDate && event.eventEndDate !== event.eventDate) || (typeof event.date === 'string' && event.date.includes(' to '))) && (
                              <span className="ml-2 bg-purple-100 text-purple-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                                2 Days
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin size={14} className="text-primary-600 shrink-0" />
                          <span className="font-medium line-clamp-1">
                            {event.venue || event.location || 'Maharashtra'}
                            {event.district ? ` (${event.district})` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Fee Structure Display */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
                        {event.isFree || (event.memberFee === 0 && event.nonMemberFee === 0) ? (
                          <div className="text-center">
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                              {t.freeEvent}
                            </span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="border-r border-slate-200 pr-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {t.memberFee}
                              </p>
                              <p className="text-base font-black text-slate-900">
                                {event.memberFee === 0 ? 'FREE' : `₹${event.memberFee}`}
                              </p>
                            </div>
                            <div className="pl-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {t.nonMemberFee}
                              </p>
                              <p className="text-base font-black text-slate-900">
                                {event.nonMemberFee === 0 ? 'FREE' : `₹${event.nonMemberFee}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Register Now CTA */}
                    <Link
                      to={`/event-registration/${event.id}`}
                      className={`w-full py-3.5 px-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${
                        isSoldOut
                          ? 'bg-slate-100 text-slate-400 pointer-events-none'
                          : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20 hover:shadow-lg'
                      }`}
                    >
                      {isSoldOut ? t.soldOut : t.registerNow}
                      {!isSoldOut && <ArrowRight size={14} />}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Sparkles className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.noEvents}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;
