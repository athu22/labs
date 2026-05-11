import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Mail, Key, ShieldCheck, ChevronRight, Loader2, User, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/renew';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.role === 'super-admin' || userData.role === 'admin') {
          await auth.signOut();
          setError('Admin accounts must use the dedicated administration portal.');
          setLoading(false);
          return;
        }

        login(userCredential.user, userData);
        navigate(from, { replace: true });
      } else {
        setError('Member profile node not found in registry.');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid credentials or unauthorized access node.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* 1. Branding / Visual Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-20 overflow-hidden">
         {/* Decorative Background Elements */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
         
         <div className="relative z-10 max-w-lg">
            <Link to="/" className="flex items-center gap-3 mb-16 group">
              <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-600/30">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">ACLAP</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">Terminal Control</p>
              </div>
            </Link>

            <h2 className="text-5xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
               Professional <br /> 
               <span className="text-primary-500">Registry</span> Access
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
               Authenticate to access your practitioner dashboard, membership status, and exclusive clinical resources.
            </p>

            <div className="space-y-6">
               <div className="flex items-center gap-4 text-slate-400">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,1)]" />
                  <p className="text-xs font-bold uppercase tracking-widest">Secure AES-256 Authentication</p>
               </div>
               <div className="flex items-center gap-4 text-slate-400">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                  <p className="text-xs font-bold uppercase tracking-widest">Real-time Session Monitoring</p>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Form Column */}
      <div className="flex-grow flex items-center justify-center p-8 bg-white lg:bg-slate-50">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-md bg-white p-10 lg:p-12 rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-slate-100"
         >
            <div className="mb-10">
               <div className="lg:hidden flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">ACLAP</h1>
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity Authentication</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Enter your credential node below</p>
            </div>

            {error && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[11px] font-bold uppercase tracking-wider mb-8 flex items-center gap-3"
              >
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                 {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Email</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={16} />
                     <input 
                       required 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder="node@practitioner.com" 
                       className="w-full bg-slate-50 border border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary-600/20 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" 
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Key</label>
                     <Link to="/" className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors">Recover</Link>
                  </div>
                  <div className="relative group">
                     <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={16} />
                     <input 
                       required 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="••••••••" 
                       className="w-full bg-slate-50 border border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary-600/20 focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" 
                     />
                  </div>
               </div>

               <button 
                 disabled={loading}
                 className="w-full py-5 bg-primary-600 text-white font-black text-[13px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-10"
               >
                  {loading ? (
                    <>Verifying Node <Loader2 className="animate-spin" size={18} /></>
                  ) : (
                    <>Sign In <ChevronRight size={18} strokeWidth={3} /></>
                  )}
               </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-50 text-center">
               <p className="text-slate-400 text-xs font-medium">
                  Not a registered member yet? 
                  <Link to="/signup" className="text-primary-600 font-black uppercase tracking-widest text-[11px] ml-2 hover:text-primary-700 transition-colors">Join Now</Link>
               </p>
            </div>

            <Link to="/" className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-400 transition-colors group">
               <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back to Homepage
            </Link>
         </motion.div>
      </div>

    </div>
  );
};

export default Login;
