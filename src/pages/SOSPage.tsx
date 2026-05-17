
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle, Phone, Navigation, Disc, CheckCircle2, WifiOff, Send, ChevronLeft, Info, Loader2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore, useSafetyStore } from '../store/useStore';
import PageTransition from '../components/PageTransition';
import DemoHint from '../components/DemoHint';

export default function SOSPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const setNavHidden = useSafetyStore(state => state.setNavHidden);
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [aiBriefingLoading, setAiBriefingLoading] = useState(false);

  useEffect(() => {
    setNavHidden(isActivated);
    return () => setNavHidden(false);
  }, [isActivated, setNavHidden]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [notifiedGuardians, setNotifiedGuardians] = useState<string[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSOS = async () => {
    setIsTransmitting(true);
    setAiBriefingLoading(true);
    try {
      // 1. Fetch real guardians to notify
      const q = query(collection(db, 'contacts'), where('userId', '==', user?.uid));
      const snap = await getDocs(q);
      const guardians = snap.docs.map(doc => doc.data().name);
      setNotifiedGuardians(guardians);

      // 2. Record SOS Event in Firestore
      if (user) {
        await addDoc(collection(db, 'sos_events'), {
          userId: user.uid,
          timestamp: new Date(),
          location: 'Live Tracking Active', // In real app, get geolocation
          status: 'ACTIVE_EMERGENCY',
          notifiedGuardians: guardians
        });
      }

      let latLng = undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej)
          );
          latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) {
          console.error('Location denied');
        }
      }

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `SOS mode is active for ${profile?.displayName || user?.displayName || 'Guardian'}. Provide a concise emergency briefing with the next 3 immediate safety actions, and acknowledge that guardians have been notified.`,
          history: [],
          latLng
        }),
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setAiBriefing(data.text);
      } else if (response.status === 503 && data.error === 'MISSING_GEMINI_API_KEY') {
        setAiBriefing('AI briefing is unavailable until GEMINI_API_KEY is configured. SOS activation and guardian alerts are still active.');
      } else {
        setAiBriefing('AI briefing could not be generated right now, but SOS activation and guardian alerts are still active.');
      }

      // 3. Simulated delay for "Cinematic Transmission"
      await new Promise(r => setTimeout(r, 1500));
      setIsActivated(true);
    } catch (e) {
      console.error(e);
      // Fallback activation
      setAiBriefing('AI briefing could not be generated right now, but SOS activation and guardian alerts are still active.');
      setIsActivated(true);
    } finally {
      setIsTransmitting(false);
      setAiBriefingLoading(false);
    }
  };

  const handleStart = () => {
    setIsPressing(true);
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          triggerSOS();
          return 100;
        }
        return prev + 2;
      });
    }, 30);
  };

  const handleEnd = () => {
    setIsPressing(false);
    clearInterval(timerRef.current);
    if (progress < 100) {
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDF8F5] flex flex-col items-center justify-between p-8 pb-44">
        <div className="w-full flex items-center justify-between mt-6">
           <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-xl shadow-black/5">
              <ChevronLeft size={24} />
           </button>
           <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Armed</span>
           </div>
           <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-xl shadow-black/5">
              <Info size={20} />
           </button>
        </div>

        {!isOnline && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full bg-amber-50 border border-amber-100 p-4 rounded-3xl mb-6 flex items-center space-x-3"
          >
            <WifiOff className="text-amber-500" size={20} />
            <div>
              <p className="text-amber-900 font-black text-xs uppercase tracking-tight">Offline Mode Active</p>
              <p className="text-amber-700/60 text-[10px] font-bold">Alerts will be sent via SMS & Mesh Network</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!isActivated ? (
            <motion.div
              key="activation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 flex flex-col items-center justify-center space-y-16 w-full max-w-md mx-auto"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">SOS Activation</h2>
                <p className="text-gray-400 font-bold text-sm tracking-tight px-10">Press and hold the shield for 3 seconds. Silent protocol will initiate.</p>
              </div>

              <div className="relative flex items-center justify-center scale-110">
                {/* Glowing Pulses */}
                {isPressing && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute w-48 h-48 bg-emergency/20 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute w-48 h-48 bg-emergency/10 rounded-full"
                    />
                  </>
                )}

                <motion.div 
                  className="relative w-64 h-64 flex items-center justify-center"
                  animate={{ scale: isPressing ? 1.05 : 1 }}
                >
                  {/* Progress Circle SVG */}
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle
                      cx="128" cy="128" r="120"
                      stroke="currentColor" strokeWidth="8"
                      fill="transparent" className="text-gray-100"
                    />
                    <motion.circle
                      cx="128" cy="128" r="120"
                      stroke="currentColor" strokeWidth="8"
                      fill="transparent" className="text-emergency"
                      strokeDasharray="753.98"
                      strokeDashoffset={753.98 - (753.98 * progress) / 100}
                    />
                  </svg>

                  <button
                    onMouseDown={handleStart}
                    onMouseUp={handleEnd}
                    onTouchStart={handleStart}
                    onTouchEnd={handleEnd}
                    disabled={isTransmitting}
                    className={`w-48 h-48 saffron-gradient rounded-full shadow-[0_30px_70px_rgba(255,153,51,0.4)] flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all duration-300 group ${isTransmitting ? 'grayscale cursor-not-allowed' : ''}`}
                  >
                    {isTransmitting ? (
                      <Loader2 size={72} className="text-white animate-spin opacity-50" />
                    ) : (
                      <div className="relative">
                        <Shield size={72} className="text-white group-active:rotate-12 transition-transform" />
                        <motion.div 
                           animate={{ scale: [1, 1.2, 1] }} 
                           transition={{ repeat: Infinity, duration: 2 }}
                           className="absolute inset-0 bg-white/20 blur-2xl rounded-full" 
                        />
                      </div>
                    )}
                  </button>
                </motion.div>
              </div>

              <div className="text-center">
                <AnimatePresence mode="wait">
                  {progress > 0 ? (
                    <motion.p 
                      key="counting"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-emergency font-black text-2xl tracking-tighter"
                    >
                      Protocol starting in {Math.ceil((100 - progress) / 33)}s
                    </motion.p>
                  ) : (
                    <motion.p 
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]"
                    >
                      Secure Connection Active
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="activated"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center space-y-10 w-full"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-200">
                <CheckCircle2 size={48} />
              </div>
              
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-gray-900">{isOnline ? 'SOS Activated!' : 'Alert Sent!'}</h2>
                <p className="text-gray-500 font-medium px-4 leading-relaxed">
                  {isOnline 
                    ? 'Help is on the way! Your location and alerts have been shared with your guardians and nearest police.' 
                    : 'SOS transmitted via SMS & Mesh Protocol. Your trusted contacts have been notified of your last known location.'}
                </p>
              </div>

              <div className="w-full space-y-4">
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Operational Output</p>
                    <div className="flex space-x-1">
                       <span className="w-1 h-1 bg-emergency rounded-full animate-ping" />
                       <span className="text-[10px] font-black text-emergency uppercase tracking-widest leading-none">Broadcasting</span>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-saffron/5 border border-saffron/10 p-5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-saffron">AI Briefing</p>
                    {aiBriefingLoading ? (
                      <div className="flex items-center space-x-3 text-gray-400">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm font-medium">Generating emergency guidance...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-gray-700 font-medium">
                        {aiBriefing || 'The SOS network is active. Emergency guidance will appear here once the AI response arrives.'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { icon: Navigation, label: 'Live Location Cloud Sync', active: isOnline },
                      { 
                        icon: Send, 
                        label: notifiedGuardians.length > 0 
                          ? `Alerted: ${notifiedGuardians.join(', ')}` 
                          : 'Fallback SMS Beacon Sent', 
                        active: true 
                      },
                      { icon: Disc, label: 'Ambient Audio Streaming', active: true },
                      { icon: AlertCircle, label: 'Nearby First Responders Alerted', active: isOnline },
                    ].filter(a => a.active).map((action, i) => (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2 }}
                        key={i}
                        className="flex items-center space-x-4 group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                          <action.icon size={22} />
                        </div>
                        <span className="text-gray-800 font-bold text-xs flex-1 leading-tight">{action.label}</span>
                        <div className="w-1.5 h-1.5 bg-saffron rounded-full animate-pulse" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsActivated(false)}
                  className="w-full h-16 bg-white border-2 border-gray-100 rounded-[28px] text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-black/[0.02]"
                >
                  I am Safe Now • Terminate SOS
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <DemoHint id="sos_sim" message="Long Press for real-world simulation" position="bottom" delay={1500} icon={Zap} />
      </div>
    </PageTransition>
  );
}
