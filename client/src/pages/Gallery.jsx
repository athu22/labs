import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon, Calendar, ChevronRight, X, Maximize2, Sparkles,
  Play, ZoomIn, Grid, List, Camera, Award, Users, Clock,
  Share2, Download, Heart, Eye, ArrowRight
} from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

// Import images from assets
import event1 from '../assets/event1.jpeg';
import event2 from '../assets/event2.jpeg';
import event3 from '../assets/event3.jpeg';
import event4 from '../assets/event4.jpeg';
import event5 from '../assets/event5.jpeg';
import event6 from '../assets/event6.jpeg';
import event7 from '../assets/event7.jpeg';
import event8 from '../assets/event8.jpeg';
import event9 from '../assets/event9.jpeg';
import event10 from '../assets/event10.jpeg';

// Translations for Gallery Page
const translations = {
  en: {
    // Hero
    associationVisualArchive: 'Association Visual Archive',
    momentsDefined: 'Moments Defined.',
    gallerySubtitle: 'An interactive visual journey through the milestones, scientific sessions, and community gatherings of ACLAP Maharashtra.',
    momentsCaptured: 'Moments Captured',
    eventsCovered: 'Events Covered',
    communityMembers: 'Community Members',
    yearsOfExcellence: 'Years of Excellence',

    // Filter
    allEvents: 'All Events',

    // Loading
    syncingVisualData: 'Syncing Visual Data',

    // Album
    hdAssets: 'HD Assets',
    viewAll: 'View All',
    showLess: 'Show Less',
    viewDetails: 'View Details',
    galleryAwaiting: 'Gallery Awaiting Content',
    galleryDesc: "The association's visual archive is currently being curated. Check back soon for event highlights.",

    // Lightbox
    download: 'Download',
    share: 'Share',
    info: 'Info',

    // CTA
    readyToContribute: 'Ready to contribute to the',
    community: 'Community?',
    ctaDesc: 'Be part of the next chapter. Join ACLAP Maharashtra today and help us capture more milestones in the history of clinical excellence.',
    joinAssociation: 'Join the Association',

    // Stats
    loading: 'Loading...',
  },
  mr: {
    // Hero
    associationVisualArchive: 'संघटना दृश्य संग्रह',
    momentsDefined: 'क्षण परिभाषित.',
    gallerySubtitle: 'ACLAP महाराष्ट्राच्या मैलाचे दगड, वैज्ञानिक सत्रे आणि समुदाय मेळाव्यांमधील परस्परसंवादी दृश्य प्रवास.',
    momentsCaptured: 'क्षण कैद',
    eventsCovered: 'कार्यक्रम समाविष्ट',
    communityMembers: 'समुदाय सदस्य',
    yearsOfExcellence: 'उत्कृष्टतेची वर्षे',

    // Filter
    allEvents: 'सर्व कार्यक्रम',

    // Loading
    syncingVisualData: 'दृश्य डेटा समक्रमित करत आहे',

    // Album
    hdAssets: 'HD संपत्ती',
    viewAll: 'सर्व पहा',
    showLess: 'कमी दाखवा',
    viewDetails: 'तपशील पहा',
    galleryAwaiting: 'गॅलरी सामग्रीची वाट पाहत आहे',
    galleryDesc: 'संघटनेचा दृश्य संग्रह सध्या तयार केला जात आहे. कार्यक्रम हायलाइट्ससाठी लवकरच परत या.',

    // Lightbox
    download: 'डाउनलोड',
    share: 'शेअर',
    info: 'माहिती',

    // CTA
    readyToContribute: 'मध्ये योगदान देण्यास तयार आहात',
    community: 'समुदाय?',
    ctaDesc: 'पुढील अध्यायाचा भाग व्हा. आजच ACLAP महाराष्ट्रात सामील व्हा आणि नैदानिक उत्कृष्टतेच्या इतिहासातील अधिक मैलाचे दगड कैद करण्यात मदत करा.',
    joinAssociation: 'संघटनेत सामील व्हा',

    // Stats
    loading: 'लोड होत आहे...',
  }
};

// All event images
const EVENT_IMAGES = [
  event1, event2, event3, event4, event5,
  event6, event7, event8, event9, event10
];

const Gallery = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredImage, setHoveredImage] = useState(null);
  const [likedImages, setLikedImages] = useState({});
  const [imageLoadStates, setImageLoadStates] = useState({});
  const heroRef = useRef(null);

  // Initialize image load states
  useEffect(() => {
    EVENT_IMAGES.forEach((_, idx) => {
      setImageLoadStates(prev => ({ ...prev, [idx]: false }));
    });
    // Set loading to false after a short delay to simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = (idx) => {
    setImageLoadStates(prev => ({ ...prev, [idx]: true }));
  };

  const handleLike = (e, imageIdx) => {
    e.stopPropagation();
    const key = `img-${imageIdx}`;
    setLikedImages(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShare = async (e, imageUrl) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this moment from ACLAP Maharashtra',
          url: imageUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
      alert('Image URL copied to clipboard!');
    }
  };

  const handleDownload = async (e, imageUrl) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aclap-moment-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Parallax scroll effect for hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats animation counter
  const StatsCounter = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [end]);
    return <span>{count}</span>;
  };

  // Floating particles effect
  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              y: [null, -100, -200],
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>
    );
  };

  // Staggered text animation variant
  const staggerText = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-8 h-8 border-2 border-primary-400 rounded-full pointer-events-none z-[1000] mix-blend-difference hidden lg:block"
        animate={{
          x: hoveredImage ? -100 : 0,
          y: hoveredImage ? -100 : 0,
          scale: hoveredImage ? 1.5 : 1,
        }}
        transition={{ type: "spring", damping: 30, mass: 0.8 }}
      />

      {/* Immersive Hero Section with Parallax */}
      <div className="relative pt-48 pb-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Particles />

        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#1e3a8a_0%,transparent_50%)] opacity-40" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#3b82f6_0%,transparent_50%)] opacity-30" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-500/20 rounded-full blur-[100px]"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10" ref={heroRef}>
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div
              custom={0}
              variants={staggerText}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-primary-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 group cursor-pointer hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={12} className="animate-pulse group-hover:rotate-12 transition-transform" />
              {t.associationVisualArchive}
            </motion.div>

            <motion.h1
              custom={1}
              variants={staggerText}
              className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8"
            >
              Moments <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-500 to-primary-600 animate-gradient-x">
                {t.momentsDefined}
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={staggerText}
              className="text-slate-400 text-xl font-medium leading-relaxed max-w-xl"
            >
              {t.gallerySubtitle}
            </motion.p>

            {/* Stats Row */}
            <motion.div
              custom={3}
              variants={staggerText}
              className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { icon: Camera, label: t.momentsCaptured, value: EVENT_IMAGES.length },
                { icon: Award, label: t.eventsCovered, value: "10+" },
                { icon: Users, label: t.communityMembers, value: "5K+" },
                { icon: Clock, label: t.yearsOfExcellence, value: "8+" },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <stat.icon size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {typeof stat.value === 'number' ? <StatsCounter end={stat.value} /> : stat.value}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-scroll" />
          </div>
        </motion.div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 py-24 relative -mt-16 z-20">
        {/* Filter & View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-6 mb-12"
        >
          <div className="flex flex-wrap gap-3">
            <motion.button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-slate-900 text-white shadow-lg shadow-slate-900/20"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Calendar size={16} />
              {t.allEvents}
            </motion.button>
          </div>

          <div className="flex gap-2 bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <motion.div
              className="relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-20 h-20 border-4 border-primary-600/10 border-t-primary-600 rounded-full" />
              <Camera className="absolute inset-0 m-auto text-primary-600/40" size={28} />
            </motion.div>
            <motion.p
              className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {t.syncingVisualData}
            </motion.p>
          </div>
        ) : (
          <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
            : 'space-y-4 max-w-4xl mx-auto'
            }`}
          >
            {EVENT_IMAGES.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.5, type: "spring", stiffness: 300 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className={`group/item relative ${viewMode === 'grid' ? 'aspect-[4/5]' : 'aspect-[16/9]'
                  } rounded-[2rem] overflow-hidden bg-white shadow-xl shadow-slate-200/50 cursor-pointer transition-all duration-500`}
                onClick={() => setSelectedImage(url)}
                onMouseEnter={() => setHoveredImage(i)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                {/* Skeleton Loader */}
                {!imageLoadStates[i] && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer" />
                )}

                <img
                  src={url}
                  alt={`Gallery Asset ${i + 1}`}
                  loading="lazy"
                  className={`w-full h-full object-cover grayscale-[0.2] group-hover/item:grayscale-0 transition-all duration-700 group-hover/item:scale-110 ${imageLoadStates[i] ? 'opacity-100' : 'opacity-0'
                    }`}
                  onLoad={() => handleImageLoad(i)}
                />

                {/* Enhanced Glassmorphic Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500 flex flex-col justify-between p-6"
                  initial={false}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="flex justify-end gap-2">
                    <motion.button
                      className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-primary-500 transition-colors"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleLike(e, i)}
                    >
                      <Heart size={18} className={likedImages[`img-${i}`] ? 'fill-red-500 text-red-500' : ''} />
                    </motion.button>
                    <motion.button
                      className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-primary-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleShare(e, url)}
                    >
                      <Share2 size={18} />
                    </motion.button>
                    <motion.button
                      className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-primary-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDownload(e, url)}
                    >
                      <Download size={18} />
                    </motion.button>
                  </div>

                  <div className="translate-y-8 group-hover/item:translate-y-0 transition-transform duration-500 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <Eye size={14} />
                      <span>{t.viewDetails}</span>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center text-white">
                      <ZoomIn size={20} />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && EVENT_IMAGES.length === 0 && (
          <motion.div
            className="text-center py-40 bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-blue-600 to-primary-400 animate-gradient-x" />
            <motion.div
              className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ImageIcon size={48} strokeWidth={1} />
            </motion.div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">{t.galleryAwaiting}</h3>
            <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto">
              {t.galleryDesc}
            </p>
          </motion.div>
        )}
      </div>

      {/* Premium Lightbox with Thumbnail Navigation */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all z-[210]"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center pointer-events-none"
            >
              <img
                src={selectedImage}
                alt="Enlarged Visual"
                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-[0_0_100px_rgba(59,130,246,0.4)] pointer-events-auto"
              />

              {/* Lightbox Footer */}
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 pointer-events-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <button className="text-white/80 hover:text-white text-sm font-medium">{t.download}</button>
                <div className="w-px h-4 bg-white/20" />
                <button className="text-white/80 hover:text-white text-sm font-medium">{t.share}</button>
                <div className="w-px h-4 bg-white/20" />
                <button className="text-white/80 hover:text-white text-sm font-medium">{t.info}</button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium CTA Section with 3D tilt effect */}
      <motion.section
        className="bg-white py-40 px-4 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary-600 to-transparent" />

        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <motion.h2
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t.readyToContribute} <span className="text-primary-600 relative inline-block">
              {t.community}
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-primary-600/30 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.3 }}
              />
            </span>
          </motion.h2>

          <motion.p
            className="text-slate-500 font-medium text-xl leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t.ctaDesc}
          </motion.p>

          <motion.div
            className="pt-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.02 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center gap-4 bg-gradient-to-r from-slate-900 to-black hover:from-black hover:to-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-4">
                {t.joinAssociation} <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        .animate-scroll {
          animation: scroll 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default Gallery;