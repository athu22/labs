import React, { useState } from 'react';
import { db, storage } from '../../../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Plus, Edit3, Trash2, Calendar, MapPin, Upload, Loader2, X, Save } from 'lucide-react';
import { compressImage } from '../../../utils/imageOptimizer';

const EventsManagementSection = ({ events, refresh, admins = [] }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', category: 'Clinical Workshop', description: '', district: '', adminEmail: '' });
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const districts = [
    'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana', 
    'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dhule', 'Gadchiroli', 
    'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 
    'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 
    'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 
    'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 
    'Wardha', 'Washim', 'Yavatmal'
  ];

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setNewEvent({ title: '', date: '', location: '', category: 'Clinical Workshop', description: '', district: '', adminEmail: '' });
    setImageFile(null);
    setExistingImageUrl('');
  };

  const handleEditClick = (event) => {
    setEditingId(event.id);
    setNewEvent({
      title: event.title,
      date: event.date,
      location: event.location,
      category: event.category || 'Clinical Workshop',
      description: event.description || '',
      district: event.district || '',
      adminEmail: event.adminEmail || ''
    });
    setExistingImageUrl(event.imageUrl || '');
    setShowAdd(true);
  };

  const deleteEvent = async (event) => {
    if (!confirm('Are you sure you want to permanently delete this event?')) return;

    try {
      // 1. Delete from Storage first while we have the URL
      if (event.imageUrl) {
        try {
          const decodedUrl = decodeURIComponent(event.imageUrl);
          const startIndex = decodedUrl.indexOf('/o/') + 3;
          const endIndex = decodedUrl.indexOf('?');
          const filePath = decodedUrl.substring(startIndex, endIndex);
          const imageRef = ref(storage, filePath);
          await deleteObject(imageRef);
        } catch (storageErr) {
          console.warn("Storage deletion failed:", storageErr);
        }
      }

      // 2. Delete from Firestore
      await deleteDoc(doc(db, 'events', event.id));

      refresh();
      alert("Event deleted successfully.");
    } catch (e) {
      console.error(e);
      alert("Error deleting event.");
    }
  };

  const handleSave = async () => {
    if (!newEvent.title || (!imageFile && !existingImageUrl)) {
      alert("Please provide a title and a banner image.");
      return;
    }
    
    setAdding(true);
    try {
      let imageUrl = existingImageUrl;

      // Only upload if a new file is selected
      if (imageFile) {
        // Optimize banner image (use slightly higher quality and larger width for big banners)
        const optimizedFile = await compressImage(imageFile, 1920, 0.8);
        
        const imageRef = ref(storage, `events/${Date.now()}_${optimizedFile.name}`);
        const snap = await uploadBytes(imageRef, optimizedFile);
        imageUrl = await getDownloadURL(snap.ref);

        // If editing and we have a previous image, delete the old one
        if (editingId && existingImageUrl) {
           try {
            const decodedUrl = decodeURIComponent(existingImageUrl);
            const path = decodedUrl.split('/o/')[1].split('?')[0];
            const oldImageRef = ref(storage, path);
            await deleteObject(oldImageRef);
          } catch (e) { console.warn("Old image deletion failed", e); }
        }
      }

      const eventData = {
        ...newEvent,
        imageUrl,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), eventData);
        alert("Event updated successfully!");
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: serverTimestamp()
        });
        alert("Event published successfully!");
      }
      
      resetForm();
      refresh();
    } catch (e) {
      console.error(e);
      alert("Error saving event.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-primary-600" size={24} /> 
            Upcoming Events
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage announcements for association activities</p>
        </div>
        {!showAdd && (
          <button 
            onClick={() => setShowAdd(true)} 
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
          >
            <Plus size={14} /> Plan New Event
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4 duration-300 relative">
          <button onClick={resetForm} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
                {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
             </div>
             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
               {editingId ? 'Edit Event Details' : 'Plan New Association Event'}
             </h3>
          </div>

          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Designation</label>
                  <input 
                    placeholder="Annual Scientific Symposium 2024" 
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 transition-all shadow-sm" 
                  />
                </div>
                
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Event Banner</label>
                   <div className="relative group h-40">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      />
                      <div className="w-full h-full bg-white border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center group-hover:border-primary-600 transition-all relative">
                         {imageFile ? (
                           <img src={URL.createObjectURL(imageFile)} alt="Banner" className="w-full h-full object-cover" />
                         ) : existingImageUrl ? (
                           <img src={existingImageUrl} alt="Existing Banner" className="w-full h-full object-cover" />
                         ) : (
                           <div className="text-center">
                              <Upload size={24} className="text-slate-200 mx-auto mb-2" />
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Primary Banner</p>
                           </div>
                         )}
                         {(imageFile || existingImageUrl) && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                               <Upload size={20} className="text-white" />
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Description & Details</label>
                   <textarea 
                     placeholder="Provide a detailed breakdown of the event, speakers, and agenda..." 
                     rows={7}
                     value={newEvent.description}
                     onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                     className="w-full bg-white border border-slate-200 rounded-xl p-4 text-[11px] font-medium text-slate-600 outline-none focus:border-primary-600 transition-all shadow-sm resize-none" 
                   />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Category</label>
                 <select 
                   value={newEvent.category}
                   onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                   className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 shadow-sm"
                 >
                   <option>Clinical Workshop</option>
                   <option>National Conference</option>
                   <option>Webinar Series</option>
                   <option>Hands-on Training</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Scheduled Date</label>
                 <input 
                   type="date" 
                   value={newEvent.date}
                   onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
                   className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 shadow-sm" 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Venue / Platform</label>
                 <input 
                   placeholder="Mumbai / Zoom" 
                   value={newEvent.location}
                   onChange={e => setNewEvent({...newEvent, location: e.target.value})} 
                   className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 shadow-sm" 
                 />
               </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mt-2">
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Event District</label>
                 <select 
                   value={newEvent.district || ''}
                   onChange={e => setNewEvent({...newEvent, district: e.target.value})}
                   className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 shadow-sm"
                 >
                   <option value="">Select District</option>
                   {districts.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Admin</label>
                 <select 
                   value={newEvent.adminEmail || ''}
                   onChange={e => setNewEvent({...newEvent, adminEmail: e.target.value})}
                   className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 shadow-sm"
                 >
                   <option value="">Select Admin</option>
                   {admins.filter(a => !newEvent.district || a.district === newEvent.district || !a.district).map(a => (
                     <option key={a.id} value={a.email}>{a.email} {a.district ? `(${a.district})` : ''}</option>
                   ))}
                 </select>
               </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={resetForm} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={adding}
              className="bg-slate-900 hover:bg-black px-10 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center gap-2 disabled:opacity-50"
            >
              {adding ? <Loader2 className="animate-spin" size={14} /> : editingId ? <Save size={14} /> : <Calendar size={14} />}
              {editingId ? 'Update Event' : 'Publish Event'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {events.map(event => (
          <div key={event.id} className="group bg-white border border-slate-200 p-5 rounded-[2.5rem] flex items-center justify-between transition-all hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5">
            <div className="flex items-center gap-6">
               <div className="w-32 h-20 bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 flex-shrink-0 relative">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Calendar size={24} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-lg text-[7px] font-black text-primary-600 uppercase tracking-widest border border-white/20">
                     {event.category}
                  </div>
               </div>
               <div>
                 <div className="text-lg font-black text-slate-800 tracking-tight mb-2">{event.title}</div>
                 <div className="flex items-center gap-4">
                   <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary-600" /> {event.date || 'TBD'}
                   </div>
                   <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary-600" /> {event.location || 'Maharashtra'}
                      {event.district && ` (${event.district})`}
                   </div>
                   {event.adminEmail && (
                     <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ml-2">
                        <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse" /> {event.adminEmail}
                     </div>
                   )}
                 </div>
               </div>
            </div>
            <div className="flex gap-2 pr-2">
              <button onClick={() => handleEditClick(event)} className="p-2 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"><Edit3 size={18} /></button>
              <button onClick={() => deleteEvent(event)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">No active events in the pipeline</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsManagementSection;
