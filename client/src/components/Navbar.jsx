import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { currentUser, userData, logout } = useAuth();

  // Check if we are on the Home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine navbar appearance based on page and scroll status
  // Transparent only on Home Page when not scrolled
  const isTransparent = isHomePage && !scrolled;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Membership', path: '/membership' },
  ];

  return (
    <nav className={`fixed w-full z-[100] transition-all duration-500 ease-in-out ${isTransparent
        ? 'bg-transparent py-8'
        : 'bg-white/95 backdrop-blur-xl py-3 border-b border-secondary-yellow/30 shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
      }`}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex justify-between items-center">

          {/* Brand Identity */}
          <Link to="/" className="flex items-center space-x-5 group relative z-[110]">
            <div className={`relative w-14 h-14 overflow-hidden rounded-[1.25rem] transition-all duration-500 ${isTransparent ? 'shadow-2xl -rotate-3 hover:rotate-0' : 'shadow-lg scale-90 rotate-0'
              }`}>
              <img src="/Logo.png" alt="ACLAP Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`text-3xl font-black tracking-tighter transition-all duration-500 leading-none ${isTransparent ? 'text-white' : 'text-accent-maroon'
                }`}>
                ACLAP
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-[2px] w-4 transition-colors duration-500 ${isTransparent ? 'bg-secondary-yellow' : 'bg-primary-600'}`} />
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${isTransparent ? 'text-secondary-yellow' : 'text-primary-600'
                  }`}>
                  Maharashtra
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-14">
            <div className="flex items-center space-x-10">
              {navLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="relative group"
                >
                  <Link
                    to={link.path}
                    className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 relative flex items-center gap-1 ${isTransparent
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

            <div className={`flex items-center space-x-8 pl-14 border-l transition-colors duration-500 ${isTransparent ? 'border-white/10' : 'border-slate-100'}`}>
              {currentUser && userData?.role !== 'admin' && userData?.role !== 'super-admin' ? (
                <div className="flex items-center space-x-6">
                  <Link to="/renew" className={`group flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 active:scale-95 ${isTransparent
                      ? 'bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white/20'
                      : 'bg-secondary-yellow/50 text-accent-maroon hover:bg-secondary-yellow shadow-md shadow-secondary-yellow/20'
                    }`}>
                    <User size={16} className="group-hover:rotate-12 transition-transform" /> Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all hover:text-red-500 ${isTransparent ? 'text-white/40 hover:text-red-400' : 'text-slate-400'
                      }`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-8">
                  <Link to="/login" className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-primary-600'}`}>
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`relative overflow-hidden px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 group shadow-2xl ${isTransparent
                        ? 'bg-white text-primary-600 hover:shadow-white/20'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/30'
                      }`}
                  >
                    <span className="relative z-10">Join Association</span>
                    <div className="absolute inset-0 bg-accent-maroon/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-3 rounded-2xl transition-all active:scale-90 ${isTransparent ? 'text-white bg-white/10 border border-white/10' : 'text-slate-600 bg-slate-50'}`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-[90] bg-white flex flex-col p-8 pt-32 overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-4xl font-black uppercase tracking-tighter flex items-center justify-between ${location.pathname === link.path ? 'text-primary-600' : 'text-slate-300'}`}
                  >
                    {link.name} <ChevronRight size={32} className="opacity-20" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 space-y-4 pb-12">
              {currentUser && userData?.role !== 'admin' && userData?.role !== 'super-admin' ? (
                <>
                  <Link to="/renew" onClick={() => setIsOpen(false)} className="block w-full py-6 text-center bg-secondary-yellow text-accent-maroon font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-secondary-yellow/20">
                    My Dashboard
                  </Link>
                  <button onClick={logout} className="block w-full py-5 text-center text-red-500 font-black uppercase tracking-widest border-2 border-slate-50 rounded-3xl">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full py-5 text-center text-slate-400 font-black uppercase tracking-widest border-2 border-slate-50 rounded-3xl">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="block w-full py-6 text-center bg-primary-600 text-white font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-primary-600/30">
                    Join Association
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
