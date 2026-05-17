
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Camera, Send, ChevronLeft, Shield, Map, Eye, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useStore';
import PageTransition from '../components/PageTransition';

const REPORT_TYPES = [
  { id: 'harassment', label: 'Harassment', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-50/50' },
  { id: 'lighting', label: 'Poor Lighting', icon: Eye, color: 'text-amber-500', bgColor: 'bg-amber-50/50' },
  { id: 'isolated', label: 'Isolated Area', icon: Map, color: 'text-orange-500', bgColor: 'bg-orange-50/50' },
  { id: 'suspicious', label: 'Suspicious Activity', icon: Shield, color: 'text-blue-500', bgColor: 'bg-blue-50/50' },
];

export default function CommunityReport() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number, address?: string } | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude, address: 'Detecting area...' });
          
          try {
            // Reverse geocode using Mapbox
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&limit=1`);
            const data = await res.json();
            if (data.features && data.features.length > 0) {
              setLocation({ lat: latitude, lng: longitude, address: data.features[0].place_name });
            }
          } catch (e) {
            setLocation({ lat: latitude, lng: longitude, address: 'Location Pinned' });
          }
        },
        () => setLocation({ lat: 17.4483, lng: 78.3915, address: 'Precision Location Failed' })
      );
    }
  }, []);

  const toggleType = (id: string) => {
    setSelectedTypes(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id) 
        : [...prev, id]
    );
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (selectedTypes.length === 0 || !user) return;
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userName: user.displayName,
        types: selectedTypes,
        description,
        timestamp: serverTimestamp(),
        location: location || { lat: 17.4483, lng: 78.3915 },
        image: capturedImage
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error("Report failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDF8F5] px-6 pt-14 pb-32">
        <div className="flex items-center space-x-5 mb-12">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)} 
            className="w-12 h-12 bg-white shadow-xl shadow-black/5 rounded-2xl flex items-center justify-center text-gray-400 border border-white"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Report</h2>
            <p className="text-[10px] font-black text-saffron uppercase tracking-[0.2em] opacity-80">Community Safety Network</p>
          </div>
        </div>

        <div className="space-y-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/40 backdrop-blur-3xl rounded-[40px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white"
          >
            <div className="flex justify-between items-center mb-6 px-2">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Select modules</p>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-saffron rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-saffron rounded-full animate-pulse [animation-delay:200ms]" />
                <div className="w-1 h-1 bg-saffron rounded-full animate-pulse [animation-delay:400ms]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {REPORT_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(255,153,51,0.1)' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleType(type.id)}
                    className={`p-5 rounded-[32px] border-2 transition-all duration-500 flex flex-col items-center space-y-3 relative overflow-hidden group ${
                      isSelected 
                        ? 'border-saffron bg-white shadow-xl shadow-saffron/20' 
                        : 'border-white bg-white/60 shadow-lg shadow-black/[0.02] hover:bg-white hover:border-saffron/30'
                    }`}
                  >
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-3 right-3 z-10"
                      >
                         <div className="w-5 h-5 bg-saffron rounded-full flex items-center justify-center text-white shadow-lg shadow-saffron/30">
                            <CheckCircle2 size={12} />
                         </div>
                      </motion.div>
                    )}

                    <div className={`w-14 h-14 ${isSelected ? 'bg-white shadow-lg text-gray-900 border border-saffron/20' : `${type.bgColor} ${type.color} border border-white`} rounded-[22px] flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 relative`}>
                      <type.icon 
                        size={26} 
                        strokeWidth={2.5} 
                        className={`relative z-10 transition-colors duration-500 ${isSelected ? type.color : ''}`} 
                      />
                    </div>

                    <div className="flex flex-col items-center space-y-1 relative z-10">
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                        {type.label}
                      </span>
                      {isSelected && (
                        <motion.div 
                          layoutId={`line-${type.id}`}
                          className="w-8 h-1 bg-saffron rounded-full shadow-[0_0_8px_rgba(255,153,51,0.4)]"
                          initial={{ width: 0 }}
                          animate={{ width: 32 }}
                        />
                      )}
                    </div>

                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white"
          >
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Detailed context</p>
              <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">AI Enhanced</div>
            </div>
            <textarea
              placeholder="Provide any additional details that might help others..."
              className="w-full h-32 bg-gray-50/50 rounded-[32px] p-6 outline-none focus:ring-2 focus:ring-saffron/10 transition-all font-bold text-gray-800 text-sm resize-none placeholder:text-gray-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[40px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white flex flex-col space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 pl-4 overflow-hidden">
                <div className={`w-2 h-2 ${location ? 'bg-emerald-500' : 'bg-saffron'} rounded-full animate-pulse shrink-0`} />
                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">
                  {location?.address || 'Pinning Location...'}
                </span>
              </div>
              <div className="flex space-x-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageCapture}
                />
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${capturedImage ? 'bg-saffron text-white shadow-xl shadow-saffron/30' : 'bg-gray-50 text-gray-400 hover:text-saffron'}`}
                >
                  <Camera size={24} />
                </motion.button>
              </div>
            </div>

            {capturedImage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative px-2 pb-2"
              >
                <div className="aspect-[16/9] w-full rounded-[28px] overflow-hidden border-2 border-dashed border-gray-100 relative group">
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                  >
                    <X size={20} />
                  </motion.button>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                     <p className="text-[9px] font-black text-white uppercase tracking-widest flex items-center space-x-2">
                        <ImageIcon size={10} />
                        <span>Evidence Securely Attached</span>
                     </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={selectedTypes.length === 0 || isSubmitting}
            className={`w-full h-16 rounded-[28px] font-black text-lg flex items-center justify-center space-x-3 shadow-xl transition-all ${
              selectedTypes.length > 0 && !isSubmitting 
                ? 'saffron-gradient text-white shadow-saffron/30' 
                : 'bg-gray-200 text-gray-400 shadow-none grayscale cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <>
                <Send size={20} />
                <span>Submit Comprehensive Report</span>
              </>
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-10"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[48px] p-12 text-center space-y-8 shadow-[0_40px_100px_rgba(0,0,0,0.3)] flex flex-col items-center relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 saffron-gradient rounded-full opacity-5 -mr-16 -mt-16 blur-2xl" />
                 
                 <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-saffron/20 rounded-full blur-xl" 
                    />
                    <div className="w-24 h-24 saffron-gradient rounded-[32px] flex items-center justify-center text-white relative z-10 shadow-2xl">
                       <Shield size={48} />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Protection Sequence Initiated</h3>
                    <p className="text-gray-500 font-bold tracking-tight text-sm px-4">Your intelligent safety report has been synchronized with the community grid.</p>
                 </div>

                 <div className="w-full bg-emerald-50 text-emerald-600 py-4 px-6 rounded-2xl flex items-center space-x-3 border border-emerald-100">
                    <CheckCircle2 size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Network Synchronized successfully</span>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
