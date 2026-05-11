import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Filter, FileText, Download, Wallet, ArrowUpRight, 
  ArrowDownLeft, BookOpen, PieChart, LayoutDashboard, Calculator,
  ChevronRight, Calendar, User, Package, Trash2, Edit3, Save, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/accounting`;

const AccountingSection = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Data fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, accountsRes, transRes] = await Promise.all([
        axios.get(`${API_URL}/groups`),
        axios.get(`${API_URL}/accounts`),
        axios.get(`${API_URL}/transactions?limit=5`)
      ]);
      setGroups(groupsRes.data);
      setAccounts(accountsRes.data);
      setRecentTransactions(transRes.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'masters', name: 'Masters', icon: <Calculator size={18} /> },
    { id: 'transactions', name: 'Transactions', icon: <ArrowUpRight size={18} /> },
    { id: 'reports', name: 'Reports', icon: <FileText size={18} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Module Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Accounting Module</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your financial records and reports</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Message Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-xl shadow-xl font-bold text-sm ${
              message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-grow overflow-hidden">
        {activeTab === 'dashboard' && <Dashboard accounts={accounts} transactions={recentTransactions} />}
        {activeTab === 'masters' && (
          <Masters 
            groups={groups} 
            accounts={accounts} 
            refresh={fetchData} 
            showMessage={showMessage}
          />
        )}
        {activeTab === 'transactions' && (
          <Transactions 
            accounts={accounts} 
            refresh={fetchData} 
            showMessage={showMessage}
          />
        )}
        {activeTab === 'reports' && <Reports accounts={accounts} />}
      </div>
    </div>
  );
};

// --- Sub-Components ---

const Dashboard = ({ accounts, transactions }) => {
  const totals = accounts.reduce((acc, curr) => {
    const bal = curr.currentBalance || 0;
    if (curr.type === 'Asset') acc.assets += bal;
    if (curr.type === 'Liability') acc.liabilities += bal;
    if (curr.type === 'Income') acc.income += bal;
    if (curr.type === 'Expense') acc.expenses += bal;
    return acc;
  }, { assets: 0, liabilities: 0, income: 0, expenses: 0 });

  const stats = [
    { label: 'Total Assets', value: `₹${totals.assets.toLocaleString()}`, icon: <Wallet className="text-emerald-500" />, color: 'bg-emerald-50' },
    { label: 'Total Liabilities', value: `₹${totals.liabilities.toLocaleString()}`, icon: <ArrowDownLeft className="text-rose-500" />, color: 'bg-rose-50' },
    { label: 'Total Income', value: `₹${totals.income.toLocaleString()}`, icon: <ArrowUpRight className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Total Expenses', value: `₹${totals.expenses.toLocaleString()}`, icon: <Calculator className="text-amber-500" />, color: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className={`${stat.color} p-6 rounded-3xl border border-slate-100 flex items-center gap-4`}>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            {stat.icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
            <p className="text-xl font-black text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
      <div className="col-span-full bg-slate-900 rounded-3xl p-8 text-white mt-4 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black uppercase tracking-widest opacity-60">Recent Activity</h3>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest bg-slate-800 px-3 py-1 rounded-full">Last 5 Transactions</span>
        </div>
        <div className="space-y-3">
          {transactions.length > 0 ? transactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800 transition-all hover:bg-slate-800/60">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${t.voucherType === 'sale' ? 'bg-blue-500/20 text-blue-400' : t.voucherType === 'payment' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {t.voucherType === 'sale' ? <ArrowUpRight size={16}/> : <ArrowDownLeft size={16}/>}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{t.partyName || 'Cash Transaction'}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.voucherType} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <p className={`text-sm font-black ${t.voucherType === 'receipt' || t.voucherType === 'sale' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {t.voucherType === 'receipt' || t.voucherType === 'sale' ? '+' : '-'} ₹{t.totalAmount?.toLocaleString()}
              </p>
            </div>
          )) : (
            <p className="text-slate-400 text-sm italic py-8 text-center">No recent transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Masters = ({ groups, accounts, refresh, showMessage }) => {
  const [view, setView] = useState('accounts');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Asset', groupId: '', openingBalance: 0 });

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/groups`, { name: formData.name, type: formData.type });
      showMessage('success', 'Account Group created successfully!');
      setShowModal(false);
      refresh();
    } catch (error) {
      showMessage('error', 'Failed to create group');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const group = groups.find(g => g.id === formData.groupId);
    try {
      await axios.post(`${API_URL}/accounts`, { 
        name: formData.name, 
        groupId: formData.groupId, 
        type: group?.type || 'Asset',
        openingBalance: formData.openingBalance 
      });
      showMessage('success', 'Account created successfully!');
      setShowModal(false);
      refresh();
    } catch (error) {
      showMessage('error', 'Failed to create account');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button 
            onClick={() => setView('groups')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'groups' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            Groups
          </button>
          <button 
            onClick={() => setView('accounts')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'accounts' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            Accounts
          </button>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', type: 'Asset', groupId: '', openingBalance: 0 });
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus size={16} /> Create {view === 'groups' ? 'Group' : 'Account'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Name</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">{view === 'groups' ? 'Type' : 'Group'}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Balance</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(view === 'groups' ? groups : accounts).map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.name}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                  {view === 'groups' ? item.type : groups.find(g => g.id === item.groupId)?.name}
                </td>
                <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">
                  ₹{view === 'groups' ? 'N/A' : (item.currentBalance || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors"><Edit3 size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">
              Create New {view === 'groups' ? 'Group' : 'Account'}
            </h3>
            <form onSubmit={view === 'groups' ? handleCreateGroup : handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-600/20"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              {view === 'groups' ? (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Type</label>
                  <select 
                    className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-bold"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Under Group</label>
                    <select 
                      required
                      className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-bold"
                      value={formData.groupId}
                      onChange={e => setFormData({...formData, groupId: e.target.value})}
                    >
                      <option value="">Select Group</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Opening Balance</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-bold"
                      value={formData.openingBalance}
                      onChange={e => setFormData({...formData, openingBalance: e.target.value})}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const Transactions = ({ accounts, refresh, showMessage }) => {
  const [voucherType, setVoucherType] = useState('payment');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', qty: 0, rate: 0 });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    partyName: '',
    narration: '',
    debitAccount: '',
    creditAccount: '',
    amount: 0
  });

  const addItem = () => {
    if (!newItem.name || !newItem.qty || !newItem.rate) return;
    const total = newItem.qty * newItem.rate;
    const updatedItems = [...items, { ...newItem, total }];
    setItems(updatedItems);
    const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
    setFormData({ ...formData, amount: newTotalAmount });
    setNewItem({ name: '', qty: 0, rate: 0 });
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
    setFormData({ ...formData, amount: newTotalAmount });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0) return alert('Amount must be greater than zero');
    
    const entries = [
      { accountId: formData.debitAccount, type: 'debit', amount: formData.amount },
      { accountId: formData.creditAccount, type: 'credit', amount: formData.amount }
    ];

    try {
      await axios.post(`${API_URL}/transactions`, {
        ...formData,
        voucherType,
        totalAmount: formData.amount,
        entries,
        items: (voucherType === 'purchase' || voucherType === 'sale') ? items : []
      });
      showMessage('success', 'Transaction saved successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        partyName: '',
        narration: '',
        debitAccount: '',
        creditAccount: '',
        amount: 0
      });
      setItems([]);
      refresh();
    } catch (error) {
      showMessage('error', 'Failed to save transaction');
    }
  };

  const voucherTypes = [
    { id: 'payment', name: 'Payment', color: 'bg-rose-500' },
    { id: 'receipt', name: 'Receipt', color: 'bg-emerald-500' },
    { id: 'sale', name: 'Sale', color: 'bg-blue-500' },
    { id: 'purchase', name: 'Purchase', color: 'bg-amber-500' },
    { id: 'journal', name: 'Journal', color: 'bg-slate-600' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {voucherTypes.map(v => (
            <button
              key={v.id}
              onClick={() => {
                setVoucherType(v.id);
                setItems([]);
                setFormData({...formData, amount: 0});
              }}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                voucherType === v.id ? `${v.color} text-white shadow-lg` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {v.name} Entry
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Date</label>
            <input 
              type="date" required
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="col-span-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Party / Reference</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
              placeholder="e.g. Cash / Supplier Name"
              value={formData.partyName}
              onChange={e => setFormData({...formData, partyName: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-rose-500 tracking-widest block mb-2">Debit Account (From)</label>
            <select 
              required
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
              value={formData.debitAccount}
              onChange={e => setFormData({...formData, debitAccount: e.target.value})}
            >
              <option value="">Select Account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest block mb-2">Credit Account (To)</label>
            <select 
              required
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
              value={formData.creditAccount}
              onChange={e => setFormData({...formData, creditAccount: e.target.value})}
            >
              <option value="">Select Account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Items Table for Purchase/Sale */}
          {(voucherType === 'purchase' || voucherType === 'sale') && (
            <div className="col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Line Items</h5>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <input 
                  type="text" placeholder="Item Name" 
                  className="col-span-2 bg-white border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
                <input 
                  type="number" placeholder="Qty" 
                  className="bg-white border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                  value={newItem.qty}
                  onChange={e => setNewItem({...newItem, qty: e.target.value})}
                />
                <input 
                  type="number" placeholder="Rate" 
                  className="bg-white border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                  value={newItem.rate}
                  onChange={e => setNewItem({...newItem, rate: e.target.value})}
                />
                <button 
                  type="button" 
                  onClick={addItem}
                  className="col-span-4 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 text-xs font-bold">
                    <span>{item.name} ({item.qty} x {item.rate})</span>
                    <div className="flex items-center gap-4">
                      <span>₹{item.total.toFixed(2)}</span>
                      <button type="button" onClick={() => removeItem(idx)} className="text-rose-500"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Total Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number" required
                readOnly={(voucherType === 'purchase' || voucherType === 'sale')}
                className={`w-full bg-slate-50 border-slate-200 rounded-xl pl-10 pr-4 py-4 text-2xl font-black text-slate-900 ${(voucherType === 'purchase' || voucherType === 'sale') ? 'opacity-70' : ''}`}
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Narration</label>
            <textarea 
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold h-24"
              placeholder="Enter details..."
              value={formData.narration}
              onChange={e => setFormData({...formData, narration: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="col-span-2 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl"
          >
            Submit {voucherType} Entry
          </button>
        </form>
      </div>

      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Entry Guidelines</h4>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-400 mb-1">Double Entry</p>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Every transaction must have a source and destination account to maintain balanced records.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-400 mb-1">Automatic Updates</p>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Saving an entry will automatically update the ledger and current balance of both accounts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports = ({ accounts }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLedger = async (accId) => {
    if (!accId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports/ledger/${accId}`);
      setLedgerEntries(res.data);
    } catch (error) {
      console.error("Ledger fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAccount) fetchLedger(selectedAccount);
  }, [selectedAccount]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 flex-grow max-w-md">
          <BookOpen className="text-primary-600" size={20} />
          <select 
            className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm font-bold"
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
          >
            <option value="">Select Account for Ledger</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm printable-area">
        <div className="p-8 border-b border-slate-100 flex justify-between items-end">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Account Ledger</h3>
            <p className="text-slate-500 text-sm font-bold">{accounts.find(a => a.id === selectedAccount)?.name || 'Select an account'}</p>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Confidential Financial Report</p>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Particulars</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Voucher</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Debit</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Credit</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ledgerEntries.length > 0 ? ledgerEntries.map((entry, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-500">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{entry.narration || 'Transaction Entry'}</td>
                <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{entry.voucherType}</td>
                <td className="px-6 py-4 text-sm font-black text-rose-500 text-right">{entry.type === 'debit' ? `₹${entry.amount.toFixed(2)}` : ''}</td>
                <td className="px-6 py-4 text-sm font-black text-emerald-500 text-right">{entry.type === 'credit' ? `₹${entry.amount.toFixed(2)}` : ''}</td>
                <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">₹{entry.balanceAfter.toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                  {selectedAccount ? 'No entries found for this period.' : 'Please select an account to view ledger.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountingSection;
