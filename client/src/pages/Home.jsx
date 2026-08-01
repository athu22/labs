import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Users, Calendar, CheckCircle, Newspaper, Bell, ArrowRight, ChevronLeft, ChevronRight, Globe, Shield, Sparkles, Zap, Heart, MessageSquare, MapPin, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, doc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { LanguageContext } from '../context/LanguageContext';
import img1 from '../assets/img1.jpeg';

// Import single banner image from assets
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
  const [bannerLoading, setBannerLoading] = useState(true);

  const slides = [
    {
      image: banner,
      tagline: t.heroTagline1,
      title: t.heroTitle1,
      subtitle: t.heroSubtitle1,
      primaryCTA: t.primaryCTA1,
      secondaryCTA: t.secondaryCTA1
    },
    {
      image: banner,
      tagline: t.heroTagline2,
      title: t.heroTitle2,
      subtitle: t.heroSubtitle2,
      primaryCTA: t.primaryCTA2,
      secondaryCTA: t.secondaryCTA2
    },
    {
      image: banner,
      tagline: t.heroTagline3,
      title: t.heroTitle3,
      subtitle: t.heroSubtitle3,
      primaryCTA: t.primaryCTA3,
      secondaryCTA: t.secondaryCTA3
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
      <section className="relative h-screen w-full overflow-hidden bg-[#140303]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <motion.div
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            >
              <div className="absolute inset-0 bg-[#f16522]/30 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140303] via-transparent to-[#140303]/40" />
            </motion.div>

            <div className="relative h-full max-w-7xl mx-auto px-2 flex flex-col items-center justify-center text-center z-10">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="max-w-5xl"
              >
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 48 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="h-[1px] w-12 bg-secondary-yellow/40 mx-auto mb-6"
                />

                <motion.span
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={{ opacity: 1, letterSpacing: "0.3em" }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-secondary-yellow text-[10px] font-black uppercase tracking-[0.3em] block mb-6"
                >
                  {slides[currentSlide].tagline}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight whitespace-pre-line drop-shadow-2xl"
                >
                  {slides[currentSlide].title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="text-base md:text-xl text-white/80 mb-12 leading-relaxed font-medium max-w-2xl mx-auto tracking-wide"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-20"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/signup"
                      className="group relative px-14 py-5 bg-white text-primary-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl flex items-center gap-3 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {slides[currentSlide].primaryCTA} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                      <motion.div
                        initial={{ y: "100%" }}
                        whileHover={{ y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-secondary-yellow"
                      />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/about"
                      className="px-14 py-5 bg-transparent border-2 border-white/20 text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all backdrop-blur-md"
                    >
                      {slides[currentSlide].secondaryCTA}
                    </Link>
                  </motion.div>
                </motion.div>
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
              className={`transition-all duration-300 rounded-full ${currentSlide === idx
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
        className="py-32 bg-[#fdfcf5] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-yellow/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="max-w-7xl mx-auto px-2 relative z-10">
          <div className="text-center mb-20">
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
              className="text-5xl md:text-7xl font-black text-accent-maroon tracking-tighter leading-tight mb-6"
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
                  className="text-5xl md:text-7xl font-black text-accent-maroon tracking-tighter leading-tight"
                >
                  <br /> <span className="text-primary-600">{t.memoryName}</span>
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
                  <h2 className="text-5xl md:text-6xl font-black text-accent-maroon tracking-tighter leading-none">{t.latestIntel}</h2>
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
                        {item.createdAt?.toDate().getDate()}
                      </motion.span>
                      <span className="text-[11px] font-black uppercase text-slate-300 tracking-widest">{item.createdAt?.toDate().toLocaleString(language === 'mr' ? 'mr-IN' : 'en-US', { month: 'short' })}</span>
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
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{notice.createdAt?.toDate().toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short' })}</span>
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
          className="relative w-full h-[600px] overflow-hidden flex items-center justify-center"
        >
          <div className="absolute inset-0 z-0">
            {upcomingEvent.imageUrl || (upcomingEvent.imageUrls && upcomingEvent.imageUrls.length > 0) ? (
              <>
                {bannerLoading && (
                  <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Loader2 className="text-primary-600 animate-spin" size={40} />
                    </motion.div>
                  </div>
                )}
                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: bannerLoading ? 0 : 1 }}
                  transition={{ duration: 1.5 }}
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
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-2 text-center">
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
                className="inline-flex items-center gap-3 mb-8 px-4 py-1.5 bg-primary-600/20 border border-primary-600/30 rounded-full backdrop-blur-md"
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
                className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[1.1]"
              >
                {upcomingEvent.title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-8 mb-12 text-white/70"
              >
                <motion.div whileHover={{ y: -3 }} className="flex items-center gap-3">
                  <Calendar size={22} className="text-primary-500" />
                  <span className="text-base font-bold uppercase tracking-widest">
                    {new Date(upcomingEvent.date).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="flex items-center gap-3">
                  <MapPin size={22} className="text-primary-500" />
                  <span className="text-base font-bold uppercase tracking-widest">{upcomingEvent.location}</span>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="flex items-center gap-3">
                  <Clock size={22} className="text-primary-500" />
                  <span className="text-base font-bold uppercase tracking-widest">{upcomingEvent.time || '09:00 AM - 05:00 PM'}</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/event-registration/${upcomingEvent.id}`}
                    className="px-14 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-primary-600/40 flex items-center gap-3"
                  >
                    {t.registerNow} <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={20} /></motion.div>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/events"
                    className="px-14 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all"
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