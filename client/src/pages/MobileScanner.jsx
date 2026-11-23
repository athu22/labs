import React from 'react';
import EventCheckinSection from './superadmin/sections/EventCheckinSection';
import { QrCode, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MobileScanner = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Venue Scanner Active
            </span>
          </div>
        </div>

        {/* Unified Scanner Component */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <EventCheckinSection />
        </div>
      </div>
    </div>
  );
};

export default MobileScanner;
