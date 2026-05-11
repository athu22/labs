import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Users, Calendar, CheckCircle, Newspaper, Bell, ArrowRight, ChevronLeft, ChevronRight, Globe, Shield, Sparkles, Zap, Heart, MessageSquare, MapPin, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, doc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const Home = () => {
  const [content, setContent] = useState({
    heroTitle: 'Empowering Clinical Laboratory Professionals',
    heroSubtext: 'Association of Clinical Laboratory Analysts & Practitioners (ACLAP) is dedicated to advancing the standards of laboratory diagnostics.',
    memberCountOffset: 2450
  });

  const [news, setNews] = useState([]);
  const [notices, setNotices] = useState([]);
  const [realMemberCount, setRealMemberCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(true);

  const slides = [
    {
      image: '/images/slide1.png',
      tagline: 'Global Standards • Local Expertise',
      title: 'Excellence in \nDiagnostics',
      subtitle: 'Leading the transformation of clinical laboratory standards across Maharashtra with professional integrity.',
      primaryCTA: 'Join Association',
      secondaryCTA: 'About Us'
    },
    {
      image: '/images/slide2.png',
      tagline: 'Education • Innovation • Progress',
      title: 'Global Research \nCollaboration',
      subtitle: 'Connecting local practitioners with international research, emerging trends and advanced technologies.',
      primaryCTA: 'Explore Events',
      secondaryCTA: 'View News'
    },
    {
      image: '/images/slide3.png',
      tagline: 'Advancing Medical Science',
      title: 'Modern Laboratory \nInfrastructure',
      subtitle: 'Empowering clinical labs with modern automation tools and high-precision diagnostic frameworks.',
      primaryCTA: 'Member Portal',
      secondaryCTA: 'Contact'
    }
  ];



  useEffect(() => {
    fetchHomeData();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const fetchHomeData = async () => {
    try {
      const mainSnap = await getDoc(doc(db, 'content', 'main'));
      if (mainSnap.exists()) setContent(mainSnap.data());

      const newsSnap = await getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(3)));
      setNews(newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const noticesSnap = await getDocs(query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(5)));
      setNotices(noticesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const membersSnap = await getDocs(collection(db, 'registrations'));
      setRealMemberCount(membersSnap.size);

      const eventsSnap = await getDocs(query(collection(db, 'events'), orderBy('date', 'desc'), limit(1)));
      if (!eventsSnap.empty) {
        setUpcomingEvent({ id: eventsSnap.docs[0].id, ...eventsSnap.docs[0].data() });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white text-slate-900">

      {/* Ultra-Premium Hero Slider */}
      <section className="relative h-screen w-full overflow-hidden bg-[#140303]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <motion.div
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            >
              <div className="absolute inset-0 bg-[#f16522]/30 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140303] via-transparent to-[#140303]/40" />
            </motion.div>

            <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center z-10">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="max-w-5xl"
              >
                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="h-[1px] w-12 bg-secondary-yellow/40" />
                  <span className="text-secondary-yellow text-[10px] font-black uppercase tracking-[0.5em]">{slides[currentSlide].tagline}</span>
                  <div className="h-[1px] w-12 bg-secondary-yellow/40" />
                </div>

                <h1 className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight whitespace-pre-line drop-shadow-2xl">
                  {slides[currentSlide].title}
                </h1>

                <p className="text-base md:text-xl text-white/80 mb-12 leading-relaxed font-medium max-w-2xl mx-auto tracking-wide">
                  {slides[currentSlide].subtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-20">
                  <Link
                    to="/signup"
                    className="group relative px-14 py-5 bg-white text-primary-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {slides[currentSlide].primaryCTA} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-secondary-yellow translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/about"
                    className="px-14 py-5 bg-transparent border-2 border-white/20 text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all backdrop-blur-md active:scale-95"
                  >
                    {slides[currentSlide].secondaryCTA}
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Harmonized Stats Section */}
      <section className="py-20 bg-white border-b border-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <StatCard icon={<Users />} label="Member Network" value={`${(content.memberCountOffset || 0) + realMemberCount}+`} />
            <StatCard icon={<Globe />} label="Maharashtra Reach" value="36+ Districts" />
            <StatCard icon={<Calendar />} label="Workshops/Year" value="12+ Sessions" />
            <StatCard icon={<Shield />} label="Certified Quality" value="100% Secure" />
          </div>
        </div>
      </section>

      {/* NEW: Why Join ACLAP? (Benefits Section) */}
      <section className="py-32 bg-[#fdfcf5] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-yellow/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-primary-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Membership Perks</span>
            <h2 className="text-4xl md:text-6xl font-black text-accent-maroon tracking-tighter leading-tight mb-6">Why Join <span className="text-primary-600">ACLAP?</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Be a part of a growing community dedicated to excellence in clinical diagnostics and laboratory ethics.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-primary-600" />, title: 'Networking', desc: 'Connect with senior practitioners and industry experts across the state.' },
              { icon: <Award className="text-primary-600" />, title: 'Certification', desc: 'Get access to specialized certification programs recognized by top labs.' },
              { icon: <MessageSquare className="text-primary-600" />, title: 'Resources', desc: 'Exclusive access to latest research papers, lab manuals, and newsletters.' },
              { icon: <Shield className="text-primary-600" />, title: 'Legal Support', desc: 'Professional advocacy and legal guidance for registered lab practitioners.' },
              { icon: <Heart className="text-primary-600" />, title: 'Welfare Schemes', desc: 'Benefits from welfare and insurance schemes dedicated to our members.' },
              { icon: <Users className="text-primary-600" />, title: 'Career Growth', desc: 'Regular job updates and skill enhancement workshops to stay ahead.' },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white border border-secondary-yellow/20 rounded-[2.5rem] shadow-xl shadow-secondary-yellow/5 hover:border-primary-500 transition-all group"
              >
                <div className="w-14 h-14 bg-secondary-yellow/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-accent-maroon mb-3 tracking-tight">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* NEW: In Loving Memory / Our Inspiration */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Image Container with Elegant Border */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/3 relative"
            >
              <div className="absolute inset-0 bg-secondary-yellow/20 rounded-[3rem] translate-x-4 translate-y-4 -z-10" />
              <div className="bg-white p-4 rounded-[3.5rem] shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
                <img 
                  src="/images/inspiration.png" 
                  alt="Late Shri Annasaheb Siddappa Karole" 
                  className="w-full h-auto rounded-[2.5rem] grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </motion.div>

            {/* Text Content */}
            <div className="lg:w-2/3 space-y-8">
              <div className="space-y-4">
                <span className="text-primary-600 text-[10px] font-black uppercase tracking-[0.4em] block">Our Eternal Inspiration</span>
                <h2 className="text-4xl md:text-6xl font-black text-accent-maroon tracking-tighter leading-tight">
                  कै. श्री. आणासाहेब <br /> <span className="text-primary-600">सिद्धाप्पा करोले</span>
                </h2>
                <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                   <span>०१/०६/१९५१</span>
                   <div className="w-8 h-[1px] bg-slate-200" />
                   <span>०१/०२/२०२३</span>
                </div>
              </div>
              
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                A visionary leader whose commitment to the clinical laboratory profession laid the foundation of our association. His legacy of integrity, excellence, and service continues to inspire every clinical practitioner across Maharashtra.
              </p>

              <div className="pt-4">
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-secondary-yellow/10 rounded-2xl text-accent-maroon text-[11px] font-black uppercase tracking-widest border border-secondary-yellow/20">
                  <Heart className="text-primary-600" size={16} fill="currentColor" /> Eternal Legacy of ACLAP
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Knowledge Hub & Bulletin Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-20 items-start">

            {/* Left: News Feed */}
            <div className="lg:col-span-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-primary-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    <Sparkles size={14} /> Knowledge Hub
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-accent-maroon tracking-tighter leading-none">The Latest Intel</h2>
                </div>
                <Link to="/news" className="text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-primary-600 pb-1 hover:text-accent-maroon hover:border-accent-maroon transition-all">Explore All News</Link>
              </div>

              <div className="space-y-12">
                {news.map((item) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={item.id}
                    className="group cursor-pointer flex gap-8 items-start"
                  >
                    <div className="hidden sm:block text-right min-w-[80px]">
                      <span className="block text-3xl font-black text-secondary-yellow group-hover:text-primary-600 transition-colors leading-none">{item.createdAt?.toDate().getDate()}</span>
                      <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{item.createdAt?.toDate().toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-accent-maroon mb-4 group-hover:text-primary-600 transition-colors leading-tight tracking-tight">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed line-clamp-2 text-sm font-medium">{item.content}</p>
                      <button className="mt-6 text-[9px] font-black uppercase text-primary-600 tracking-[0.2em] group-hover:gap-2 flex items-center transition-all">
                        Read Story <ArrowRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Bulletin Column */}
            <div className="lg:col-span-4 lg:sticky lg:top-32">
              <div className="bg-white border-2 border-secondary-yellow/20 rounded-[3rem] p-10 shadow-2xl shadow-secondary-yellow/5">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-xl font-black text-accent-maroon tracking-tight flex items-center gap-3">
                    <Bell className="text-primary-600" size={20} /> Bulletin
                  </h2>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
                  </div>
                </div>

                <div className="space-y-10">
                  {notices.map(notice => (
                    <div key={notice.id} className="group cursor-pointer border-l-2 border-transparent hover:border-primary-500 pl-4 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${notice.priority === 'Urgent' ? 'bg-red-500 text-white' : 'bg-primary-100 text-primary-600'}`}>
                          {notice.priority}
                        </span>
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{notice.createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <h4 className="text-slate-800 font-bold group-hover:text-primary-600 transition-colors text-base leading-snug">{notice.title}</h4>
                    </div>
                  ))}
                </div>

                <Link to="/notices" className="mt-12 block text-center py-4 bg-secondary-yellow/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-accent-maroon hover:bg-secondary-yellow/30 transition-all">
                  View All Notices
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW: Testimonials Section */}
      <section className="py-32 bg-[#fdfcf5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-accent-maroon tracking-tighter leading-tight">Members' <span className="text-primary-600">Voice</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: 'Dr. Rahul Deshmukh', role: 'Lab Director', text: 'Joining ACLAP was the best decision for my career. The networking opportunities and certification programs are top-notch.' },
              { name: 'Mrs. Sneha Patil', role: 'Clinical Analyst', text: 'The legal support and advocacy provided by the association give us lab practitioners a sense of security and professional pride.' }
            ].map((test, i) => (
              <div key={i} className="p-12 bg-white rounded-[3rem] border border-secondary-yellow/30 shadow-lg relative">
                <div className="text-primary-600 mb-6">
                  <MessageSquare size={32} />
                </div>
                <p className="text-lg text-slate-600 italic leading-relaxed mb-8">"{test.text}"</p>
                <div>
                  <h4 className="text-lg font-black text-accent-maroon">{test.name}</h4>
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">{test.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Upcoming Event Banner */}
      {upcomingEvent && (
        <section className="relative w-full h-[600px] overflow-hidden flex items-center justify-center">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            {upcomingEvent.imageUrl || (upcomingEvent.imageUrls && upcomingEvent.imageUrls.length > 0) ? (
              <>
                {bannerLoading && (
                  <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
                    <Loader2 className="text-primary-600 animate-spin" size={40} />
                  </div>
                )}
                <motion.img 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: bannerLoading ? 0 : 1 }}
                  transition={{ duration: 1 }}
                  src={upcomingEvent.imageUrl || upcomingEvent.imageUrls[0]} 
                  alt={upcomingEvent.title} 
                  onLoad={() => setBannerLoading(false)}
                  className="w-full h-full object-cover"
                />
              </>
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <Calendar className="w-32 h-32 text-slate-800" strokeWidth={1} />
              </div>
            )}
            {/* Dark Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 mb-8 px-4 py-1.5 bg-primary-600/20 border border-primary-600/30 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Next Big Event</span>
              </div>

              <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
                {upcomingEvent.title}
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-8 mb-12 text-white/70">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-primary-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    {new Date(upcomingEvent.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-primary-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">{upcomingEvent.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-primary-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">{upcomingEvent.time || '09:00 AM - 05:00 PM'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link 
                  to={`/event-registration/${upcomingEvent.id}`}
                  className="px-12 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-primary-600/40 active:scale-95 flex items-center gap-3"
                >
                  Register Now <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/events" 
                  className="px-12 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}



    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="text-center group">
    <div className="flex justify-center mb-6">
      <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
        {React.cloneElement(icon, { size: 24, strokeWidth: 1.5 })}
      </div>
    </div>
    <div className="text-3xl md:text-4xl font-black text-accent-maroon mb-2 tracking-tight group-hover:scale-105 transition-transform">{value}</div>
    <div className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black">{label}</div>
  </div>
);

export default Home;
