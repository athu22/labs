import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Users, Calendar, CheckCircle, Newspaper, Bell, ArrowRight, ChevronLeft, ChevronRight, Globe, Shield, Sparkles, Zap, Heart, MessageSquare, MapPin, Clock, Loader2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { LanguageContext } from '../context/LanguageContext';
import img1 from '../assets/img1.jpeg';
import event1 from '../assets/event1.jpeg';
import event2 from '../assets/event2.jpeg';
import event3 from '../assets/event3.jpeg';
import banner from '../assets/banner.jpeg';

// Translations for Home Page
const translations = {
  en: {
    // Hero
    heroTagline1: 'Empowering Professionals. Advancing Diagnostics. Serving Society.',
    heroTitle1: 'Excellence in \nLaboratory Science',
    heroSubtitle1: 'Shaping the future of laboratory excellence through quality, innovation, ethics, and lifelong learning.',
    heroTagline2: 'Driven by Integrity. Inspired by Excellence. United in Service.',
    heroTitle2: 'Stronger Partnerships \nBetter Healthcare',
    heroSubtitle2: 'Building meaningful connections with laboratory owners, professionals, and industry experts across Maharashtra.',
    heroTagline3: 'Education • Innovation • Progress',
    heroTitle3: 'Empowering Laboratory \nProfessionals',
    heroSubtitle3: 'Strengthening diagnostic services and creating healthier communities through professional development.',
    primaryCTA1: 'Join Association',
    secondaryCTA1: 'About Us',
    primaryCTA2: 'Explore Events',
    secondaryCTA2: 'View News',
    primaryCTA3: 'Member Portal',
    secondaryCTA3: 'Contact',

    // Stats
    memberNetwork: 'Member Network',
    maharashtraReach: 'Maharashtra Reach',
    workshopsPerYear: 'Workshops/Year',
    certifiedQuality: 'Certified Quality',
    districts: 'Districts',
    sessions: 'Sessions',
    secure: 'Secure',

    // Why Join
    membershipPerks: 'Membership Perks',
    whyJoin: 'Why Join',
    aclap: 'ACLAP?',
    joinSubtext: 'Be a part of a growing community dedicated to excellence in clinical diagnostics and laboratory ethics.',
    networkingTitle: 'Networking',
    networkingDesc: 'Build meaningful connections with laboratory owners, Medical Laboratory Professionals, senior practitioners, academicians, and industry experts across Maharashtra.',
    certificationTitle: 'Certification',
    certificationDesc: 'Get access to specialized training, certification programs, workshops, and Continuing Professional Development (CPD) opportunities.',
    resourcesTitle: 'Resources',
    resourcesDesc: 'Access the latest guidelines, research articles, SOPs, legal updates, technical manuals, newsletters, and educational resources.',
    legalSupportTitle: 'Legal Support',
    legalSupportDesc: 'Receive professional guidance on laboratory regulations, compliance, licensing, government policies, and legal matters.',
    welfareSchemesTitle: 'Welfare Schemes',
    welfareSchemesDesc: 'Benefit from welfare initiatives, insurance support, financial assistance programs, emergency relief, and member-focused schemes.',
    careerGrowthTitle: 'Career Growth',
    careerGrowthDesc: 'Advance your career through leadership opportunities, skill development programs, employment updates, and professional mentoring.',

    // Memory Section
    eternalInspiration: 'Our Eternal Inspiration',
    memoryName: 'Late Shri Annasaheb Siddappa Karole',
    memoryDate: '01/06/1951 — 01/02/2023',
    memoryDesc: 'A visionary leader whose commitment to the clinical laboratory profession laid the foundation of our association. His legacy of integrity, excellence, and service continues to inspire every clinical practitioner across Maharashtra.',
    eternalLegacy: 'Eternal Legacy of ACLAP',

    // Knowledge Hub
    knowledgeHub: 'Knowledge Hub',
    latestIntel: 'The Latest Intel',
    exploreAllNews: 'Explore All News',
    readStory: 'Read Story',
    bulletin: 'Bulletin',
    viewAllNotices: 'View All Notices',
    urgent: 'Urgent',

    // Testimonials
    membersVoice: "Members' Voice",

    // Event Banner
    nextBigEvent: 'Next Big Event',
    registerNow: 'Register Now',
    learnMore: 'Learn More',
  },
  mr: {
    // Hero
    heroTagline1: 'व्यावसायिकांचे सक्षमीकरण • गुणवत्तापूर्ण निदान • समाजसेवा',
    heroTitle1: 'प्रयोगशाळा विज्ञानात \nउत्कृष्टता',
    heroSubtitle1: 'उत्कृष्ट प्रयोगशाळा सेवांद्वारे निरोगी भविष्य घडविण्याचा संकल्प.',
    heroTagline2: 'सचोटीने प्रेरित • उत्कृष्टतेसाठी समर्पित • सेवेसाठी एकत्र',
    heroTitle2: 'मजबूत भागीदारी \nउत्तम आरोग्यसेवा',
    heroSubtitle2: 'महाराष्ट्रभरातील प्रयोगशाळा मालक, व्यावसायिक आणि उद्योग तज्ञांशी मजबूत व्यावसायिक नेटवर्क तयार करणे.',
    heroTagline3: 'शिक्षण • नवोपक्रम • प्रगती',
    heroTitle3: 'प्रयोगशाळा व्यावसायिकांना \nसक्षम करणे',
    heroSubtitle3: 'सक्षम निदान सेवा आणि निरोगी समाज घडविण्यासाठी व्यावसायिक विकास.',
    primaryCTA1: 'संघात सामील व्हा',
    secondaryCTA1: 'आमच्याबद्दल',
    primaryCTA2: 'कार्यक्रम पहा',
    secondaryCTA2: 'बातम्या पहा',
    primaryCTA3: 'सदस्य पोर्टल',
    secondaryCTA3: 'संपर्क',

    // Stats
    memberNetwork: 'सदस्य नेटवर्क',
    maharashtraReach: 'महाराष्ट्र पोहोच',
    workshopsPerYear: 'कार्यशाळा/वर्ष',
    certifiedQuality: 'प्रमाणित गुणवत्ता',
    districts: 'जिल्हे',
    sessions: 'सत्रे',
    secure: 'सुरक्षित',

    // Why Join
    membershipPerks: 'सदस्यत्व लाभ',
    whyJoin: 'का सामील व्हावे',
    aclap: 'ACLAP?',
    joinSubtext: 'उत्कृष्ट नैदानिक सेवा आणि प्रयोगशाळा नैतिकतेसाठी समर्पित वाढत्या समुदायाचा भाग व्हा.',
    networkingTitle: 'नेटवर्किंग',
    networkingDesc: 'महाराष्ट्रभरातील प्रयोगशाळा मालक, मेडिकल लॅबोरेटरी व्यावसायिक, वरिष्ठ तज्ज्ञ, शिक्षक आणि उद्योग क्षेत्रातील मान्यवरांशी मजबूत व्यावसायिक नेटवर्क तयार करा.',
    certificationTitle: 'प्रमाणपत्र',
    certificationDesc: 'विशेष प्रशिक्षण, प्रमाणपत्र अभ्यासक्रम, कार्यशाळा आणि सतत व्यावसायिक विकास (CPD) कार्यक्रमांमध्ये प्रवेश मिळवा.',
    resourcesTitle: 'संसाधने',
    resourcesDesc: 'नवीन संशोधन, मार्गदर्शक तत्त्वे, SOPs, कायदेशीर अद्यतने, तांत्रिक पुस्तिका, न्यूजलेटर आणि शैक्षणिक साहित्य यांचा लाभ घ्या.',
    legalSupportTitle: 'कायदेशीर सहाय्य',
    legalSupportDesc: 'प्रयोगशाळा नियम, परवाने, शासकीय धोरणे, कायदेशीर बाबी आणि व्यावसायिक हक्कांबाबत तज्ज्ञ मार्गदर्शन मिळवा.',
    welfareSchemesTitle: 'कल्याण योजना',
    welfareSchemesDesc: 'विमा संरक्षण, आर्थिक सहाय्य, आपत्कालीन मदत, सदस्य कल्याण योजना आणि कुटुंबाच्या सुरक्षिततेसाठी राबविण्यात येणाऱ्या विविध उपक्रमांचा लाभ घ्या.',
    careerGrowthTitle: 'करिअर प्रगती',
    careerGrowthDesc: 'नेतृत्व विकास, कौशल्यवृद्धी, रोजगाराच्या संधी, मार्गदर्शन, परिषद, सेमिनार आणि व्यावसायिक नेटवर्किंगच्या माध्यमातून आपल्या करिअरला नवीन उंची द्या.',

    // Memory Section
    eternalInspiration: 'आमची शाश्वत प्रेरणा',
    memoryName: 'कै. श्री. आण्णासाहेब सिद्धाप्पा करोले',
    memoryDate: '०१/०६/१९५१ — ०१/०२/२०२३',
    memoryDesc: 'एक दूरदर्शी नेता ज्यांच्या प्रयोगशाळा व्यवसायातील योगदानाने आमच्या संघटनेचा पाया रचला. प्रामाणिकपणा, उत्कृष्टता आणि सेवा यांचा वारसा महाराष्ट्रातील प्रत्येक प्रयोगशाळा व्यावसायिकांना प्रेरणा देत आहे.',
    eternalLegacy: 'ACLAP चा शाश्वत वारसा',

    // Knowledge Hub
    knowledgeHub: 'ज्ञान केंद्र',
    latestIntel: 'अद्ययावत माहिती',
    exploreAllNews: 'सर्व बातम्या पहा',
    readStory: 'वाचा',
    bulletin: 'अधिसूचना',
    viewAllNotices: 'सर्व सूचना पहा',
    urgent: 'तातडीचे',

    // Testimonials
    membersVoice: 'सदस्यांचे मत',

    // Event Banner
    nextBigEvent: 'पुढील मोठा कार्यक्रम',
    registerNow: 'आता नोंदणी करा',
    learnMore: 'अधिक माहिती',
  }
};

const formatEventDate = (ev, lang = 'en') => {
  if (!ev) return '';

  // 1. If ev already has a valid formatted display date, return it directly
  if (typeof ev.displayDate === 'string' && ev.displayDate.trim() && !/invalid/i.test(ev.displayDate)) {
    return ev.displayDate.trim();
  }

  const rawDate = ev.event_date || ev.eventDate || ev.date || ev.startDate || ev.start_date;
  const rawEndDate = ev.event_end_date || ev.eventEndDate || ev.endDate || ev.end_date;

  if (!rawDate && !rawEndDate) {
    return lang === 'mr' ? 'आगामी तारीख' : 'Upcoming Date';
  }

  const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
  const opt = { day: '2-digit', month: 'short', year: 'numeric' };

  // 2. If rawDate contains a range string like "19 Jan 2027 - 20 Jan 2027" or "2027-01-19 to 2027-01-20"
  if (typeof rawDate === 'string') {
    const separator = rawDate.includes(' to ') ? ' to ' : (rawDate.includes(' - ') ? ' - ' : null);
    if (separator) {
      const [sPart, ePart] = rawDate.split(separator);
      const ds = new Date(sPart.trim());
      const de = new Date(ePart.trim());
      if (!isNaN(ds.getTime()) && !isNaN(de.getTime())) {
        return lang === 'mr'
          ? `${ds.toLocaleDateString(locale, opt)} ते ${de.toLocaleDateString(locale, opt)}`
          : `${ds.toLocaleDateString(locale, opt)} - ${de.toLocaleDateString(locale, opt)}`;
      }
      return rawDate.trim();
    }
  }

  const parseD = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const d1 = parseD(rawDate);
  const d2 = parseD(rawEndDate);

  if (d1 && d2 && d1.getTime() !== d2.getTime()) {
    const s1 = d1.toLocaleDateString(locale, opt);
    const s2 = d2.toLocaleDateString(locale, opt);
    return lang === 'mr' ? `${s1} ते ${s2}` : `${s1} - ${s2}`;
  }

  if (d1) {
    return d1.toLocaleDateString(locale, opt);
  }

  if (typeof rawDate === 'string' && rawDate.trim() && !/invalid/i.test(rawDate)) {
    return rawDate.trim();
  }

  return lang === 'mr' ? 'आगामी तारीख' : 'Upcoming Date';
};

const formatEventTime = (ev) => {
  if (!ev) return '09:00 AM - 05:00 PM';
  const formatT = (t) => {
    if (!t) return '';
    if (/AM|PM/i.test(t)) return t;
    const parts = String(t).split(':');
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parts[1];
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    }
    return t;
  };

  const st = ev.start_time || ev.startTime;
  const et = ev.end_time || ev.endTime;
  if (st && et) {
    return `${formatT(st)} - ${formatT(et)}`;
  }
  if (st) return formatT(st);
  if (ev.time && typeof ev.time === 'string') return ev.time;
  return '09:00 AM - 05:00 PM';
};

const Home = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [content, setContent] = useState({
    heroTitle: 'Empowering Clinical Laboratory Professionals',
    heroSubtext: 'Association of Clinical Laboratory Analysts & Practitioners (ACLAP) is dedicated to advancing the standards of laboratory diagnostics.',
    memberCountOffset: 4500
  });

  const [news, setNews] = useState([]);
  const [notices, setNotices] = useState([]);
  const [realMemberCount, setRealMemberCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);

  // Modern presentation: Clean high-res conference photography for text slides,
  // and pure unobstructed poster showcase for official banner.jpeg
  const defaultSlides = useMemo(() => [
    {
      id: 'default-1',
      image: event1, // Conference auditorium with delegates
      tagline: t.heroTagline1,
      title: t.heroTitle1,
      subtitle: t.heroSubtitle1,
      primaryCTA: t.primaryCTA1,
      secondaryCTA: t.secondaryCTA1,
      primaryLink: '/signup',
      secondaryLink: '/about',
      isEventSlide: false,
    },
    {
      id: 'default-2',
      image: event2, // Conference stage & expert panel
      tagline: t.heroTagline2,
      title: t.heroTitle2,
      subtitle: t.heroSubtitle2,
      primaryCTA: t.primaryCTA2,
      secondaryCTA: t.secondaryCTA2,
      primaryLink: '/events',
      secondaryLink: '/news',
      isEventSlide: false,
    },
    {
      id: 'default-3',
      image: event3, // Clinical diagnostics seminar
      tagline: t.heroTagline3,
      title: t.heroTitle3,
      subtitle: t.heroSubtitle3,
      primaryCTA: t.primaryCTA3,
      secondaryCTA: t.secondaryCTA3,
      primaryLink: '/portal',
      secondaryLink: '/contact',
      isEventSlide: false,
    },
    {
      id: 'default-banner',
      image: banner, // Official ACLAP Association poster graphic
      isBannerShowcase: true,
      tagline: language === 'mr' ? 'महाराष्ट्र राज्य अधिकृत संघटना' : 'OFFICIAL STATE ASSOCIATION • MAHARASHTRA',
      title: '',
      subtitle: '',
      primaryCTA: t.primaryCTA1,
      secondaryCTA: t.secondaryCTA1,
      primaryLink: '/signup',
      secondaryLink: '/about',
      isEventSlide: false,
    }
  ], [t, language]);

  const slides = useMemo(() => {
    if (!featuredEvents || featuredEvents.length === 0) {
      return defaultSlides;
    }

    const eventSlides = featuredEvents.map((ev) => {
      const img = ev.imageUrl || ev.image_url || (Array.isArray(ev.imageUrls) ? ev.imageUrls[0] : null) || banner;
      const formattedDate = formatEventDate(ev, language);
      const venueStr = ev.venue || ev.location || ev.address || 'Maharashtra';
      const timeStr = formatEventTime(ev);

      // Filter out test/short placeholder descriptions (e.g. "sjsj")
      const rawDesc = (ev.description || '').trim();
      const cleanDesc = (rawDesc.length > 15 && !/^([a-z])\1+$/i.test(rawDesc)) ? rawDesc : '';

      return {
        id: `feat-${ev.id}`,
        eventId: ev.id,
        isEventSlide: true,
        image: img,
        tagline: language === 'mr' ? '⭐ महत्त्वाचा कार्यक्रम • विशेष नोंदणी सुरू' : '⭐ FEATURED IMPORTANT EVENT • REGISTRATION OPEN',
        title: ev.title,
        eventDateFormatted: formattedDate,
        venue: venueStr,
        eventTime: timeStr,
        description: cleanDesc,
        primaryCTA: language === 'mr' ? 'आता नोंदणी करा' : 'Register Now',
        secondaryCTA: language === 'mr' ? 'सविस्तर माहिती' : 'Event Details',
        primaryLink: `/event-registration/${ev.id}`,
        secondaryLink: `/events`,
      };
    });

    return [...eventSlides, ...defaultSlides];
  }, [featuredEvents, defaultSlides, language]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const fetchHomeData = async () => {
    try {
      const { data: mainSnap } = await supabase.from('content').select('*').eq('id', 'main').single();
      if (mainSnap) setContent({
        heroTitle: mainSnap.hero_title,
        heroSubtext: mainSnap.hero_subtext,
        memberCountOffset: mainSnap.member_count_offset
      });

      const { data: newsSnap } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3);
      if (newsSnap) setNews(newsSnap.map(n => ({ ...n, createdAt: new Date(n.created_at) })));

      const { data: noticesSnap } = await supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(5);
      if (noticesSnap) setNotices(noticesSnap.map(n => ({ ...n, createdAt: new Date(n.created_at) })));

      const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
      if (count !== null) setRealMemberCount(count);

      // 1. Read featured event IDs from content table banner_url
      let featuredIds = [];
      if (mainSnap?.banner_url) {
        try {
          const parsed = JSON.parse(mainSnap.banner_url);
          if (Array.isArray(parsed)) featuredIds = parsed;
        } catch (_) {}
      }

      // 2. Fetch published events
      let { data: eventsSnap } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!eventsSnap || eventsSnap.length === 0) {
        const anySnap = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        eventsSnap = anySnap.data || [];
      }

      const allEventsList = eventsSnap || [];

      // 3. Filter featured/important events for Hero Slider
      const featured = allEventsList.filter((ev) =>
        Boolean(ev.is_featured || ev.isFeatured || (Array.isArray(featuredIds) && featuredIds.includes(ev.id)))
      );
      setFeaturedEvents(featured);

      // 4. Set upcomingEvent for the "NEXT BIG EVENT" section
      if (allEventsList.length > 0) {
        const ev = featured.length > 0 ? featured[0] : allEventsList[0];
        const eventImg =
          ev.imageUrl ||
          ev.image_url ||
          (Array.isArray(ev.imageUrls) ? ev.imageUrls[0] : null) ||
          banner;

        const rawDate = ev.event_date || ev.eventDate || ev.date;
        let formattedDateString = '';
        if (rawDate) {
          if (typeof rawDate === 'string' && rawDate.includes(' to ')) {
            const [s, e] = rawDate.split(' to ');
            const ds = new Date(s.trim());
            const de = new Date(e.trim());
            if (!isNaN(ds.getTime()) && !isNaN(de.getTime())) {
              formattedDateString = `${ds.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${de.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
            } else {
              formattedDateString = rawDate;
            }
          } else {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              formattedDateString = d.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            } else {
              formattedDateString = String(rawDate);
            }
          }
        }

        setUpcomingEvent({
          ...ev,
          imageUrl: eventImg,
          image_url: eventImg,
          displayDate: formattedDateString,
          location: ev.venue || ev.location || ev.address || 'Designated Venue',
          time: (ev.start_time && ev.end_time)
            ? `${ev.start_time} - ${ev.end_time}`
            : (ev.start_time || ev.time || '09:00 AM - 05:00 PM'),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  return (
    <div className="relative overflow-hidden bg-white text-slate-900">

      {/* Hero Slider */}
      {(() => {
        const safeIndex = currentSlide % (slides.length || 1);
        const activeSlide = slides[safeIndex] || slides[0] || {};

        return (
          <section className="relative h-screen w-full overflow-hidden bg-slate-950">
            <AnimatePresence mode="wait">
              <motion.div
                key={safeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 z-0"
              >
                {/* Background Image Layer */}
                <motion.div
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 8, ease: "easeOut" }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${activeSlide.image || event1})` }}
                >
                  {/* High contrast, cinematic overlay tailored to slide type */}
                  {activeSlide.isBannerShowcase ? (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
                  ) : activeSlide.isEventSlide ? (
                    <>
                      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-slate-950/60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
                    </>
                  )}
                </motion.div>

                <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="max-w-5xl"
                  >
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 48 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="h-[1px] w-12 bg-secondary-yellow/60 mx-auto mb-6"
                    />

                    {/* Tagline / Badge */}
                    <motion.div
                      initial={{ opacity: 0, letterSpacing: "0.5em" }}
                      animate={{ opacity: 1, letterSpacing: "0.3em" }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="text-secondary-yellow text-[10px] md:text-xs font-black uppercase tracking-[0.3em] inline-flex flex-wrap items-center justify-center gap-2 mb-6"
                    >
                      {activeSlide.isEventSlide && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                          <Star size={12} className="fill-slate-950" /> Important Event
                        </span>
                      )}
                      <span>{activeSlide.tagline}</span>
                    </motion.div>

                    {/* Banner Showcase Slide: Let the poster graphic shine without giant overlapping title */}
                    {activeSlide.isBannerShowcase ? (
                      <div className="my-8 md:my-14">
                        <div className="inline-block px-6 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20 text-white/95 text-xs md:text-sm font-semibold mb-8 shadow-xl">
                          {language === 'mr' ? 'महाराष्ट्रभरातील प्रयोगशाळा व्यावसायिकांचे अधिकृत व्यासपीठ' : 'Empowering Clinical Laboratory Professionals Across Maharashtra'}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-4">
                          <Link
                            to="/signup"
                            className="w-full sm:w-auto justify-center px-8 sm:px-12 py-3.5 sm:py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl flex items-center gap-3 transition-all"
                          >
                            <span>{t.primaryCTA1}</span> <ArrowRight size={16} />
                          </Link>
                          <Link
                            to="/about"
                            className="w-full sm:w-auto justify-center px-8 sm:px-12 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-black uppercase tracking-[0.2em] rounded-2xl backdrop-blur-md transition-all text-center"
                          >
                            {t.secondaryCTA1}
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Title */}
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.6 }}
                          className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-4 sm:mb-8 leading-[1.15] sm:leading-[1.1] tracking-tight whitespace-pre-line drop-shadow-2xl"
                        >
                          {activeSlide.title}
                        </motion.h1>

                        {/* Event Metadata Capsule */}
                        {activeSlide.isEventSlide ? (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.85, duration: 0.6 }}
                            className="flex flex-col items-center mb-10"
                          >
                            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-4">
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 text-white text-xs md:text-sm font-semibold shadow-lg">
                                <Calendar size={15} className="text-secondary-yellow" />
                                <span>{activeSlide.eventDateFormatted}</span>
                              </div>
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 text-white text-xs md:text-sm font-semibold shadow-lg">
                                <MapPin size={15} className="text-secondary-yellow" />
                                <span className="uppercase">{activeSlide.venue}</span>
                              </div>
                              {activeSlide.eventTime && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 text-white text-xs md:text-sm font-semibold shadow-lg">
                                  <Clock size={15} className="text-secondary-yellow" />
                                  <span>{activeSlide.eventTime}</span>
                                </div>
                              )}
                            </div>
                            {activeSlide.description && (
                              <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto italic font-normal">
                                "{activeSlide.description}"
                              </p>
                            )}
                          </motion.div>
                        ) : (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.6 }}
                            className="text-base md:text-xl text-white/80 mb-10 leading-relaxed font-medium max-w-2xl mx-auto tracking-wide"
                          >
                            {activeSlide.subtitle}
                          </motion.p>
                        )}

                        {/* CTA Buttons */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.05, duration: 0.6 }}
                          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 relative z-20 w-full sm:w-auto"
                        >
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                            <Link
                              to={activeSlide.primaryLink || '/signup'}
                              className={
                                activeSlide.isEventSlide
                                  ? "w-full sm:w-auto justify-center px-8 sm:px-12 py-3.5 sm:py-4 bg-gradient-to-r from-secondary-yellow to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-secondary-yellow/30 flex items-center gap-3"
                                  : "w-full sm:w-auto justify-center group relative px-8 sm:px-14 py-3.5 sm:py-5 bg-white text-primary-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl flex items-center gap-3 overflow-hidden"
                              }
                            >
                              <span className="relative z-10 flex items-center gap-3">
                                {activeSlide.primaryCTA} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                              </span>
                              {!activeSlide.isEventSlide && (
                                <motion.div
                                  initial={{ y: "100%" }}
                                  whileHover={{ y: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="absolute inset-0 bg-secondary-yellow"
                                />
                              )}
                            </Link>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                            <Link
                              to={activeSlide.secondaryLink || '/about'}
                              className="w-full sm:w-auto block text-center px-8 sm:px-14 py-3.5 sm:py-5 bg-transparent border-2 border-white/20 text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all backdrop-blur-md"
                            >
                              {activeSlide.secondaryCTA}
                            </Link>
                          </motion.div>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20"
            >
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${safeIndex === idx
                    ? 'w-10 h-1.5 bg-secondary-yellow'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                    }`}
                />
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              whileHover={{ scale: 1.1, x: -5 }}
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              whileHover={{ scale: 1.1, x: 5 }}
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
            >
              <ChevronRight size={20} />
            </motion.button>
          </section>
        );
      })()}

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="py-24 bg-white border-b border-slate-50 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            <motion.div variants={fadeInUp}>
              <StatCard icon={<Users />} label={t.memberNetwork} value="5000+" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard icon={<Globe />} label={t.maharashtraReach} value="25+ Districts" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard icon={<Calendar />} label={t.workshopsPerYear} value="12+ Sessions" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard icon={<Shield />} label={t.certifiedQuality} value="100% Secure" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Why Join ACLAP? */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-16 sm:py-24 md:py-32 bg-[#fdfcf5] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-yellow/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary-600 text-[11px] font-black uppercase tracking-[0.4em] mb-4 block"
            >
              {t.membershipPerks}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-7xl font-black text-accent-maroon tracking-tight leading-tight mb-4 sm:mb-6"
            >
              {t.whyJoin} <span className="text-primary-600">{t.aclap}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-lg max-w-2xl mx-auto font-medium"
            >
              {t.joinSubtext}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-primary-600" />, title: t.networkingTitle, desc: t.networkingDesc },
              { icon: <Award className="text-primary-600" />, title: t.certificationTitle, desc: t.certificationDesc },
              { icon: <MessageSquare className="text-primary-600" />, title: t.resourcesTitle, desc: t.resourcesDesc },
              { icon: <Shield className="text-primary-600" />, title: t.legalSupportTitle, desc: t.legalSupportDesc },
              { icon: <Heart className="text-primary-600" />, title: t.welfareSchemesTitle, desc: t.welfareSchemesDesc },
              { icon: <Users className="text-primary-600" />, title: t.careerGrowthTitle, desc: t.careerGrowthDesc },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="p-8 md:p-10 bg-white border border-secondary-yellow/20 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-secondary-yellow/5 hover:border-primary-500 transition-all group cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-secondary-yellow/10 rounded-2xl flex items-center justify-center mb-6 transition-all"
                >
                  {React.cloneElement(benefit.icon, { size: 32 })}
                </motion.div>
                <h3 className="text-2xl font-bold text-accent-maroon mb-3 tracking-tight">{benefit.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* In Loving Memory */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-32 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-2 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            <motion.div
              variants={fadeInLeft}
              className="lg:w-1/3 relative"
            >
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="absolute inset-0 bg-secondary-yellow/20 rounded-[3rem] translate-x-4 translate-y-4 -z-10"
              />
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-[3.5rem] shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden"
              >
                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  src={img1}
                  alt="Late Shri Annasaheb Siddappa Karole"
                  className="w-full h-auto rounded-[2.5rem]"
                />
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeInRight}
              className="lg:w-2/3 space-y-8"
            >
              <div className="space-y-4">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-primary-600 text-[11px] font-black uppercase tracking-[0.4em] block"
                >
                  {t.eternalInspiration}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-5xl md:text-7xl font-black text-accent-maroon tracking-tight leading-tight"
                >
                  <span className="text-primary-600">{t.memoryName}</span>
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-sm"
                >
                  <span>{t.memoryDate.split(' — ')[0]}</span>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 32 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-[1px] bg-slate-200"
                  />
                  <span>{t.memoryDate.split(' — ')[1]}</span>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 text-xl leading-relaxed font-medium"
              >
                {t.memoryDesc}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.02 }}
                className="pt-4"
              >
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-secondary-yellow/10 rounded-2xl text-accent-maroon text-sm font-black uppercase tracking-widest border border-secondary-yellow/20">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
                  >
                    <Heart className="text-primary-600" size={18} fill="currentColor" />
                  </motion.div>
                  {t.eternalLegacy}
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* Knowledge Hub & Bulletin Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid lg:grid-cols-12 gap-20 items-start">

            <div className="lg:col-span-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6"
              >
                <motion.div variants={fadeInUp} className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 text-primary-600 text-[11px] font-black uppercase tracking-[0.3em]"
                  >
                    <Sparkles size={16} /> {t.knowledgeHub}
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-accent-maroon tracking-tight leading-tight">{t.latestIntel}</h2>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Link to="/news" className="text-primary-600 text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-primary-600 pb-1 hover:text-accent-maroon hover:border-accent-maroon transition-all">{t.exploreAllNews}</Link>
                </motion.div>
              </motion.div>

              <div className="space-y-12">
                {news.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={{ x: 10 }}
                    className="group cursor-pointer flex gap-8 items-start"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 + 0.1 }}
                      className="hidden sm:block text-right min-w-[100px]"
                    >
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="block text-4xl font-black text-secondary-yellow group-hover:text-primary-600 transition-colors leading-none"
                      >
                        {item.createdAt?.getDate?.() || new Date(item.createdAt).getDate()}
                      </motion.span>
                      <span className="text-[11px] font-black uppercase text-slate-300 tracking-widest">{((item.createdAt?.toLocaleString) ? item.createdAt : new Date(item.createdAt)).toLocaleString(language === 'mr' ? 'mr-IN' : 'en-US', { month: 'short' })}</span>
                    </motion.div>
                    <div className="flex-grow">
                      <h3 className="text-3xl font-bold text-accent-maroon mb-4 group-hover:text-primary-600 transition-colors leading-tight tracking-tight">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed line-clamp-2 text-base font-medium">{item.content}</p>
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="mt-6 text-[11px] font-black uppercase text-primary-600 tracking-[0.2em] flex items-center transition-all gap-1"
                      >
                        {t.readStory} <ArrowRight size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-4 lg:sticky lg:top-32"
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-2 border-secondary-yellow/20 rounded-[3rem] p-10 shadow-2xl shadow-secondary-yellow/5"
              >
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-2xl font-black text-accent-maroon tracking-tight flex items-center gap-3">
                    <Bell className="text-primary-600" size={24} /> {t.bulletin}
                  </h2>
                  <div className="flex gap-1">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 rounded-full bg-red-500"
                    />
                    <span className="w-2 h-2 rounded-full bg-red-500/30" />
                  </div>
                </div>

                <div className="space-y-10">
                  {notices.map((notice, idx) => (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 5 }}
                      className="group cursor-pointer border-l-2 border-transparent hover:border-primary-500 pl-4 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${notice.priority === 'Urgent' ? 'bg-red-500 text-white' : 'bg-primary-100 text-primary-600'}`}
                        >
                          {notice.priority === 'Urgent' ? t.urgent : notice.priority}
                        </motion.span>
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{((notice.createdAt?.toLocaleDateString) ? notice.createdAt : new Date(notice.createdAt)).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <h4 className="text-slate-800 font-bold group-hover:text-primary-600 transition-colors text-lg leading-snug">{notice.title}</h4>
                    </motion.div>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/notices" className="mt-12 block text-center py-4 bg-secondary-yellow/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-accent-maroon hover:bg-secondary-yellow/30 transition-all">
                    {t.viewAllNotices}
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Testimonials Section - Empty */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="py-32 bg-[#fdfcf5]"
      >
        <div className="max-w-7xl mx-auto px-2">
          <div className="text-center mb-20">
            <motion.h2
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-black text-accent-maroon tracking-tighter leading-tight"
            >
              {t.membersVoice}
            </motion.h2>
          </div>
          <div className="flex items-center justify-center min-h-[200px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                💬
              </motion.div>
              <p className="text-2xl font-bold text-slate-400 tracking-tight">Coming Soon</p>
              <p className="text-slate-400">Member testimonials will appear here</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Upcoming Event Banner */}
      {upcomingEvent && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative w-full min-h-[500px] py-16 sm:py-24 md:h-[600px] overflow-hidden flex items-center justify-center bg-slate-950"
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={upcomingEvent.imageUrl || upcomingEvent.image_url || event1 || banner}
              alt={upcomingEvent.title || 'Event Banner'}
              onError={(e) => {
                e.currentTarget.src = event1;
              }}
              className="w-full h-full object-cover transition-transform duration-1000 scale-100 hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/80" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 mb-6 sm:mb-8 px-4 py-1.5 bg-primary-600/20 border border-primary-600/30 rounded-full backdrop-blur-md"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2 h-2 rounded-full bg-primary-500"
                />
                <span className="text-[11px] font-black text-primary-400 uppercase tracking-[0.3em]">{t.nextBigEvent}</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 sm:mb-8 tracking-tight leading-tight"
              >
                {upcomingEvent.title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-12 text-white/80"
              >
                <motion.div whileHover={{ y: -3 }} className="flex items-center gap-2 sm:gap-3">
                  <Calendar size={18} className="text-secondary-yellow sm:w-[22px] sm:h-[22px]" />
                  <span className="text-xs sm:text-base font-bold uppercase tracking-wider sm:tracking-widest">
                    {upcomingEvent.displayDate || formatEventDate(upcomingEvent, language)}
                  </span>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="flex items-center gap-2 sm:gap-3">
                  <MapPin size={18} className="text-secondary-yellow sm:w-[22px] sm:h-[22px]" />
                  <span className="text-xs sm:text-base font-bold uppercase tracking-wider sm:tracking-widest">{upcomingEvent.venue || upcomingEvent.location || upcomingEvent.address || 'Venue TBA'}</span>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="flex items-center gap-2 sm:gap-3">
                  <Clock size={18} className="text-secondary-yellow sm:w-[22px] sm:h-[22px]" />
                  <span className="text-xs sm:text-base font-bold uppercase tracking-wider sm:tracking-widest">{formatEventTime(upcomingEvent)}</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Link
                    to={`/event-registration/${upcomingEvent.id}`}
                    className="w-full sm:w-auto justify-center px-8 sm:px-14 py-3.5 sm:py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-primary-600/40 flex items-center gap-3"
                  >
                    {t.registerNow} <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={20} /></motion.div>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Link
                    to="/events"
                    className="w-full sm:w-auto block text-center px-8 sm:px-14 py-3.5 sm:py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-black text-xs sm:text-sm uppercase tracking-[0.2em] rounded-2xl transition-all"
                  >
                    {t.learnMore}
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="text-center group"
  >
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="flex justify-center mb-4"
    >
      <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
        {React.cloneElement(icon, { size: 28, strokeWidth: 1.5 })}
      </div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-5xl font-black text-accent-maroon mb-2 tracking-tight"
    >
      {value}
    </motion.div>
    <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">{label}</div>
  </motion.div>
);

export default Home;