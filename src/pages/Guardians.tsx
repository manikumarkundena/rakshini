
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Phone, Plus, Trash2, ChevronLeft, Bell, BellOff, User, Save, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore, useSafetyStore } from '../store/useStore';
import PageTransition from '../components/PageTransition';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  notifiedOnSOS: boolean;
  status?: 'online' | 'offline';
  isPrimary?: boolean;
}

export default function Guardians() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const setNavHidden = useSafetyStore(state => state.setNavHidden);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setNavHidden(showAddForm);
    return () => setNavHidden(false);
  }, [showAddForm, setNavHidden]);

  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '', notifiedOnSOS: true, isPrimary: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<{id: string, msg: string}[]>([]);

  const addToast = (msg: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      const q = query(collection(db, 'contacts'), where('userId', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        status: Math.random() > 0.3 ? 'online' : 'offline' // Simulated heartbeat
      } as Contact));
      setContacts(data);
    } catch (error) {
      console.error("Fetch contacts failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newContact.name || !newContact.phone || !user) return;
    setIsSubmitting(true);
    try {
      // If setting as primary, unset others (simplified for demo)
      const contactData = {
        ...newContact,
        userId: user.uid,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'contacts'), contactData);
      setContacts([...contacts, { id: docRef.id, ...contactData, status: 'online' }]);
      addToast(`${newContact.name} Linked Successfully`);
      setShowAddForm(false);
      setNewContact({ name: '', phone: '', relation: '', notifiedOnSOS: true, isPrimary: false });
    } catch (error) {
      console.error("Add contact failed", error);
      addToast('Link Protocol Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contacts', id));
      setContacts(contacts.filter(c => c.id !== id));
      addToast('Guardian Removed');
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const toggleNotification = async (contact: Contact) => {
    try {
      const contactRef = doc(db, 'contacts', contact.id);
      await updateDoc(contactRef, { notifiedOnSOS: !contact.notifiedOnSOS });
      setContacts(contacts.map(c => c.id === contact.id ? { ...c, notifiedOnSOS: !c.notifiedOnSOS } : c));
      addToast(contact.notifiedOnSOS ? 'Alerts Deactivated' : 'Alerts Active');
    } catch (error) {
      console.error("Update failed", error);
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
              className="bg-white/80 backdrop-blur-xl border border-saffron/20 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-saffron rounded-full flex items-center justify-center text-white">
                <Shield size={16} strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{toast.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="min-h-screen bg-cream px-6 pt-14 pb-44">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-5">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)} 
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-xl shadow-black/5 border border-white"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Guardians</h2>
              <p className="text-saffron text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Security Circle Management</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="w-12 h-12 saffron-gradient rounded-2xl flex items-center justify-center text-white shadow-xl shadow-saffron/30"
          >
            <Plus size={24} />
          </motion.button>
        </div>

        <div className="bg-white rounded-[40px] p-6 mb-10 border border-white shadow-xl shadow-black/[0.02] flex items-center space-x-5">
           <div className="w-16 h-16 bg-cream rounded-[24px] flex items-center justify-center text-saffron relative">
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-saffron rounded-full blur-xl" 
              />
              <Shield size={32} strokeWidth={2.5} className="relative z-10" />
           </div>
           <div className="flex-1">
              <h4 className="text-gray-900 font-black text-sm tracking-tight">Active Pulse Monitoring</h4>
              <p className="text-gray-400 text-[10px] font-bold mt-1 leading-relaxed tracking-wider uppercase">Fallback SMS Relay Enabled</p>
           </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-saffron" size={40} />
          </div>
        ) : (
          <div className="space-y-5">
             <AnimatePresence>
               {contacts.map((contact, i) => (
                 <motion.div
                   key={contact.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                   className={`bg-white rounded-[36px] p-6 shadow-sm border border-gray-50 flex items-center space-x-5 relative overflow-hidden group hover:shadow-xl hover:shadow-black/[0.03] transition-all duration-500`}
                 >
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-[24px] ${contact.status === 'online' ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'} flex items-center justify-center transition-colors duration-500`}>
                         <User size={28} />
                      </div>
                      {contact.status === 'online' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1">
                       <div className="flex items-center space-x-2">
                          <h4 className="text-base font-black text-gray-900 tracking-tight">{contact.name}</h4>
                          {contact.isPrimary && (
                            <span className="bg-saffron/10 text-saffron text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Primary</span>
                          )}
                       </div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-70">
                         {contact.relation} • {contact.phone}
                       </p>
                    </div>

                    <div className="flex items-center space-x-2 relative z-10">
                       <motion.button 
                         whileTap={{ scale: 0.9 }}
                         onClick={() => toggleNotification(contact)}
                         className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${contact.notifiedOnSOS ? 'bg-orange-50 text-saffron' : 'bg-gray-50 text-gray-300'}`}
                       >
                          {contact.notifiedOnSOS ? <Bell size={20} strokeWidth={2.5} /> : <BellOff size={20} />}
                       </motion.button>
                       <motion.button 
                         whileTap={{ scale: 0.9 }}
                         onClick={() => handleDelete(contact.id)}
                         className="w-12 h-12 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <Trash2 size={20} />
                       </motion.button>
                    </div>
                 </motion.div>
               ))}
              </AnimatePresence>

             {contacts.length === 0 && !showAddForm && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-center py-20 px-10 space-y-6 bg-white/50 rounded-[48px] border border-dashed border-gray-200"
               >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto">
                     <Shield size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Safety Network Empty</h3>
                    <p className="text-gray-400 text-xs font-medium leading-relaxed">Synchronize Rakshini with your trusted circle to enable fallback security protocols.</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(true)}
                    className="h-14 px-8 saffron-gradient rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-saffron/30"
                  >
                    + Establish Link
                  </motion.button>
               </motion.div>
             )}
          </div>
        )}

        <AnimatePresence>
          {showAddForm && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowAddForm(false)} 
                className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[9998]" 
              />
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-3xl rounded-t-[56px] z-[9999] p-10 pb-20 space-y-8 shadow-[0_-20px_100px_rgba(0,0,0,0.3)] border-t border-white/20 overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-48 h-48 saffron-gradient rounded-full opacity-10 -mr-24 -mt-24 blur-3xl pointer-events-none" />
                 
                 <div className="flex justify-between items-center relative z-10">
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">Add Guardian</h3>
                      <p className="text-saffron text-[10px] font-black uppercase tracking-[0.3em] mt-1">Establishing fallback relay</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }} 
                      onClick={() => setShowAddForm(false)} 
                      className="w-12 h-12 bg-gray-50/50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
                    >
                      <X size={24} />
                    </motion.button>
                 </div>

                 <div className="space-y-6 relative z-10">
                    <div className="relative group">
                       <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Identification</label>
                       <input 
                         className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-bold text-gray-800" 
                         placeholder="Guardian Name" 
                         value={newContact.name} 
                         onChange={(e) => setNewContact({...newContact, name: e.target.value})} 
                       />
                    </div>
                    <div className="relative group">
                       <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Phone Node</label>
                       <input 
                         className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-bold text-gray-800" 
                         placeholder="+91 XXXXX XXXXX" 
                         value={newContact.phone} 
                         onChange={(e) => setNewContact({...newContact, phone: e.target.value})} 
                       />
                    </div>
                    <div className="relative group">
                       <label className="absolute -top-2.5 left-4 px-2 bg-white text-[9px] font-black text-saffron uppercase tracking-widest z-10">Relationship Sync</label>
                       <input 
                         className="w-full h-16 bg-gray-50/50 rounded-2xl px-6 outline-none border-2 border-transparent focus:border-saffron/20 focus:bg-white transition-all font-bold text-gray-800" 
                         placeholder="Sister, Father, Friend..." 
                         value={newContact.relation} 
                         onChange={(e) => setNewContact({...newContact, relation: e.target.value})} 
                       />
                    </div>
                    
                    <motion.button
                       whileTap={{ scale: 0.98 }}
                       onClick={() => setNewContact({...newContact, isPrimary: !newContact.isPrimary})}
                       className={`flex items-center justify-between p-5 rounded-[32px] border-2 transition-all w-full ${newContact.isPrimary ? 'border-saffron/20 bg-saffron/[0.03]' : 'border-gray-50 bg-gray-50/50'}`}
                    >
                       <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${newContact.isPrimary ? 'bg-saffron text-white' : 'bg-gray-100 text-gray-400'}`}>
                             <Shield size={20} />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest block">Primary Responder</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Priority notification trigger</span>
                          </div>
                       </div>
                       <div className={`w-12 h-6 rounded-full relative transition-colors ${newContact.isPrimary ? 'bg-saffron' : 'bg-gray-200'}`}>
                          <motion.div animate={{ x: newContact.isPrimary ? 26 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </motion.button>
                 </div>

                 <motion.button
                   whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(255, 153, 51, 0.3)' }}
                   whileTap={{ scale: 0.98 }}
                   onClick={handleAdd}
                   disabled={isSubmitting || !newContact.name || !newContact.phone}
                   className={`w-full h-18 rounded-[32px] font-black text-lg flex items-center justify-center space-x-3 shadow-2xl transition-all relative overflow-hidden ${
                     newContact.name && newContact.phone && !isSubmitting
                       ? 'saffron-gradient text-white shadow-saffron/30' 
                       : 'bg-gray-100 text-gray-400 shadow-none grayscale cursor-not-allowed'
                   }`}
                 >
                   <AnimatePresence mode="wait">
                     {isSubmitting ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center space-x-3">
                           <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                           <span className="uppercase tracking-[0.2em] text-xs">Syncing Node...</span>
                        </motion.div>
                     ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center space-x-3">
                          <Plus size={24} strokeWidth={3} />
                          <span className="uppercase tracking-[0.2em] text-xs">Activate Link</span>
                        </motion.div>
                     )}
                   </AnimatePresence>
                 </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
