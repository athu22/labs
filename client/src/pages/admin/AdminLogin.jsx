import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Mail, Key, Shield, ChevronRight, Loader2, Lock, ArrowLeft, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
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

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' || userData.role === 'super-admin') {
          login(userCredential.user, userData);
          navigate('/admin');
        } else {
          await auth.signOut();
          setError('Access Denied: Insufficient privilege level.');
        }
      } else {
        setError('Administrator node not found in registry.');
      }
    } catch (err) {
      console.error(err);
      setError('Authentication failed. Check your master credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Abstract Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-white border-4 border-slate-900 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-6 shadow-2xl shadow-primary-600/20 rotate-3">
              <Shield size={32} strokeWidth={2.5} />
           </div>
           <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Admin <span className="text-primary-500">Terminal</span></h1>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">Association Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-black/50">
           {error && (
             <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                {error}
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Identity</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={16} />
                    <input 
                      required 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@aclap.org" 
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:border-primary-500 transition-all outline-none" 
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Encryption Key</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={16} />
                    <input 
                      required 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:border-primary-500 transition-all outline-none" 
                    />
                 </div>
              </div>

              <button 
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-10"
              >
                 {loading ? (
                   <>Authorizing <Loader2 className="animate-spin" size={16} /></>
                 ) : (
                   <>Unlock System <ChevronRight size={16} strokeWidth={3} /></>
                 )}
              </button>
           </form>

           <div className="mt-10 pt-8 border-t border-slate-800/50 flex items-center justify-between">
              <Link to="/" className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 flex items-center gap-2 transition-all">
                 <ArrowLeft size={12} /> Exit Terminal
              </Link>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Secure Uplink</span>
              </div>
           </div>
        </div>

        {/* Security Footer */}
        <p className="text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] mt-10 flex items-center justify-center gap-2">
           <Terminal size={12} /> Encrypted Administration Channel
        </p>
      </motion.div>

    </div>
  );
};

export default AdminLogin;
