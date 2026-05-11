import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#fdfcf5] border-t-4 border-secondary-yellow/30 pt-16 pb-8 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">

        {/* Main Footer Grid - More Compact */}
        <div className="grid lg:grid-cols-12 gap-12 mb-12">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white shadow-md rounded-xl p-2 border border-secondary-yellow/20">
                <img src="/Logo.png" alt="ACLAP Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-accent-maroon leading-none">ACLAP</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-600 mt-1">Maharashtra</span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
              Advancing the standards of clinical laboratory science through education and global collaboration.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Facebook size={16} />, link: '#' },
                { icon: <Twitter size={16} />, link: '#' },
                { icon: <Instagram size={16} />, link: '#' },
                { icon: <Linkedin size={16} />, link: '#' }
              ].map((social, i) => (
                <a key={i} href={social.link} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2 lg:pl-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-xs font-bold text-slate-600 hover:text-primary-600 transition-all">Home</Link></li>
              <li><Link to="/about" className="text-xs font-bold text-slate-600 hover:text-primary-600 transition-all">About Us</Link></li>
              <li><Link to="/events" className="text-xs font-bold text-slate-600 hover:text-primary-600 transition-all">Events</Link></li>
              <li><Link to="/membership" className="text-xs font-bold text-slate-600 hover:text-primary-600 transition-all">Membership</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms', 'Lab Standards', 'Contact'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-xs font-bold text-slate-600 hover:text-primary-600 transition-all">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column - More Compact */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-secondary-yellow/20 rounded-3xl p-8 shadow-sm">
              <h4 className="text-base font-black text-accent-maroon mb-6 tracking-tight">Direct Contact</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                  <MapPin size={16} className="text-primary-600" />
                  <span>Mumbai, Maharashtra 400001</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                  <Phone size={16} className="text-primary-600" />
                  <span>+91 22 2345 6789</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                  <Mail size={16} className="text-primary-600" />
                  <span>info@aclap.org</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar - Clean */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
            <ShieldCheck size={14} className="text-primary-600" />
            © 2026 Association of Clinical Laboratory Analysts & Practitioners.
          </div>
          <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-6">
            <Link to="#" className="hover:text-primary-600 transition-colors">Legals</Link>
            <Link to="#" className="hover:text-primary-600 transition-colors">Site Map</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
