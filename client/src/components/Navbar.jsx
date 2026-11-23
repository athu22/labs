import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronRight, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';


// Translations
const translations = {
  en: {
    home: 'Home',
    aboutUs: 'About Us',
    events: 'Events',
    gallery: 'Gallery',
    membership: 'Membership',
    contactUs: 'Contact Us',
    dashboard: 'Dashboard',
    logout: 'Logout',
    login: 'Login',
    joinAssociation: 'Join Association',
    myDashboard: 'My Dashboard',
    aclap: 'ACLAP',
    maharashtra: 'Maharashtra',
    language: 'Language',
    english: 'English',
    marathi: 'Marathi',
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    aboutUs: 'आमच्याबद्दल',
    events: 'कार्यक्रम',
    gallery: 'गॅलरी',
    membership: 'सदस्यत्व',
    contactUs: 'संपर्क करा',
    dashboard: 'डॅशबोर्ड',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    joinAssociation: 'संघात सामील व्हा',
    myDashboard: 'माझा डॅशबोर्ड',
    aclap: 'ACLAP',
    maharashtra: 'महाराष्ट्र',
    language: 'भाषा',
    english: 'इंग्रजी',
    marathi: 'मराठी',
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const location = useLocation();
  const { currentUser, userData, logout } = useAuth();
  const { language, setLanguage } = useContext(LanguageContext);
  const t = translations[language];

  // Check if we are on the Home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setShowLanguageMenu(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Determine navbar appearance based on page and scroll status
  // Transparent only on Home Page when not scrolled
  const isTransparent = isHomePage && !scrolled;

  const navLinks = [
    { name: t.home, path: '/' },
    { name: t.aboutUs, path: '/about' },
    { name: t.events, path: '/events' },
    { name: t.gallery, path: '/gallery' },
    { name: t.membership, path: '/membership' },
    { name: t.contactUs, path: '/contact-us' },
  ];

  // Update navLinks when language changes
  const getNavLinks = () => [
    { name: t.home, path: '/' },
    { name: t.aboutUs, path: '/about' },
    { name: t.events, path: '/events' },
    { name: t.gallery, path: '/gallery' },
    { name: t.membership, path: '/membership' },
    { name: t.contactUs, path: '/contact-us' },
  ];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  return (
    <>
      <nav className={`fixed w-full z-[100] transition-all duration-500 ease-in-out ${isTransparent
        ? 'bg-transparent py-4 sm:py-5 md:py-6'
        : 'bg-white/95 backdrop-blur-xl py-2 sm:py-2.5 md:py-3 border-b border-secondary-yellow/30 shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
        }`}>
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center">

            {/* Brand Identity - Responsive sizes */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group relative z-[110]">
              <div className={`relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 overflow-hidden rounded-[0.8rem] sm:rounded-[1rem] transition-all duration-500 ${isTransparent ? 'shadow-xl -rotate-3 hover:rotate-0' : 'shadow-md scale-90 rotate-0'
                }`}>
                <img src="/Logo.png" alt="ACLAP Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tighter transition-all duration-500 leading-none ${isTransparent ? 'text-white' : 'text-accent-maroon'
                  }`}>
                  {t.aclap}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className={`h-[2px] w-3 sm:w-4 transition-colors duration-500 ${isTransparent ? 'bg-secondary-yellow' : 'bg-primary-600'
                    }`} />
                  <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] transition-colors duration-500 ${isTransparent ? 'text-secondary-yellow' : 'text-primary-600'
                    }`}>
                    {t.maharashtra}
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Nav - Responsive spacing */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <div className="flex items-center space-x-4 xl:space-x-6">
                {getNavLinks().map((link) => (
                  <div key={link.path} className="relative group">
                    <Link
                      to={link.path}
                      className={`text-[11px] xl:text-xs 2xl:text-sm font-black uppercase tracking-[0.12em] xl:tracking-[0.15em] transition-all duration-300 relative flex items-center gap-1 ${isTransparent
                        ? (location.pathname === link.path ? 'text-secondary-yellow' : 'text-white/90 hover:text-white')
                        : (location.pathname === link.path ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600')
                        }`}
                    >
                      <span className="relative z-10">{link.name}</span>
                      <span className={`absolute -bottom-1.5 left-0 h-0.5 transition-all duration-500 rounded-full ${location.pathname === link.path ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
                        } ${isTransparent ? 'bg-secondary-yellow' : 'bg-primary-600'}`} />
                    </Link>
                  </div>
                ))}
              </div>

              <div className={`flex items-center space-x-3 xl:space-x-4 pl-4 xl:pl-5 border-l transition-colors duration-500 ${isTransparent ? 'border-white/10' : 'border-slate-100'
                }`}>
                {/* Language Switcher - Desktop */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 ${isTransparent
                      ? 'text-white/80 hover:text-white bg-white/10 border border-white/10'
                      : 'text-slate-600 hover:text-primary-600 bg-slate-50 border border-slate-200 hover:border-primary-300'
                      }`}
                  >
                    <Globe size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {language === 'en' ? 'EN' : 'MR'}
                    </span>
                  </button>

                  {showLanguageMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                      <div className="p-1">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {t.language}
                        </div>
                        <button
                          onClick={() => handleLanguageChange('en')}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${language === 'en'
                            ? 'bg-primary-50 text-primary-600'
                            : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <span className="text-sm font-medium">{t.english}</span>
                          {language === 'en' && <Check size={16} className="text-primary-600" />}
                        </button>
                        <button
                          onClick={() => handleLanguageChange('mr')}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${language === 'mr'
                            ? 'bg-primary-50 text-primary-600'
                            : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <span className="text-sm font-medium">{t.marathi}</span>
                          {language === 'mr' && <Check size={16} className="text-primary-600" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {currentUser && userData?.role !== 'admin' && userData?.role !== 'super-admin' ? (
                  <div className="flex items-center space-x-3 xl:space-x-4">
                    <Link
                      to="/renew"
                      className={`group flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-1.5 xl:py-2 rounded-xl text-[10px] xl:text-[11px] 2xl:text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 active:scale-95 ${isTransparent
                        ? 'bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white/20'
                        : 'bg-secondary-yellow/50 text-accent-maroon hover:bg-secondary-yellow shadow-md shadow-secondary-yellow/20'
                        }`}
                    >
                      <User size={14} className="group-hover:rotate-12 transition-transform" /> {t.dashboard}
                    </Link>
                    <button
                      onClick={logout}
                      className={`text-[10px] xl:text-[11px] 2xl:text-xs font-black uppercase tracking-widest transition-all hover:text-red-500 ${isTransparent ? 'text-white/40 hover:text-red-400' : 'text-slate-400'
                        }`}
                    >
                      {t.logout}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 xl:space-x-4">
                    <Link
                      to="/login"
                      className={`text-[11px] xl:text-xs 2xl:text-sm font-black uppercase tracking-[0.12em] xl:tracking-[0.15em] transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-primary-600'
                        }`}
                    >
                      {t.login}
                    </Link>
                    <Link
                      to="/signup"
                      className={`relative overflow-hidden px-4 xl:px-5 py-2 xl:py-2.5 rounded-xl font-black text-[10px] xl:text-[11px] 2xl:text-xs uppercase tracking-[0.12em] xl:tracking-[0.15em] transition-all active:scale-95 group shadow-xl ${isTransparent
                        ? 'bg-white text-primary-600 hover:shadow-white/20'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/30'
                        }`}
                    >
                      <span className="relative z-10">{t.joinAssociation}</span>
                      <div className="absolute inset-0 bg-accent-maroon/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button - Responsive */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Language Switcher - Mobile */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className={`p-2 rounded-xl transition-all active:scale-90 ${isTransparent ? 'text-white bg-white/10 border border-white/10' : 'text-slate-600 bg-slate-50'
                    }`}
                >
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-1">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t.language}
                      </div>
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${language === 'en'
                          ? 'bg-primary-50 text-primary-600'
                          : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <span className="text-sm font-medium">{t.english}</span>
                        {language === 'en' && <Check size={16} className="text-primary-600" />}
                      </button>
                      <button
                        onClick={() => handleLanguageChange('mr')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${language === 'mr'
                          ? 'bg-primary-50 text-primary-600'
                          : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <span className="text-sm font-medium">{t.marathi}</span>
                        {language === 'mr' && <Check size={16} className="text-primary-600" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all active:scale-90 z-[110] relative ${isTransparent ? 'text-white bg-white/10 border border-white/10' : 'text-slate-600 bg-slate-50'
                  }`}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full Screen Mobile Overlay - Responsive */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-[105] bg-white flex flex-col p-4 sm:p-5 pt-24 sm:pt-28 md:pt-32 overflow-y-auto"
          >
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
              {getNavLinks().map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center justify-between py-2 ${location.pathname === link.path ? 'text-primary-600' : 'text-slate-800 hover:text-primary-600'
                      }`}
                  >
                    {link.name}
                    <ChevronRight size={24} className="opacity-30 text-slate-400" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10 md:mt-12 space-y-3 sm:space-y-4 md:space-y-5 pb-12">
              {currentUser && userData?.role !== 'admin' && userData?.role !== 'super-admin' ? (
                <>
                  <Link
                    to="/renew"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-4 sm:py-5 text-center bg-secondary-yellow text-accent-maroon font-black uppercase tracking-widest text-xs sm:text-sm rounded-2xl shadow-xl shadow-secondary-yellow/20 transition-all active:scale-95"
                  >
                    {t.myDashboard}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="block w-full py-3 sm:py-4 text-center text-red-500 font-black uppercase tracking-widest text-xs sm:text-sm border-2 border-slate-100 rounded-2xl transition-all active:scale-95 hover:bg-red-50"
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-3 sm:py-4 text-center text-slate-600 font-black uppercase tracking-widest text-xs sm:text-sm border-2 border-slate-100 rounded-2xl transition-all active:scale-95 hover:bg-slate-50"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-4 sm:py-5 text-center bg-primary-600 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-2xl shadow-xl shadow-primary-600/30 transition-all active:scale-95 hover:bg-primary-700"
                  >
                    {t.joinAssociation}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;