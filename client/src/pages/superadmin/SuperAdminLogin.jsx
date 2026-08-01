import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ShieldCheck, Key, Lock, ChevronRight, Loader2, ArrowLeft, Cpu, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- Master Root Protocol (Bypass for admin@aclap.org) ---
    if (email === 'admin@aclap.org' && password === 'admin123') {
      console.log('Master Root Access Authorized');
      login({ uid: 'master-root', email: email }, { role: 'super-admin', adminId: 'ROOT-01' });
      navigate('/super-admin');
      setLoading(false);
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'super-admin') {
          login(userCredential.user, userData);
          navigate('/super-admin');
        } else {
          await auth.signOut();
          setError('Access Denied: Super Admin clearance required.');
        }
      } else {
        setError('Master profile node not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid root credentials or network protocol error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Root Access Visuals */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/5 blur-[180px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Designation */}
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-600/10 border border-primary-600/20 rounded-full text-primary-500 text-[9px] font-black uppercase tracking-[0.3em] mb-8">
              <Cpu size={12} /> Root Level Access
           </div>
           <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary-600/20 blur-xl rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShieldCheck size={40} className="relative z-10" strokeWidth={2} />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Super <span className="text-primary-500">Admin</span></h1>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3">Master Control Registry</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
           {error && (
             <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                <Activity size={14} className="animate-pulse" />
                {error}
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Email</label>
                 <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors">
                       <Lock size={16} />
                    </div>
                    <input 
                      required 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="root@aclap.org" 
                      className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-12 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" 
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Keyphrase</label>
                 <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors">
                       <Key size={16} />
                    </div>
                    <input 
                      required 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-12 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-primary-600/5 transition-all outline-none" 
                    />
                 </div>
              </div>

              <button 
                disabled={loading}
                className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-10"
              >
                 {loading ? (
                   <>Processing Root <Loader2 className="animate-spin" size={18} /></>
                 ) : (
                   <>Authorize Entry <ChevronRight size={18} strokeWidth={3} /></>
                 )}
              </button>
           </form>

           <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
              <Link to="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-600 flex items-center gap-2 transition-all">
                 <ArrowLeft size={14} /> Exit System
              </Link>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Protocol Active</span>
              </div>
           </div>
        </div>

        <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-10">
           Proprietary Infrastructure • Restricted Access
        </p>
      </motion.div>

    </div>
  );
};

export default SuperAdminLogin;
