import React, { useState, useEffect } from 'react';
import eventApi from '../../../services/eventApi';
import { supabase } from '../../../services/supabase';
import {
  ShieldCheck,
  UserCheck,
  Gift,
  Coffee,
  Utensils,
  Plus,
  Trash2,
  Calendar,
  Save,
  Check,
  X,
  Loader2,
  Users,
} from 'lucide-react';

const StaffPermissionsSection = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Staff form state
  const [staffEmail, setStaffEmail] = useState('');
  const [canCheckin, setCanCheckin] = useState(true);
  const [canDistributeWelcomeKit, setCanDistributeWelcomeKit] = useState(true);
  const [canDistributeBreakfast, setCanDistributeBreakfast] = useState(false);
  const [canDistributeLunch, setCanDistributeLunch] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    setLoading(true);
    try {
      const [eventsRes, { data: usersData }] = await Promise.all([
        eventApi.get('/public'),
        supabase.from('users').select('id, auth_id, email, role, full_name').in('role', ['admin', 'event-staff', 'member']),
      ]);

      const list = eventsRes.data || [];
      setEvents(list);
      setAdminUsers(usersData || []);

      if (list.length > 0) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error('[initData]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadPermissions();
    }
  }, [selectedEventId]);

  const loadPermissions = async () => {
    try {
      const res = await eventApi.get(`/staff-permissions?eventId=${selectedEventId}`);
      setStaffList(res.data || []);
    } catch (err) {
      console.error('[loadPermissions]', err);
    }
  };

  const handleSavePermission = async (e) => {
    e.preventDefault();
    if (!staffEmail || !selectedEventId) {
      alert('Please provide staff email.');
      return;
    }

    setSaving(true);
    try {
      const matchedUser = adminUsers.find((u) => u.email.toLowerCase() === staffEmail.trim().toLowerCase());
      await eventApi.post('/staff-permissions', {
        eventId: selectedEventId,
        staffUserId: matchedUser?.auth_id || matchedUser?.id || staffEmail.trim().toLowerCase(),
        staffEmail: staffEmail.trim().toLowerCase(),
        canCheckin,
        canDistributeWelcomeKit,
        canDistributeBreakfast,
        canDistributeLunch,
      });

      setStaffEmail('');
      loadPermissions();
      alert('Staff permissions assigned successfully!');
    } catch (err) {
      console.error('[handleSavePermission]', err);
      alert(err.response?.data?.error || 'Failed to save staff permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePermission = async (id) => {
    if (!confirm('Are you sure you want to revoke this staff member permissions?')) return;
    try {
      await eventApi.delete(`/staff-permissions/${id}`);
      loadPermissions();
    } catch (err) {
      console.error('[handleDeletePermission]', err);
      alert('Failed to remove staff permission.');
    }
  };

  const handleToggleRow = async (perm, field) => {
    try {
      await eventApi.post('/staff-permissions', {
        eventId: perm.event_id,
        staffUserId: perm.staff_user_id,
        staffEmail: perm.staff_email,
        canCheckin: field === 'can_checkin' ? !perm.can_checkin : perm.can_checkin,
        canDistributeWelcomeKit: field === 'can_distribute_welcome_kit' ? !perm.can_distribute_welcome_kit : perm.can_distribute_welcome_kit,
        canDistributeBreakfast: field === 'can_distribute_breakfast' ? !perm.can_distribute_breakfast : perm.can_distribute_breakfast,
        canDistributeLunch: field === 'can_distribute_lunch' ? !perm.can_distribute_lunch : perm.can_distribute_lunch,
      });
      loadPermissions();
    } catch (err) {
      console.error('[handleToggleRow]', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-primary-600" size={24} />
            Event Staff Role & Permission Management
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Assign granular operational rights: Event Entry, Welcome Kits, Breakfast, and Lunch
          </p>
        </div>

        {/* Selected Event Selector */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary-600 shrink-0" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-primary-600"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.eventDate || ev.date || 'TBD'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form: Assign New Staff Member */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-slate-700">
              <Plus size={18} className="text-primary-600" />
              <h3 className="text-xs font-black uppercase tracking-widest">
                Assign Staff to Event
              </h3>
            </div>

            <form onSubmit={handleSavePermission} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. staff1@aclap.org"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  list="admin-users-list"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-primary-600 outline-none"
                />
                <datalist id="admin-users-list">
                  {adminUsers.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.full_name || u.role}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Checkbox Matrix */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Permissions Matrix:
                </label>

                {/* Entry */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <UserCheck size={16} className="text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Can Check-in (Event Entry)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={canCheckin}
                    onChange={(e) => setCanCheckin(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </label>

                {/* Welcome Kit */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Gift size={16} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Can Distribute Welcome Kit</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={canDistributeWelcomeKit}
                    onChange={(e) => setCanDistributeWelcomeKit(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>

                {/* Breakfast */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Coffee size={16} className="text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">Can Distribute Breakfast</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={canDistributeBreakfast}
                    onChange={(e) => setCanDistributeBreakfast(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                </label>

                {/* Lunch */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Utensils size={16} className="text-orange-600" />
                    <span className="text-xs font-bold text-slate-800">Can Distribute Lunch</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={canDistributeLunch}
                    onChange={(e) => setCanDistributeLunch(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Authorize Staff Member
              </button>
            </form>
          </div>
        </div>

        {/* Assigned Staff List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <Users size={16} className="text-primary-600" />
                Authorized Event Staff ({staffList.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Staff Email</th>
                    <th className="px-3 py-3 text-center">Entry</th>
                    <th className="px-3 py-3 text-center">Kit</th>
                    <th className="px-3 py-3 text-center">Breakfast</th>
                    <th className="px-3 py-3 text-center">Lunch</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.length > 0 ? (
                    staffList.map((perm) => (
                      <tr key={perm.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {perm.staff_email}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleToggleRow(perm, 'can_checkin')}
                            className={`p-1 rounded-lg ${
                              perm.can_checkin
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            <Check size={14} />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleToggleRow(perm, 'can_distribute_welcome_kit')}
                            className={`p-1 rounded-lg ${
                              perm.can_distribute_welcome_kit
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            <Check size={14} />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleToggleRow(perm, 'can_distribute_breakfast')}
                            className={`p-1 rounded-lg ${
                              perm.can_distribute_breakfast
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            <Check size={14} />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleToggleRow(perm, 'can_distribute_lunch')}
                            className={`p-1 rounded-lg ${
                              perm.can_distribute_lunch
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            <Check size={14} />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => handleDeletePermission(perm.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">
                        No specific staff permissions assigned for this event. Super Admins have default full access.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPermissionsSection;
