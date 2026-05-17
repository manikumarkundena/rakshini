
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/useStore';

const MandalaSVG = () => (
  <svg viewBox="0 0 200 200" className="w-[800px] h-[800px] text-white/5 opacity-20">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow)">
      {[...Array(12)].map((_, i) => (
        <circle
          key={i}
          cx="100"
          cy="100"
          r={20 + i * 12}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray={i % 2 === 0 ? "4 4" : "2 8"}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <line
          key={`line-${i}`}
          x1="100"
          y1="100"
          x2={100 + Math.cos((i * Math.PI) / 4) * 150}
          y2={100 + Math.sin((i * Math.PI) / 4) * 150}
          stroke="currentColor"
          strokeWidth="0.2"
        />
      ))}
    </g>
  </svg>
);

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [navigate, user, loading]);

  return (
    <PageTransition>
      <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#1a0f05]">
        {/* Premium Saffron Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF9933]/30 via-[#1a0f05] to-black" />
        
        {/* Rotating Mandala Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute pointer-events-none select-none"
        >
          <MandalaSVG />
        </motion.div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-saffron/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Glowing Icon Wrapper */}
            <div className="relative mb-12">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-saffron blur-[30px] rounded-full" 
              />
              <div className="relative w-28 h-28 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(255,153,51,0.2)]">
                <svg viewBox="0 0 24 24" className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>

            {/* Glowing Typography */}
            <div className="text-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="text-6xl font-black tracking-[-0.04em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              >
                Rakshini
              </motion.h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100px' }}
                transition={{ delay: 1.2, duration: 1.5, ease: "circOut" }}
                className="h-1 bg-gradient-to-r from-transparent via-saffron to-transparent mx-auto mt-4"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="mt-6 text-sm font-medium tracking-[0.3em] uppercase text-white/80"
              >
                Protection Beyond Panic
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Startup-Grade Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-20 flex flex-col items-center w-full max-w-[200px]"
        >
          <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden mb-3">
             <motion.div
               className="h-full bg-saffron shadow-[0_0_10px_#FF9933]"
               initial={{ x: '-100%' }}
               animate={{ x: '100%' }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
             />
          </div>
          <motion.span 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]"
          >
            Initializing Safeguards
          </motion.span>
        </motion.div>

        {/* Lens Flare Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(40%_40%_at_20%_20%,_rgba(255,153,51,0.05)_0%,_transparent_100%)]" />
      </div>
    </PageTransition>
  );
}
