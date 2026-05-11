import React from 'react';
import { Calendar, Users, ArrowRight } from 'lucide-react';

const EventRegistrations = () => {
  // Mock data for event registrations
  const eventStats = [
    { id: 1, title: 'Annual Lab Symposium 2024', registrations: 145, capacity: 200, date: 'May 20, 2024' },
    { id: 2, title: 'Webinar: Modern Diagnostics', registrations: 320, capacity: 500, date: 'June 05, 2024' },
    { id: 3, title: 'Technician Training Workshop', registrations: 45, capacity: 50, date: 'June 15, 2024' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-6">Event Participation</h2>
      
      <div className="grid gap-4">
        {eventStats.map(event => (
          <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">{event.title}</h3>
                <p className="text-slate-500 text-sm">{event.date}</p>
              </div>
            </div>

            <div className="flex-grow max-w-xs w-full">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-400">REGISTRATIONS</span>
                <span className="text-white">{event.registrations} / {event.capacity}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(event.registrations / event.capacity) * 100}%` }}
                />
              </div>
            </div>

            <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors group">
              View List <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventRegistrations;
