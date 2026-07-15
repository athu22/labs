import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

// Translations for Footer
const translations = {
  en: {
    // Brand
    aclap: 'ACLAP',
    maharashtra: 'Maharashtra',
    brandDesc: 'Advancing the standards of Medical laboratory science through education and global collaboration.',

    // Value Line
    valueLine: 'Driven by Integrity. Inspired by Excellence. United in Service.',

    // Explore
    explore: 'Explore',
    home: 'Home',
    aboutUs: 'About Us',
    events: 'Events',
    membership: 'Membership',

    // Legal
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    terms: 'Terms',
    labStandards: 'Lab Standards',
    contact: 'Contact',

    // Contact
    directContact: 'Direct Contact',
    address: 'Mahakashi Cs No 683/5 plot no 21.Gondkar Mala sangli Road,Ichalkaranji, Dist-Kolhapur, PIN- 416115',
    phone: '+91 9921485676',
    email: 'aclapasso@gmail.com',

    // Bottom Bar
    copyright: '© 2026 Association of Medical Laboratory Analysts & Practitioners.',
    legals: 'Legals',
    siteMap: 'Site Map',
  },
  mr: {
    // Brand
    aclap: 'ACLAP',
    maharashtra: 'महाराष्ट्र',
    brandDesc: 'शिक्षण आणि जागतिक सहकार्याद्वारे वैद्यकीय प्रयोगशाळा विज्ञानाची मानके वाढवणे.',

    // Value Line
    valueLine: 'सचोटीने प्रेरित • उत्कृष्टतेसाठी समर्पित • सेवेसाठी एकत्र.',

    // Explore
    explore: 'एक्सप्लोर',
    home: 'मुख्यपृष्ठ',
    aboutUs: 'आमच्याबद्दल',
    events: 'कार्यक्रम',
    membership: 'सदस्यत्व',

    // Legal
    legal: 'कायदेशीर',
    privacyPolicy: 'गोपनीयता धोरण',
    terms: 'अटी',
    labStandards: 'प्रयोगशाळा मानके',
    contact: 'संपर्क',

    // Contact
    directContact: 'थेट संपर्क',
    address: 'महाकाशी सीएस क्र 683/5 प्लॉट क्र. 21. गोंदकर माला सांगली रोड, इचलकरंजी, जिल्हा-कोल्हापूर, पिन- 416115.',
    phone: '+९१ ९९२१४८५६७६',
    email: 'aclapasso@gmail.com',

    // Bottom Bar
    copyright: '© २०२६ असोसिएशन ऑफ मेडिकल लॅबोरेटरी ॲनालिस्ट्स अँड प्रॅक्टिशनर्स.',
    legals: 'कायदेशीर',
    siteMap: 'साइट नकाशा',
  }
};

const Footer = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <footer className="bg-[#fdfcf5] pt-16 pb-8 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* Main Footer Grid */}
        <div className="grid lg:grid-cols-12 gap-12 mb-12">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-white shadow-md rounded-xl p-2">
                <img src="/Logo.png" alt="ACLAP Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-accent-maroon leading-none">{t.aclap}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 mt-1">{t.maharashtra}</span>
              </div>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              {t.brandDesc}
            </p>

            {/* Value Line - Added here */}
            <div className="pt-2 border-t border-secondary-yellow/20">
              <p className="text-[11px] font-bold text-primary-600/80 italic leading-relaxed">
                {t.valueLine}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { icon: <Facebook size={18} />, link: '#' },
                { icon: <Twitter size={18} />, link: '#' },
                { icon: <Instagram size={18} />, link: '#' },
                { icon: <Linkedin size={18} />, link: '#' }
              ].map((social, i) => (
                <a key={i} href={social.link} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2 lg:pl-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">{t.explore}</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all">{t.home}</Link></li>
              <li><Link to="/about" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all">{t.aboutUs}</Link></li>
              <li><Link to="/events" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all">{t.events}</Link></li>
              <li><Link to="/membership" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all">{t.membership}</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">{t.legal}</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all">{t.privacyPolicy}</Link></li>
              <li><Link to="/terms" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all">{t.terms}</Link></li>
              <li><Link to="/lab-standards" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all">{t.labStandards}</Link></li>
              <li><Link to="/contact-us" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all">{t.contact}</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-secondary-yellow/20 rounded-2xl p-7 shadow-sm">
              <h4 className="text-base font-black text-accent-maroon mb-5 tracking-tight">{t.directContact}</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-slate-600 text-sm font-medium p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t.address}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm font-bold p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Phone size={18} className="text-primary-600 flex-shrink-0" />
                  <span>{t.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm font-bold p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Mail size={18} className="text-primary-600 flex-shrink-0" />
                  <span>{t.email}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-secondary-yellow/10">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <ShieldCheck size={14} className="text-primary-600" />
            {t.copyright}
          </div>
          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-primary-600 transition-colors">{t.legals}</Link>
            <Link to="/sitemap" className="hover:text-primary-600 transition-colors">{t.siteMap}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;