import React, { useState } from 'react';
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

const Register = () => {
  const { currentUser, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    email: currentUser?.email || '',
    phone: '',
    organization: '',
    district: '',
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
    degreeCertificate: null
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

      // 2. Save Data to Firestore
      await addDoc(collection(db, 'registrations'), {
        ...formData,
        uid: currentUser.uid,
        profilePhoto: profileUrl,
        degreeCertificate: degreeUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Error submitting registration. Please try again.");
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
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Application Lodged</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            Your membership application is being reviewed by the administrative node. You will receive an update via email shortly.
          </p>
          <button 
            onClick={() => navigate(from)}
            className="w-full py-4 bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            {from === '/' ? 'Return to Terminal' : 'Continue to Event'}
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
              <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em] mb-4 inline-block">Professional Registry</span>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
                Join the <span className="text-primary-600">Elite</span> Circle of Practitioners
              </h1>
              <p className="text-slate-500 text-lg font-medium mb-12 leading-relaxed">
                By registering, you gain access to a unified ecosystem of professional verification, continuous learning, and exclusive association benefits.
              </p>

              <div className="space-y-8">
                 <div className="flex gap-5">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Verified Identity</h3>
                       <p className="text-xs text-slate-400 mt-1 font-medium">Standardized clinical practitioner verification.</p>
                    </div>
                 </div>
                 <div className="flex gap-5">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                       <FileText size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Smart Compliance</h3>
                       <p className="text-xs text-slate-400 mt-1 font-medium">Automatic updates on new clinical regulations.</p>
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
                       <User size={14} /> 01. Personal Identity
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                          <input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Dr. John Doe" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Connection</label>
                           <input required type="email" name="email" value={formData.email} readOnly className="w-full bg-slate-100 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-400 cursor-not-allowed outline-none" />
                        </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Line</label>
                          <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 ••••• •••••" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                          <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience (Years)</label>
                          <input required name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                    </div>
                 </div>

                 {/* Section: Professional */}
                 <div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                       <Briefcase size={14} /> 02. Professional Node
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">P.M.C./A.H.P. Reg. No.</label>
                          <input required name="registrationNo" value={formData.registrationNo} onChange={handleChange} placeholder="Official Reg Number" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Highest Qualification</label>
                          <input required name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. M.Sc. Micro / DMLT" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                       <div className="col-span-full space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name of Lab / Organization</label>
                          <input required name="organization" value={formData.organization} onChange={handleChange} placeholder="Current working organization" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                       <div className="col-span-full space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address of Lab</label>
                          <textarea required name="address" value={formData.address} onChange={handleChange} placeholder="Full address for correspondence" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none resize-none" rows={3} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City / District</label>
                          <input required name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Kolhapur" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pin Code</label>
                          <input required name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit PIN" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Office Phone / Fax</label>
                          <input name="officePhone" value={formData.officePhone} onChange={handleChange} placeholder="Optional" className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary-600/10 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                          <input required name="state" value="Maharashtra" readOnly className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-sm font-bold text-slate-400 outline-none" />
                       </div>
                    </div>
                 </div>

                 {/* Section: Assets */}
                 <div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
                       <Upload size={14} /> 03. Digital Documentation
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Identity (Photo)</label>
                          <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                             <input type="file" name="profilePhoto" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                <Upload size={18} />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.profilePhoto ? files.profilePhoto.name : 'Upload JPG/PNG'}</p>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Degree Validation (PDF)</label>
                          <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group hover:bg-slate-100 transition-all cursor-pointer">
                             <input type="file" name="degreeCertificate" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 shadow-sm transition-colors mb-2">
                                <FileText size={18} />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.degreeCertificate ? files.degreeCertificate.name : 'Upload PDF'}</p>
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
                      <>Processing Node <Loader2 className="animate-spin" size={18} /></>
                    ) : (
                      <>Commit Registration <ChevronRight size={18} strokeWidth={3} /></>
                    )}
                 </button>
                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                    Secure 256-bit AES Encrypted Submission
                 </p>
              </div>
           </form>
        </div>

      </div>
    </div>
  );
};

export default Register;
