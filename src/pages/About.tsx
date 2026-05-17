import { motion } from 'framer-motion';
import { ChevronLeft, Github, Linkedin, Globe, Shield, Zap, Sparkles, Cpu, Watch, Drone, Network, Map, Users, Mic, User, Terminal, Lock, Activity, Eye, Compass, Brain, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

const IntelligenceCard = ({ icon: Icon, title, desc, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="relative group cursor-pointer"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-saffron/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="relative bg-neutral-900/40 backdrop-blur-3xl rounded-[40px] p-8 border border-white/5 shadow-2xl overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-saffron/10 transition-colors" />
      
      <div className="flex items-start space-x-6">
        <div className="w-16 h-16 rounded-3xl bg-neutral-800/50 flex items-center justify-center text-saffron relative overflow-hidden group-hover:shadow-[0_0_30px_rgba(255,153,51,0.3)] transition-all duration-500">
           <Icon size={30} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 bg-gradient-to-tr from-saffron/10 to-transparent opacity-0 group-hover:opacity-100" 
           />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-black text-white tracking-tight group-hover:text-saffron transition-colors">{title}</h4>
          <p className="text-xs text-gray-400 font-medium leading-relaxed mt-2 opacity-80 group-hover:opacity-100 transition-opacity">{desc}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const GlowBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-saffron/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.03)_0%,transparent_70%)]" />
  </div>
);

export default function About() {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, title: "Neural Safety Core", desc: "Autonomous AI engine processing real-time environmental risk factors." },
    { icon: Map, title: "AI Threat Mapping", desc: "Predictive spatial intelligence visualizing potential danger zones." },
    { icon: Radio, title: "Guardian Mesh Network", desc: "Decentralized P2P relay protocols ensuring connectivity in blackouts." },
    { icon: Lock, title: "Silent Emergency Relay", desc: "Instantaneous encrypted signaling to trusted nodes via secure backchannels." },
    { icon: Activity, title: "Vault Intelligence Layer", desc: "Zero-knowledge proof architecture for biometrically secured metadata." },
    { icon: Compass, title: "Predictive Risk Engine", desc: "Advanced machine learning algorithms anticipating threats before they escalate." }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-saffron/30 selection:text-saffron relative px-6 pt-14 pb-44 space-y-16 overflow-x-hidden">
        <GlowBackground />

        {/* Navigation */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <motion.button 
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)} 
              className="w-14 h-14 bg-neutral-900/80 backdrop-blur-2xl shadow-2xl rounded-2xl flex items-center justify-center text-gray-400 border border-white/5 hover:text-white transition-colors"
            >
               <ChevronLeft size={28} />
            </motion.button>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Ecosystem</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-ping" />
                <p className="text-saffron text-[10px] font-black uppercase tracking-[0.3em]">Neural Protocol v1.0.4</p>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex space-x-2">
             <div className="px-4 py-2 bg-neutral-900/50 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">System Ready</div>
             <div className="px-4 py-2 bg-saffron/10 rounded-full border border-saffron/20 text-[9px] font-black uppercase tracking-[0.2em] text-saffron">Node Active</div>
          </div>
        </div>

        {/* Cinematic Vision Section */}
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
              Beyond Safety.<br/>
              Beyond Reaction.<br/>
              <span className="text-saffron animate-pulse">Intelligence.</span>
            </h3>
            
            <p className="text-xl text-neutral-400 font-medium leading-relaxed max-w-2xl">
              Rakshini is the world's first <span className="text-white italic">decentralized security protocol</span>. We are engineering the architecture that makes fear obsolete through predictive spatial intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
             {features.map((f, i) => (
               <IntelligenceCard key={i} {...f} delay={i * 0.1} />
             ))}
          </div>
        </div>

        {/* Future Vision - Sentinel Grid */}
        <div className="relative z-10 py-10">
          <div className="bg-neutral-900/30 backdrop-blur-3xl rounded-[64px] p-12 border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-saffron/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start md:justify-between space-y-10 md:space-y-0">
               <div className="max-w-md space-y-6">
                  <div className="w-20 h-20 bg-saffron rounded-[32px] flex items-center justify-center text-white shadow-[0_0_50px_rgba(255,153,51,0.4)]">
                     <Eye size={40} />
                  </div>
                  <h4 className="text-4xl font-black tracking-tight leading-tight">The Sentinel Grid<br/><span className="text-gray-500">Omnipresent Protection.</span></h4>
                  <p className="text-neutral-400 font-medium text-lg leading-relaxed">
                    A global mesh of autonomous nodes collaborating to map, analyze, and neutralize urban threats in real-time.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                     {["P2P Encryption", "Zero Latency", "Offline Mesh", "AI Vision"].map(t => (
                       <span key={t} className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white">{t}</span>
                     ))}
                  </div>
               </div>
               
               <div className="flex-1 max-w-sm w-full">
                  <div className="aspect-square relative flex items-center justify-center">
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-dashed border-saffron/20 rounded-full" 
                     />
                     <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-8 border border-white/10 rounded-full" 
                     />
                     <div className="relative z-10 w-32 h-32 bg-white/5 backdrop-blur-3xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
                        <Drone size={48} className="text-saffron animate-float" />
                     </div>
                     <div className="absolute top-0 right-0 w-4 h-4 bg-saffron rounded-full animate-ping" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Founder Section - The Architect */}
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-10">
             <div className="h-[2px] w-12 bg-saffron" />
             <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-saffron">The Architecht</h5>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-saffron/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
            <div className="bg-neutral-900 rounded-[56px] p-12 border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
               
               <div className="relative z-10 flex flex-col md:flex-row items-center space-y-10 md:space-y-0 md:space-x-12">
                  <div className="relative">
                    <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                       className="w-44 h-44 rounded-full border-4 border-dashed border-saffron/30" 
                    />
                    <div className="absolute inset-2 rounded-full p-2 bg-gradient-to-br from-saffron to-orange-600 shadow-[0_0_40px_rgba(255,153,51,0.4)]">
                       <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden grayscale contrast-125">
                          <User size={80} className="text-white opacity-20" />
                       </div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-neutral-900 flex items-center justify-center">
                       <Shield size={16} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6 text-center md:text-left">
                     <div>
                        <h4 className="text-5xl font-black tracking-tight">Manikumar K</h4>
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mt-2">
                           <p className="text-saffron text-xs font-black uppercase tracking-[0.3em]">Founder & Systems AI Architect</p>
                           <span className="hidden md:block w-1.5 h-1.5 bg-neutral-700 rounded-full" />
                           <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.3em]">Visionnaire</p>
                        </div>
                     </div>
                     
                     <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/5 relative">
                        <div className="absolute -top-4 -left-4 text-7xl text-saffron/10 font-serif">"</div>
                        <p className="text-xl text-neutral-300 italic font-medium leading-relaxed relative z-10">
                          "Building intelligent protection infrastructure for the next generation. Safety isn't a premium feature—it should be a systemic constant that makes fear obsolete."
                        </p>
                        <div className="absolute -bottom-10 -right-4 text-7xl text-saffron/10 font-serif rotate-180">"</div>
                     </div>
                     
                     <div className="flex items-center justify-center md:justify-start space-x-6 pt-4">
                        {[
                          { icon: Globe, link: "https://manikumarkundena.vercel.app/" },
                          { icon: Github, link: "https://github.com/manikumarkundena" },
                          { icon: Linkedin, link: "https://linkedin.com/in/manikumarkundena" }
                        ].map((social, i) => (
                          <motion.a 
                            key={i}
                            whileHover={{ y: -8, scale: 1.1 }}
                            href={social.link} 
                            target="_blank" 
                            className="w-16 h-16 bg-neutral-800/50 backdrop-blur-xl rounded-2xl flex items-center justify-center text-gray-400 hover:text-saffron border border-white/5 transition-all shadow-xl"
                          >
                            <social.icon size={28} />
                          </motion.a>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center space-y-4 pb-20">
           <div className="flex items-center justify-center space-x-2">
             <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-neutral-800" />
             <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.8em]">Built for Humanity</p>
             <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-neutral-800" />
           </div>
           <p className="text-neutral-500 text-[8px] font-black uppercase tracking-widest opacity-50">Deployed 2026 • AI Ecosystem v1.4.2</p>
        </div>
      </div>
    </PageTransition>
  );
}
