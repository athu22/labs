import React, { useState, useEffect } from 'react';
import eventApi from '../../../services/eventApi';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../context/AuthContext';
import {
  Banknote,
  Search,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  History,
  Check,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CashVerificationSection = ({ refreshParent }) => {
  const { currentUser, userData } = useAuth();
  const isSuperAdmin = userData?.role === 'super-admin' || currentUser?.email === 'admin@aclap.org';
  const adminDistrict = userData?.district || '';

  const [registrations, setRegistrations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [modalAction, setModalAction] = useState('district_approve'); // 'district_approve' | 'final_approve'
  const [amountReceived, setAmountReceived] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [modalError, setModalError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'history'
  const [stageFilter, setStageFilter] = useState('all'); // 'all' | 'district_pending' | 'district_approved'

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, logsRes] = await Promise.all([
        eventApi.get('/cash/pending'),
        eventApi.get('/cash/logs'),
      ]);
      setRegistrations(pendingRes.data || []);
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error('[CashVerificationSection]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openVerifyModal = (reg, actionType = null) => {
    setSelectedReg(reg);
    const defaultAction = actionType || (isSuperAdmin ? 'final_approve' : 'district_approve');
    setModalAction(defaultAction);
    setAmountReceived(reg.total_amount?.toString() || '0');
    setReceiptNotes('');
    setModalError('');
  };

  const handleVerifyCash = async () => {
    if (!selectedReg) return;
    const receivedNum = Number(amountReceived);
    const expected = Number(selectedReg.total_amount || 0);

    if (Number.isNaN(receivedNum) || receivedNum < expected) {
      setModalError(`Amount received cannot be less than the registration fee (₹${expected}).`);
      return;
    }

    setVerifying(true);
    setModalError('');
    try {
      const res = await eventApi.post(`/cash/${selectedReg.id}/verify`, {
        amountReceived: receivedNum,
        receiptNotes,
        action: modalAction,
      });

      setSelectedReg(null);
      fetchData();
      if (refreshParent) refreshParent();

      if (res.data?.stage === 'district_verified') {
        alert(res.data?.message || 'जिल्हा स्तरावर रोख रक्कम मंजूर करण्यात आली! अंतिम मंजुरीसाठी मुख्य Super Admin कडे पाठवले आहे.');
      } else {
        alert(res.data?.message || 'मुख्य Super Admin कडून अंतिम मंजुरी पूर्ण झाली आणि तिकीट सक्रिय करण्यात आले!');
      }
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.error || 'Cash verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      r.registration_code?.toLowerCase().includes(s) ||
      r.full_name?.toLowerCase().includes(s) ||
      r.phone?.toLowerCase().includes(s) ||
      r.email?.toLowerCase().includes(s) ||
      r.district?.toLowerCase().includes(s) ||
      r.events?.title?.toLowerCase().includes(s);

    if (!matchesSearch) return false;

    if (stageFilter === 'district_pending') {
      return !r.isDistrictApproved;
    }
    if (stageFilter === 'district_approved') {
      return r.isDistrictApproved;
    }
    return true;
  });

  const pendingDistrictCount = registrations.filter((r) => !r.isDistrictApproved).length;
  const approvedDistrictCount = registrations.filter((r) => r.isDistrictApproved).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Banknote className="text-amber-600" size={24} />
              {isSuperAdmin ? 'Two-Tier Cash Payment Verification' : `District Cash Desk (${adminDistrict || 'जिल्हा संकलन'})`}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-400">
              {isSuperAdmin ? 'Master Super Admin Desk' : `District Admin: ${adminDistrict}`}
            </span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            १) जिल्हा प्रतिनिधी पडताळणी (District Verification) ➔ २) मुख्य Super Admin अंतिम मंजुरी व तिकीट जारी
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending ({registrations.length})
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Audit Log ({logs.length})
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {activeSubTab === 'pending' ? (
        <>
          {/* Controls Bar: Search & Stage Filtering */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search by code, attendee name, district, or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 focus:bg-white focus:border-primary-600 outline-none transition-all"
              />
            </div>

            {/* Super Admin Stage Filter Pills */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setStageFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    stageFilter === 'all'
                      ? 'bg-slate-900 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Pending ({registrations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStageFilter('district_pending')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    stageFilter === 'district_pending'
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Clock size={12} /> Awaiting District ({pendingDistrictCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStageFilter('district_approved')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    stageFilter === 'district_approved'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 size={12} /> Ready for Super Admin ({approvedDistrictCount})
                </button>
              </div>
            )}
          </div>

          {/* Pending Cash Registrations Table */}
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="animate-spin text-primary-600 mx-auto mb-2" size={24} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading pending cash queue...</p>
            </div>
          ) : filteredRegistrations.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">
                        Reg Code
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">
                        Attendee & District
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">
                        Event
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">
                        Fee Due
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">
                        Approval Workflow
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px] text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-black text-primary-600">
                          {reg.registration_code || reg.id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-900">{reg.full_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              <MapPin size={10} className="text-primary-600" /> {reg.district || reg.chapter_name || 'Maharashtra'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{reg.phone}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700 max-w-xs truncate">
                          {reg.events?.title || reg.event_title || '—'}
                        </td>
                        <td className="px-5 py-4 font-black text-slate-900">
                          ₹{reg.total_amount || 0}
                        </td>
                        <td className="px-5 py-4">
                          {reg.isDistrictApproved ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={11} className="text-emerald-600" /> जिल्हा मंजूर (District Approved)
                              </span>
                              <p className="text-[9px] text-slate-400 font-medium">
                                Awaiting Super Admin Ticket Issue
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock size={11} className="text-amber-600" /> पायरी १: जिल्हा पडताळणी प्रलंबित
                              </span>
                              <p className="text-[9px] text-slate-400 font-medium">
                                At {reg.district || 'District'} Representative
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {/* If viewing as District Admin */}
                          {!isSuperAdmin ? (
                            reg.isDistrictApproved ? (
                              <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase">
                                ✓ Sent to Super Admin
                              </span>
                            ) : (
                              <button
                                onClick={() => openVerifyModal(reg, 'district_approve')}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5"
                              >
                                <Check size={12} strokeWidth={3} /> Verify Cash (जिल्हा मंजुरी)
                              </button>
                            )
                          ) : (
                            /* If viewing as Super Admin */
                            <div className="flex items-center justify-end gap-2">
                              {reg.isDistrictApproved ? (
                                <button
                                  onClick={() => openVerifyModal(reg, 'final_approve')}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-95 inline-flex items-center gap-1.5"
                                >
                                  <ShieldCheck size={13} strokeWidth={2.5} /> Final Approve & Issue Ticket
                                </button>
                              ) : (
                                <button
                                  onClick={() => openVerifyModal(reg, 'final_approve')}
                                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5"
                                  title="Super Admin override to verify immediately"
                                >
                                  <Banknote size={12} /> Direct Super Admin Approve
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                No pending cash registrations found in this category
              </p>
            </div>
          )}
        </>
      ) : (
        /* Audit Log Table */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Attendee & District</th>
                  <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Event</th>
                  <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Amount Received</th>
                  <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Verified By</th>
                  <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Verification Time</th>
                  <th className="px-5 py-3.5 font-black uppercase tracking-wider text-slate-500 text-[10px]">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {log.event_registrations?.full_name || 'Attendee'}
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {log.event_registrations?.registration_code || ''}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">{log.events?.title || '—'}</td>
                      <td className="px-5 py-4 font-black text-emerald-600">₹{log.amount_received}</td>
                      <td className="px-5 py-4 text-slate-700 font-semibold">{log.verified_by_email || log.verified_by || 'Admin'}</td>
                      <td className="px-5 py-4 text-slate-500 text-[11px] font-mono">
                        {new Date(log.verified_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-[11px] italic max-w-xs">{log.receipt_notes || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      No cash verification audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verify Cash Payment Modal */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    modalAction === 'final_approve' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {modalAction === 'final_approve' ? <ShieldCheck size={20} /> : <Banknote size={20} />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">
                      {modalAction === 'final_approve'
                        ? 'Super Admin Final Approval'
                        : `District Cash Verification (${selectedReg.district || 'District'})`}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      {selectedReg.registration_code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 2-Step Approval Pipeline Tracker */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                {/* Step 1: District Admin */}
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    selectedReg.isDistrictApproved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white animate-pulse'
                  }`}>
                    {selectedReg.isDistrictApproved ? '✓' : '1'}
                  </span>
                  <div>
                    <p className="font-black text-slate-800 text-[10px] uppercase">
                      १. जिल्हा प्रतिनिधी ({selectedReg.district || 'District'})
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">
                      {selectedReg.isDistrictApproved ? 'पडताळणी पूर्ण' : 'पडताळणी प्रलंबित'}
                    </p>
                  </div>
                </div>

                <ArrowRight size={14} className="text-slate-400" />

                {/* Step 2: Main Super Admin */}
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    selectedReg.isDistrictApproved
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    2
                  </span>
                  <div>
                    <p className="font-black text-slate-800 text-[10px] uppercase">
                      २. मुख्य Super Admin
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">
                      अंतिम मंजुरी व तिकीट जारी
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendee Details Review */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Attendee:</span>
                  <span className="font-bold text-slate-900">{selectedReg.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">District (जिल्हा):</span>
                  <span className="font-black text-primary-600 flex items-center gap-1">
                    <MapPin size={11} /> {selectedReg.district || selectedReg.chapter_name || 'Maharashtra'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Event:</span>
                  <span className="font-bold text-slate-900">{selectedReg.events?.title || selectedReg.event_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-bold text-slate-800">{selectedReg.phone} • {selectedReg.email}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Expected Cash Fee:</span>
                  <span className="font-black text-base text-slate-900">₹{selectedReg.total_amount}</span>
                </div>
              </div>

              {/* Previous District Verification Note if already reviewed */}
              {selectedReg.districtVerification && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider text-emerald-800">
                    <CheckCircle2 size={13} className="text-emerald-600" /> जिल्हा स्तरावर तपासले गेले (District Verified)
                  </div>
                  <p className="text-[11px]">
                    <strong>Verifier:</strong> {selectedReg.districtVerification.verified_by_email}
                  </p>
                  {selectedReg.districtVerification.receipt_notes && (
                    <p className="text-[11px] italic text-slate-600">
                      &ldquo;{selectedReg.districtVerification.receipt_notes}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Form Input */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Amount Received in Cash (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-black text-slate-900 focus:border-amber-500 outline-none"
                    placeholder="Enter collected cash amount"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Receipt / Approval Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={receiptNotes}
                    onChange={(e) => setReceiptNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:border-amber-500 outline-none"
                    placeholder="e.g. Received at Pune district desk, receipt #452"
                  />
                </div>

                {modalError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="w-1/3 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={verifying}
                  onClick={handleVerifyCash}
                  className={`w-2/3 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 ${
                    modalAction === 'final_approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                  }`}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Processing...
                    </>
                  ) : modalAction === 'final_approve' ? (
                    <>
                      <ShieldCheck size={14} strokeWidth={2.5} /> Final Approve & Issue Ticket
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={3} /> Confirm District Cash & Send to Super Admin
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CashVerificationSection;
