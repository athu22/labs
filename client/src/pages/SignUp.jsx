import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Mail,
  Key,
  User,
  ShieldCheck,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || { pathname: '/' };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a basic user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        role: 'member', // Default role
        isProfileComplete: false,
        createdAt: new Date().toISOString()
      });

      // Redirect directly to the membership registration form
      navigate('/register', { state: { from } });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered in our database. Please login instead.');
      } else {
        setError('Failed to create account. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">

      {/* Branding / Visual Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-lg">
          <Link to="/" className="flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-2xl">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">ACLAP</h1>
          </Link>

          <h2 className="text-5xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
            Start Your <br />
            Professional <span className="text-secondary-yellow text-opacity-80">Journey</span>
          </h2>
          <p className="text-white/80 text-lg font-medium leading-relaxed mb-12">
            Create your digital identity node to access the professional registry and association benefits.
          </p>
        </div>
      </div>

      {/* Form Column */}
      <div className="flex-grow flex items-center justify-center p-8 bg-white lg:bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 lg:p-12 rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-slate-100"
        >
          <div className="mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Step 1: Identity Creation</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[11px] font-bold uppercase tracking-wider mb-8 flex items-center gap-3">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={16} />
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 border border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary-600/20 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={16} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-slate-50 border border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary-600/20 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
              <div className="relative group">
                <Key
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors"
                  size={16}
                />

                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-transparent rounded-2xl py-4 pl-12 pr-14 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary-600/20 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-5 bg-primary-600 text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-10"
            >
              {loading ? (
                <>Creating Node <Loader2 className="animate-spin" size={18} /></>
              ) : (
                <>Sign Up & Continue <ChevronRight size={18} strokeWidth={3} /></>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-xs font-medium">
              Already have an account?
              <Link to="/login" className="text-primary-600 font-black uppercase tracking-widest text-[11px] ml-2 hover:text-primary-700 transition-colors">Login</Link>
            </p>
          </div>

          <Link to="/membership" className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-400 transition-colors group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
        </motion.div>
      </div>

    </div>
  );
};

export default SignUp;
