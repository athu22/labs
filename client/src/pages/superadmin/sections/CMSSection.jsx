import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import {
  Home as HomeIcon, Info, Newspaper, Bell, Users, Layout,
  Plus, Trash2, Save, Loader2, RefreshCw, Sparkles
} from 'lucide-react';

const CMSSection = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content States
  const [mainContent, setMainContent] = useState({
    heroTitle: 'Empowering Clinical Laboratory Professionals',
    heroSubtext: 'Association of Clinical Laboratory Analysts & Practitioners (ACLAP) is dedicated to advancing the standards...',
    aboutText: 'The Association of Clinical Laboratory Analysts & Practitioners (ACLAP) is a premier professional body...',
    memberCountOffset: 2450,
    email: 'contact@aclap.org',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India',
    facebook: '',
    twitter: '',
    instagram: '',
    bannerUrl: ''
  });

  const [news, setNews] = useState([]);
  const [notices, setNotices] = useState([]);

  const [newNews, setNewNews] = useState({ title: '', content: '' });
  const [newNotice, setNewNotice] = useState({ title: '', content: '', priority: 'Normal' });

  useEffect(() => {
    fetchCMSData();
  }, []);

  const fetchCMSData = async () => {
    setLoading(true);
    try {
      const [
        { data: mainSnap },
        { data: newsSnap },
        { data: noticesSnap }
      ] = await Promise.all([
        supabase.from('content').select('*').eq('id', 'main').single(),
        supabase.from('news').select('*').order('created_at', { ascending: false }),
        supabase.from('notices').select('*').order('created_at', { ascending: false })
      ]);

      if (mainSnap) {
        setMainContent(prev => ({
          ...prev,
          heroTitle: mainSnap.hero_title ?? prev.heroTitle,
          heroSubtext: mainSnap.hero_subtext ?? prev.heroSubtext,
          aboutText: mainSnap.about_text ?? prev.aboutText,
          memberCountOffset: mainSnap.member_count_offset ?? prev.memberCountOffset,
          email: mainSnap.email ?? prev.email,
          phone: mainSnap.phone ?? prev.phone,
          address: mainSnap.address ?? prev.address,
          facebook: mainSnap.facebook ?? prev.facebook,
          twitter: mainSnap.twitter ?? prev.twitter,
          instagram: mainSnap.instagram ?? prev.instagram,
          bannerUrl: mainSnap.banner_url ?? prev.bannerUrl,
        }));
      }

      setNews(newsSnap || []);
      setNotices(noticesSnap || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMain = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('content').upsert({
        id: 'main',
        hero_title: mainContent.heroTitle,
        hero_subtext: mainContent.heroSubtext,
        about_text: mainContent.aboutText,
        member_count_offset: Number(mainContent.memberCountOffset) || 0,
        email: mainContent.email,
        phone: mainContent.phone,
        address: mainContent.address,
        facebook: mainContent.facebook,
        twitter: mainContent.twitter,
        instagram: mainContent.instagram,
        banner_url: mainContent.bannerUrl,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      alert('Main content updated!');
    } catch (e) {
      console.error(e);
      alert('Failed to update main content.');
    } finally {
      setSaving(false);
    }
  };

  const addNews = async () => {
    if (!newNews.title) return;
    const { error } = await supabase.from('news').insert([{
      title: newNews.title,
      content: newNews.content,
      created_at: new Date().toISOString()
    }]);
    if (error) {
      console.error(error);
      alert('Failed to add story.');
      return;
    }
    setNewNews({ title: '', content: '' });
    fetchCMSData();
  };

  const addNotice = async () => {
    if (!newNotice.title) return;
    const { error } = await supabase.from('notices').insert([{
      title: newNotice.title,
      content: newNotice.content,
      priority: newNotice.priority,
      created_at: new Date().toISOString()
    }]);
    if (error) {
      console.error(error);
      alert('Failed to broadcast notice.');
      return;
    }
    setNewNotice({ title: '', content: '', priority: 'Normal' });
    fetchCMSData();
  };

  const deleteItem = async (col, id) => {
    if (confirm('Delete this item?')) {
      const { error } = await supabase.from(col).delete().eq('id', id);
      if (error) {
        console.error(error);
        alert('Failed to delete item.');
        return;
      }
      fetchCMSData();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-8 h-8 border-2 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Layout className="text-primary-600" size={24} /> 
            CMS Architecture
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage global website titles and core content</p>
        </div>
        <button
          onClick={handleSaveMain}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
          Commit Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Left Column: Branding & Hero */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
                   <HomeIcon size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Hero & Headline Sections</h3>
             </div>
             
             <div className="grid md:grid-cols-3 gap-6">
               <div className="md:col-span-2">
                 <CMSInput
                   label="Hero Main Title"
                   value={mainContent.heroTitle}
                   onChange={(v) => setMainContent({ ...mainContent, heroTitle: v })}
                 />
               </div>
               <CMSInput
                 label="Member Offset"
                 type="number"
                 value={mainContent.memberCountOffset}
                 onChange={(v) => setMainContent({ ...mainContent, memberCountOffset: parseInt(v) })}
               />
             </div>
             
             <div className="mt-6">
               <CMSTextarea
                 label="Hero Description"
                 value={mainContent.heroSubtext}
                 onChange={(v) => setMainContent({ ...mainContent, heroSubtext: v })}
               />
             </div>
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
                   <Info size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">About Section Title & Text</h3>
             </div>
             <CMSTextarea
               label="Long Description Content"
               rows={6}
               value={mainContent.aboutText}
               onChange={(v) => setMainContent({ ...mainContent, aboutText: v })}
             />
          </div>
        </div>

        {/* Right Column: Meta & Contacts */}
        <div className="space-y-8">
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
                   <Users size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Contact Identity</h3>
             </div>
             <div className="space-y-4">
               <CMSInput label="Official Email" value={mainContent.email} onChange={(v) => setMainContent({ ...mainContent, email: v })} />
               <CMSInput label="Phone Number" value={mainContent.phone} onChange={(v) => setMainContent({ ...mainContent, phone: v })} />
               <CMSInput label="Office Address" value={mainContent.address} onChange={(v) => setMainContent({ ...mainContent, address: v })} />
             </div>
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
                   <Sparkles size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Social Channels</h3>
             </div>
             <div className="space-y-4">
               <CMSInput label="Facebook" value={mainContent.facebook} onChange={(v) => setMainContent({ ...mainContent, facebook: v })} />
               <CMSInput label="Twitter / X" value={mainContent.twitter} onChange={(v) => setMainContent({ ...mainContent, twitter: v })} />
               <CMSInput label="Instagram" value={mainContent.instagram} onChange={(v) => setMainContent({ ...mainContent, instagram: v })} />
             </div>
          </div>
        </div>

      </div>

      {/* Dynamic Feeds: News & Notices */}
      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* News Flow */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
              <Newspaper size={14} className="text-primary-600" /> Dispatch News
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{news.length} Items</span>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <input
                placeholder="Story Title..."
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-primary-600 transition-all"
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
              />
              <textarea
                placeholder="Brief content breakdown..."
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-[11px] text-slate-600 outline-none resize-none font-medium min-h-[100px] focus:border-primary-600 transition-all"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
              />
              <button onClick={addNews} className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-xl text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95">
                <Plus size={14} /> Add Story
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {news.map(item => (
                <div key={item.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex justify-between items-start group hover:border-primary-200 transition-all">
                  <div className="pr-4">
                    <h4 className="text-slate-800 font-bold text-xs">{item.title}</h4>
                    <p className="text-slate-400 text-[10px] mt-1 line-clamp-1 font-medium italic">{item.content}</p>
                  </div>
                  <button onClick={() => deleteItem('news', item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Notices Flow */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
              <Bell size={14} className="text-amber-500" /> Bulletin Board
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{notices.length} Active</span>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <input
                placeholder="Notice Subject..."
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500 transition-all"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
              />
              <select
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none appearance-none"
                value={newNotice.priority}
                onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
              >
                <option>Normal Priority</option>
                <option>Important Priority</option>
                <option>Urgent Priority</option>
              </select>
              <button onClick={addNotice} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest rounded-xl text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-600/10">
                <Plus size={14} /> Broadcast
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {notices.map(item => (
                <div key={item.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex justify-between items-center group hover:border-amber-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.priority?.includes('Urgent') ? 'bg-rose-500 animate-pulse' : item.priority?.includes('Important') ? 'bg-amber-500' : 'bg-slate-300'}`} />
                    <h4 className="text-slate-800 font-bold text-xs">{item.title}</h4>
                  </div>
                  <button onClick={() => deleteItem('notices', item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

// Reusable Components
const CMSInput = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
    <input
      type={type}
      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-600/5 outline-none transition-all placeholder:text-slate-300"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const CMSTextarea = ({ label, value, onChange, rows = 3 }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
    <textarea
      rows={rows}
      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-[11px] font-medium text-slate-700 focus:border-primary-600 focus:ring-4 focus:ring-primary-600/5 outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);


export default CMSSection;
