import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, RefreshCw, ShieldCheck, ArrowRight, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../context/LanguageContext';

// Translations for Membership Page
const translations = {
  en: {
    // Header
    professionalRegistry: 'Professional Registry',
    chooseMembership: 'Choose Your',
    membershipPath: 'Membership Path',
    membershipDesc: 'Whether you are joining for the first time or maintaining your legacy, we provide a seamless digital experience for all clinical practitioners.',

    // Options
    newMembership: 'New Membership',
    newMembershipDesc: 'Join our elite association of clinical laboratory practitioners. Get verified and access exclusive benefits.',
    startJourney: 'Start Journey',
    renewMembership: 'Renew Membership',
    renewMembershipDesc: 'Maintain your professional status and continue accessing our premium resources and network.',
    stayConnected: 'Stay Connected',
    proceedNow: 'Proceed Now',

    // Benefits
    instantAccess: 'Instant Access',
    instantAccessDesc: 'Digital membership cards issued immediately upon approval.',
    globalRecognition: 'Global Recognition',
    globalRecognitionDesc: 'Join a network recognized by international clinical bodies.',
    secureIdentity: 'Secure Identity',
    secureIdentityDesc: 'Blockchain-backed verification for all clinical credentials.',

    // Meta
    choosePath: 'Choose Your Membership Path',
  },
  mr: {
    // Header
    professionalRegistry: 'व्यावसायिक नोंदणी',
    chooseMembership: 'तुमची',
    membershipPath: 'सदस्यत्व श्रेणी निवडा',
    membershipDesc: 'तुम्ही प्रथमच सामील होत असाल किंवा तुमचा वारसा कायम ठेवत असाल, आम्ही सर्व नैदानिक व्यावसायिकांसाठी अखंड डिजिटल अनुभव प्रदान करतो.',

    // Options
    newMembership: 'नवीन सदस्यत्व',
    newMembershipDesc: 'आमच्या प्रतिष्ठित नैदानिक प्रयोगशाळा व्यावसायिकांच्या संघटनेत सामील व्हा. प्रमाणित व्हा आणि विशेष लाभ मिळवा.',
    startJourney: 'प्रवास सुरू करा',
    renewMembership: 'सदस्यत्व नूतनीकरण',
    renewMembershipDesc: 'तुमची व्यावसायिक स्थिती कायम ठेवा आणि आमच्या प्रीमियम संसाधने आणि नेटवर्कमध्ये प्रवेश सुरू ठेवा.',
    stayConnected: 'जोडलेले राहा',
    proceedNow: 'आता पुढे जा',

    // Benefits
    instantAccess: 'त्वरित प्रवेश',
    instantAccessDesc: 'मंजुरीनंतर त्वरित डिजिटल सदस्यत्व कार्ड जारी केले जातात.',
    globalRecognition: 'जागतिक मान्यता',
    globalRecognitionDesc: 'आंतरराष्ट्रीय नैदानिक संस्थांद्वारे मान्यताप्राप्त नेटवर्कमध्ये सामील व्हा.',
    secureIdentity: 'सुरक्षित ओळख',
    secureIdentityDesc: 'सर्व नैदानिक प्रमाणपत्रांसाठी ब्लॉकचेन-समर्थित सत्यापन.',

    // Meta
    choosePath: 'तुमची सदस्यत्व श्रेणी निवडा',
  }
};

const Membership = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  const options = [
    {
      title: t.newMembership,
      description: t.newMembershipDesc,
      icon: <UserPlus size={40} className="text-primary-600" />,
      path: '/signup',
      color: 'bg-primary-600',
      badge: t.startJourney
    },
    {
      title: t.renewMembership,
      description: t.renewMembershipDesc,
      icon: <RefreshCw size={40} className="text-emerald-500" />,
      path: '/renew',
      color: 'bg-emerald-500',
      badge: t.stayConnected
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 relative overflow-hidden">

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 rounded-l-[5rem] -z-10" />
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-secondary-yellow/10 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4">

        {/* Header Section */}
        <div className="max-w-3xl mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-600 text-[11px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <ShieldCheck size={14} /> {t.professionalRegistry}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6 sm:mb-8"
          >
            {t.chooseMembership} <br />
            <span className="text-primary-600">{t.membershipPath}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 font-medium leading-relaxed"
          >
            {t.membershipDesc}
          </motion.p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {options.map((option, i) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
            >
              <Link to={option.path} className="group block relative h-full">
                <div className="h-full bg-white border border-slate-100 rounded-[3rem] p-10 lg:p-14 shadow-2xl shadow-slate-900/5 transition-all duration-500 hover:shadow-primary-600/10 hover:-translate-y-2 group-hover:border-primary-600/20 overflow-hidden">

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-10 group-hover:bg-primary-50 transition-colors duration-500" />

                  <div className="flex flex-col h-full">
                    <div className="mb-10 inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-[1.5rem] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      {option.icon}
                    </div>

                    <div className="mt-auto">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block group-hover:text-primary-600 transition-colors">
                        {option.badge}
                      </span>
                      <h2 className="text-3xl font-black text-slate-900 mb-6 group-hover:text-primary-600 transition-colors">
                        {option.title}
                      </h2>
                      <p className="text-slate-500 font-medium leading-relaxed mb-10 text-lg">
                        {option.description}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center text-white shadow-lg`}>
                          <ArrowRight size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">{t.proceedNow}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Benefits Quick Glance */}
        <div className="mt-32 pt-20 border-t border-slate-100">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Zap className="text-secondary-yellow" />, title: t.instantAccess, text: t.instantAccessDesc },
              { icon: <Award className="text-primary-600" />, title: t.globalRecognition, text: t.globalRecognitionDesc },
              { icon: <ShieldCheck className="text-emerald-500" />, title: t.secureIdentity, text: t.secureIdentityDesc }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className="flex gap-5"
              >
                <div className="shrink-0">{benefit.icon}</div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2">{benefit.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{benefit.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Membership;