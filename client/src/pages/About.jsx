import React, { useState, useEffect, useContext } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import {
  Shield, Target, Eye, Users, Award, BookOpen, Heart, Globe,
  ChevronRight, ArrowRight, Calendar, MapPin, Clock, CheckCircle,
  Sparkles, TrendingUp, Zap, Star, Building2, Mail, Phone, MapPinned,
  Crown, Briefcase, GraduationCap, Microscope, FlaskConical,
  TestTube, Stethoscope, Activity, BarChart3, Layers, ShieldCheck,
  UserCheck, Handshake, Lightbulb, Rocket, Gem, Leaf, ThumbsUp,
  FileText, Wallet, Play, Pause, Quote, MessageCircle, Instagram,
  Facebook, Twitter, Linkedin, Youtube, PenTool, Coffee, Smile, Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

// Import member images from assets
import member1 from '../assets/member1.png';
import member2 from '../assets/member2.png';
import member3 from '../assets/member3.png';
import member4 from '../assets/member4.png';
import member5 from '../assets/member5.png';

// First Executive Committee images
import fMember1 from '../assets/committee/member_1.jpeg';
import fMember2 from '../assets/committee/member_2.jpeg';
import fMember3 from '../assets/committee/member_3.jpeg';
import fMember4 from '../assets/committee/member_4.jpeg';
import fMember5 from '../assets/committee/member_5.jpeg';
import fMember6 from '../assets/committee/member_6.jpeg';
import fMember7 from '../assets/committee/member_7.jpeg';
import fMember8 from '../assets/committee/member_8.jpeg';
import fMember9 from '../assets/committee/member_9.jpeg';
import fMember10 from '../assets/committee/member_10.jpeg';
import fMember11 from '../assets/committee/member_11.jpeg';
import fMember12 from '../assets/committee/member_12.jpeg';
import fMember13 from '../assets/committee/member_13.jpeg';
import fMember14 from '../assets/committee/member_14.jpeg';
import fMember15 from '../assets/committee/member_15.jpeg';
import fMember16 from '../assets/committee/member_16.jpeg';
import fMember17 from '../assets/committee/member_17.jpeg';
import fMember18 from '../assets/committee/member_18.jpeg';
import fMember19 from '../assets/committee/member_19.jpeg';

// Second Executive Committee images
import sMember1 from '../assets/second_committee/face_1.jpeg';
import sMember2 from '../assets/second_committee/face_2.jpeg';
import sMember3 from '../assets/second_committee/face_3.jpeg';
import sMember4 from '../assets/second_committee/face_4.jpeg';
import sMember5 from '../assets/second_committee/face_5.jpeg';
import sMember6 from '../assets/second_committee/face_6.jpeg';
import sMember7 from '../assets/second_committee/face_7.jpeg';
import sMember8 from '../assets/second_committee/face_8.jpeg';
import sMember9 from '../assets/second_committee/face_9.jpeg';
import sMember10 from '../assets/second_committee/face_10.jpeg';
import sMember11 from '../assets/second_committee/face_11.jpeg';
import sMember12 from '../assets/second_committee/face_12.jpeg';
import sMember13 from '../assets/second_committee/face_13.jpeg';
import sMember14 from '../assets/second_committee/face_14.jpeg';
import sMember15 from '../assets/second_committee/face_15.jpeg';
import sMember16 from '../assets/second_committee/face_16.jpeg';
import sMember17 from '../assets/second_committee/face_17.jpeg';
import sMember18 from '../assets/second_committee/face_18.jpeg';
import sMember19 from '../assets/second_committee/face_19.jpeg';
import sMember20 from '../assets/second_committee/face_20.jpeg';

// Translations for About Page
const translations = {
  en: {
    // Hero
    sinceText: 'Since 2005 | Est. Maharashtra',
    heroTitle: 'Pioneering',
    heroTitleHighlight: 'Clinical',
    heroTitleEnd: 'Laboratory Excellence',
    heroDesc: 'Association of Clinical Laboratory Analysts & Practitioners (ACLAP) — transforming diagnostic standards across Maharashtra through innovation, education, and professional unity.',
    getInTouch: 'Get in Touch',
    joinACLAP: 'Join ACLAP',
    trustedBy: 'Trusted by 4,500+ professionals',

    // Stats
    yearsOfExcellence: 'Years of Excellence',
    districtsCovered: 'Districts Covered',
    certifiedMembers: 'Certified Members',
    industryLeadership: 'Industry leadership since 2004',
    completeCoverage: 'Complete state coverage',
    andGrowing: 'And growing daily',

    // Vision & Mission
    ourVision: 'Our Vision',
    ourMission: 'Our Mission',
    visionDesc: 'Our vision is to build a future where every laboratory professional is respected, empowered, and recognized as a vital pillar of healthcare. We aspire to advance excellence in laboratory science through quality, innovation, ethics, and lifelong learning. Together, we aim to strengthen diagnostic services and create healthier communities.',
    visionTagline: '“Shaping the Future of Laboratory Excellence.”',
    missionDesc: 'Our mission is to empower laboratory professionals through excellence in education, innovation, and collaboration. We are committed to promoting quality diagnostics, ethical practice, and continuous professional development. By strengthening the laboratory profession, we strive to improve patient care and contribute to a healthier society.',
    missionTagline: '“Empowering Professionals. Advancing Diagnostics. Serving Society.”',
    exploreVision: 'Explore Vision',
    discoverMission: 'Discover Mission',
    ourGoal: 'Our Goal',

    // Governance
    leadershipFramework: 'Leadership Framework',
    governanceHierarchy: 'Governance',
    governanceDesc: 'A decentralized democratic structure ensuring representation from every corner of Maharashtra',
    stateExecutive: 'State Executive Committee',
    stateRole: 'Strategic Governance',
    stateDesc: 'The supreme governing body responsible for statewide clinical regulations, policy formulation, and strategic healthcare partnerships.',
    districtCommittee: 'District Committee',
    districtRole: 'Regional Administration',
    districtDesc: 'Governing units for each of Maharashtra\'s 36 districts, managing regional member activities and addressing local healthcare challenges.',
    talukaReps: 'Taluka Representatives',
    talukaRole: 'Local Coordination',
    talukaDesc: 'Frontline coordinators serving as primary contact points for laboratory practitioners, facilitating workshops and registrations.',
    generalBody: 'General Body Members',
    generalRole: 'Clinical Practitioners',
    generalDesc: 'The heartbeat of ACLAP—certified professionals upholding laboratory excellence across every district of Maharashtra.',

    // Core Values
    corePrinciples: 'Core Principles',
    valuesDefine: 'The Values That',
    defineUs: 'Define Us',
    valuesDesc: 'The foundational pillars that guide every decision and action at ACLAP',

    // Leadership
    ourLeaders: 'Our Leaders',
    executiveBoard: 'Meet Our',
    executiveBoardEnd: 'Executive Board',
    leadershipDesc: 'Visionary leaders committed to advancing clinical laboratory excellence',

    // First Executive Committee
    firstExecutiveBoard: 'First',
    firstExecutiveBoardEnd: 'Executive Committee',
    firstExecutiveBoardDesc: 'The visionary founders who laid the foundation of ACLAP',
    secondExecutiveBoard: 'Second',
    secondExecutiveBoardEnd: 'Executive Committee',
    secondExecutiveBoardDesc: 'The visionary leaders who expanded the reach of ACLAP',
    viewCommittee: 'View Committee',
    hideCommittee: 'Hide Committee',

    // Achievements
    ourAchievements: 'Our Achievements',

    // Why Join ACLAP
    whyJoinAclap: 'Why Join ACLAP?',
    whyJoinTaglineStart: 'Together We Protect.',
    whyJoinTaglineEnd: 'Together We Progress.',
    whyJoinDesc: 'ACLAP is Maharashtra’s trusted association dedicated to empowering Clinical Laboratory Analysts and Practitioners. We work collectively to protect professional rights, promote scientific excellence, and strengthen the future of laboratory professionals through unity, advocacy, and continuous development.',

    // Testimonials - Empty
    membersSay: 'What Our',
    membersSayEnd: 'Members Say',

    // Membership Process
    joinACLAPTitle: 'Join ACLAP',
    membershipProcess: 'Membership',
    processEnd: 'Verification Process',
    processDesc: 'A streamlined, secure, and transparent 4-step process to join our professional community',
    digitalApplication: 'Digital Application Submission',
    digitalAppDesc: 'Practitioners submit professional credentials through our encrypted secure portal.',
    documentVerification: 'Document Verification',
    documentVerifDesc: 'District Executive Committees verify academic and registration documents.',
    feeSettlement: 'Fee Settlement',
    feeSettleDesc: 'Upon verification, members contribute to the association welfare fund.',
    digitalID: 'Digital ID Issuance',
    digitalIDDesc: 'Official ACLAP Member ID and certificate generated for records.',
    processingTime: '95% of applications are processed within 5 working days',
    verifiedSecurity: '100% Verified Security',
    securityDesc: 'Our multi-tier verification process ensures only qualified practitioners represent ACLAP, maintaining the highest professional standards and trust.',
    isoCertified: 'ISO 9001:2024 Certified',
    govRecognized: 'Government Recognized',
    gdprCompliant: 'GDPR Compliant',

    // CTA
    ctaTitle: 'Ready to Transform Laboratory',
    ctaTitleEnd: 'Healthcare in Maharashtra?',
    ctaDesc: 'Join India\'s fastest-growing association of clinical laboratory professionals and be part of the diagnostic revolution.',
    registerNow: 'Register Now',
    contactUs: 'Contact Us',
  },
  mr: {
    // Hero
    sinceText: '२००५ पासून | स्था. महाराष्ट्र',
    heroTitle: 'प्रणेता',
    heroTitleHighlight: 'नैदानिक',
    heroTitleEnd: 'प्रयोगशाळा उत्कृष्टता',
    heroDesc: 'असोसिएशन ऑफ क्लिनिकल लॅबोरेटरी ॲनालिस्ट्स अँड प्रॅक्टिशनर्स (ACLAP) — नवोपक्रम, शिक्षण आणि व्यावसायिक एकता यांच्या माध्यमातून महाराष्ट्रातील निदान मानकांचे परिवर्तन.',
    getInTouch: 'संपर्क करा',
    joinACLAP: 'ACLAP मध्ये सामील व्हा',
    trustedBy: '४,५००+ व्यावसायिकांचा विश्वास',

    // Stats
    yearsOfExcellence: 'उत्कृष्टतेची वर्षे',
    districtsCovered: 'जिल्हे व्याप्ती',
    certifiedMembers: 'प्रमाणित सदस्य',
    industryLeadership: '२००४ पासून उद्योग नेतृत्व',
    completeCoverage: 'पूर्ण राज्य व्याप्ती',
    andGrowing: 'आणि दररोज वाढत आहे',

    // Vision & Mission
    ourVision: 'आमची दृष्टी',
    ourMission: 'आमचे ध्येय',
    visionDesc: 'प्रत्येक प्रयोगशाळा व्यावसायिकाला सन्मान, सक्षम संधी आणि आरोग्य व्यवस्थेतील महत्त्वपूर्ण स्थान मिळावे, हीच आमची दृष्टी आहे. गुणवत्ता, विज्ञान, नवोपक्रम, नैतिकता आणि सातत्यपूर्ण शिक्षण यांच्या आधारावर प्रयोगशाळा क्षेत्रात उत्कृष्टतेची नवी उंची गाठणे हे आमचे ध्येय आहे. सक्षम निदान सेवा आणि निरोगी समाज घडविण्यासाठी आम्ही कटिबद्ध आहोत.',
    visionTagline: '“उत्कृष्ट प्रयोगशाळा सेवांद्वारे निरोगी भविष्य घडविण्याचा संकल्प.”',
    missionDesc: 'आमचे ध्येय म्हणजे शिक्षण, नवोपक्रम आणि सहकार्य यांच्या माध्यमातून प्रयोगशाळा व्यावसायिकांना सक्षम करणे. गुणवत्तापूर्ण निदान सेवा, नैतिक व्यावसायिक आचरण आणि सातत्यपूर्ण कौशल्यविकासाला प्रोत्साहन देणे ही आमची बांधिलकी आहे. सक्षम प्रयोगशाळा व्यवसायाच्या माध्यमातून उत्तम रुग्णसेवा आणि निरोगी समाज घडविण्यासाठी आम्ही कार्यरत आहोत.',
    missionTagline: '“व्यावसायिकांचे सक्षमीकरण • गुणवत्तापूर्ण निदान • समाजसेवा”',
    exploreVision: 'दृष्टी पहा',
    discoverMission: 'ध्येय पहा',
    ourGoal: 'आमचे उद्दिष्ट',

    // Governance
    leadershipFramework: 'नेतृत्व रचना',
    governanceHierarchy: 'प्रशासकीय',
    governanceDesc: 'महाराष्ट्राच्या प्रत्येक कोपऱ्यातून प्रतिनिधित्व सुनिश्चित करणारी विकेंद्रित लोकशाही रचना',
    stateExecutive: 'राज्य कार्यकारिणी समिती',
    stateRole: 'रणनीतिक प्रशासन',
    stateDesc: 'राज्यव्यापी नैदानिक नियम, धोरण निर्मिती आणि रणनीतिक आरोग्य भागीदारीसाठी जबाबदार सर्वोच्च प्रशासकीय संस्था.',
    districtCommittee: 'जिल्हा प्रतिनिधी',
    districtRole: 'प्रादेशिक प्रशासन',
    districtDesc: 'महाराष्ट्राच्या ३६ जिल्ह्यांसाठी प्रशासकीय एकके, प्रादेशिक सदस्य क्रियाकलाप व्यवस्थापित करणे आणि स्थानिक आरोग्य आव्हानांना सामोरे जाणे.',
    talukaReps: 'तालुका प्रतिनिधी',
    talukaRole: 'स्थानिक समन्वय',
    talukaDesc: 'प्रयोगशाळा व्यावसायिकांसाठी प्राथमिक संपर्क बिंदू म्हणून कार्य करणारे फ्रंटलाइन समन्वयक, कार्यशाळा आणि नोंदणी सुलभ करणे.',
    generalBody: 'ACLAP सभा सदस्य',
    generalRole: 'नैदानिक व्यावसायिक',
    generalDesc: 'ACLAP चा हृदयस्पर्शी भाग—महाराष्ट्राच्या प्रत्येक जिल्ह्यात प्रयोगशाळा उत्कृष्टता कायम ठेवणारे प्रमाणित व्यावसायिक.',

    // Core Values
    corePrinciples: 'मूलभूत तत्त्वे',
    valuesDefine: 'आम्हाला व्याख्या देणारी',
    defineUs: 'मूल्ये',
    valuesDesc: 'ACLAP मधील प्रत्येक निर्णय आणि कृतीला मार्गदर्शन करणारे मूलभूत स्तंभ',

    // Leadership
    ourLeaders: 'आमचे नेते',
    executiveBoard: 'आमची',
    executiveBoardEnd: 'पदाधिकारी मंडळ',
    leadershipDesc: 'नैदानिक प्रयोगशाळा उत्कृष्टतेसाठी वचनबद्ध दूरदर्शी नेते',

    // First Executive Committee
    firstExecutiveBoard: 'पहिली',
    firstExecutiveBoardEnd: 'कार्यकारिणी समिती',
    firstExecutiveBoardDesc: 'ACLAP चा पाया रचणारे दूरदर्शी संस्थापक',
    secondExecutiveBoard: 'दुसरी',
    secondExecutiveBoardEnd: 'कार्यकारिणी समिती',
    secondExecutiveBoardDesc: 'ACLAP ची व्याप्ती वाढवणारे दूरदर्शी नेते',
    viewCommittee: 'समिती पहा',
    hideCommittee: 'समिती लपवा',

    // Achievements
    ourAchievements: 'आमची उपलब्धी',

    // Why Join ACLAP
    whyJoinAclap: 'ACLAP मध्ये का सामील व्हावे?',
    whyJoinTaglineStart: 'एकत्रितपणे आपण संरक्षण करतो.',
    whyJoinTaglineEnd: 'एकत्रितपणे आपण प्रगती करतो.',
    whyJoinDesc: 'ACLAP ही महाराष्ट्रातील एक विश्वसनीय संघटना आहे, जी क्लिनिकल लॅबोरेटरी विश्लेषक आणि अभ्यासकांना सक्षम करण्यासाठी समर्पित आहे. आम्ही व्यावसायिक अधिकारांचे रक्षण करण्यासाठी, वैज्ञानिक उत्कृष्टतेला प्रोत्साहन देण्यासाठी आणि एकता, वकिली आणि सतत विकासाच्या माध्यमातून प्रयोगशाळा व्यावसायिकांचे भविष्य अधिक बळकट करण्यासाठी एकत्रितपणे काम करतो.',

    // Testimonials - Empty
    membersSay: 'सदस्य काय',
    membersSayEnd: 'म्हणतात',

    // Membership Process
    joinACLAPTitle: 'ACLAP मध्ये सामील व्हा',
    membershipProcess: 'सदस्यत्व',
    processEnd: 'पडताळणी प्रक्रिया',
    processDesc: 'आमच्या व्यावसायिक समुदायात सामील होण्यासाठी सुव्यवस्थित, सुरक्षित आणि पारदर्शक ४-चरणीय प्रक्रिया',
    digitalApplication: 'डिजिटल अर्ज सादरीकरण',
    digitalAppDesc: 'व्यावसायिक आमच्या एन्क्रिप्टेड सुरक्षित पोर्टलद्वारे व्यावसायिक प्रमाणपत्रे सादर करतात.',
    documentVerification: 'कागदपत्र पडताळणी',
    documentVerifDesc: 'जिल्हा कार्यकारिणी समित्या शैक्षणिक आणि नोंदणी कागदपत्रांची पडताळणी करतात.',
    feeSettlement: 'शुल्क निपटारा',
    feeSettleDesc: 'पडताळणीनंतर, सदस्य संघटना कल्याण निधीमध्ये योगदान देतात.',
    digitalID: 'डिजिटल आयडी जारी करणे',
    digitalIDDesc: 'रेकॉर्डसाठी अधिकृत ACLAP सदस्य आयडी आणि प्रमाणपत्र तयार केले जाते.',
    processingTime: '९५% अर्ज ५ कार्य दिवसांत प्रक्रिया केले जातात',
    verifiedSecurity: '१००% सत्यापित सुरक्षा',
    securityDesc: 'आमची बहु-स्तरीय पडताळणी प्रक्रिया सुनिश्चित करते की केवळ पात्र व्यावसायिक ACLAP चे प्रतिनिधित्व करतात, सर्वोच्च व्यावसायिक मानके आणि विश्वास राखतात.',
    isoCertified: 'ISO ९००१:२००४ प्रमाणित',
    govRecognized: 'सरकारी मान्यता प्राप्त',
    gdprCompliant: 'GDPR अनुपालन',

    // CTA
    ctaTitle: 'महाराष्ट्रातील प्रयोगशाळा',
    ctaTitleEnd: 'आरोग्यसेवा बदलण्यास तयार आहात?',
    ctaDesc: 'भारतातील सर्वात वेगाने वाढणाऱ्या नैदानिक प्रयोगशाळा व्यावसायिकांच्या संघटनेत सामील व्हा आणि निदान क्रांतीचा भाग व्हा.',
    registerNow: 'आता नोंदणी करा',
    contactUs: 'संपर्क करा',
  }
};

const About = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFirstCommitteeVisible, setIsFirstCommitteeVisible] = useState(false);
  const [isSecondCommitteeVisible, setIsSecondCommitteeVisible] = useState(false);

  // Empty testimonials array
  const testimonials = [];

  const achievements = [
    { year: '2024', title: 'Best Professional Association', organization: 'Healthcare Excellence Awards', icon: <Trophy size={20} /> },
    { year: '2023', title: 'Innovation in Diagnostics', organization: 'Medical Technology Summit', icon: <Lightbulb size={20} /> },
    { year: '2022', title: 'Outstanding Contribution', organization: 'Maharashtra Health Dept', icon: <Award size={20} /> },
  ];

  const controls = {
    fadeInUp: {
      hidden: { opacity: 0, y: 60 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -70 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 70 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    },
    scaleUp: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, type: "spring", stiffness: 100 }
      }
    },
    rotateIn: {
      hidden: { opacity: 0, rotate: -10, scale: 0.9 },
      visible: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: { duration: 0.6, type: "spring" }
      }
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
      }
    }
  };

  const values = [
    { title: 'Integrity', desc: 'We act with honesty, transparency, and accountability in everything we do.', icon: <Shield size={28} />, color: 'from-blue-500 to-cyan-500', stat: '100% Transparency' },
    { title: 'Excellence', desc: 'We strive for the highest standards in laboratory practice, learning, and professional growth.', icon: <Target size={28} />, color: 'from-emerald-500 to-teal-500', stat: '98% Accuracy Rate' },
    { title: 'Ethics', desc: 'We uphold ethical practices that build trust, respect, and professional credibility.', icon: <Heart size={28} />, color: 'from-purple-500 to-pink-500', stat: '100% Trust' },
    { title: 'Innovation', desc: 'We embrace new ideas, technology, and research to shape the future of diagnostics.', icon: <Lightbulb size={28} />, color: 'from-orange-500 to-red-500', stat: '50+ Research Papers' },
    { title: 'Collaboration', desc: 'We believe stronger partnerships create stronger professionals and better healthcare.', icon: <Users size={28} />, color: 'from-indigo-500 to-purple-500', stat: '10K+ Members' },
    { title: 'Service', desc: 'We are committed to serving our profession, patients, and society with dedication and compassion.', icon: <Heart size={28} />, color: 'from-rose-500 to-pink-500', stat: '25+ Districts' },
  ];

  // Simplified Leadership Team - Using images from assets
  const leadershipTeam = [
    {
      name: 'Mr. Prashant Gulekar',
      position: 'President',
      image: member1,
    },
    {
      name: 'Mr. Ganesh Bondhare',
      position: 'Vice President',
      image: member2,
    },
    {
      name: 'Mr. Ramesh Chougale',
      position: 'Secretary',
      image: member3,
    },
    {
      name: 'Mr. Umesh Sonar',
      position: 'Treasurer',
      image: member4,
    },
    {
      name: 'Mr. Rajabhau Garud',
      position: 'Joint Secretary',
      image: member5,
    },
  ];

  const firstExecutiveCommittee = [
    { name: 'Annasaheb Karole', position: 'President', image: fMember1 },
    { name: 'Rajkumar Tiwatane', position: 'Secretary', image: fMember2 },
    { name: 'Udaykumar Khairnar', position: 'Vice President', image: fMember3 },
    { name: 'Raghunath Bhongale', position: 'Joint Secretary', image: fMember4 },
    { name: 'Shivaji Kadam', position: 'Treasurer', image: fMember5 },
    { name: 'Anil Rathi', position: 'Director', image: fMember6 },
    { name: 'Shripad Karandikar', position: 'Director', image: fMember7 },
    { name: 'Gautam Desai', position: 'Director', image: fMember8 },
    { name: 'Dhanjay Dabir', position: 'Director', image: fMember9 },
    { name: 'Rajesh Shetti', position: 'Director', image: fMember10 },
    { name: 'Shakil Attar', position: 'Director', image: fMember11 },
    { name: 'Varsha Zavar', position: 'Director', image: fMember12 },
    { name: 'Nitin Salunkhe', position: 'Director', image: fMember13 },
    { name: 'Girish Sharanathe', position: 'Director', image: fMember14 },
    { name: 'Anil Gite', position: 'Zonal Secretary', image: fMember15 },
    { name: 'Vilas Rasal', position: 'Zonal Secretary', image: fMember16 },
    { name: 'Dhanjay Kulkarni', position: 'Zonal Secretary', image: fMember17 },
    { name: 'Kumar Patil', position: 'Zonal Secretary', image: fMember18 },
    { name: 'Janardhan Chopade', position: 'Zonal Secretary', image: fMember19 }
  ];

  const secondExecutiveCommittee = [
    { name: 'Annasaheb Karole', position: 'President', image: sMember1 },
    { name: 'Dhananjay Dabir', position: 'Vice President', image: sMember2 },
    { name: 'Kumar Patil', position: 'Secretary', image: sMember3 },
    { name: 'Raghunath Bhongale', position: 'Treasurer', image: sMember4 },
    { name: 'Shripad Karandikar', position: 'Joint Secretary', image: sMember5 },
    { name: 'Hemant Kumbhar', position: 'Zonal Secretary', image: sMember6 },
    { name: 'Umeshchandra Sonar', position: 'Director (PMC President)', image: sMember7 },
    { name: 'Nitin Solanke', position: 'Zonal Secretary', image: sMember8 },
    { name: 'Ganesh Bondhare', position: 'Zonal Secretary', image: sMember9 },
    { name: 'Dattatraya Apsingekar', position: 'Director', image: sMember10 },
    { name: 'Prashant Gulekar', position: 'Director', image: sMember11 },
    { name: 'Ram Krishna Borse', position: 'Director', image: sMember12 },
    { name: 'Chandrakant Kotwade', position: 'Director', image: sMember13 },
    { name: 'Pandit Jadhav', position: 'Director', image: sMember14 },
    { name: 'Janardhan Chopade', position: 'Director', image: sMember15 },
    { name: 'Mahadev Kolekar', position: 'Director', image: sMember16 },
    { name: 'Deepak Kale', position: 'Director', image: sMember17 },
    { name: 'Nikhil Late', position: 'Director', image: sMember18 },
    { name: 'Rajesh Garud', position: 'Director', image: sMember19 },
    { name: 'Varsha Zanvar', position: 'Director', image: sMember20 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % (testimonials.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="bg-white overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/30 to-white" />

        {/* Animated Background Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"
        />

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.3 + Math.random() * 0.3, 0],
              scale: [0, 0.3 + Math.random() * 0.3, 0],
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, (Math.random() - 0.5) * 200]
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut"
            }}
            className="absolute w-1.5 h-1.5 bg-primary-400/30 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}

        <div className="relative max-w-7xl mx-auto px-2 py-32 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={controls.staggerContainer}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <motion.div
                variants={controls.scaleUp}
                className="inline-flex items-center gap-2 bg-primary-100/50 px-5 py-2 rounded-full mb-8 shadow-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles size={16} className="text-primary-600/70" />
                </motion.div>
                <span className="text-primary-700/80 text-xs font-black uppercase tracking-wider">{t.sinceText}</span>
              </motion.div>

              <motion.h1
                variants={controls.fadeInUp}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-6"
              >
                {t.heroTitle}{' '}
                <span className="relative inline-block">
                  {t.heroTitleHighlight}
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-3 left-0 h-3 bg-primary-200/40 -z-10"
                  />
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
                  {t.heroTitleEnd}
                </span>
              </motion.h1>

              <motion.p
                variants={controls.fadeInUp}
                className="text-slate-500 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
              >
                {t.heroDesc}
              </motion.p>

              <motion.div
                variants={controls.fadeInUp}
                className="flex flex-wrap gap-5 justify-center lg:justify-start"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Link
                    to="/contact"
                    className="group relative px-10 py-4 bg-black text-white text-sm font-black uppercase tracking-wider rounded-full shadow-2xl shadow-primary-600/30 overflow-hidden inline-flex items-center gap-2"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t.getInTouch}
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight size={16} />
                      </motion.div>
                    </span>
                    <motion.div
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-primary-700"
                    />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="px-10 py-4 bg-white border-2 border-primary-200 text-primary-700 text-sm font-black uppercase tracking-wider rounded-full hover:bg-primary-50 transition-all shadow-lg inline-flex items-center gap-2"
                  >
                    {t.joinACLAP}
                    <Award size={16} />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={controls.fadeInUp}
                className="mt-12 flex items-center gap-6 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="w-8 h-8 rounded-full bg-primary-200 border-2 border-white flex items-center justify-center text-primary-700 text-xs font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </motion.div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{t.trustedBy}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Stats Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={controls.staggerContainer}
              className="lg:w-1/2"
            >
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: 'Since 2005', label: t.yearsOfExcellence, icon: <Award size={32} />, gradient: 'from-amber-500 to-orange-500', desc: t.industryLeadership },
                  { value: '25+', label: t.districtsCovered, icon: <MapPinned size={32} />, gradient: 'from-emerald-500 to-teal-500', desc: t.completeCoverage },
                  { value: '5K+', label: t.certifiedMembers, icon: <Users size={32} />, gradient: 'from-purple-500 to-pink-500', desc: t.andGrowing },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    variants={controls.scaleUp}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onHoverStart={() => setHoveredCard(idx)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 group cursor-pointer relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: hoveredCard === idx ? 10 : -10, y: hoveredCard === idx ? -10 : 10 }}
                      className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-bl-full opacity-10`}
                    />
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="text-3xl font-black text-slate-800 mb-1"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wide">{stat.label}</div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: hoveredCard === idx ? 'auto' : 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-primary-600 mt-2">{stat.desc}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-primary-300 flex justify-center pt-2">
              <motion.div
                animate={{ height: [4, 14, 4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 rounded-full bg-primary-500"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Vision Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={controls.fadeInLeft}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl bg-white p-10 shadow-2xl"
            >
              <motion.div
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-100 to-primary-50 rounded-bl-full -z-10"
                whileHover={{ scale: 1.2, x: 20, y: -20 }}
                transition={{ duration: 0.4 }}
              />
              <div className="flex items-start justify-between mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center text-white mb-0 shadow-xl shadow-primary-600/30">
                  <Eye size={36} />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-2 border-primary-200 flex items-center justify-center"
                >
                  <Sparkles size={20} className="text-primary-400" />
                </motion.div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">{t.ourVision}</h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                {t.visionDesc}
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-primary-600 text-md md:text-lg font-black text-center tracking-wide">
                  {t.visionTagline}
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="mt-6 flex items-center gap-2 text-primary-600 font-bold group"
              >
                {t.exploreVision}
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                  <ChevronRight size={18} />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={controls.fadeInRight}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl bg-primary-600 p-10 shadow-2xl"
            >
              <motion.div
                className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-tr-full -z-10"
                whileHover={{ scale: 1.2, x: -20, y: 20 }}
                transition={{ duration: 0.4 }}
              />
              <div className="flex items-start justify-between mb-8">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-0 shadow-xl backdrop-blur-sm">
                  <Target size={36} />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="px-3 py-1 bg-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-wider"
                >
                  {t.ourGoal}
                </motion.div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">{t.ourMission}</h2>
              <p className="text-primary-100 text-lg leading-relaxed mb-6">
                {t.missionDesc}
              </p>
              <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                <p className="text-white text-md md:text-lg font-black text-center tracking-wide">
                  {t.missionTagline}
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="mt-6 flex items-center gap-2 text-white font-bold group"
              >
                {t.discoverMission}
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                  <ChevronRight size={18} />
                </motion.div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Governance Hierarchy */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-2">
          <div className="text-center mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.scaleUp}
              className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Crown size={14} className="text-primary-600" />
              </motion.div>
              <span className="text-primary-700 text-xs font-black uppercase tracking-wider">{t.leadershipFramework}</span>
            </motion.div>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4"
            >
              {t.governanceHierarchy} <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Hierarchy</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-slate-500 text-lg max-w-2xl mx-auto"
            >
              {t.governanceDesc}
            </motion.p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Central Line */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-600 via-primary-300 to-transparent hidden md:block"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute left-1/2 top-0 w-4 h-4 -ml-2 rounded-full bg-primary-600 hidden md:block"
            />

            {[
              { level: '01', title: t.stateExecutive, role: t.stateRole, desc: t.stateDesc, icon: <Crown size={24} />, color: 'from-amber-500 to-orange-500', members: '15 Members' },
              { level: '02', title: t.districtCommittee, role: t.districtRole, desc: t.districtDesc, icon: <Building2 size={24} />, color: 'from-blue-500 to-cyan-500', members: '108 Members' },
              { level: '03', title: t.talukaReps, role: t.talukaRole, desc: t.talukaDesc, icon: <Users size={24} />, color: 'from-emerald-500 to-teal-500', members: '350+ Members' },
              { level: '04', title: t.generalBody, role: t.generalRole, desc: t.generalDesc, icon: <UserCheck size={24} />, color: 'from-purple-500 to-pink-500', members: '10,000+ Members' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={controls.fadeInUp}
                transition={{ delay: i * 0.15 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-16 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="md:w-5/12">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    onHoverStart={() => setHoveredCard(i)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:border-primary-200 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: hoveredCard === i ? 20 : -20 }}
                      className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${item.color} rounded-full opacity-10`}
                    />
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {item.icon}
                      </div>
                      <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{item.level}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-primary-600 text-xs font-bold uppercase tracking-wider mb-3">{item.role}</p>
                    <p className="text-slate-500 text-sm leading-relaxed mb-3">{item.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        <Users size={12} className="inline mr-1" /> {item.members}
                      </span>
                      <motion.div
                        animate={{ x: hoveredCard === i ? 5 : 0 }}
                        className="text-primary-600"
                      >
                        <ChevronRight size={16} />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.2, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 border-4 border-white shadow-2xl flex items-center justify-center text-white font-black text-xl z-20 shrink-0 cursor-pointer relative group"
                >
                  {item.level}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    className="absolute -inset-2 rounded-full border-2 border-primary-300 opacity-0 group-hover:opacity-100"
                  />
                </motion.div>

                <div className="md:w-5/12 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-2">
          <div className="text-center mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.scaleUp}
              className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Heart size={14} className="text-primary-600" />
              </motion.div>
              <span className="text-primary-700 text-xs font-black uppercase tracking-wider">{t.corePrinciples}</span>
            </motion.div>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4"
            >
              {t.valuesDefine} <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">{t.defineUs}</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-slate-500 text-lg max-w-2xl mx-auto"
            >
              {t.valuesDesc}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={controls.rotateIn}
                whileHover={{ y: -12 }}
                onHoverStart={() => setHoveredCard(i + 10)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group cursor-pointer"
              >
                <div className={`bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:border-primary-200 transition-all h-full text-center relative overflow-hidden`}>
                  <motion.div
                    animate={{
                      scale: hoveredCard === i + 10 ? [1, 1.1, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${value.color} rounded-full opacity-5`}
                  />
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg`}
                  >
                    {value.icon}
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">{value.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{value.desc}</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.random() * 30 + 70}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full bg-gradient-to-r ${value.color}`}
                    />
                  </div>
                  <p className="text-xs font-semibold text-primary-600">{value.stat}</p>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    className="mt-4 text-primary-600"
                  >
                    <Star size={14} className="mx-auto" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team - Using images from assets */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-2 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.scaleUp}
              className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4"
            >
              <Users size={14} className="text-primary-600" />
              <span className="text-primary-700 text-xs font-black uppercase tracking-wider">{t.ourLeaders}</span>
            </motion.div>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4"
            >
              {t.executiveBoard} <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">{t.executiveBoardEnd}</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-slate-500 text-lg max-w-2xl mx-auto"
            >
              {t.leadershipDesc}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {leadershipTeam.map((leader, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={controls.scaleUp}
                whileHover={{ y: -12 }}
                className="group cursor-pointer h-full"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl transition-all relative h-full flex flex-col">
                  <div className="relative h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-full h-full flex items-center justify-center relative"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute w-40 h-40 rounded-full bg-primary-300/20"
                      />
                      <img
                        src={leader.image}
                        alt={leader.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl z-10"
                      />
                    </motion.div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
                  </div>
                  <div className="p-6 text-center flex-grow flex flex-col justify-center">
                    <h3 className="text-xl font-black text-slate-800 mb-1">{leader.name}</h3>
                    <p className="text-primary-600 text-xs font-bold uppercase tracking-wider">{leader.position}</p>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* First Executive Committee Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.scaleUp}
              className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4"
            >
              <Users size={14} className="text-primary-600" />
              <span className="text-primary-700 text-xs font-black uppercase tracking-wider">{t.ourLeaders}</span>
            </motion.div>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4"
            >
              {t.firstExecutiveBoard} <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">{t.firstExecutiveBoardEnd}</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-slate-500 text-lg max-w-2xl mx-auto"
            >
              {t.firstExecutiveBoardDesc}
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {firstExecutiveCommittee.slice(0, 5).map((leader, i) => (
              <motion.div
                key={`first-5-${i}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={controls.scaleUp}
                whileHover={{ y: -5 }}
                className="group cursor-pointer h-full"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all relative h-full flex flex-col p-6 text-center">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary-100 shadow-md mx-auto mb-4 shrink-0"
                  />
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-sm md:text-base font-black text-slate-800 mb-1 leading-tight">{leader.name}</h3>
                    <p className="text-primary-600 text-[10px] md:text-xs font-bold uppercase tracking-wider">{leader.position}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {isFirstCommitteeVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-8">
                  {firstExecutiveCommittee.slice(5).map((leader, i) => (
                    <motion.div
                      key={`rest-${i}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group cursor-pointer h-full"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all relative h-full flex flex-col p-6 text-center">
                        <img
                          src={leader.image}
                          alt={leader.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary-100 shadow-md mx-auto mb-4 shrink-0"
                        />
                        <div className="flex-grow flex flex-col justify-center">
                          <h3 className="text-sm md:text-base font-black text-slate-800 mb-1 leading-tight">{leader.name}</h3>
                          <p className="text-primary-600 text-[10px] md:text-xs font-bold uppercase tracking-wider">{leader.position}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFirstCommitteeVisible(!isFirstCommitteeVisible)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 border-2 border-primary-200 font-black text-sm uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all"
            >
              {isFirstCommitteeVisible ? t.hideCommittee : t.viewCommittee}
              <motion.div
                animate={{ rotate: isFirstCommitteeVisible ? -90 : 90 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight size={18} />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Second Executive Committee Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.scaleUp}
              className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4"
            >
              <Users size={14} className="text-primary-600" />
              <span className="text-primary-700 text-xs font-black uppercase tracking-wider">{t.ourLeaders}</span>
            </motion.div>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4"
            >
              {t.secondExecutiveBoard} <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">{t.secondExecutiveBoardEnd}</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInUp}
              className="text-slate-500 text-lg max-w-2xl mx-auto"
            >
              {t.secondExecutiveBoardDesc}
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {secondExecutiveCommittee.slice(0, 5).map((leader, i) => (
              <motion.div
                key={`second-5-${i}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={controls.scaleUp}
                whileHover={{ y: -5 }}
                className="group cursor-pointer h-full"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all relative h-full flex flex-col p-6 text-center">
                  {leader.image ? (
                    <img src={leader.image} alt={leader.name} className="w-20 h-20 rounded-full object-cover border-2 border-primary-100 shadow-md mx-auto mb-4 shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-inner shrink-0">
                      <UserCheck size={32} />
                    </div>
                  )}
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-sm md:text-base font-black text-slate-800 mb-1 leading-tight">{leader.name}</h3>
                    <p className="text-primary-600 text-[10px] md:text-xs font-bold uppercase tracking-wider">{leader.position}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {isSecondCommitteeVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-8">
                  {secondExecutiveCommittee.slice(5).map((leader, i) => (
                    <motion.div
                      key={`rest2-${i}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group cursor-pointer h-full"
                    >
                      <div className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all relative h-full flex flex-col p-6 text-center">
                        {leader.image ? (
                          <img src={leader.image} alt={leader.name} className="w-20 h-20 rounded-full object-cover border-2 border-primary-100 shadow-md mx-auto mb-4 shrink-0" />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-inner shrink-0">
                            <UserCheck size={32} />
                          </div>
                        )}
                        <div className="flex-grow flex flex-col justify-center">
                          <h3 className="text-sm md:text-base font-black text-slate-800 mb-1 leading-tight">{leader.name}</h3>
                          <p className="text-primary-600 text-[10px] md:text-xs font-bold uppercase tracking-wider">{leader.position}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSecondCommitteeVisible(!isSecondCommitteeVisible)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 border-2 border-primary-200 font-black text-sm uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all"
            >
              {isSecondCommitteeVisible ? t.hideCommittee : t.viewCommittee}
              <motion.div
                animate={{ rotate: isSecondCommitteeVisible ? -90 : 90 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight size={18} />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-2">
          <div className="text-center mb-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.scaleUp}
              className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4"
            >
              <Trophy size={14} className="text-primary-600" />
              <span className="text-primary-700 text-xs font-black uppercase tracking-wider">{t.ourAchievements}</span>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((achievement, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={controls.fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-md border border-slate-100 text-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-3">
                  {achievement.icon}
                </div>
                <span className="text-xs font-bold text-primary-600">{achievement.year}</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1 mb-1">{achievement.title}</h3>
                <p className="text-xs text-slate-400">{achievement.organization}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join ACLAP Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={controls.scaleUp}
            className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-8 shadow-sm"
          >
            <ShieldCheck size={16} className="text-primary-600" />
            <span className="text-primary-700 text-sm font-black uppercase tracking-wider">{t.whyJoinAclap}</span>
          </motion.div>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={controls.fadeInUp}
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-8 leading-tight"
          >
            {t.whyJoinTaglineStart} <span className="text-primary-600">{t.whyJoinTaglineEnd}</span>
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={controls.fadeInUp}
            className="bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-12 shadow-inner"
          >
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium">
              {t.whyJoinDesc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Membership Process */}
      <section className="py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInLeft}
            >
              <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-6">
                <UserCheck size={14} className="text-primary-600" />
                <span className="text-primary-700 text-xs font-black uppercase tracking-wider">{t.joinACLAPTitle}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">
                {t.membershipProcess} <span className="text-primary-600">{t.processEnd}</span>
              </h2>
              <p className="text-slate-500 text-lg mb-10">
                {t.processDesc}
              </p>

              <div className="space-y-8">
                {[
                  { step: '01', title: t.digitalApplication, desc: t.digitalAppDesc, icon: <FileText size={20} />, time: '~10 mins' },
                  { step: '02', title: t.documentVerification, desc: t.documentVerifDesc, icon: <ShieldCheck size={20} />, time: '2-3 days' },
                  { step: '03', title: t.feeSettlement, desc: t.feeSettleDesc, icon: <Wallet size={20} />, time: '~5 mins' },
                  { step: '04', title: t.digitalID, desc: t.digitalIDDesc, icon: <Award size={20} />, time: 'Instant' },
                ].map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 15 }}
                    className="flex gap-5 group cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-black text-lg group-hover:bg-primary-600 group-hover:text-white transition-colors"
                      >
                        {p.step}
                      </motion.div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">{p.title}</h4>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{p.time}</span>
                      </div>
                      <p className="text-slate-500 text-sm">{p.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 bg-primary-50 rounded-xl flex items-center gap-3"
              >
                <CheckCircle size={20} className="text-primary-600 flex-shrink-0" />
                <p className="text-xs text-slate-600">{t.processingTime}</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={controls.fadeInRight}
              whileHover={{ y: -8 }}
            >
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                  className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"
                />
                <ShieldCheck size={56} className="mb-6 relative z-10" />
                <h3 className="text-2xl font-black mb-4 relative z-10">{t.verifiedSecurity}</h3>
                <p className="text-primary-100 leading-relaxed mb-8 relative z-10">
                  {t.securityDesc}
                </p>
                <div className="flex flex-wrap gap-3 relative z-10">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm"
                  >
                    {t.isoCertified}
                  </motion.span>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm"
                  >
                    {t.govRecognized}
                  </motion.span>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm"
                  >
                    {t.gdprCompliant}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={controls.scaleUp}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-16 text-center shadow-2xl"
          >
            <motion.div
              animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -80, 0], y: [0, 30, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6"
              >
                <Sparkles size={16} className="text-white" />
                <span className="text-white text-xs font-black uppercase tracking-wider">{t.joinACLAPTitle}</span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                {t.ctaTitle} <br /> {t.ctaTitleEnd}
              </h2>
              <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-10">
                {t.ctaDesc}
              </p>

              {/* Animated Stats Row */}
              <div className="flex flex-wrap justify-center gap-8 mb-10">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">5K+</div>
                  <div className="text-[10px] text-primary-200 uppercase tracking-wider">{t.certifiedMembers}</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">20+</div>
                  <div className="text-[10px] text-primary-200 uppercase tracking-wider">{t.yearsOfExcellence}</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">25+</div>
                  <div className="text-[10px] text-primary-200 uppercase tracking-wider">{t.districtsCovered}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="px-10 py-4 bg-white text-primary-700 font-black text-sm uppercase tracking-wider rounded-full shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
                  >
                    {t.registerNow}
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <ArrowRight size={16} />
                    </motion.div>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="px-10 py-4 bg-transparent border-2 border-white/30 text-white font-black text-sm uppercase tracking-wider rounded-full hover:bg-white/10 transition-all inline-flex items-center gap-2"
                  >
                    {t.contactUs}
                    <Phone size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default About;