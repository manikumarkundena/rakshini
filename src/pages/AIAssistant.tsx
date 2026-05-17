
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, ChevronLeft, Sparkles, Loader2, Shield, Info, Mic, MicOff, Volume2, Search, Map as MapIcon, RotateCcw, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/useStore';
import DemoHint from '../components/DemoHint';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  isTyping?: boolean;
}

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

const PulseCircle = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <motion.div
      animate={{ scale: [1, 2], opacity: [0.3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      className="absolute w-full h-full rounded-full border-4 border-saffron/20"
    />
  </div>
);

const VoiceWaveform = () => (
  <div className="flex items-center space-x-1 h-6">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          height: [8, 24, 12, 20, 8],
          opacity: [0.5, 1, 0.7, 1, 0.5]
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity, 
          delay: i * 0.1,
          ease: "easeInOut"
        }}
        className="w-1 bg-saffron rounded-full"
      />
    ))}
  </div>
);

export default function AIAssistant() {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const userName = profile?.aiAlias || (profile?.displayName || user?.displayName || 'Guardian').split(' ')[0];
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      parts: [{ text: `Awaiting command, ${userName}. System diagnostics report high efficiency. Neural Safety Mesh is at 100% parity. How shall we secure your path today?` }] 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceUI, setShowVoiceUI] = useState(false);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', parts: [{ text: textToSend }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Get location for grounding
      let latLng = undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej)
          );
          latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) { console.error("Location denied"); }
      }

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: textToSend, 
          history: messages.map(m => ({ role: m.role, parts: m.parts })),
          latLng
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503 && data.error === 'MISSING_GEMINI_API_KEY') {
          const fallbackMsg: Message = {
            role: 'model',
            parts: [{ text: 'AI chat is unavailable until GEMINI_API_KEY is configured. The assistant shell is still active, but live responses cannot be generated yet.' }],
            isTyping: true
          };
          setMessages(prev => [...prev, fallbackMsg]);
          return;
        }
        if (response.status === 429 && data.text) {
          const fallbackMsg: Message = { 
            role: 'model', 
            parts: [{ text: data.text }],
            isTyping: true 
          };
          setMessages(prev => [...prev, fallbackMsg]);
          return;
        }
        throw new Error(data.error || "API Error");
      }
      
      const aiMsg: Message = { 
        role: 'model', 
        parts: [{ text: data.text }],
        isTyping: true 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI failed", error);
      const errorMsg: Message = { 
        role: 'model', 
        parts: [{ text: "The Neural Safety Grid is experiencing temporary turbulence, but my core guardian protocols remain active. Please try again or use the SOS trigger if you are in immediate danger." }],
        isTyping: true 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!isListening) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => {
          setIsListening(true);
          setShowVoiceUI(true);
        };
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };
        recognition.onend = () => {
          setIsListening(false);
          setTimeout(() => setShowVoiceUI(false), 1500);
        };
        recognition.start();
      } else {
        setIsListening(true);
        setShowVoiceUI(true);
        setTimeout(() => {
          setIsListening(false);
          setTimeout(() => setShowVoiceUI(false), 1000);
        }, 3000);
      }
    } else {
      setIsListening(false);
      setShowVoiceUI(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const examplePrompts = [
    "I feel unsafe right now",
    "Find safest route home",
    "Nearby police stations",
    "Neural threat report"
  ];

  return (
    <PageTransition>
      <div className="flex flex-col h-screen bg-[#f6f0e4] overflow-hidden selection:bg-saffron/30 selection:text-saffron relative">
        {/* Animated Backdrop Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-saffron/5 via-transparent to-transparent opacity-60" />
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-saffron/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]" />
        </div>

        {/* Premium Control Header */}
        <div className="pt-14 px-6 pb-6 bg-white/40 backdrop-blur-3xl border-b border-black/5 z-30 sticky top-0">
          <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/dashboard')} 
                className="w-10 h-10 md:w-12 md:h-12 bg-white/80 shadow-sm rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 border border-white hover:text-saffron transition-colors"
                title="Return to Dashboard"
              >
                <ChevronLeft size={24} className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-[#0a0a0a] rounded-[20px] md:rounded-[22px] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                    <motion.div 
                      animate={{ 
                        top: ['-100%', '100%'],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-saffron to-transparent z-10"
                    />
                    <Sparkles size={24} className="text-saffron relative z-20 animate-pulse md:hidden" />
                    <Sparkles size={28} className="text-saffron relative z-20 animate-pulse hidden md:block" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-emerald-500 border-[3px] md:border-4 border-white rounded-full shadow-lg overflow-hidden flex items-center justify-center"
                  >
                     <div className="w-full h-full bg-emerald-400 animate-pulse" />
                  </motion.div>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight leading-none">Rakshini Engine</h2>
                  <div className="flex items-center space-x-2 mt-1 md:mt-1.5">
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-saffron rounded-full animate-ping" />
                    <p className="text-[8px] md:text-[9px] font-black text-saffron uppercase tracking-[0.3em] md:tracking-[0.4em] opacity-80">Guardian Protocol v4.0</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 md:space-x-8">
               <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Neural Link</span>
                  <span className="text-[10px] md:text-xs font-black text-emerald-600 tracking-tighter">STABLE</span>
               </div>
               <motion.button 
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMessages(prev => [prev[0]])}
                className="w-10 h-10 md:w-12 md:h-12 bg-white/80 shadow-sm rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 border border-white hover:text-saffron transition-all"
                title="Reset Chat"
              >
                 <RotateCcw size={18} className="md:w-5 md:h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Intelligence Metrics Bar */}
        <div className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pb-2">
            {[
              { label: 'Neural Sync', value: 'OPTIMAL', color: 'text-emerald-500', icon: Shield },
              { label: 'Risk Index', value: 'MINIMAL', color: 'text-saffron', icon: Info },
              { label: 'Active Aura', value: 'SECURE', color: 'text-blue-500', icon: Sparkles },
              { label: 'Protocol', value: 'v4.0.2', color: 'text-gray-900', icon: MapIcon }
            ].map((w, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className="bg-white/60 backdrop-blur-xl border border-white rounded-[22px] p-3 md:p-4 flex items-center space-x-3 shadow-sm"
              >
                  <div className={`p-2 md:p-2.5 rounded-xl bg-white shadow-sm ${w.color}`}>
                    <w.icon size={14} className="md:w-4 md:h-4" />
                  </div>
                  <div>
                    <p className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{w.label}</p>
                    <p className={`text-xs md:text-[13px] font-black tracking-tighter ${w.color}`}>{w.value}</p>
                  </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Content Arena */}
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-[160px] md:pb-[180px] space-y-6 md:space-y-10 no-scrollbar relative z-10 max-w-5xl mx-auto w-full scroll-smooth">
           <AnimatePresence mode="popLayout">
             {messages.map((msg, i) => (
               <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                  <div className={`flex flex-col space-y-2 max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                     <div className={`relative px-5 py-4 md:px-7 md:py-6 text-[15px] md:text-[16px] font-medium leading-relaxed shadow-lg transition-all duration-500 ${
                        msg.role === 'user' 
                          ? 'bg-[#0a0a0a] text-white rounded-[24px] md:rounded-[32px] rounded-tr-none' 
                          : 'bg-white/90 text-gray-900 rounded-[24px] md:rounded-[32px] rounded-tl-none border border-white backdrop-blur-2xl'
                     }`}>
                        {msg.role === 'model' && i === messages.length - 1 && msg.isTyping ? (
                          <TypewriterText text={msg.parts[0].text} />
                        ) : (
                          msg.parts[0].text
                        )}
                        <div className={`absolute inset-0 rounded-[24px] md:rounded-[32px] opacity-10 blur-xl -z-10 ${msg.role === 'user' ? 'bg-[#0a0a0a]' : 'bg-saffron'}`} />
                     </div>
                     <div className={`flex items-center space-x-2 px-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${msg.role === 'user' ? 'bg-[#0a0a0a]' : 'bg-saffron'}`} />
                        <span>{msg.role === 'user' ? 'Authenticated' : 'Rakshini AI'}</span>
                     </div>
                     
                     {msg.role === 'model' && i === 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-4 md:mt-6 w-full max-w-lg">
                           {examplePrompts.map((tag) => (
                             <motion.button 
                                key={tag}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSend(tag)}
                                className="group text-[10px] md:text-[11px] bg-white/60 hover:bg-saffron hover:text-white text-gray-600 px-5 py-3 md:py-4 rounded-2xl border border-white shadow-sm transition-all text-left font-bold tracking-tight flex items-center justify-between"
                             >
                               <span className="flex-1 mr-2">{tag}</span>
                               <Send size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                             </motion.button>
                           ))}
                        </div>
                     )}
                  </div>
               </motion.div>
             ))}
             {loading && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex justify-start"
               >
                 <div className="bg-white/80 backdrop-blur-3xl rounded-[24px] md:rounded-[32px] rounded-tl-none py-4 md:py-6 px-6 md:px-8 shadow-sm border border-white flex items-center space-x-4 md:space-x-6">
                   <VoiceWaveform />
                   <div className="flex flex-col">
                      <span className="text-[10px] md:text-[11px] text-saffron font-black uppercase tracking-[0.3em] md:tracking-[0.4em] animate-pulse">Neural Matrix Scan</span>
                      <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5 md:mt-1">Analyzing Spatial Vulnerabilities...</span>
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
           <div ref={messagesEndRef} className="h-4 md:h-10" />
        </div>

        {/* Elegant Floating Command Dock */}
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 md:pb-10 pt-4 bg-gradient-to-t from-[#f6f0e4] via-[#f6f0e4]/95 to-transparent z-40">
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative flex items-center space-x-3 md:space-x-4">
              <div className="relative flex-1 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-saffron to-orange-400 rounded-[26px] md:rounded-[34px] blur opacity-10 group-focus-within:opacity-25 transition-opacity" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Communicate with Core..."
                  className="relative w-full h-[60px] md:h-[72px] bg-white/95 backdrop-blur-3xl rounded-[24px] md:rounded-[32px] px-6 md:px-8 pr-14 md:pr-16 outline-none shadow-xl shadow-black/5 font-bold text-gray-900 placeholder:text-gray-300 transition-all border border-white focus:border-saffron/30 text-sm md:text-base selection:bg-saffron/30"
                />
                
                <AnimatePresence>
                  {isListening && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex items-center space-x-3 bg-white px-5 py-2.5 rounded-full shadow-xl z-10 border border-saffron/20"
                    >
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Aura Input ACTIVE</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className={`absolute right-2 md:right-2.5 top-2 md:top-2.5 w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-[20px] md:rounded-[24px] flex items-center justify-center transition-all ${
                     input.trim() ? 'bg-saffron text-white shadow-lg shadow-saffron/30' : 'bg-gray-50 text-gray-200 border border-black/5'
                  }`}
                >
                   {loading ? <Loader2 size={20} className="animate-spin md:w-6 md:h-6" /> : <Send size={20} className="md:w-6 md:h-6" />}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVoice}
                className={`w-[64px] h-[64px] md:w-[76px] md:h-[76px] rounded-[26px] md:rounded-[32px] flex items-center justify-center transition-all border-2 relative overflow-hidden ${
                  isListening 
                    ? 'bg-red-500 text-white border-red-500 shadow-xl shadow-red-500/20' 
                    : 'bg-white text-saffron border-white shadow-xl hover:shadow-saffron/10'
                }`}
              >
                {isListening ? <MicOff size={24} className="relative z-10 md:w-7 md:h-7" /> : <Mic size={24} className="relative z-10 md:w-7 md:h-7" />}
                {isListening && <PulseCircle />}
              </motion.button>
            </div>

            <div className="flex justify-center items-center space-x-8 md:space-x-12 mt-6 md:mt-8 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-saffron rounded-full animate-pulse" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-500">Neural Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-500">Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Voice Perception Notification */}
        <AnimatePresence>
          {showVoiceUI && (
            <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 50, opacity: 0 }}
               className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] max-w-sm"
            >
               <div className="bg-white/95 backdrop-blur-3xl px-8 py-6 rounded-[40px] md:rounded-[48px] shadow-2xl border border-saffron/10 flex flex-col items-center space-y-4 md:space-y-5">
                  <div className="relative">
                     <VoiceWaveform />
                     <motion.div 
                        animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 border-2 border-saffron rounded-full -m-4 md:-m-6"
                     />
                  </div>
                  <div className="text-center">
                     <span className="text-[9px] md:text-[11px] font-black text-gray-900 uppercase tracking-[0.4em] md:tracking-[0.5em] block mb-1">Aura Sensing</span>
                     <span className="text-[8px] md:text-[9px] text-saffron font-black uppercase tracking-[0.2em]">Analyzing acoustic environment...</span>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        <DemoHint id="ai_grounding" message="Grounding active for your location" position="bottom" delay={2000} icon={Brain} />
      </div>
    </PageTransition>
  );
}


