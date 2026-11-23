import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Phone, MapPin, Clock, Send, MessageCircle,
    Facebook, Twitter, Instagram, Linkedin, Youtube,
    CheckCircle, Globe, Building2, Users, Award, Calendar,
    Shield, Headphones, Zap, ArrowRight, Copy, Check,
    ExternalLink, Printer, Download, Heart, Coffee,
    User, Briefcase, FileText, AlertCircle, Star, ThumbsUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

// Translations for Contact Page
const translations = {
    en: {
        // Hero
        supportAvailable: 'Support Available 24/7',
        getInTouch: 'Get in',
        touch: 'Touch',
        contactDesc: "We're here to assist you with any questions about membership, events, or partnership opportunities. Fill out the form below and our team will respond within 24 hours.",
        secureForm: 'Secure Form',
        sslEncrypted: 'SSL Encrypted',
        responseTime: 'Response Time',
        responseValue: '< 24 Hours',
        happyMembers: 'Happy Members',
        membersValue: '5000+',
        rating: 'Rating',
        ratingValue: '4.9/5 Stars',

        // Form
        sendMessage: 'Send us a Message',
        formDesc: 'Fill out the form below and our team will assist you promptly',
        fullName: 'Full Name',
        emailAddress: 'Email Address',
        phoneNumber: 'Phone Number',
        membershipId: 'Membership ID (if applicable)',
        inquiryCategory: 'Inquiry Category',
        priorityLevel: 'Priority Level',
        subject: 'Subject',
        message: 'Message',
        characters: 'characters',
        newsletter: 'Subscribe to our newsletter for updates on events and industry news',
        sendingMessage: 'Sending Message...',
        sendMessageBtn: 'Send Message',
        successMessage: 'Message sent successfully! We\'ll get back to you soon.',
        failedMessage: 'Failed to send message. Please try again.',
        networkError: 'Network error. Please check your connection and try again.',

        // Sidebar
        contactInformation: 'Contact Information',
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        officeHours: 'Office Hours',
        openNow: 'Open Now',
        mondayFriday: 'Monday - Friday',
        mondayFridayHours: '9:00 AM - 6:00 PM',
        saturday: 'Saturday',
        saturdayHours: '10:00 AM - 2:00 PM',
        sunday: 'Sunday',
        sundayHours: 'Closed',
        members: 'Members',
        partnerLabs: 'Partner Labs',
        awards: 'Awards',
        eventsPerYear: 'Events/Year',
        emergencySupport: 'Emergency Support',
        helplineAvailable: '24/7 Helpline Available',

        // FAQ
        faqTitle: 'Frequently Asked Questions',
        faqSubtitle: "Got Questions? We've Got Answers",
        faq1q: 'How do I become a member?',
        faq1a: 'You can apply for membership by clicking the "Join Association" button on our homepage. Fill out the registration form, submit required documents, and our team will review your application within 2-3 business days.',
        faq2q: 'What are the membership benefits?',
        faq2a: 'Members get access to certification programs, networking events, research resources, legal support, discounted conference fees, and exclusive industry publications.',
        faq3q: 'How can I register for events?',
        faq3a: 'Visit our Events page, browse upcoming events, select the one you want to attend, and click "Register Now". Members receive early bird discounts and priority registration.',
        faq4q: 'How do I renew my membership?',
        faq4a: 'Login to your member portal, navigate to the renewal section, and complete the payment process. You can renew annually using credit card, net banking, or UPI.',
        faq5q: 'What is the refund policy?',
        faq5a: 'Membership fees are non-refundable but can be transferred. Event registration refunds are available up to 30 days before the event date.',
        faq6q: 'Can I volunteer at ACLAP?',
        faq6a: 'Absolutely! We welcome volunteers for events, committee participation, and regional chapter activities. Fill out the contact form with "Volunteer" as subject.',

        // WhatsApp
        chatOnWhatsApp: 'Chat on WhatsApp',

        // Categories
        generalInquiry: 'General Inquiry',
        membershipRelated: 'Membership Related',
        eventRegistration: 'Event Registration',
        technicalSupport: 'Technical Support',
        partnershipOpportunity: 'Partnership Opportunity',
        feedbackSuggestion: 'Feedback / Suggestion',
        lowPriority: 'Low Priority',
        normalPriority: 'Normal Priority',
        highPriority: 'High Priority',
        urgent: 'Urgent',
        required: '*',
    },
    mr: {
        // Hero
        supportAvailable: '२४/७ समर्थन उपलब्ध',
        getInTouch: 'संपर्क',
        touch: 'करा',
        contactDesc: 'आम्ही सदस्यत्व, कार्यक्रम किंवा भागीदारी संधींबद्दल कोणत्याही प्रश्नांमध्ये मदत करण्यासाठी येथे आहोत. खालील फॉर्म भरा आणि आमची टीम २४ तासांत प्रतिसाद देईल.',
        secureForm: 'सुरक्षित फॉर्म',
        sslEncrypted: 'SSL एन्क्रिप्टेड',
        responseTime: 'प्रतिसाद वेळ',
        responseValue: '< २४ तास',
        happyMembers: 'आनंदी सदस्य',
        membersValue: '5000+',
        rating: 'रेटिंग',
        ratingValue: '४.९/५ तारे',

        // Form
        sendMessage: 'आम्हाला संदेश पाठवा',
        formDesc: 'खालील फॉर्म भरा आणि आमची टीम त्वरित मदत करेल',
        fullName: 'पूर्ण नाव',
        emailAddress: 'ईमेल पत्ता',
        phoneNumber: 'फोन नंबर',
        membershipId: 'सदस्यत्व आयडी (असल्यास)',
        inquiryCategory: 'चौकशी श्रेणी',
        priorityLevel: 'प्राधान्य पातळी',
        subject: 'विषय',
        message: 'संदेश',
        characters: 'अक्षरे',
        newsletter: 'कार्यक्रम आणि उद्योग बातम्यांसाठी आमच्या वृत्तपत्राची सदस्यता घ्या',
        sendingMessage: 'संदेश पाठवत आहे...',
        sendMessageBtn: 'संदेश पाठवा',
        successMessage: 'संदेश यशस्वीरित्या पाठवला! आम्ही लवकरच तुमच्याशी संपर्क साधू.',
        failedMessage: 'संदेश पाठवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        networkError: 'नेटवर्क त्रुटी. कृपया तुमचे कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.',

        // Sidebar
        contactInformation: 'संपर्क माहिती',
        phone: 'फोन',
        email: 'ईमेल',
        address: 'पत्ता',
        officeHours: 'कार्यालयीन वेळ',
        openNow: 'आता खुले',
        mondayFriday: 'सोमवार - शुक्रवार',
        mondayFridayHours: 'सकाळी ९:०० - संध्याकाळी ६:००',
        saturday: 'शनिवार',
        saturdayHours: 'सकाळी १०:०० - दुपारी २:००',
        sunday: 'रविवार',
        sundayHours: 'बंद',
        members: 'सदस्य',
        partnerLabs: 'भागीदार प्रयोगशाळा',
        awards: 'पुरस्कार',
        eventsPerYear: 'कार्यक्रम/वर्ष',
        emergencySupport: 'आपत्कालीन समर्थन',
        helplineAvailable: '२४/७ हेल्पलाइन उपलब्ध',

        // FAQ
        faqTitle: 'वारंवार विचारले जाणारे प्रश्न',
        faqSubtitle: 'प्रश्न आहेत? आमच्याकडे उत्तरे आहेत',
        faq1q: 'मी सदस्य कसा होऊ?',
        faq1a: 'तुम्ही आमच्या मुख्यपृष्ठावरील "संघात सामील व्हा" बटणावर क्लिक करून सदस्यत्वासाठी अर्ज करू शकता. नोंदणी फॉर्म भरा, आवश्यक कागदपत्रे सबमिट करा आणि आमची टीम २-३ कार्य दिवसांत तुमच्या अर्जाची पुनरावलोकन करेल.',
        faq2q: 'सदस्यत्वाचे फायदे काय आहेत?',
        faq2a: 'सदस्यांना प्रमाणपत्र कार्यक्रम, नेटवर्किंग इव्हेंट्स, संशोधन संसाधने, कायदेशीर समर्थन, सवलतीच्या परिषद शुल्क आणि विशेष उद्योग प्रकाशनांमध्ये प्रवेश मिळतो.',
        faq3q: 'मी कार्यक्रमांसाठी नोंदणी कशी करू?',
        faq3a: 'आमच्या कार्यक्रम पृष्ठाला भेट द्या, आगामी कार्यक्रम ब्राउझ करा, तुम्हाला उपस्थित राहायचा असलेला कार्यक्रम निवडा आणि "आता नोंदणी करा" क्लिक करा. सदस्यांना लवकर पक्षी सवलत आणि प्राधान्य नोंदणी मिळते.',
        faq4q: 'मी माझे सदस्यत्व कसे नूतनीकरण करू?',
        faq4a: 'तुमच्या सदस्य पोर्टलवर लॉगिन करा, नूतनीकरण विभागात जा आणि पेमेंट प्रक्रिया पूर्ण करा. तुम्ही क्रेडिट कार्ड, नेट बँकिंग किंवा UPI वापरून वार्षिक नूतनीकरण करू शकता.',
        faq5q: 'रिफंड धोरण काय आहे?',
        faq5a: 'सदस्यत्व शुल्क परताव्यायोग्य नाही परंतु हस्तांतरित केले जाऊ शकते. कार्यक्रम नोंदणी रिफंड कार्यक्रमाच्या तारखेपूर्वी ३० दिवसांपर्यंत उपलब्ध आहेत.',
        faq6q: 'मी ACLAP मध्ये स्वयंसेवक होऊ शकतो का?',
        faq6a: 'अर्थात! आम्ही कार्यक्रम, समिती सहभाग आणि प्रादेशिक शाखा क्रियाकलापांसाठी स्वयंसेवकांचे स्वागत करतो. "स्वयंसेवक" विषय म्हणून संपर्क फॉर्म भरा.',

        // WhatsApp
        chatOnWhatsApp: 'व्हॉट्सॲपवर चॅट करा',

        // Categories
        generalInquiry: 'सामान्य चौकशी',
        membershipRelated: 'सदस्यत्व संबंधित',
        eventRegistration: 'कार्यक्रम नोंदणी',
        technicalSupport: 'तांत्रिक समर्थन',
        partnershipOpportunity: 'भागीदारी संधी',
        feedbackSuggestion: 'अभिप्राय / सूचना',
        lowPriority: 'कमी प्राधान्य',
        normalPriority: 'सामान्य प्राधान्य',
        highPriority: 'उच्च प्राधान्य',
        urgent: 'तातडीचे',
        required: '*',
    }
};

// Missing HandshakeIcon component
const HandshakeIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 15 L8 15 L8 21 L2 21 Z" />
        <path d="M22 15 L16 15 L16 21 L22 21 Z" />
        <path d="M8 15 L16 15 L16 21 L8 21 Z" />
        <path d="M5 9 L19 9" />
        <path d="M8 5 L16 5" />
        <path d="M2 9 L5 9 L5 15 L2 15 Z" />
        <path d="M22 9 L19 9 L19 15 L22 15 Z" />
    </svg>
);

const ChevronDown = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const Contact = () => {
    const { language } = useContext(LanguageContext);
    const t = translations[language];

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        membershipId: '',
        category: 'general',
        priority: 'normal',
        subject: '',
        message: '',
        newsletter: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [copiedField, setCopiedField] = useState(null);
    const [activeFaq, setActiveFaq] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        if (error) setError('');
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${API_URL}/api/contact/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    membershipId: '',
                    category: 'general',
                    priority: 'normal',
                    subject: '',
                    message: '',
                    newsletter: false
                });
                setTimeout(() => setIsSubmitted(false), 5000);
            } else {
                setError(data.message || t.failedMessage);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setError(t.networkError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const categories = [
        { value: 'general', label: t.generalInquiry, icon: <MessageCircle size={16} /> },
        { value: 'membership', label: t.membershipRelated, icon: <Users size={16} /> },
        { value: 'event', label: t.eventRegistration, icon: <Calendar size={16} /> },
        { value: 'technical', label: t.technicalSupport, icon: <Headphones size={16} /> },
        { value: 'partnership', label: t.partnershipOpportunity, icon: <HandshakeIcon size={16} /> },
        { value: 'feedback', label: t.feedbackSuggestion, icon: <ThumbsUp size={16} /> }
    ];

    const priorities = [
        { value: 'low', label: t.lowPriority, color: 'bg-green-100 text-green-700' },
        { value: 'normal', label: t.normalPriority, color: 'bg-blue-100 text-blue-700' },
        { value: 'high', label: t.highPriority, color: 'bg-orange-100 text-orange-700' },
        { value: 'urgent', label: t.urgent, color: 'bg-red-100 text-red-700' }
    ];

    const faqs = [
        { q: t.faq1q, a: t.faq1a },
        { q: t.faq2q, a: t.faq2a },
        { q: t.faq3q, a: t.faq3a },
        { q: t.faq4q, a: t.faq4a },
        { q: t.faq5q, a: t.faq5a },
        { q: t.faq6q, a: t.faq6a }
    ];

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen pt-32 pb-24 overflow-hidden">

            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-600/5 to-secondary-yellow/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/5 to-purple-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-600/3 to-secondary-yellow/3 rounded-full blur-3xl" />
            </div>

            {/* Hero Section */}
            <section className="relative mb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-slate-600">{t.supportAvailable}</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6">
                            {t.getInTouch}{' '}
                            <span className="relative inline-block">
                                {t.touch}
                                <svg className="absolute bottom-2 left-0 w-full h-4 text-secondary-yellow -z-10" viewBox="0 0 200 10">
                                    <path d="M0 5 Q 50 10 100 5 T 200 5" stroke="currentColor" fill="none" strokeWidth="4" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                            {t.contactDesc}
                        </p>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center gap-8 mt-10">
                            {[
                                { icon: <Shield size={20} />, label: t.secureForm, value: t.sslEncrypted },
                                { icon: <Clock size={20} />, label: t.responseTime, value: t.responseValue },
                                { icon: <Users size={20} />, label: t.happyMembers, value: t.membersValue },
                                { icon: <Star size={20} />, label: t.rating, value: t.ratingValue }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white rounded-full px-5 py-2 shadow-sm">
                                    <div className="text-primary-600">{item.icon}</div>
                                    <div>
                                        <p className="text-xs text-slate-500">{item.label}</p>
                                        <p className="text-sm font-bold text-slate-900">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Contact Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Contact Form - 7 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
                                <h2 className="text-2xl font-black text-white mb-2">{t.sendMessage}</h2>
                                <p className="text-primary-100 text-sm">{t.formDesc}</p>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Row 1: Full Name & Email */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                                            {t.fullName} <span className="text-red-500">{t.required}</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                                                placeholder="Dr. Rajesh Mehta"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                                            {t.emailAddress} <span className="text-red-500">{t.required}</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                                                placeholder="dr.rajesh@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Phone & Membership ID */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                                            {t.phoneNumber}
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                                            {t.membershipId}
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="membershipId"
                                                value={formData.membershipId}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                                                placeholder="ACM-2024-XXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 3: Category & Priority */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                                            {t.inquiryCategory} <span className="text-red-500">{t.required}</span>
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                                            {t.priorityLevel}
                                        </label>
                                        <div className="flex gap-3">
                                            {priorities.map(pri => (
                                                <label key={pri.value} className="flex-1 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="priority"
                                                        value={pri.value}
                                                        checked={formData.priority === pri.value}
                                                        onChange={handleChange}
                                                        className="hidden peer"
                                                    />
                                                    <div className={`text-center py-2 rounded-lg border-2 transition-all peer-checked:border-primary-600 peer-checked:bg-primary-50 ${pri.color}`}>
                                                        <span className="text-xs font-bold">{pri.label}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Subject */}
                                <div>
                                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                                        {t.subject} <span className="text-red-500">{t.required}</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                                        placeholder="Brief description of your inquiry"
                                    />
                                </div>

                                {/* Row 5: Message */}
                                <div>
                                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                                        {t.message} <span className="text-red-500">{t.required}</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all resize-none"
                                        placeholder="Please provide detailed information about your inquiry..."
                                    />
                                    <p className="text-xs text-slate-400 mt-2">
                                        {formData.message.length} {t.characters}
                                    </p>
                                </div>

                                {/* Newsletter Checkbox */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="newsletter"
                                        checked={formData.newsletter}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-600"
                                    />
                                    <label className="text-sm text-slate-600">
                                        {t.newsletter}
                                    </label>
                                </div>

                                {/* Error Message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                                        >
                                            <AlertCircle size={18} className="text-red-600" />
                                            <span className="text-sm text-red-600 font-medium">{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-600/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {t.sendingMessage}
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                            {t.sendMessageBtn}
                                        </>
                                    )}
                                </button>

                                {/* Success Message */}
                                <AnimatePresence>
                                    {isSubmitted && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                                        >
                                            <CheckCircle size={18} className="text-emerald-600" />
                                            <span className="text-sm text-emerald-600 font-medium">
                                                {t.successMessage}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </motion.div>

                    {/* Right Sidebar - 5 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-5 space-y-6"
                    >
                        {/* Contact Information Cards - Updated with real data from image */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <Phone size={16} className="text-primary-600" />
                                </div>
                                {t.contactInformation}
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { icon: <Phone size={18} />, label: t.phone, value: '+91 9921485676', copy: '+91 9921465676' },
                                    { icon: <Mail size={18} />, label: t.email, value: 'aclapasso@gmail.com', copy: 'aclapasso@gmail.com' },
                                    { icon: <MapPin size={18} />, label: t.address, value: 'Mahakashi Cs No 683/5 plot no 21.Gondkar Mala sangli Road,Ichalkaranji, Dist-Kolhapur, PIN- 416115.' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="text-primary-600">{item.icon}</div>
                                            <div>
                                                <p className="text-xs text-slate-500">{item.label}</p>
                                                <p className="text-sm font-bold text-slate-900">{item.value}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(item.copy, item.label)}
                                            className="p-2 hover:bg-white rounded-lg transition-colors"
                                        >
                                            {copiedField === item.label ?
                                                <Check size={16} className="text-green-500" /> :
                                                <Copy size={16} className="text-slate-400" />
                                            }
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Registration Number Display */}
                            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs text-slate-500">Registration Number</p>
                                <p className="text-sm font-bold text-slate-900">S.R. Act. No.: MAH/1076/2005/Pune,B.P.T ACT.F.21158/Pune</p>
                            </div>
                        </div>

                        {/* Office Hours with Live Status */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-white">
                                    <Clock size={20} />
                                    <h3 className="text-lg font-black text-white">{t.officeHours}</h3>
                                </div>
                                <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold">{t.openNow}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { day: t.mondayFriday, hours: t.mondayFridayHours },
                                    { day: t.saturday, hours: t.saturdayHours },
                                    { day: t.sunday, hours: t.sundayHours }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-slate-300 text-sm">{item.day}</span>
                                        <span className="text-white font-bold text-sm">{item.hours}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Users size={22} className="text-primary-600" />
                                </div>
                                <p className="text-2xl font-black text-slate-900">5K+</p>
                                <p className="text-xs font-bold text-slate-500">{t.members}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Building2 size={22} className="text-emerald-600" />
                                </div>
                                <p className="text-2xl font-black text-slate-900">500+</p>
                                <p className="text-xs font-bold text-slate-500">{t.partnerLabs}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Award size={22} className="text-purple-600" />
                                </div>
                                <p className="text-2xl font-black text-slate-900">50+</p>
                                <p className="text-xs font-bold text-slate-500">{t.awards}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Calendar size={22} className="text-orange-600" />
                                </div>
                                <p className="text-2xl font-black text-slate-900">100+</p>
                                <p className="text-xs font-bold text-slate-500">{t.eventsPerYear}</p>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                                    <Phone size={18} className="text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-600 uppercase">{t.emergencySupport}</p>
                                    <p className="text-sm font-bold text-slate-900">{t.helplineAvailable}</p>
                                </div>
                            </div>
                            <p className="text-2xl font-black text-slate-900">+91 9921485676</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* FAQ Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="text-center mb-12">
                    <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em] bg-primary-50 px-4 py-2 rounded-full inline-block">
                        {t.faqTitle}
                    </span>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mt-4">{t.faqSubtitle}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
                            onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                                    {faq.q}
                                </h3>
                                <div className="text-primary-600 transition-transform group-hover:rotate-180">
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {activeFaq === idx && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3"
                                    >
                                        <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* WhatsApp Chat Button */}
            <motion.a
                href="https://wa.me/919921485676?text=Hello%20ACLAP%2C%20I%20need%20assistance%20with..."
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-full shadow-2xl hover:shadow-xl transition-all group"
            >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{t.chatOnWhatsApp}</span>
            </motion.a>
        </div>
    );
};

export default Contact;