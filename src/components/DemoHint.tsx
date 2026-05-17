
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Sparkles } from 'lucide-react';

interface DemoHintProps {
  id: string;
  message: string;
  position?: 'top' | 'bottom' | 'middle';
  delay?: number;
  icon?: React.ElementType;
}

export default function DemoHint({ id, message, position = 'bottom', delay = 1000, icon: Icon = Sparkles }: DemoHintProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Check if dismissed in this session
  const storageKey = `rakshini_hint_${id}`;
  const isDismissed = sessionStorage.getItem(storageKey);

  if (isDismissed || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(storageKey, 'true');
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return 'top-24 left-1/2 -translate-x-1/2';
      case 'bottom': return 'bottom-32 left-1/2 -translate-x-1/2';
      case 'middle': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default: return 'bottom-32 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay, duration: 0.5, type: 'spring', damping: 20 }}
        className={`fixed z-[60] px-6 py-3 ${getPositionClasses()} pointer-events-auto`}
      >
        <div className="bg-black/80 backdrop-blur-xl border border-saffron/30 rounded-2xl shadow-[0_20px_50px_rgba(255,153,51,0.15)] flex items-center space-x-3 whitespace-nowrap group">
          <div className="flex items-center space-x-2.5">
            <Icon size={14} className="text-saffron group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black text-gray-100 uppercase tracking-widest">{message}</span>
          </div>
          <button 
            onClick={handleDismiss}
            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
