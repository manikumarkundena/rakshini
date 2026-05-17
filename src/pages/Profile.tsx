import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Settings, Shield, Bell, ChevronRight, LogOut, Info, ExternalLink, X, Save, Camera, Lock, CheckCircle2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { useAuthStore, useSafetyStore } from '../store/useStore';
import PageTransition from '../components/PageTransition';

const ProfileItem = ({ icon: Icon, label, value, onClick, color = "text-saffron", bgColor = "bg-cream" }: any) => (
  <motion.button
    whileHover={{ x: 5 }}
    onClick={onClick}
    className="w-full bg-white rounded-3xl p-5 border border-gray-50 shadow-sm flex items-center space-x-4 group"
  >
    <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center ${color} transition-all group-hover:scale-110`}>
       <Icon size={24} />
    </div>
    <div className="flex-1 text-left">
      <h4 className="text-sm font-black text-gray-900 leading-tight">{label}</h4>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{value}</p>
    </div>
    <ChevronRight size={18} className="text-gray-300 transition-transform group-hover:translate-x-1" />
  </motion.button>
);

const SettingToggle = ({ label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-2">
    <div className="flex-1 pr-4">
      <h4 className="text-sm font-bold text-gray-900 leading-tight">{label}</h4>
      <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">{desc}</p>
    </div>
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${active ? 'bg-saffron' : 'bg-gray-200'}`}
    >
      <motion.div
        animate={{ x: active ? 26 : 2 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </motion.button>
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, setUser, updateProfile } = useAuthStore();
  const setNavHidden = useSafetyStore(state => state.setNavHidden);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    setNavHidden(isEditOpen || isNotifOpen || isPrivacyOpen);
    return () => setNavHidden(false);
  }, [isEditOpen, isNotifOpen, isPrivacyOpen, setNavHidden]);

  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<{id: string, msg: string}[]>([]);

  const addToast = (msg: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    bio: '',
    bloodGroup: '',
    medicalConditions: '',
    gender: '',
    role: '',
    aiAlias: '',
    guardianLevel: '',
    protocolTier: ''
  });

  // Settings State (Persisted in localStorage)
  const [settings, setSettings] = useState({
    sosAlerts: true,
    riskAlerts: true,
    guardianAlerts: true,
    stealthMode: false,
    vaultLock: true,
    biometrics: false
  });

  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem(`settings_${user.uid}`);
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        bloodGroup: profile.bloodGroup || '',
        medicalConditions: profile.medicalConditions || '',
        gender: profile.gender || '',
        role: profile.role || '',
        aiAlias: profile.aiAlias || '',
        guardianLevel: profile.guardianLevel || '',
        protocolTier: profile.protocolTier || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (formData.displayName !== user.displayName) {
        await updateFirebaseProfile(auth.currentUser!, { displayName: formData.displayName });
        setUser({ ...user, displayName: formData.displayName });
      }

      const updatedData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });

      updateProfile(updatedData);
      addToast('Profile Protocols Updated');
      setTimeout(() => setIsEditOpen(false), 800);
    } catch (e) {
      console.error(e);
      addToast('Sync Failed: Retrying in background');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(newSettings);
    if (user) {
      localStorage.setItem(`settings_${user.uid}`, JSON.stringify(newSettings));
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/auth');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <PageTransition>
      {/* Toast System */}
      <div className="fixed top-8 right-6 z-[200] flex flex-col items-end space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="bg-white/80 backdrop-blur-xl border border-emerald-500/20 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle2 size={16} strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{toast.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="px-6 pt-12 space-y-10 pb-44">
        <div className="flex flex-col items-center space-y-4">
           <div className="relative">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="w-36 h-36 rounded-[48px] saffron-gradient p-1.5 shadow-2xl relative"
              >
                <div className="w-full h-full rounded-[44px] bg-white flex items-center justify-center overflow-hidden border-4 border-white relative z-10">
                   {user?.photoURL ? (
                     <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-cream flex items-center justify-center text-saffron/20">
                        <User size={80} />
                     </div>
                   )}
                </div>
                <div className="absolute inset-0 bg-saffron rounded-[48px] blur-2xl opacity-10 animate-pulse" />
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 w-12 h-12 saffron-gradient rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-xl z-20"
                onClick={() => setIsEditOpen(true)}
              >
                 <Settings size={22} />
              </motion.button>
           </div>
           
           <div className="text-center space-y-1">
             <h2 className="text-3xl font-black text-gray-900 tracking-tight">{profile?.displayName || user?.displayName || 'Rakshini User'}</h2>
             <div className="flex flex-col items-center">
                <p className="text-saffron font-black text-[10px] uppercase tracking-[0.3em]">{profile?.role || 'Guardian Member'}</p>
                <div className="flex items-center justify-center space-x-2 mt-1">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{profile?.statusLabel || 'Secured Account • Active'}</p>
                </div>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'AI Alias', value: profile?.aiAlias || 'N/A' },
             { label: 'Guardian', value: profile?.guardianLevel || 'Base Node' },
             { label: 'Protocol', value: profile?.protocolTier || 'Standard' },
             { label: 'Safety', value: `${profile?.safetyScore || 100}%` }
           ].map((stat, i) => (
             <div key={i} className="bg-white/50 border border-gray-100 rounded-3xl p-4 text-center">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <p className="text-sm font-black text-gray-900">{stat.value}</p>
             </div>
           ))}
        </div>

        <div className="space-y-8">
           <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Account & Safety</p>
                <div className="h-[1px] flex-1 bg-gray-100 ml-4 opacity-50" />
              </div>
              <div className="space-y-3">
                <ProfileItem icon={User} label="Edit Profile" value="Bio, Medical info & Name" onClick={() => setIsEditOpen(true)} />
                <ProfileItem icon={Phone} label="Emergency Contacts" value="Manage fallback SMS relay" onClick={() => navigate('/guardians')} />
                <ProfileItem icon={Heart} label="Guardian Network" value="Direct Circle Protection" onClick={() => navigate('/guardians')} color="text-rose-500" bgColor="bg-rose-50" />
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Operational Config</p>
                <div className="h-[1px] flex-1 bg-gray-100 ml-4 opacity-50" />
              </div>
              <div className="space-y-3">
                <ProfileItem icon={Bell} label="Notifications" value="Toggle AI risk & safety alerts" onClick={() => setIsNotifOpen(true)} color="text-amber-500" bgColor="bg-amber-50" />
                <ProfileItem icon={Shield} label="Privacy & Security" value="Stealth mode & Vault settings" onClick={() => setIsPrivacyOpen(true)} color="text-blue-500" bgColor="bg-blue-50" />
                <ProfileItem icon={Info} label="About Rakshini" value="Mission v1.0 & Vision" onClick={() => navigate('/about')} color="text-emerald-500" bgColor="bg-emerald-50" />
              </div>
           </div>

           <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full h-16 bg-white border border-rose-100 rounded-[32px] flex items-center justify-center space-x-3 text-rose-500 font-black shadow-[0_10px_30px_rgba(244,63,94,0.05)]"
           >
              <LogOut size={22} strokeWidth={3} />
              <span className="uppercase tracking-widest text-xs">Terminate Session</span>
           </motion.button>
        </div>

        <div className="text-center pt-8 space-y-4 opacity-60">
           <div className="flex justify-center space-x-6">
              <a href="https://manikumarkundena.vercel.app/" target="_blank" className="text-gray-400 hover:text-saffron transition-colors"><ExternalLink size={18} /></a>
           </div>
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] leading-relaxed">
             End-to-End Encrypted Ecosystem<br/>
             Rakshini Security Protocols Active
           </p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsEditOpen(false)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[9998]" 
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: '100%', opacity: 0 }} 
              transition={{ type: 'spring', damping: 30, stiffness: 300 }} 
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white/95 backdrop-blur-3xl z-[9999] shadow-[-20px_0_100px_rgba(0,0,0,0.3)] border-l border-white/20 p-8 overflow-y-auto custom-scrollbar"
            >
               <div className="flex justify-between items-center mb-10 sticky top-0 bg-white/50 backdrop-blur-md pt-2 pb-6 z-20">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Identity</h3>
                    <p className="text-saffron text-[10px] font-black uppercase tracking-[0.2em] mt-1">Intelligence Module Core</p>
                  </div>
                  <motion.button 
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => setIsEditOpen(false)} 
                    className="w-12 h-12 bg-gray-50/50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
               </div>

               <div className="space-y-8 pb-32">
                  <div className="flex flex-col items-center space-y-4 mb-10">
                     <div className="relative group">
                        <motion.div 
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-28 h-28 rounded-[36px] saffron-gradient p-1 shadow-2xl"
                        >
                          <div className="w-full h-full rounded-[32px] bg-white flex items-center justify-center overflow-hidden border-4 border-white relative z-10 transition-transform group-hover:scale-[0.98]">
                             {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <User size={48} className="text-gray-200" />}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                                <Camera size={24} className="text-white" />
                             </div>
                          </div>
                        </motion.div>
                     </div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Biometric Photo Sync</p>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {[
                      { label: 'Legal Identification', value: 'displayName', icon: User, placeholder: 'Full Name' },
                      { label: 'Secure Phone Node', value: 'phoneNumber', icon: Phone, placeholder: '+91 XXXX XXXX' }
                    ].map((field) => (
                      <div key={field.value} className="relative group">
                         <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">{field.label}</label>
                         <div className="relative">
                           <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-saffron transition-colors">
                              <field.icon size={18} />
                           </div>
                           <input 
                             className="w-full h-16 bg-gray-50/50 rounded-2xl pl-14 pr-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white focus:shadow-[0_0_20px_rgba(255,153,51,0.05)] transition-all font-bold text-gray-800" 
                             value={formData[field.value as keyof typeof formData]} 
                             onChange={(e) => setFormData({...formData, [field.value]: e.target.value})} 
                             placeholder={field.placeholder} 
                           />
                         </div>
                      </div>
                    ))}

                    <div className="relative group">
                       <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Emergency Bio</label>
                       <textarea 
                         className="w-full h-36 bg-gray-50/50 rounded-[32px] p-8 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white focus:shadow-[0_0_20px_rgba(255,153,51,0.05)] transition-all font-bold text-gray-800 resize-none leading-relaxed" 
                         value={formData.bio} 
                         onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                         placeholder="Brief alert details for first responders..." 
                       />
                    </div>

                       <div className="relative group">
                          <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Guardian Role</label>
                          <input 
                            className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-bold text-gray-800" 
                            value={formData.role} 
                            onChange={(e) => setFormData({...formData, role: e.target.value})} 
                            placeholder="e.g. Founder & Architect" 
                          />
                       </div>

                       <div className="relative group">
                          <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">AI Alias</label>
                          <input 
                            className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-bold text-gray-800" 
                            value={formData.aiAlias} 
                            onChange={(e) => setFormData({...formData, aiAlias: e.target.value})} 
                            placeholder="e.g. Rakshini Admin" 
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-5">
                          <div className="relative group">
                             <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Guardian Level</label>
                             <input 
                               className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-bold text-gray-800" 
                               value={formData.guardianLevel} 
                               onChange={(e) => setFormData({...formData, guardianLevel: e.target.value})} 
                               placeholder="e.g. Primary Node" 
                             />
                          </div>
                          <div className="relative group">
                             <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Protocol Tier</label>
                             <input 
                               className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-bold text-gray-800" 
                               value={formData.protocolTier} 
                               onChange={(e) => setFormData({...formData, protocolTier: e.target.value})} 
                               placeholder="e.g. Shunya Core" 
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-5">
                       <div className="relative group">
                          <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Blood Group</label>
                          <select 
                            className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-black text-gray-800 appearance-none" 
                            value={formData.bloodGroup} 
                            onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                          >
                             <option value="">N/A</option>
                             {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                               <option key={bg} value={bg}>{bg}</option>
                             ))}
                          </select>
                       </div>
                       <div className="relative group">
                          <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Identity</label>
                          <select 
                            className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-black text-gray-800 appearance-none" 
                            value={formData.gender} 
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          >
                             <option value="">N/A</option>
                             <option value="Female">Female</option>
                             <option value="Male">Male</option>
                             <option value="Other">Other</option>
                          </select>
                       </div>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255, 153, 51, 0.3)' }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={handleUpdateProfile} 
                    disabled={isSaving} 
                    className={`w-full h-18 rounded-[32px] font-black text-lg flex items-center justify-center space-x-3 shadow-2xl transition-all saffron-gradient text-white relative overflow-hidden`}
                  >
                    <AnimatePresence mode="wait">
                      {isSaving ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center space-x-3">
                           <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                           <span className="uppercase tracking-[0.2em] text-xs font-black">Syncing Node...</span>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center space-x-3">
                          <Save size={22} strokeWidth={3} />
                          <span className="uppercase tracking-[0.2em] text-xs font-black">Commit Safety Profile</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotifOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsNotifOpen(false)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[9998]" 
            />
            <motion.div 
              initial={{ y: '100%', opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: '100%', opacity: 0 }} 
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-3xl rounded-t-[56px] z-[9999] p-10 pb-20 space-y-8 shadow-[0_-20px_100px_rgba(0,0,0,0.3)] border-t border-white/20"
            >
               <div className="flex justify-between items-center"><div><h3 className="text-2xl font-black tracking-tight">Safety Alerts</h3><p className="text-amber-500 text-[9px] font-black uppercase tracking-[0.3em]">Network Alert Configuration</p></div><motion.button onClick={() => setIsNotifOpen(false)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><X size={20} /></motion.button></div>
               <div className="space-y-4">
                  <SettingToggle label="SOS Master Alerts" desc="Instant high-volume alerts for emergency triggers." active={settings.sosAlerts} onToggle={() => toggleSetting('sosAlerts')} />
                  <SettingToggle label="AI Danger Proximity" desc="Alert when entering regions with high risk volatility." active={settings.riskAlerts} onToggle={() => toggleSetting('riskAlerts')} />
                  <SettingToggle label="Guardian Heartbeat" desc="Notifications regarding guardian status changes." active={settings.guardianAlerts} onToggle={() => toggleSetting('guardianAlerts')} />
               </div>
               <button onClick={() => setIsNotifOpen(false)} className="w-full py-5 saffron-gradient rounded-[24px] text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-saffron/20">Acknowledge & Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {isPrivacyOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsPrivacyOpen(false)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[9998]" 
            />
            <motion.div 
              initial={{ y: '100%', opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: '100%', opacity: 0 }} 
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-3xl rounded-t-[56px] z-[9999] p-10 pb-20 space-y-8 shadow-[0_-20px_100px_rgba(0,0,0,0.3)] border-t border-white/20"
            >
               <div className="flex justify-between items-center"><div><h3 className="text-2xl font-black tracking-tight">Neural Privacy</h3><p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em]">Encryption & Stealth Shield</p></div><motion.button onClick={() => setIsPrivacyOpen(false)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><X size={20} /></motion.button></div>
               <div className="space-y-4">
                  <SettingToggle label="Ghost Stealth Mode" desc="Hide your precise beacon from the general map grid." active={settings.stealthMode} onToggle={() => toggleSetting('stealthMode')} />
                  <SettingToggle label="Neural Vault Lock" desc="Automated secondary encryption for safety logs." active={settings.vaultLock} onToggle={() => toggleSetting('vaultLock')} />
                  <SettingToggle label="Biometric Continuity" desc="Force biometric verification for critical actions." active={settings.biometrics} onToggle={() => toggleSetting('biometrics')} />
               </div>
               <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl flex items-start space-x-3"><Lock size={18} className="text-blue-500 shrink-0 mt-1" /><p className="text-[10px] text-blue-800/60 font-bold leading-relaxed uppercase tracking-wider">Privacy protocols are managed via local biometric keychains. Rakshini never stores raw biometric data.</p></div>
               <button onClick={() => setIsPrivacyOpen(false)} className="w-full py-5 bg-gray-900 border border-white/10 rounded-[24px] text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl">Seal Configuration</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
