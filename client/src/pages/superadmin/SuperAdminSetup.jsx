import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdminSetup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${API_URL}/api/setup/initialize-master`, {
        email,
        password
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/super-admin-login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize super admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0101] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-600/10 via-transparent to-transparent" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/[0.04] border border-white/10 backdrop-blur-3xl rounded-[4rem] p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600/10 border border-primary-500/20 rounded-full text-primary-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            <ShieldAlert size={16} /> Initial Setup
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">Create <span className="text-primary-600">Master</span></h1>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">First-time System Configuration</p>
        </div>

        {success ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Setup Complete!</h2>
            <p className="text-white/40 text-sm">Redirecting to login portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">Root Email</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5.5 pl-16 pr-8 text-white font-bold focus:border-primary-500 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                  placeholder="root@aclap.org"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">Master Password</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5.5 pl-16 pr-8 text-white font-bold focus:border-primary-500 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-3">
                <ShieldAlert size={18} /> {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-6 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-[2.5rem] transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-4 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  Initialize System <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default SuperAdminSetup;
