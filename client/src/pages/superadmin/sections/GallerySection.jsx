import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2, Sparkles } from 'lucide-react';
import { compressImage } from '../../../utils/imageOptimizer';

const GallerySection = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [imageFiles, setImageFiles] = useState([null, null, null, null, null]);
  const [galleryTitle, setGalleryTitle] = useState('');

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages((data || []).map(item => ({
        ...item,
        imageUrls: item.imageUrls || item.image_urls || [],
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleFileChange = (index, file) => {
    const newFiles = [...imageFiles];
    newFiles[index] = file;
    setImageFiles(newFiles);
  };

  const uploadToGallery = async () => {
    const validFiles = imageFiles.filter(f => f !== null);
    if (validFiles.length === 0) {
      alert("Please select at least one photo.");
      return;
    }

    setUploading(true);
    try {
      const imageUrls = [];
      for (const file of validFiles) {
        // Optimize image before upload
        setOptimizing(true);
        const optimizedFile = await compressImage(file, 1200, 0.7);
        setOptimizing(false);

        const safeName = (optimizedFile.name || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `gallery/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, optimizedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
      }

      const { error: insertError } = await supabase.from('gallery').insert([{
        title: galleryTitle || 'Association Gallery',
        image_urls: imageUrls,
        created_at: new Date().toISOString()
      }]);

      if (insertError) throw insertError;

      setGalleryTitle('');
      setImageFiles([null, null, null, null, null]);
      fetchGallery();
      alert("Gallery updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Error uploading gallery: " + (e.message || 'Check Supabase storage bucket "uploads".'));
    } finally {
      setUploading(false);
    }
  };

  const deleteGalleryItem = async (album) => {
    if (!confirm('Are you sure you want to permanently delete this gallery album and all its photos?')) return;

    try {
      // 1. Delete all photos from Supabase Storage first
      if (album.imageUrls && album.imageUrls.length > 0) {
        const paths = album.imageUrls
          .map(url => {
            const marker = '/storage/v1/object/public/uploads/';
            const idx = url.indexOf(marker);
            return idx !== -1 ? decodeURIComponent(url.slice(idx + marker.length).split('?')[0]) : null;
          })
          .filter(Boolean);

        if (paths.length > 0) {
          const { error: storageErr } = await supabase.storage.from('uploads').remove(paths);
          if (storageErr) console.warn("Could not delete gallery photos from storage:", storageErr);
        }
      }

      // 2. Delete from Supabase DB
      const { error } = await supabase.from('gallery').delete().eq('id', album.id);
      if (error) throw error;

      fetchGallery();
      alert("Gallery album deleted successfully.");
    } catch (e) {
      console.error(e);
      alert("Error deleting gallery album.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ImageIcon className="text-primary-600" size={24} /> 
            Media Gallery
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Upload and manage photo archives for the website</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Upload Form */}
        <div className="lg:col-span-5">
           <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-primary-600">
                    <Upload size={18} />
                 </div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Add to Gallery</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Album Title (Optional)</label>
                  <input 
                    placeholder="Event Name or Year..." 
                    value={galleryTitle}
                    onChange={e => setGalleryTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-primary-600 transition-all shadow-sm" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Slots (Max 5 at once)</label>
                  <div className="grid grid-cols-5 gap-3">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative aspect-square group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleSingleFileChange(idx, e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full h-full bg-white border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center group-hover:border-primary-600 transition-all relative">
                          {file ? (
                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center opacity-20">
                              <Plus size={16} className="mx-auto" />
                              <p className="text-[6px] font-black mt-1 uppercase">{idx + 1}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={uploadToGallery}
                  disabled={uploading}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-50 mt-4"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      {optimizing ? 'Optimizing Media...' : 'Broadcasting Node...'}
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} />
                      Publish to Gallery
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>

        {/* Existing Gallery List */}
        <div className="lg:col-span-7 space-y-6">
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Visual Archive</h3>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{images.length} Albums</span>
           </div>

           {loading ? (
             <div className="py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-primary-600" size={24} />
             </div>
           ) : (
             <div className="grid gap-6">
               {images.map(item => (
                 <div key={item.id} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all">
                    <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-primary-600">
                             <Sparkles size={14} />
                          </div>
                          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{item.title}</span>
                       </div>
                       <button onClick={() => deleteGalleryItem(item)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </div>
                    <div className="p-4">
                       <div className="grid grid-cols-5 gap-2">
                          {item.imageUrls?.map((url, i) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                               <img src={url} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
               ))}

               {images.length === 0 && (
                 <div className="py-32 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Gallery is empty</p>
                 </div>
               )}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default GallerySection;
