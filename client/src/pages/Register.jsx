import React, { useState, useContext } from 'react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
   User, Mail, Phone, MapPin, Briefcase, FileText,
   ChevronRight, CheckCircle2, ShieldCheck, Loader2, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

// Translations for Register Page
const translations = {
   en: {
      // Header
      professionalRegistry: 'Professional Registry',
      eliteCircle: 'Join the',
      eliteHighlight: 'Elite',
      eliteEnd: 'Circle of Practitioners',
      registerDesc: 'By registering, you gain access to a unified ecosystem of professional verification, continuous learning, and exclusive association benefits.',
      verifiedIdentity: 'Verified Identity',
      verifiedIdentityDesc: 'Standardized clinical practitioner verification.',
      smartCompliance: 'Smart Compliance',
      smartComplianceDesc: 'Automatic updates on new clinical regulations.',

      // Form Sections
      personalIdentity: 'Personal Identity',
      professionalNode: 'Professional Node',
      digitalDocumentation: 'Digital Documentation',

      // Personal Fields
      firstName: 'First Name',
      fatherName: "Father's Name",
      motherName: "Mother's Name",
      surname: 'Surname',
      emailConnection: 'Email Connection',
      phoneLine: 'Phone Line',
      dateOfBirth: 'Date of Birth',
      experience: 'Experience (Years)',

      // Professional Fields
      registrationNo: 'P.M.C./A.H.P. Reg. No.',
      highestQualification: 'Highest Qualification',
      labOrganization: 'Name of Lab / Organization',
      labAddress: 'Address of Lab',
      district: 'District',
      taluka: 'Taluka',
      cityVillage: 'City / Village',
      pinCode: 'Pin Code',
      officePhone: 'Office Phone / Fax',
      state: 'State',
      enterFirstName: 'First Name',
      enterFatherName: 'Father Name',
      enterMotherName: 'Mother Name',
      enterSurname: 'Surname',
      enterPhone: '+91 ••••• •••••',
      enterExperience: 'e.g. 5',
      enterRegistrationNo: 'Official Reg Number',
      enterQualification: 'e.g. M.Sc. Micro / DMLT',
      enterOrganization: 'Current working organization',
      enterAddress: 'Full address for correspondence',
      enterDistrict: 'e.g. Nashik',
      enterTaluka: 'e.g. Niphad',
      enterCity: 'e.g. Ozar',
      enterPincode: '6-digit PIN',
      enterOfficePhone: 'Optional',

      // File Upload
      profileIdentity: 'Profile Identity (Photo)',
      degreeValidation: 'Degree Validation (PDF)',
      aadharCard: 'Aadhar Card',
      panCard: 'PAN Card',
      registrationCertificate: 'Registration Certificate',
      bioWasteCertificate: 'Bio-Waste Medical Certificate',
      specialCourseAward: 'Special Course / Award',
      shopActDocument: 'Shop Act / Establishment',
      visitingCard: 'Visiting Card / Letter Head',
      uploadJpgPng: 'Upload JPG/PNG',
      uploadPdf: 'Upload PDF',
      uploadPdfJpg: 'Upload PDF/JPG',

      // Buttons
      commitRegistration: 'Commit Registration',
      processingNode: 'Processing Node',
      secureSubmission: 'Secure 256-bit AES Encrypted Submission',

      // Success
      applicationLodged: 'Application Lodged',
      successDesc: 'Your membership application is being reviewed by the administrative node. You will receive an update via email shortly.',
      returnToTerminal: 'Return to Terminal',
      continueToEvent: 'Continue to Event',

      // Errors
      errorSubmitting: 'Error submitting registration. Please try again.',
   },
   mr: {
      // Header
      professionalRegistry: 'व्यावसायिक नोंदणी',
      eliteCircle: 'मध्ये सामील व्हा',
      eliteHighlight: 'उत्कृष्ट',
      eliteEnd: 'व्यावसायिकांचे वर्तुळ',
      registerDesc: 'नोंदणी करून, तुम्हाला व्यावसायिक सत्यापन, सतत शिक्षण आणि विशेष संघटना लाभांच्या एकत्रित परिसंस्थेमध्ये प्रवेश मिळतो.',
      verifiedIdentity: 'सत्यापित ओळख',
      verifiedIdentityDesc: 'प्रमाणित नैदानिक व्यावसायिक सत्यापन.',
      smartCompliance: 'स्मार्ट अनुपालन',
      smartComplianceDesc: 'नवीन नैदानिक नियमांवर स्वयंचलित अद्यतने.',

      // Form Sections
      personalIdentity: 'वैयक्तिक ओळख',
      professionalNode: 'व्यावसायिक नोड',
      digitalDocumentation: 'डिजिटल दस्तऐवजीकरण',

      // Personal Fields
      firstName: 'पहिले नाव',
      fatherName: "वडिलांचे नाव",
      motherName: "आईचे नाव",
      surname: 'आडनाव',
      emailConnection: 'ईमेल कनेक्शन',
      phoneLine: 'फोन लाइन',
      dateOfBirth: 'जन्मतारीख',
      experience: 'अनुभव (वर्षे)',

      // Professional Fields
      registrationNo: 'पी.एम.सी./ए.एच.पी. नोंदणी क्र.',
      highestQualification: 'सर्वोच्च पात्रता',
      labOrganization: 'प्रयोगशाळा / संस्थेचे नाव',
      labAddress: 'प्रयोगशाळेचा पत्ता',
      district: 'जिल्हा',
      taluka: 'तालुका',
      cityVillage: 'शहर / गाव',
      pinCode: 'पिन कोड',
      officePhone: 'कार्यालयीन फोन / फॅक्स',
      state: 'राज्य',
      enterFirstName: 'पहिले नाव',
      enterFatherName: 'वडिलांचे नाव',
      enterMotherName: 'आईचे नाव',
      enterSurname: 'आडनाव',
      enterPhone: '+९१ ••••• •••••',
      enterExperience: 'उदा. ५',
      enterRegistrationNo: 'अधिकृत नोंदणी क्रमांक',
      enterQualification: 'उदा. एम.एससी. मायक्रो / डीएमएलटी',
      enterOrganization: 'सध्याची कार्यरत संस्था',
      enterAddress: 'पत्रव्यवहारासाठी पूर्ण पत्ता',
      enterDistrict: 'उदा. नाशिक',
      enterTaluka: 'उदा. निफाड',
      enterCity: 'उदा. ओझर',
      enterPincode: '६-अंकी पिन',
      enterOfficePhone: 'ऐच्छिक',

      // File Upload
      profileIdentity: 'प्रोफाइल ओळख (फोटो)',
      degreeValidation: 'पदवी प्रमाणीकरण (PDF)',
      aadharCard: 'आधार कार्ड',
      panCard: 'पॅन कार्ड',
      registrationCertificate: 'नोंदणी प्रमाणपत्र',
      bioWasteCertificate: 'जैव-कचरा वैद्यकीय प्रमाणपत्र',
      specialCourseAward: 'विशेष अभ्यासक्रम / पुरस्कार',
      shopActDocument: 'दुकान कायदा / स्थापना',
      visitingCard: 'व्हिजिटिंग कार्ड / लेटर हेड',
      uploadJpgPng: 'JPG/PNG अपलोड करा',
      uploadPdf: 'PDF अपलोड करा',
      uploadPdfJpg: 'PDF/JPG अपलोड करा',

      // Buttons
      commitRegistration: 'नोंदणी सबमिट करा',
      processingNode: 'नोड प्रक्रिया करत आहे',
      secureSubmission: 'सुरक्षित २५६-बिट AES एन्क्रिप्टेड सबमिशन',

      // Success
      applicationLodged: 'अर्ज सबमिट केला',
      successDesc: 'तुमच्या सदस्यत्व अर्जाची प्रशासकीय नोडद्वारे पुनरावलोकन केली जात आहे. तुम्हाला लवकरच ईमेलद्वारे अद्यतन प्राप्त होईल.',
      returnToTerminal: 'मुख्यपृष्ठावर परत',
      continueToEvent: 'कार्यक्रमाकडे जा',

      // Errors
      errorSubmitting: 'नोंदणी सबमिट करण्यात त्रुटी. कृपया पुन्हा प्रयत्न करा.',
   }
};

const Register = () => {
   const { currentUser, userData } = useAuth();
   const { language } = useContext(LanguageContext);
   const t = translations[language];
   const location = useLocation();
   const navigate = useNavigate();
   const from = location.state?.from?.pathname || '/';

   const [formData, setFormData] = useState({
      firstName: '',
      fatherName: '',
      motherName: '',
      surname: '',
      email: currentUser?.email || '',
      phone: '',
      organization: '',
      district: '',
      taluka: '',
      city: '',
      state: 'Maharashtra',
      address: '',
      experience: '',
      dob: '',
      registrationNo: '',
      qualification: '',
      pincode: '',
      officePhone: ''
   });

   const [files, setFiles] = useState({
      profilePhoto: null,
      degreeCertificate: null,
      aadharCard: null,
      panCard: null,
      registrationCertificate: null,
      bioWasteCertificate: null,
      awardCertificate: null,
      shopActDocument: null,
      visitingCard: null
   });

   const [submitting, setSubmitting] = useState(false);
   const [submitted, setSubmitted] = useState(false);

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleFileChange = (e) => {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);

      try {
         // 1. Upload Files
         let profileUrl = '';
         let degreeUrl = '';
         let aadharUrl = '';
         let panUrl = '';
         let registrationUrl = '';
         let bioWasteUrl = '';
         let awardUrl = '';
         let shopActUrl = '';
         let visitingCardUrl = '';

         if (files.profilePhoto) {
            const photoRef = ref(storage, `profiles/${Date.now()}_${files.profilePhoto.name}`);
            const snap = await uploadBytes(photoRef, files.profilePhoto);
            profileUrl = await getDownloadURL(snap.ref);
         }

         if (files.degreeCertificate) {
            const degreeRef = ref(storage, `certificates/${Date.now()}_${files.degreeCertificate.name}`);
            const snap = await uploadBytes(degreeRef, files.degreeCertificate);
            degreeUrl = await getDownloadURL(snap.ref);
         }
         if (files.aadharCard) {
            const aadharRef = ref(storage, `aadhar/${Date.now()}_${files.aadharCard.name}`);
            const snap = await uploadBytes(aadharRef, files.aadharCard);
            aadharUrl = await getDownloadURL(snap.ref);
         }

         if (files.panCard) {
            const panRef = ref(storage, `pan/${Date.now()}_${files.panCard.name}`);
            const snap = await uploadBytes(panRef, files.panCard);
            panUrl = await getDownloadURL(snap.ref);
         }

         if (files.registrationCertificate) {
            const fileRef = ref(storage, `registration/${Date.now()}_${files.registrationCertificate.name}`);
            const snap = await uploadBytes(fileRef, files.registrationCertificate);
            registrationUrl = await getDownloadURL(snap.ref);
         }

         if (files.bioWasteCertificate) {
            const fileRef = ref(storage, `biowaste/${Date.now()}_${files.bioWasteCertificate.name}`);
            const snap = await uploadBytes(fileRef, files.bioWasteCertificate);
            bioWasteUrl = await getDownloadURL(snap.ref);
         }

         if (files.awardCertificate) {
            const fileRef = ref(storage, `awards/${Date.now()}_${files.awardCertificate.name}`);
            const snap = await uploadBytes(fileRef, files.awardCertificate);
            awardUrl = await getDownloadURL(snap.ref);
         }

         if (files.shopActDocument) {
            const fileRef = ref(storage, `shopact/${Date.now()}_${files.shopActDocument.name}`);
            const snap = await uploadBytes(fileRef, files.shopActDocument);
            shopActUrl = await getDownloadURL(snap.ref);
         }
         if (files.visitingCard) {
            const fileRef = ref(storage, `visitingcard/${Date.now()}_${files.visitingCard.name}`);
            const snap = await uploadBytes(fileRef, files.visitingCard);
            visitingCardUrl = await getDownloadURL(snap.ref);
         }

         // 2. Save Data to Firestore
         const fullName = `${formData.firstName} ${formData.fatherName} ${formData.surname}`.trim();

         await addDoc(collection(db, 'registrations'), {
            ...formData,
            uid: currentUser.uid,
            profilePhoto: profileUrl,
            degreeCertificate: degreeUrl,
            aadharCard: aadharUrl,
            panCard: panUrl,
            status: 'pending',
            createdAt: serverTimestamp(),
            registrationCertificate: registrationUrl,
            bioWasteCertificate: bioWasteUrl,
            awardCertificate: awardUrl,
            shopActDocument: shopActUrl,
            visitingCard: visitingCardUrl,
         });

         setSubmitted(true);
      } catch (error) {
         console.error("Registration Error:", error);
         alert(t.errorSubmitting);
      } finally {
         setSubmitting(false);
      }
   };

   if (submitted) return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
         <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md border border-slate-100"
         >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
               <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{t.applicationLodged}</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">
               {t.successDesc}
            </p>
            <button
               onClick={() => navigate(from)}
               className="w-full py-4 bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
               {from === '/' ? t.returnToTerminal : t.continueToEvent}
            </button>
         </motion.div>
      </div>
   );

   return (
      <div className="min-h-screen bg-white pt-32 pb-24 relative overflow-hidden">

         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 rounded-l-[5rem] -z-10" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600/5 blur-[120px] rounded-full -z-10" />

         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-20">

            {/* Information Column */}
            <div className="lg:col-span-5">
               <div className="sticky top-40">
                  <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em] mb-4 inline-block">{t.professionalRegistry}</span>
                  <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
                     {t.eliteCircle} <span className="text-primary-600">{t.eliteHighlight}</span> {t.eliteEnd}
                  </h1>
                  <p className="text-slate-500 text-lg font-medium mb-12 leading-relaxed">
                     {t.registerDesc}
                  </p>

                  <div className="space-y-8">
                     <div className="flex gap-5">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                           <ShieldCheck size={20} />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t.verifiedIdentity}</h3>
                           <p className="text-xs text-slate-400 mt-1 font-medium">{t.verifiedIdentityDesc}</p>
                        </div>
                     </div>
                     <div className="flex gap-5">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                           <FileText size={20} />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t.smartCompliance}</h3>
                           <p className="text-xs text-slate-400 mt-1 font-medium">{t.smartComplianceDesc}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
               <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-slate-900/5">
                  <div className="space-y-12">

                     {/* Section: Personal */}
                     <div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                           <User size={14} /> 01. {t.personalIdentity}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                 {t.firstName}
                              </label>
                              <input
                                 required
                                 name="firstName"
                                 value={formData.firstName}
                                 onChange={handleChange}
                                 placeholder={t.enterFirstName}
                                 className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                 {t.fatherName}
                              </label>
                              <input
                                 required
                                 name="fatherName"
                                 value={formData.fatherName}
                                 onChange={handleChange}
                                 placeholder={t.enterFatherName}
                                 className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                 {t.motherName}
                              </label>
                              <input
                                 required
                                 name="motherName"
                                 value={formData.motherName}
                                 onChange={handleChange}
                                 placeholder={t.enterMotherName}
                                 className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                 {t.surname}
                              </label>
                              <input
                                 required
                                 name="surname"
                                 value={formData.surname}
                                 onChange={handleChange}
                                 placeholder={t.enterSurname}
                                 className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.emailConnection}</label>
                              <input required type="email" name="email" value={formData.email} readOnly className="w-full bg-slate-100 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-400 cursor-not-allowed outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.phoneLine}</label>
                              <input required name="phone" value={formData.phone} onChange={handleChange} placeholder={t.enterPhone} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.dateOfBirth}</label>
                              <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.experience}</label>
                              <input required name="experience" value={formData.experience} onChange={handleChange} placeholder={t.enterExperience} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                        </div>
                     </div>

                     {/* Section: Professional */}
                     <div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                           <Briefcase size={14} /> 02. {t.professionalNode}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.registrationNo}</label>
                              <input required name="registrationNo" value={formData.registrationNo} onChange={handleChange} placeholder={t.enterRegistrationNo} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.highestQualification}</label>
                              <input required name="qualification" value={formData.qualification} onChange={handleChange} placeholder={t.enterQualification} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="col-span-full space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.labOrganization}</label>
                              <input required name="organization" value={formData.organization} onChange={handleChange} placeholder={t.enterOrganization} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="col-span-full space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.labAddress}</label>
                              <textarea required name="address" value={formData.address} onChange={handleChange} placeholder={t.enterAddress} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none resize-none" rows={3} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.district}</label>
                              <input required name="district" value={formData.district} onChange={handleChange} placeholder={t.enterDistrict} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.taluka}</label>
                              <input required name="taluka" value={formData.taluka} onChange={handleChange} placeholder={t.enterTaluka} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.cityVillage}</label>
                              <input required name="city" value={formData.city} onChange={handleChange} placeholder={t.enterCity} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.pinCode}</label>
                              <input required name="pincode" value={formData.pincode} onChange={handleChange} placeholder={t.enterPincode} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.officePhone}</label>
                              <input name="officePhone" value={formData.officePhone} onChange={handleChange} placeholder={t.enterOfficePhone} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.state}</label>
                              <input required name="state" value="Maharashtra" readOnly className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-400 outline-none" />
                           </div>
                        </div>
                     </div>

                     {/* Section: Assets */}
                     <div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                           <Upload size={14} /> 03. {t.digitalDocumentation}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.profileIdentity}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="profilePhoto" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <Upload size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.profilePhoto ? files.profilePhoto.name : t.uploadJpgPng}</p>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.degreeValidation}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="degreeCertificate" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.degreeCertificate ? files.degreeCertificate.name : t.uploadPdf}</p>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.aadharCard}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="aadharCard" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.aadharCard ? files.aadharCard.name : t.uploadPdfJpg}</p>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.panCard}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="panCard" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.panCard ? files.panCard.name : t.uploadPdfJpg}</p>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.registrationCertificate}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="registrationCertificate" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.registrationCertificate ? files.registrationCertificate.name : t.uploadPdfJpg}</p>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.bioWasteCertificate}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="bioWasteCertificate" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.bioWasteCertificate ? files.bioWasteCertificate.name : t.uploadPdfJpg}</p>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.specialCourseAward}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="awardCertificate" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.awardCertificate ? files.awardCertificate.name : t.uploadPdfJpg}</p>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.shopActDocument}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="shopActDocument" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.shopActDocument ? files.shopActDocument.name : t.uploadPdfJpg}</p>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.visitingCard}</label>
                              <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                                 <input type="file" name="visitingCard" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.visitingCard ? files.visitingCard.name : t.uploadPdfJpg}</p>
                              </div>
                           </div>

                        </div>
                     </div>

                  </div>

                  <div className="mt-16">
                     <button
                        disabled={submitting}
                        className="w-full py-5 bg-primary-600 text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                     >
                        {submitting ? (
                           <>{t.processingNode} <Loader2 className="animate-spin" size={18} /></>
                        ) : (
                           <>{t.commitRegistration} <ChevronRight size={18} strokeWidth={3} /></>
                        )}
                     </button>
                     <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                        {t.secureSubmission}
                     </p>
                  </div>
               </form>
            </div>

         </div>
      </div>
   );
};

export default Register;