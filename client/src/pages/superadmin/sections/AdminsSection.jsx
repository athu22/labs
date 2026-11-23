import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../services/supabase';
import { 
  Shield, Plus, Trash2, Mail, UserPlus, Loader2, Key, Edit2, X, Check,
  MapPin, Search, CheckCircle2, AlertCircle, Building2, UserCheck, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminsSection = ({ admins = [], refresh }) => {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminDistrict, setNewAdminDistrict] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const districts = [
    'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana', 
    'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dhule', 'Gadchiroli', 
    'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 
    'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 
    'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 
    'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 
    'Wardha', 'Washim', 'Yavatmal'
  ];

  const addAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword || !newAdminDistrict) {
      alert('Please provide email, password, and district.');
      return;
    }
    
    setAdding(true);
    
    try {
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );

      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email: newAdminEmail,
        password: newAdminPassword,
      });

      if (authError) throw authError;

      const user = authData?.user;
      if (!user?.id) {
        throw new Error('Failed to create user in Supabase Auth.');
      }
      if (user.identities && user.identities.length === 0) {
        throw new Error('This email is already registered.');
      }

      // 2. Create the user record in Supabase `users` table
      const nextId = (admins.length + 1).toString();
      const { error: dbError } = await supabase.from('users').insert([{
        auth_id: user.id,
        email: newAdminEmail,
        role: 'admin',
        adminId: nextId,
        district: newAdminDistrict,
        created_at: new Date().toISOString()
      }]);

      if (dbError) throw dbError;

      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminDistrict('');
      refresh();
      alert('Administrator created and authorized successfully!');
    } catch (e) {
      console.error(e);
      let errorMsg = 'Error creating administrator. ';
      const msg = (e.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists') || e.code === '23505') {
        errorMsg += 'An account with this email address already exists.';
      } else {
        errorMsg += e.message || 'Please check the console for details.';
      }
      alert(errorMsg);
    } finally {
      setAdding(false);
    }
  };

  const updateAdmin = async () => {
    if (!newAdminDistrict) {
      alert('Please select a district.');
      return;
    }
    
    setAdding(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ district: newAdminDistrict })
        .eq('id', editingAdmin.id);

      if (error) throw error;
      
      setNewAdminEmail('');
      setNewAdminDistrict('');
      setEditingAdmin(null);
      refresh();
      alert('Administrator profile updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Error updating administrator node.');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (admin) => {
    setEditingAdmin(admin);
    setNewAdminEmail(admin.email);
    setNewAdminDistrict(admin.district || '');
    setNewAdminPassword('');
  };

  const cancelEdit = () => {
    setEditingAdmin(null);
    setNewAdminEmail('');
    setNewAdminDistrict('');
    setNewAdminPassword('');
  };

  const removeAdmin = async (id) => {
    if (confirm('Permanently revoke this user\'s administrative access?')) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (error) throw error;
        refresh();
      } catch (e) {
        console.error(e);
        alert('Error revoking administrator access.');
      }
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const s = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      a.email?.toLowerCase().includes(s) ||
      a.district?.toLowerCase().includes(s) ||
      a.adminId?.toString().includes(s)
    );
  });

  const coveredDistricts = new Set(admins.map((a) => (a.district || '').trim()).filter(Boolean));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Header & KPI Cards */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  District Administrator Access & Privileges
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                  Manage Regional District Admins for Maharashtra Clinical Association
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black">
              {admins.length} Active Regional Admins
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
              {coveredDistricts.size} / 36 Districts Assigned
            </span>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-100/60 text-primary-700 flex items-center justify-center font-black">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Admins</p>
              <h4 className="text-xl font-black text-slate-900 font-mono">{admins.length + 1} Nodes</h4>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center font-black">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Districts Covered</p>
              <h4 className="text-xl font-black text-slate-900 font-mono">{coveredDistricts.size} Districts</h4>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100/60 text-amber-700 flex items-center justify-center font-black">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Open Districts</p>
              <h4 className="text-xl font-black text-slate-900 font-mono">{36 - coveredDistricts.size} Districts</h4>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Split: Provision Form (Left) & Directory (Right) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Provision Administrator Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm sticky top-20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-black">
                {editingAdmin ? <Edit2 size={16} /> : <UserPlus size={16} />}
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {editingAdmin ? 'Edit Administrator Node' : 'Provision New District Admin'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Assign access role & district territory</p>
              </div>
            </div>

            {editingAdmin && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-700 px-2 py-1 bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                Admin Email Identity *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="email"
                  placeholder="admin.pune@aclap.org"
                  disabled={Boolean(editingAdmin)}
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-600 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                Assigned Territory (District) *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <select
                  value={newAdminDistrict}
                  onChange={(e) => setNewAdminDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-600 transition-all cursor-pointer shadow-inner"
                >
                  <option value="">Select Maharashtra District / जिल्हा निवडा *</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d} {coveredDistricts.has(d) ? ' (Currently Assigned)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!editingAdmin && (
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                  Initial Master Password *
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-600 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <Shield size={14} /> : <Key size={14} />}
                  </button>
                </div>
              </div>
            )}

            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 space-y-1 mt-2">
              <p className="font-black uppercase tracking-wider text-[10px] text-primary-700">
                District Administrator Permissions:
              </p>
              <p className="leading-relaxed text-slate-600 text-[10px]">
                Can review event cash payments for their district (Stage 1 Cash Approval), verify registered clinical members, and manage local registrations.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={editingAdmin ? updateAdmin : addAdmin}
                disabled={adding}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-600/30 active:scale-95 disabled:opacity-50"
              >
                {adding ? (
                  <>
                    <Loader2 className="animate-spin" size={15} /> Authorizing Node...
                  </>
                ) : editingAdmin ? (
                  <>
                    <Check size={15} /> Save Territory Changes
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Authorize District Admin
                  </>
                )}
              </button>

              {editingAdmin && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Administrator Directory */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Active Administrator Directory
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Authorized credentials and district delegations</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search by email or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary-600"
              />
            </div>
          </div>

          {/* Master Super Admin Card (Always present) */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                SA
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black tracking-tight text-white">admin@aclap.org</h4>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-primary-500 text-white">
                    Master Root
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                  Supreme Oversight • All 36 Districts • Final Cash Ticket Issuance
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-black uppercase">Active Root</span>
          </div>

          {/* Regional District Admins List */}
          <div className="space-y-3">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="group p-4 bg-slate-50/70 hover:bg-white border border-slate-200/90 hover:border-primary-300 hover:shadow-md rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-primary-600 font-black text-xs shrink-0 shadow-sm">
                    {admin.district?.slice(0, 2).toUpperCase() || 'DA'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-slate-900 tracking-tight">{admin.email}</p>
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-400 font-mono">
                        #ID-{admin.adminId || '0'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-100">
                        <MapPin size={10} /> {admin.district || 'All Districts'} District
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Node
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => startEdit(admin)}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-transparent hover:border-primary-200"
                    title="Change District Territory"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAdmin(admin.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
                    title="Revoke Admin Access"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {filteredAdmins.length === 0 && (
              <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <UserCheck size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No district administrators match your query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminsSection;
