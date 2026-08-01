import React, { useState } from 'react';
import { db, firebaseConfig } from '../../../services/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Shield, Plus, Trash2, Mail, UserPlus, Loader2, Key, Edit2, X, Check } from 'lucide-react';

const AdminsSection = ({ admins, refresh }) => {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminDistrict, setNewAdminDistrict] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

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
      // We use a secondary Firebase app instance to create the user in Auth
      // This prevents the current Super Admin from being signed out
      let secondaryApp;
      const appName = "SecondaryApp_" + Date.now();
      
      secondaryApp = initializeApp(firebaseConfig, appName);
      const secondaryAuth = getAuth(secondaryApp);

      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAdminEmail, newAdminPassword);
      const uid = userCredential.user.uid;

      // 2. Create the user document in Firestore using the Auth UID
      const nextId = (admins.length + 1).toString();
      
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        email: newAdminEmail,
        role: 'admin',
        adminId: nextId,
        district: newAdminDistrict,
        createdAt: serverTimestamp()
      });

      // 3. Cleanup secondary app
      await deleteApp(secondaryApp);
      
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminDistrict('');
      refresh();
      alert('Administrator created and authorized successfully!');
    } catch (e) {
      console.error(e);
      let errorMsg = 'Error creating administrator. ';
      if (e.code === 'auth/email-already-in-use') errorMsg += 'This email is already registered.';
      else if (e.code === 'auth/weak-password') errorMsg += 'Password should be at least 6 characters.';
      else errorMsg += e.message;
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
      await updateDoc(doc(db, 'users', editingAdmin.id), {
        district: newAdminDistrict
      });
      
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
    setNewAdminPassword(''); // We don't edit password here
  };

  const cancelEdit = () => {
    setEditingAdmin(null);
    setNewAdminEmail('');
    setNewAdminDistrict('');
    setNewAdminPassword('');
  };

  const removeAdmin = async (id) => {
    if (confirm('Permanently revoke this user\'s administrative access?')) {
      await deleteDoc(doc(db, 'users', id));
      refresh();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="text-primary-600" size={24} /> 
            Privilege Management
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage system administrators and access levels</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Registration Form */}
        <div className="lg:col-span-4">
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 sticky top-0">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
                   {editingAdmin ? <Edit2 size={16} /> : <UserPlus size={16} />}
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  {editingAdmin ? 'Update Admin' : 'Provision Admin'}
                </h3>
             </div>
             
             <div className="space-y-5">
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identity</label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                   <input
                     type="email"
                     placeholder="admin@aclap.org"
                     disabled={!!editingAdmin}
                     value={newAdminEmail}
                     onChange={(e) => setNewAdminEmail(e.target.value)}
                     className="w-full bg-white disabled:bg-slate-50 disabled:text-slate-400 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 transition-all shadow-sm"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned District</label>
                  <select
                    value={newAdminDistrict}
                    onChange={(e) => setNewAdminDistrict(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 transition-all shadow-sm"
                  >
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>

                {!editingAdmin && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 transition-all shadow-sm"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        {showPassword ? <Shield size={14} /> : <Key size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-2">
                  <button
                    onClick={editingAdmin ? updateAdmin : addAdmin}
                    disabled={adding}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/10 active:scale-95 disabled:opacity-50"
                  >
                    {adding ? <Loader2 className="animate-spin" size={14} /> : (editingAdmin ? <Check size={14} /> : <Plus size={14} />)} 
                    {editingAdmin ? 'Save Changes' : 'Authorize Node'}
                  </button>
                  {editingAdmin && (
                    <button
                      onClick={cancelEdit}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <X size={14} /> Cancel Edit
                    </button>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Admin List */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Active Administrator Directory</h3>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{admins.length} Nodes</span>
           </div>

           <div className="grid gap-4">
             {admins.map(admin => (
               <div key={admin.id} className="group bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between transition-all hover:border-primary-200 hover:shadow-sm">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-50 transition-colors">
                     <Shield size={18} />
                   </div>
                   <div>
                     <div className="text-sm font-black text-slate-800 tracking-tight">{admin.email}</div>
                     <div className="flex items-center gap-3 mt-1">
                       <div className="flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{admin.adminId || 'N/A'}</span>
                       </div>
                       <div className="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                         {admin.district || 'All Districts'}
                       </div>
                     </div>
                   </div>
                 </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(admin)}
                      className="p-2 text-slate-300 hover:text-primary-600 hover:bg-primary-50 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                      title="Edit Profile"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => removeAdmin(admin.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                      title="Revoke Access"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
               </div>
             ))}

             {admins.length === 0 && (
               <div className="py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">No secondary administrators found</p>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminsSection;
