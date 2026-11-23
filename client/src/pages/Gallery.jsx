import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon, Calendar, ChevronRight, X, Maximize2, Sparkles,
  Play, ZoomIn, Grid, List, Camera, Award, Users, Clock,
  Share2, Download, Heart, Eye, ArrowRight
} from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { supabase } from '../services/supabase';

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

// High-performance, self-contained Gallery Card
const GalleryCard = React.memo(({
  url,
  index,
  viewMode,
  isLiked,
  onSelect,
  onLike,
  onShare,
  onDownload,
  onHover,
  t,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ delay: (index % 5) * 0.04, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group/item relative ${
        viewMode === 'grid' ? 'aspect-[4/5]' : 'aspect-[16/9]'
      } rounded-[2rem] overflow-hidden bg-slate-100 shadow-xl shadow-slate-200/50 cursor-pointer transition-all duration-300`}
      onClick={() => onSelect(url)}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Background Pulse Shimmer until image is ready */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/70 animate-pulse flex items-center justify-center">
          <ImageIcon className="text-slate-300 w-8 h-8 opacity-50" />
        </div>
      )}

      <img
        ref={(el) => {
          if (el && el.complete && !isLoaded) {
            setIsLoaded(true);
          }
        }}
        src={url}
        alt={`Gallery Moment ${index + 1}`}
        loading={index < 5 ? "eager" : "lazy"}
        fetchPriority={index < 5 ? "high" : "auto"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 group-hover/item:scale-110 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Enhanced Glassmorphic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 pointer-events-none group-hover/item:pointer-events-auto">
        <div className="flex justify-end gap-2">
          <button
            className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-primary-500 transition-all hover:scale-110 active:scale-95"
            onClick={(e) => onLike(e, index)}
          >
            <Heart size={18} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
          </button>
          <button
            className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-primary-500 transition-all hover:scale-110 active:scale-95"
            onClick={(e) => onShare(e, url)}
          >
            <Share2 size={18} />
          </button>
          <button
            className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-primary-500 transition-all hover:scale-110 active:scale-95"
            onClick={(e) => onDownload(e, url)}
          >
            <Download size={18} />
          </button>
        </div>

        <div className="translate-y-4 group-hover/item:translate-y-0 transition-transform duration-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
            <Eye size={14} />
            <span>{t.viewDetails}</span>
          </div>
          <div className="w-11 h-11 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ZoomIn size={18} />
          </div>
        </div>
      </div>
    </motion.div>
  );
});
GalleryCard.displayName = 'GalleryCard';

const Gallery = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [images, setImages] = useState(EVENT_IMAGES);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredImage, setHoveredImage] = useState(null);
  const [likedImages, setLikedImages] = useState({});
  const heroRef = useRef(null);

  // Fetch dynamic gallery items from Supabase & combine with default assets
  useEffect(() => {
    let isMounted = true;
    const fetchDynamicGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const dynamicUrls = [];
          data.forEach(item => {
            const urls = item.image_urls || item.imageUrls || [];
            if (Array.isArray(urls)) {
              dynamicUrls.push(...urls);
            }
          });
          if (dynamicUrls.length > 0) {
            setImages([...dynamicUrls, ...EVENT_IMAGES]);
          }
        }
      } catch (err) {
        console.warn('[Gallery] Supabase fetch error:', err);
      }
    };
    fetchDynamicGallery();
    return () => { isMounted = false; };
  }, []);

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
      <div className="relative pt-28 pb-10 sm:pt-32 sm:pb-12 md:pt-36 md:pb-12 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-4 group cursor-pointer hover:bg-white/15 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={13} className="animate-pulse group-hover:rotate-12 transition-transform" />
              {t.associationVisualArchive}
            </motion.div>

            <motion.h1
              custom={1}
              variants={staggerText}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-400 to-indigo-400">
                {t.momentsDefined}
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={staggerText}
              className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mb-6"
            >
              {t.gallerySubtitle}
            </motion.p>

            {/* Stats Row */}
            <motion.div
              custom={3}
              variants={staggerText}
              className="flex flex-wrap items-center gap-5 sm:gap-8 pt-5 border-t border-white/10"
            >
              {[
                { icon: Camera, label: t.momentsCaptured, value: images.length },
                { icon: Award, label: t.eventsCovered, value: "10+" },
                { icon: Users, label: t.communityMembers, value: "5K+" },
                { icon: Clock, label: t.yearsOfExcellence, value: "8+" },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <stat.icon size={16} className="text-primary-400" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-white leading-tight">
                      {typeof stat.value === 'number' ? <StatsCounter end={stat.value} /> : stat.value}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 relative z-20">
        {/* Filter & View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8"
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
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6'
            : 'space-y-4 max-w-4xl mx-auto'
            }`}
          >
            {images.map((url, i) => (
              <GalleryCard
                key={`${url}-${i}`}
                url={url}
                index={i}
                viewMode={viewMode}
                isLiked={Boolean(likedImages[`img-${i}`])}
                onSelect={(selectedUrl) => setSelectedImage(selectedUrl)}
                onLike={handleLike}
                onShare={handleShare}
                onDownload={handleDownload}
                onHover={(idx) => setHoveredImage(idx)}
                t={t}
              />
            ))}
          </div>
        )}

        {!loading && images.length === 0 && (
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
        className="bg-white py-16 sm:py-24 md:py-32 px-4 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary-600 to-transparent" />

        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12 relative z-10">
          <motion.h2
            className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight"
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
            className="text-slate-500 font-medium text-sm sm:text-base md:text-xl leading-relaxed max-w-2xl mx-auto"
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

      <style>{`
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