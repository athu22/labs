import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Search, Filter, FileText, Download, Wallet, ArrowUpRight,
    ArrowDownLeft, BookOpen, PieChart, LayoutDashboard, Calculator,
    ChevronRight, Calendar, User, Package, Trash2, Edit3, Save, X,
    TrendingUp, TrendingDown, CircleDollarSign, Receipt, Building2,
    Sparkles, Settings, Eye, CheckCircle2, AlertCircle, Menu, Home,
    Layers, List, BarChart3, LogOut, Bell, HelpCircle, CreditCard,
    Archive, FolderTree, Landmark, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../../../services/apiConfig';

const API_URL = `${getApiBaseUrl()}/api/accounting`;

const TallyAccountLogin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
            showMessage('error', 'Failed to load data');
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

    const handleNavClick = (tabId) => {
        setActiveTab(tabId);
        setIsSidebarOpen(false);
    };

    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, gradient: 'from-emerald-500 to-teal-500', description: 'Financial Overview' },
        { id: 'masters', name: 'Masters', icon: <Calculator size={20} />, gradient: 'from-blue-500 to-indigo-500', description: 'Groups & Accounts' },
        { id: 'transactions', name: 'Transactions', icon: <ArrowUpRight size={20} />, gradient: 'from-amber-500 to-orange-500', description: 'Voucher Entries' },
        { id: 'reports', name: 'Reports', icon: <FileText size={20} />, gradient: 'from-purple-500 to-pink-500', description: 'Ledger & Analysis' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
            {/* Floating Hamburger Button */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed top-5 left-5 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 hover:bg-slate-50"
            >
                <Menu size={22} className="text-slate-700" />
            </button>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
                    >
                        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Sparkles className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                                            Tally
                                        </h1>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Accounting System</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                >
                                    <XCircle size={20} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-base shadow-md">
                                    CA
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-800">Admin User</p>
                                    <p className="text-[10px] text-slate-500 font-medium">admin@company.com</p>
                                </div>
                                <button className="p-1.5 hover:bg-white rounded-lg transition-colors">
                                    <Settings size={16} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <nav className="flex-1 py-4 px-3 space-y-1">
                            {navItems.map((item) => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`transition-transform ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className={`text-sm font-bold ${activeTab === item.id ? 'text-white' : 'text-slate-700'}`}>
                                            {item.name}
                                        </p>
                                        <p className={`text-[9px] font-medium ${activeTab === item.id ? 'text-white/70' : 'text-slate-400'}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                    {activeTab === item.id && <ChevronRight size={16} className="text-white" />}
                                </motion.button>
                            ))}

                            <div className="my-4 border-t border-slate-100"></div>

                            <div className="px-2 py-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-2">Quick Actions</p>
                                <div className="space-y-1">
                                    <button onClick={() => handleNavClick('transactions')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all text-sm font-medium">
                                        <CreditCard size={16} className="text-emerald-500" />
                                        New Transaction
                                    </button>
                                    <button onClick={() => handleNavClick('masters')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all text-sm font-medium">
                                        <FolderTree size={16} className="text-blue-500" />
                                        Create Account
                                    </button>
                                    <button onClick={() => handleNavClick('reports')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all text-sm font-medium">
                                        <BarChart3 size={16} className="text-purple-500" />
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                        </nav>

                        <div className="p-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HelpCircle size={16} className="text-slate-400" />
                                    <span className="text-xs text-slate-500 font-medium">Help & Support</span>
                                </div>
                                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                    <LogOut size={16} className="text-slate-400" />
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-400 text-center mt-3 font-medium">© 2026 Tally System</p>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="min-h-screen">
                <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-5 py-4 md:px-8">
                    <div className="flex items-center justify-between">
                        <div className="ml-12 md:ml-16">
                            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                                {navItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {navItems.find(item => item.id === activeTab)?.description || 'Overview'}
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors relative">
                                <Bell size={20} className="text-slate-500" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-700">Admin User</p>
                                    <p className="text-[9px] text-slate-400">Online</p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                                    AU
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-5 md:px-8 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 md:p-6 text-white shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-semibold opacity-90">Welcome back,</p>
                                <p className="text-xl md:text-2xl font-black mt-1">Admin User</p>
                                <p className="text-[10px] md:text-xs opacity-80 mt-2">Here's what's happening with your accounts today</p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Landmark size={28} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className={`fixed top-20 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2 ${message.type === 'success'
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                                : 'bg-gradient-to-r from-rose-500 to-red-600 text-white'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading && (
                    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                        />
                    </div>
                )}

                <div className="px-5 md:px-8 pb-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
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
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ accounts, transactions }) => {
    const totals = accounts.reduce((acc, curr) => {
        const bal = curr.currentBalance || 0;
        if (curr.type === 'Asset') acc.assets += bal;
        if (curr.type === 'Liability') acc.liabilities += bal;
        if (curr.type === 'Income') acc.income += bal;
        if (curr.type === 'Expense') acc.expenses += bal;
        return acc;
    }, { assets: 0, liabilities: 0, income: 0, expenses: 0 });

    const netWorth = totals.assets - totals.liabilities;
    const profitLoss = totals.income - totals.expenses;

    const stats = [
        { label: 'Total Assets', value: `₹${totals.assets.toLocaleString()}`, icon: <Wallet size={22} />, gradient: 'from-emerald-500 to-teal-500', bgLight: 'bg-emerald-50' },
        { label: 'Total Liabilities', value: `₹${totals.liabilities.toLocaleString()}`, icon: <TrendingDown size={22} />, gradient: 'from-rose-500 to-red-500', bgLight: 'bg-rose-50' },
        { label: 'Total Income', value: `₹${totals.income.toLocaleString()}`, icon: <TrendingUp size={22} />, gradient: 'from-blue-500 to-cyan-500', bgLight: 'bg-blue-50' },
        { label: 'Total Expenses', value: `₹${totals.expenses.toLocaleString()}`, icon: <Calculator size={22} />, gradient: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -3 }}
                        className={`${stat.bgLight} rounded-xl p-5 border border-slate-100 transition-all duration-300`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                                <p className="text-xl font-black text-slate-800">{stat.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md flex items-center justify-center text-white`}>
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                            <CircleDollarSign size={16} className="text-white" />
                        </div>
                        <h3 className="font-black text-slate-800">Net Worth</h3>
                    </div>
                    <p className={`text-2xl font-black ${netWorth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ₹{netWorth.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Assets - Liabilities</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                            <TrendingUp size={16} className="text-white" />
                        </div>
                        <h3 className="font-black text-slate-800">P&L Summary</h3>
                    </div>
                    <p className={`text-2xl font-black ${profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ₹{profitLoss.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Income - Expenses</p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
            >
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt size={18} className="text-emerald-400" />
                            <h3 className="text-base font-black text-white uppercase tracking-tight">Recent Transactions</h3>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-800 px-2 py-1 rounded-full tracking-wider">
                            Last 5 Entries
                        </span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {transactions.length > 0 ? transactions.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${t.voucherType === 'sale' || t.voucherType === 'receipt'
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-rose-100 text-rose-600'
                                    }`}>
                                    {t.voucherType === 'sale' || t.voucherType === 'receipt'
                                        ? <ArrowUpRight size={14} />
                                        : <ArrowDownLeft size={14} />
                                    }
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">{t.partyName || 'Cash Transaction'}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {t.voucherType}
                                        </span>
                                        <span className="text-[10px] text-slate-400">•</span>
                                        <span className="text-[10px] text-slate-500 font-medium">{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <p className={`text-sm font-black ${t.voucherType === 'receipt' || t.voucherType === 'sale'
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                                }`}>
                                {t.voucherType === 'receipt' || t.voucherType === 'sale' ? '+' : '-'} ₹{t.totalAmount?.toLocaleString()}
                            </p>
                        </div>
                    )) : (
                        <div className="p-8 text-center">
                            <p className="text-slate-400 font-medium text-sm">No transactions found</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const Masters = ({ groups, accounts, refresh, showMessage }) => {
    const [view, setView] = useState('accounts');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'Asset', groupId: '', openingBalance: 0 });

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/groups`, { name: formData.name, type: formData.type });
            showMessage('success', `Group "${formData.name}" created successfully`);
            setShowModal(false);
            setFormData({ name: '', type: 'Asset', groupId: '', openingBalance: 0 });
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
                openingBalance: Number(formData.openingBalance)
            });
            showMessage('success', `Account "${formData.name}" created successfully`);
            setShowModal(false);
            setFormData({ name: '', type: 'Asset', groupId: '', openingBalance: 0 });
            refresh();
        } catch (error) {
            showMessage('error', 'Failed to create account');
        }
    };

    const handleDelete = async (id, type) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                await axios.delete(`${API_URL}/${type}/${id}`);
                showMessage('success', `${type} deleted successfully`);
                refresh();
            } catch (error) {
                showMessage('error', `Failed to delete ${type}`);
            }
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2 bg-white/80 p-1 rounded-lg shadow-sm border border-slate-200">
                    <button
                        onClick={() => setView('groups')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === 'groups'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Groups ({groups.length})
                    </button>
                    <button
                        onClick={() => setView('accounts')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === 'accounts'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Accounts ({accounts.length})
                    </button>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({ name: '', type: 'Asset', groupId: '', openingBalance: 0 });
                        setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus size={14} /> Create {view === 'groups' ? 'Group' : 'Account'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-500">Name</th>
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-500">{view === 'groups' ? 'Type' : 'Group'}</th>
                                <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider text-slate-500">Balance</th>
                                <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(view === 'groups' ? groups : accounts).map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                                {view === 'groups' ? <FolderIcon size={12} /> : <Building2 size={12} />}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                            {view === 'groups' ? item.type : groups.find(g => g.id === item.groupId)?.name || '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-bold text-slate-800">
                                            {view === 'groups' ? '—' : `₹${(item.currentBalance || 0).toLocaleString()}`}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(item.id, view === 'groups' ? 'groups' : 'accounts')}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors ml-2"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(view === 'groups' ? groups : accounts).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">
                                        No {view} found. Click "Create {view === 'groups' ? 'Group' : 'Account'}" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {editingItem ? 'Edit' : 'New'} {view === 'groups' ? 'Group' : 'Account'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={view === 'groups' ? handleCreateGroup : handleCreateAccount} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter name..."
                                    />
                                </div>
                                {view === 'groups' ? (
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Type</label>
                                        <select
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
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
                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Under Group</label>
                                            <select
                                                required
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium"
                                                value={formData.groupId}
                                                onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                                            >
                                                <option value="">Select Group</option>
                                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Opening Balance</label>
                                            <input
                                                type="number"
                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium"
                                                value={formData.openingBalance}
                                                onChange={e => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                                                placeholder="0"
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="flex gap-3 pt-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition">Create</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FolderIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

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

        if (!formData.debitAccount || !formData.creditAccount) {
            alert('Please select both debit and credit accounts');
            return;
        }

        if (formData.amount <= 0) {
            alert('Amount must be greater than zero');
            return;
        }

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
            showMessage('success', 'Transaction saved successfully');
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
        { id: 'payment', name: 'Payment', color: 'from-rose-500 to-red-500' },
        { id: 'receipt', name: 'Receipt', color: 'from-emerald-500 to-teal-500' },
        { id: 'sale', name: 'Sale', color: 'from-blue-500 to-cyan-500' },
        { id: 'purchase', name: 'Purchase', color: 'from-amber-500 to-orange-500' },
        { id: 'journal', name: 'Journal', color: 'from-slate-600 to-gray-700' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-lg">
                <div className="flex flex-wrap gap-2 mb-5">
                    {voucherTypes.map(v => (
                        <button
                            key={v.id}
                            onClick={() => {
                                setVoucherType(v.id);
                                setItems([]);
                                setFormData({ ...formData, amount: 0 });
                            }}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${voucherType === v.id
                                ? `bg-gradient-to-r ${v.color} text-white shadow-md`
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {v.name}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Party Name</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                placeholder="Party name (optional)"
                                value={formData.partyName}
                                onChange={e => setFormData({ ...formData, partyName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-rose-500 block mb-1">Debit Account *</label>
                            <select
                                required
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.debitAccount}
                                onChange={e => setFormData({ ...formData, debitAccount: e.target.value })}
                            >
                                <option value="">Select Account</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-emerald-500 block mb-1">Credit Account *</label>
                            <select
                                required
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.creditAccount}
                                onChange={e => setFormData({ ...formData, creditAccount: e.target.value })}
                            >
                                <option value="">Select Account</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(voucherType === 'purchase' || voucherType === 'sale') && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h5 className="text-[9px] font-black uppercase text-slate-500 mb-3">Line Items</h5>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Item name"
                                    className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                                    value={newItem.qty}
                                    onChange={e => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                                />
                                <input
                                    type="number"
                                    placeholder="Rate"
                                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                                    value={newItem.rate}
                                    onChange={e => setNewItem({ ...newItem, rate: Number(e.target.value) })}
                                />
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="col-span-4 bg-indigo-600 text-white text-[10px] font-black py-1.5 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Add Item
                                </button>
                            </div>
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg mb-1 text-xs font-bold">
                                    <span>{item.name} ({item.qty} × ₹{item.rate})</span>
                                    <span>₹{item.total.toLocaleString()}</span>
                                    <button type="button" onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Amount *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                required
                                readOnly={voucherType === 'purchase' || voucherType === 'sale'}
                                className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-3 text-xl font-black"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-500 block mb-1">Narration</label>
                        <textarea
                            rows={2}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={formData.narration}
                            onChange={e => setFormData({ ...formData, narration: e.target.value })}
                            placeholder="Additional details..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 rounded-lg text-xs font-black uppercase tracking-wider hover:shadow-xl transition"
                    >
                        Save Transaction
                    </button>
                </form>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider mb-3">Transaction Guide</h4>
                <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">Double Entry System</p>
                        <p className="text-[10px] text-slate-600">Every transaction affects two accounts - one debit and one credit.</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">Voucher Types</p>
                        <p className="text-[10px] text-slate-600">Select appropriate voucher type: Payment, Receipt, Sale, Purchase, or Journal.</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">Auto Calculations</p>
                        <p className="text-[10px] text-slate-600">Ledger balances update automatically when transactions are saved.</p>
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
        if (!accId) {
            setLedgerEntries([]);
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/reports/ledger/${accId}`);
            setLedgerEntries(res.data);
        } catch (error) {
            console.error(error);
            setLedgerEntries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger(selectedAccount);
    }, [selectedAccount]);

    const calculateTotal = () => {
        let totalDebit = 0;
        let totalCredit = 0;
        ledgerEntries.forEach(entry => {
            if (entry.type === 'debit') totalDebit += entry.amount;
            else totalCredit += entry.amount;
        });
        return { totalDebit, totalCredit };
    };

    const { totalDebit, totalCredit } = calculateTotal();

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-lg">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                        <BookOpen className="text-indigo-500" size={20} />
                        <select
                            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                            value={selectedAccount}
                            onChange={e => setSelectedAccount(e.target.value)}
                        >
                            <option value="">Select Account to View Ledger</option>
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                            ))}
                        </select>
                    </div>
                    {ledgerEntries.length > 0 && (
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase bg-slate-100 hover:bg-slate-200 transition"
                        >
                            <Download size={12} /> Export
                        </button>
                    )}
                </div>
            </div>

            {selectedAccount && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-indigo-100">
                        <h3 className="text-lg font-black text-slate-800">Ledger Statement</h3>
                        <p className="text-sm text-indigo-600 font-semibold">
                            {accounts.find(a => a.id === selectedAccount)?.name || '—'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Type: {accounts.find(a => a.id === selectedAccount)?.type || '—'}</p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 mt-2">Loading ledger entries...</p>
                        </div>
                    ) : ledgerEntries.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-slate-400">No transactions found for this account</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-500">Date</th>
                                            <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-500">Particulars</th>
                                            <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider text-slate-500">Debit</th>
                                            <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider text-slate-500">Credit</th>
                                            <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-wider text-slate-500">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledgerEntries.map((entry, i) => (
                                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-4 py-3 text-xs text-slate-600">{new Date(entry.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-xs font-medium text-slate-700">{entry.narration || '—'}</td>
                                                <td className="px-4 py-3 text-right text-rose-600 font-bold text-xs">
                                                    {entry.type === 'debit' ? `₹${entry.amount.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-emerald-600 font-bold text-xs">
                                                    {entry.type === 'credit' ? `₹${entry.amount.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-black text-xs text-slate-800">
                                                    ₹{entry.balanceAfter.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t border-slate-200">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-3 text-right text-xs font-black uppercase text-slate-600">Total:</td>
                                            <td className="px-4 py-3 text-right text-rose-600 font-black text-sm">₹{totalDebit.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-emerald-600 font-black text-sm">₹{totalCredit.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-black text-sm">₹{(totalDebit - totalCredit).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TallyAccountLogin;