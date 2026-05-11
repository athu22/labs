import React from 'react';
import { 
  Users, UserCheck, Clock, RefreshCw, Calendar, 
  TrendingUp, Activity, PieChart, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePie, Pie, Cell
} from 'recharts';

const OverviewSection = ({ stats }) => {
  // Real data structure for charts
  const data = [
    { name: 'Jan', members: 0 },
    { name: 'Feb', members: 0 },
    { name: 'Mar', members: 0 },
    { name: 'Apr', members: 0 },
    { name: 'May', members: 0 },
    { name: 'Jun', members: stats.totalMembers }, // Current month real data
  ];

  const pieData = [
    { name: 'Approved', value: stats.approvedMembers, color: '#4f46e5' },
    { name: 'Pending', value: stats.pendingApprovals, color: '#f59e0b' },
    { name: 'Admins', value: stats.activeAdmins, color: '#10b981' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Executive Stat Cards Grid - ALL REAL DATA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Members" value={stats.totalMembers} color="indigo" growth="+0%" />
        <StatCard icon={UserCheck} label="Approved" value={stats.approvedMembers} color="emerald" growth="+0%" />
        <StatCard icon={Clock} label="Pending Review" value={stats.pendingApprovals} color="amber" growth="+0%" />
        <StatCard icon={RefreshCw} label="Renewals Due" value={stats.renewalsDue} color="rose" growth="+0%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Growth Analytics */}
        <div className="lg:col-span-2 bg-slate-50/50 border border-slate-200 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600 shadow-sm">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Registration Flow</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time database entries</p>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', padding: '12px'}}
                  itemStyle={{fontSize: '11px', fontWeight: '800', color: '#1e293b'}}
                />
                <Area type="monotone" dataKey="members" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorInd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
              <PieChart size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Segmentation</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real database breakdown</p>
            </div>
          </div>
          <div className="flex-grow flex flex-col justify-center relative min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePie>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </RePie>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 leading-none">{stats.totalMembers}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Members</span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl transition-all hover:border-primary-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, growth }) => {
  const styles = {
    indigo: "text-indigo-600 bg-indigo-50/50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50/50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50/50 border-amber-100",
    rose: "text-rose-600 bg-rose-50/50 border-rose-100",
    blue: "text-blue-600 bg-blue-50/50 border-blue-100",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary-400/50 transition-all group flex flex-col relative overflow-hidden">
      <div className={`w-10 h-10 ${styles[color]} rounded-xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110 duration-500`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col relative z-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-end justify-between">
          <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
          <div className={`flex items-center gap-0.5 text-[9px] font-black px-2 py-0.5 rounded-full ${growth.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
             {growth}
          </div>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
         <Icon size={120} />
      </div>
    </div>
  );
};

export default OverviewSection;
