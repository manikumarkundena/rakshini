
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Map, MessageSquare, Eye, ChevronRight, Bell, Cloud, Sun, User, AlertTriangle, Lock, WifiOff, X, Sparkles, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/useStore';
import DemoHint from '../components/DemoHint';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <div className="text-right">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
    <div>
      <p className="text-gray-500 font-medium text-sm flex items-center mb-1">
        {subtitle}
      </p>
      {trend && (
        <div className="flex items-center space-x-1">
          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${trend}%` }}
               className="h-full bg-saffron"
             />
          </div>
          <span className="text-[10px] text-gray-400 font-bold">{trend}% High</span>
        </div>
      )}
    </div>
  </motion.div>
);

const IconButton = ({ icon: Icon, label, color, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center space-y-2 group"
  >
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-xl shadow-saffron/10 group-hover:shadow-saffron/30 transition-all`}>
      <Icon size={24} />
    </div>
    <span className="text-xs font-bold text-gray-600 tracking-tight">{label}</span>
  </motion.button>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const displayName = profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'User';
  const photoURL = profile?.photoURL || user?.photoURL;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Safe route recalculated', meta: 'Obstruction detected on main corridor', time: '2m ago', icon: Shield, color: 'text-saffron bg-saffron/10' },
    { id: 2, title: 'Guardian monitoring active', meta: 'Satellite sync confirmed', time: '15m ago', icon: Zap, color: 'text-blue-500 bg-blue-50' },
    { id: 3, title: 'Community alert reported', meta: 'Poor lighting reported near you', time: '1h ago', icon: Eye, color: 'text-orange-500 bg-orange-50' },
    { id: 4, title: 'Emergency network online', meta: 'Regional nodes connectivity 100%', time: '3h ago', icon: Map, color: 'text-emerald-500 bg-emerald-50' },
  ];

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

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDF8F5] px-6 pt-14 pb-44 space-y-10">
        {/* Cinematic Header */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-3xl p-4 rounded-[32px] border border-white shadow-xl shadow-black/[0.02]">
          <div className="flex items-center space-x-4 pl-2">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm"
            >
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-gray-400" size={28} />
                )}
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Hey {displayName}!</h2>
                {!isOnline ? (
                  <div className="bg-amber-50 text-amber-500 px-3 py-1 rounded-full flex items-center space-x-1.5 border border-amber-100">
                    <WifiOff size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Offline</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 opacity-60">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Node</span>
                  </div>
                )}
              </div>
              <p className="text-saffron text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{profile?.role || 'Guardian System Armed'}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-xl shadow-black/5 border border-white relative group"
          >
            <Bell size={26} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-emergency rounded-full border-2 border-white shadow-lg animate-pulse" />
          </motion.button>
        </div>

        {/* Notification Panel */}
        <AnimatePresence>
          {showNotifications && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-sm bg-white/95 backdrop-blur-3xl z-[101] shadow-2xl border-l border-white p-8"
              >
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Activity</h3>
                      <p className="text-[10px] font-black text-saffron uppercase tracking-[0.2em] opacity-80">Security Intelligence Feed</p>
                   </div>
                   <motion.button 
                     whileTap={{ scale: 0.9 }}
                     onClick={() => setShowNotifications(false)}
                     className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"
                   >
                     <X size={20} />
                   </motion.button>
                </div>

                <div className="space-y-4">
                   {notifications.map((notif, i) => (
                     <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={notif.id}
                        className="bg-white/50 border border-white rounded-[28px] p-5 shadow-sm hover:shadow-md transition-shadow group flex items-start space-x-4"
                     >
                        <div className={`w-12 h-12 rounded-2xl ${notif.color} flex items-center justify-center shrink-0`}>
                           <notif.icon size={22} />
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start">
                              <h4 className="text-sm font-black text-gray-900 leading-tight">{notif.title}</h4>
                              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{notif.time}</span>
                           </div>
                           <p className="text-[11px] text-gray-400 font-medium mt-1 leading-relaxed">{notif.meta}</p>
                        </div>
                     </motion.div>
                   ))}
                </div>
                
                <div className="absolute bottom-10 left-8 right-8">
                   <motion.button 
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors"
                   >
                      Clear Log
                   </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Safety Core Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <StatCard
              title="Global Protection Index"
              value="94/100"
              subtitle="Secure Protection"
              icon={Shield}
              color="saffron-gradient"
              trend={94}
            />
          </div>
          <div className="lg:col-span-5">
             <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-[40px] p-8 shadow-xl shadow-black/[0.02] border border-white flex flex-col justify-between h-full relative overflow-hidden group"
              >
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 saffron-gradient rounded-full opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">AI Core Risk State</p>
                    <div className="relative w-full max-w-[200px] h-24 flex items-center justify-center overflow-hidden">
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 border-[1px] border-emerald-500/20 rounded-full" 
                       />
                       <motion.div 
                         animate={{ rotate: -360 }}
                         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                         className="absolute w-4/5 h-4/5 border-[1px] border-emerald-500/10 rounded-full" 
                       />
                       <div className="text-emerald-500 flex flex-col items-center">
                          <h3 className="text-4xl font-black tracking-tighter">ZEN</h3>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Locked</span>
                       </div>
                    </div>
                    <div className="w-full max-w-[180px] bg-gray-50 h-2 rounded-full overflow-hidden border border-white">
                       <motion.div 
                         initial={{ x: "-100%" }}
                         animate={{ x: "100%" }}
                         transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                         className="h-full w-1/3 saffron-gradient blur-sm" 
                       />
                    </div>
                </div>
              </motion.div>
          </div>
        </div>

        {/* Quick Commands Grid */}
        <div className="bg-white rounded-[48px] p-10 shadow-2xl shadow-black/[0.03] border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 saffron-gradient rounded-full opacity-5 blur-[100px]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12 pl-2">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Security Control Center</p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Protocols</h3>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Encrypted Nodes Active</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <IconButton icon={Zap} label="SOS" color="bg-emergency" onClick={() => navigate('/sos')} />
              <IconButton icon={Map} label="Map" color="bg-orange-500" onClick={() => navigate('/map')} />
              <IconButton icon={MessageSquare} label="Guardian" color="bg-blue-500" onClick={() => navigate('/assistant')} />
              <IconButton icon={Eye} label="Stealth" color="bg-gray-800" onClick={() => navigate('/calculator')} />
              <IconButton icon={AlertTriangle} label="Report" color="bg-amber-500" onClick={() => navigate('/reports')} />
              <IconButton icon={Lock} label="Vault" color="bg-saffron" onClick={() => navigate('/vault')} />
            </div>
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="space-y-6 pb-12">
          <div className="flex justify-between items-center px-4">
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em]">Intelligence Feed</p>
            <motion.button 
              whileHover={{ rotate: 90 }}
              className="w-10 h-10 bg-white shadow-xl shadow-black/5 rounded-full flex items-center justify-center text-gray-300"
            >
               <ChevronRight size={18} />
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 px-2">
            {[
              { title: 'Secure Corridor Detected', meta: 'Safe commute suggested', icon: Shield, color: 'bg-emerald-50 text-emerald-500', dot: 'bg-emerald-500' },
              { title: 'New Community Alert', meta: 'Poor lighting reported near you', icon: Eye, color: 'bg-orange-50 text-orange-500', dot: 'bg-orange-500' }
            ].map((feed, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 5 }}
                className="bg-white rounded-[32px] p-6 border border-white shadow-xl shadow-black/[0.01] flex items-center space-x-5 group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl ${feed.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   <feed.icon size={26} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-900 tracking-tight">{feed.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{feed.meta}</p>
                </div>
                <div className={`w-2.5 h-2.5 ${feed.dot} rounded-full shadow-lg shadow-black/20`} />
              </motion.div>
            ))}
          </div>
        </div>
        <DemoHint id="dash_sos" message="Tap SOS for emergency simulation" position="bottom" delay={2000} icon={Zap} />
        <DemoHint id="dash_navigation" message="Interactive AI Navigation Active" position="top" delay={4000} icon={Sparkles} />
        <DemoHint id="map_gestures" message="Swipe right to return" position="top" delay={3000} icon={Navigation} />
        <DemoHint id="map_layers" message="Toggle Layers for Tactical View" position="bottom" delay={5000} icon={Sparkles} />
      </div>
    </PageTransition>
  );
}

const Users = ({ size, className }: any) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} height={size} 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" 
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        className={className}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);
