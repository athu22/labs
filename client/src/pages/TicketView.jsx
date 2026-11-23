import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventApi from '../services/eventApi';
import DigitalTicket from '../components/DigitalTicket';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

const TicketView = () => {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await eventApi.get(`/tickets/${code}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Ticket not found.');
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchTicket();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Smart Ticket</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black mb-2">Ticket Not Found</h2>
        <p className="text-slate-400 text-sm max-w-md mb-8">{error || 'The requested ticket could not be located.'}</p>
        <Link
          to="/events"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
        >
          View All Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-28 pb-16 px-4">
      <div className="max-w-xl mx-auto mb-6 flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Back to Events
        </Link>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 font-mono">
          {code}
        </span>
      </div>

      <DigitalTicket
        ticket={data.ticket}
        registration={data.registration}
        event={data.event}
        isProvisional={data.type === 'provisional_pass'}
      />
    </div>
  );
};

export default TicketView;
