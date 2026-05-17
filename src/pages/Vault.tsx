
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileText, Image as ImageIcon, Video, Plus, ChevronLeft, Shield, Search, MoreVertical, Trash2, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

interface VaultFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'other';
  size: string;
  date: string;
  url?: string;
}

export default function Vault() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState<VaultFile[]>([
    { id: '1', name: 'Identity_Proof.pdf', type: 'pdf', size: '2.4 MB', date: '2 days ago' },
    { id: '2', name: 'Evidence_Capture_001.mp4', type: 'video', size: '45 MB', date: '5 days ago' },
    { id: '3', name: 'Emergency_Contacts.pdf', type: 'pdf', size: '156 KB', date: '1 week ago' },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split('/')[0];
    const newFile: VaultFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: (file.type.includes('pdf') ? 'pdf' : (fileType as any)) || 'other',
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      date: 'Just now',
      url: URL.createObjectURL(file)
    };

    setFiles(prev => [newFile, ...prev]);
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDF8F5] px-6 pt-14 pb-32">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-5">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)} 
              className="w-12 h-12 bg-white shadow-xl shadow-black/5 rounded-2xl flex items-center justify-center text-gray-400 border border-white"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Vault</h2>
              <p className="text-[10px] font-black text-saffron uppercase tracking-[0.2em] opacity-80">Security Protocol Alpha</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 saffron-gradient rounded-[22px] flex items-center justify-center text-white shadow-[0_15px_30px_rgba(255,153,51,0.3)] transition-all"
          >
            <Plus size={28} />
          </motion.button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[40px] p-8 mb-10 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex items-start space-x-6"
        >
           <div className="w-16 h-16 bg-saffron/10 rounded-[28px] flex items-center justify-center text-saffron flex-shrink-0">
              <Shield size={32} />
           </div>
           <div>
              <h4 className="text-lg font-black text-gray-900">Encrypted Storage</h4>
              <p className="text-gray-400 text-xs font-bold leading-relaxed mt-2">
                 Your evidence is protected by zero-knowledge architecture. Everything is encrypted locally on your device.
              </p>
           </div>
        </motion.div>

        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-saffron blur-2xl opacity-5 group-focus-within:opacity-10 transition-opacity" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            placeholder="Search your records..."
            className="relative w-full h-16 bg-white rounded-[28px] pl-14 pr-6 outline-none border border-white shadow-xl shadow-black/5 font-bold text-gray-800 placeholder:text-gray-300 focus:border-saffron/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Recent Decrypted Files</p>
              <div className="flex space-x-1">
                 <div className="w-1.5 h-1.5 bg-saffron rounded-full animate-pulse" />
                 <span className="text-[9px] font-black text-saffron uppercase tracking-widest">Active session</span>
              </div>
           </div>

           <AnimatePresence mode="popLayout">
             {filteredFiles.length > 0 ? filteredFiles.map((file) => (
               <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white rounded-[32px] p-5 flex items-center space-x-5 border border-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all"
               >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    file.type === 'video' ? 'bg-purple-50 text-purple-500' : 
                    file.type === 'pdf' ? 'bg-red-50 text-red-500' : 
                    file.type === 'image' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'
                  }`}>
                     {file.type === 'video' ? <Video size={24} /> : 
                      file.type === 'pdf' ? <FileText size={24} /> : 
                      file.type === 'image' ? (
                        file.url ? <img src={file.url} className="w-full h-full object-cover rounded-2xl" /> : <ImageIcon size={24} />
                      ) : <FileText size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-black text-gray-900 truncate tracking-tight">{file.name}</h4>
                     <p className="text-[10px] text-gray-400 font-black uppercase mt-1 tracking-widest">
                        {file.size} • {file.date}
                     </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => deleteFile(file.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                       <Trash2 size={18} />
                    </button>
                    {file.url && (
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 text-gray-300 hover:text-saffron hover:bg-orange-50 rounded-xl transition-all"
                      >
                         <Eye size={18} />
                      </a>
                    )}
                  </div>
               </motion.div>
             )) : (
               <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                     <Search size={32} />
                  </div>
                  <p className="text-gray-400 font-black text-sm uppercase tracking-widest leading-loose">No records found matching your query</p>
               </div>
             )}
           </AnimatePresence>
        </div>

        {/* Categories */}
        <div className="mt-16 grid grid-cols-2 gap-5">
           {[
             { label: 'Cloud Backup', icon: Lock, count: '1.2 GB', color: 'text-saffron', bg: 'bg-orange-50/50' },
             { label: 'Voice Evidence', icon: FileText, count: '14 files', color: 'text-blue-500', bg: 'bg-blue-50/50' },
           ].map((cat, i) => (
             <motion.div 
               key={i} 
               whileHover={{ y: -5 }}
               className={`${cat.bg} rounded-[40px] p-8 flex flex-col items-center text-center space-y-4 border border-white/50 backdrop-blur-sm`}
             >
                <div className={`w-14 h-14 bg-white/50 backdrop-blur-md border border-white/80 flex items-center justify-center rounded-2xl ${cat.color} shadow-sm`}>
                   <cat.icon size={28} />
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${cat.color}`}>{cat.label}</span>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">{cat.count}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </PageTransition>
  );
}
