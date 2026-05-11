import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Calendar, ChevronRight, X, Maximize2, Sparkles } from 'lucide-react';

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setAlbums(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Immersive Hero Section */}
      <div className="relative pt-48 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#1e3a8a_0%,transparent_50%)] opacity-40" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#3b82f6_0%,transparent_50%)] opacity-30" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-primary-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <Sparkles size={12} className="animate-pulse" /> Association Visual Archive
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
              Moments <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-600">Defined.</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-xl">
              An interactive visual journey through the milestones, scientific sessions, and community gatherings of ACLAP Maharashtra.
            </p>
          </motion.div>
        </div>

        {/* Decorative Element */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-600/20 blur-[120px] rounded-full" />
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-6 py-24 relative -mt-16 z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin" />
                <ImageIcon className="absolute inset-0 m-auto text-primary-600/20" size={24} />
             </div>
             <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em] animate-pulse">Syncing Visual Data</p>
          </div>
        ) : (
          <div className="space-y-40">
            {albums.map((album, idx) => (
              <motion.section 
                key={album.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="group"
              >
                {/* Album Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 text-primary-600 font-black text-[11px] uppercase tracking-[0.4em]">
                         <div className="h-px w-12 bg-primary-600/30" />
                         <span className="bg-primary-50 px-3 py-1 rounded-lg">
                            {album.createdAt?.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                         </span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none group-hover:translate-x-2 transition-transform duration-500">
                        {album.title}
                      </h2>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-4">
                         {album.imageUrls?.slice(0, 3).map((u, i) => (
                           <div key={i} className="w-10 h-10 rounded-full border-4 border-white overflow-hidden shadow-lg">
                              <img src={u} className="w-full h-full object-cover" alt="Preview" loading="lazy" />
                           </div>
                         ))}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                        {album.imageUrls?.length} HD Assets
                      </div>
                   </div>
                </div>

                {/* Refined Grid Layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {album.imageUrls?.map((url, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      whileHover={{ y: -10 }}
                      className="group/item relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/50 cursor-zoom-in transition-all duration-500"
                      onClick={() => setSelectedImage(url)}
                    >
                       <img 
                         src={url} 
                         alt={`Gallery Asset ${i}`} 
                         loading="lazy"
                         className="w-full h-full object-cover grayscale-[0.3] group-hover/item:grayscale-0 transition-all duration-700 group-hover/item:scale-110"
                       />
                       
                       {/* Glassmorphic Overlay */}
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                          <div className="translate-y-4 group-hover/item:translate-y-0 transition-transform duration-500 flex items-center justify-between">
                             <div className="w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center text-white">
                                <Maximize2 size={20} />
                             </div>
                             <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">View Full Size</span>
                          </div>
                       </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}

            {albums.length === 0 && (
              <div className="text-center py-40 bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-blue-600 to-primary-400" />
                 <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                    <ImageIcon size={48} strokeWidth={1} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Gallery Awaiting Content</h3>
                 <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto">
                    The association's visual archive is currently being curated. Check back soon for event highlights.
                 </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* High-End Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all z-[210]">
               <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl w-full h-full flex items-center justify-center pointer-events-none"
            >
               <img 
                 src={selectedImage} 
                 alt="Enlarged Visual" 
                 className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_100px_rgba(59,130,246,0.3)] pointer-events-auto"
               />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium CTA Section */}
      <section className="bg-white py-40 px-6 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary-600 to-transparent" />
         
         <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
               Ready to contribute to the <span className="text-primary-600">Community?</span>
            </h2>
            <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-2xl mx-auto">
               Be part of the next chapter. Join ACLAP Maharashtra today and help us capture more milestones in the history of clinical excellence.
            </p>
            <div className="pt-8">
               <Link to="/signup" className="inline-flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-2xl hover:shadow-primary-600/20 active:scale-95 group">
                  Join the Association <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Gallery;
