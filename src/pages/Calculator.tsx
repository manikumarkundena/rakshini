import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ChevronLeft, AlertCircle, CheckCircle2, Sparkles, X, Terminal, Navigation } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import DemoHint from '../components/DemoHint';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  
  const [pin, setPin] = useState(localStorage.getItem('rakshini_stealth_pin') || '');
  const [isSetupMode, setIsSetupMode] = useState(!localStorage.getItem('rakshini_stealth_pin'));
  const [setupStep, setSetupStep] = useState(1); // 1: Enter PIN, 2: Confirm PIN
  const [tempPin, setTempPin] = useState('');
  const [error, setError] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [decoyCode, setDecoyCode] = useState(localStorage.getItem('rakshini_decoy_pin') || '0000');
  const [showDemoHint, setShowDemoHint] = useState(false);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!pin && !isSetupMode) {
      setIsSetupMode(true);
    }
  }, [pin, isSetupMode]);

  useEffect(() => {
    const timer = setTimeout(() => setShowDemoHint(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setHistory('');
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      const displayValue = String(Number(result.toFixed(8)));
      setDisplay(displayValue);
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
    setHistory(`${inputValue} ${nextOperator}`);
  };

  const calculate = (first: number, second: number, op: string) => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second !== 0 ? first / second : 0;
      case '%': return (first * second) / 100;
      default: return second;
    }
  };

  const handleEqual = () => {
    // SECURITY CHECK: Secret Code
    if (display === pin && !isSetupMode) {
      handleSecureUnlock('main');
      return;
    }

    if (display === '999' && !isSetupMode) {
      handleSecureUnlock('main');
      return;
    }

    if (display === decoyCode && !isSetupMode) {
      handleSecureUnlock('decoy');
      return;
    }

    if (isSetupMode) {
      if (setupStep === 1) {
        if (display.length < 4) {
          setError('PIN MUST BE 4+ DIGITS');
          return;
        }
        setTempPin(display);
        setSetupStep(2);
        clearDisplay();
        return;
      } else {
        if (display === tempPin) {
          localStorage.setItem('rakshini_stealth_pin', display);
          setPin(display);
          setIsSetupMode(false);
          setSetupStep(1);
          clearDisplay();
          setError('VAULT SECURED');
        } else {
          setError('PIN MISMATCH');
          setSetupStep(1);
          clearDisplay();
        }
        return;
      }
    }

    // Standard Calculator Logic
    const inputValue = parseFloat(display);
    if (operator && firstOperand !== null) {
      const result = calculate(firstOperand, inputValue, operator);
      const displayValue = String(Number(result.toFixed(8)));
      setDisplay(displayValue);
      setHistory(prev => `${prev} ${inputValue} =`);
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecondOperand(false);
    }
  };

  const handleSecureUnlock = (mode: 'main' | 'decoy') => {
    setIsExiting(true);
    setTimeout(() => {
      if (mode === 'main') {
        navigate('/dashboard');
      } else {
        setIsExiting(false);
        clearDisplay();
        setError('Diagnostic Mode Enabled');
        setTimeout(() => setError(''), 3000);
      }
    }, 2500);
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowSettings(true);
    }, 2000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const buttons = [
    ['C', '%', '/', 'del'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '00', '='],
  ];

  if (isExiting) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center space-y-8 overflow-hidden px-6">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-2 border-saffron/30 flex items-center justify-center relative"
        >
          <div className="absolute inset-0 bg-saffron/10 blur-3xl animate-pulse" />
          <Shield className="text-saffron w-12 h-12" />
        </motion.div>
        
        <div className="text-center space-y-6 w-full max-w-xs">
          <div className="space-y-2">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-black text-white tracking-[0.4em] uppercase"
            >
              Unlocked
            </motion.h2>
            <p className="text-saffron font-black text-[10px] tracking-[0.3em] uppercase opacity-60">Neural Protocol Authenticated</p>
          </div>

          <div className="h-0.5 bg-white/5 rounded-full w-full relative overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-saffron to-transparent shadow-[0_0_15px_#ff9933]"
            />
          </div>
          
          <div className="flex justify-center space-x-1">
             {[0, 1, 2].map(i => (
               <motion.div 
                 key={i}
                 animate={{ opacity: [0, 1, 0] }}
                 transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                 className="w-1.5 h-1.5 bg-saffron rounded-full"
               />
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 150) {
            // Secret swipe right gesture
            handleSecureUnlock('main');
          }
        }}
        className="h-screen bg-[#080808] text-white flex flex-col p-6 font-sans relative overflow-hidden select-none cursor-default"
      >
        {/* Visual Decoration */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-saffron/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Covert Header */}
        <div className="relative z-10 pt-4 flex justify-between items-center">
          <div 
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            className="flex items-center space-x-2 opacity-30 hover:opacity-100 transition-all cursor-default px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <Sparkles size={14} className="text-saffron animate-pulse" />
            <span className="text-[9px] font-black tracking-[0.4em] uppercase">Tactical.OS</span>
          </div>
          
          {isSetupMode ? (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="px-4 py-1.5 bg-saffron/10 border border-saffron/20 rounded-full flex items-center space-x-2"
            >
              <Lock size={12} className="text-saffron" />
              <span className="text-[9px] font-black text-saffron uppercase tracking-widest">
                {setupStep === 1 ? 'Shield Config' : 'Verify Pin'}
              </span>
            </motion.div>
          ) : (
            <div className="flex items-center space-x-2 opacity-20">
              <div className="flex space-x-0.5">
                 {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-white/20 rounded-full" />)}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Secure Link</span>
            </div>
          )}
        </div>

        {/* Display Area */}
        <div className="flex-1 flex flex-col justify-end pb-8 space-y-4 relative z-10">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border self-end mb-2 ${
                  error.includes('match') || error.includes('digit') 
                    ? 'bg-emergency/10 border-emergency/20 text-emergency' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                }`}
              >
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-2">
            <motion.p 
              key={history}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-right text-gray-500 text-xl font-medium tracking-tight h-8 truncate"
            >
              {history}
            </motion.p>
            <motion.h2 
              key={display}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`text-right ${display.length > 9 ? 'text-5xl' : 'text-7xl'} font-light tracking-tighter truncate leading-none transition-all`}
            >
              {display}
            </motion.h2>
          </div>
        </div>

        {/* Tactical Keypad */}
        <div className="grid grid-cols-4 gap-3 md:gap-4 pb-10 relative z-10">
          {buttons.flat().map((btn, i) => {
            if (btn === '') return <div key={i} />;
            
            const isOperator = ['/', '*', '-', '+', '='].includes(btn);
            const isAction = ['C', '%', 'del'].includes(btn);
            
            return (
              <motion.button
                key={`${btn}-${i}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (btn === 'del') setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                  else if (btn === 'C') clearDisplay();
                  else if (btn === '=') handleEqual();
                  else if (isOperator) performOperation(btn);
                  else if (btn === '.') inputDecimal();
                  else inputDigit(btn);
                  
                  if (error && !error.includes('Successfully')) setError('');
                }}
                className={`h-20 rounded-[24px] md:rounded-[32px] flex items-center justify-center text-3xl font-medium transition-all duration-300 active:bg-white/10 ${
                  btn === '=' ? 'bg-saffron text-white shadow-[0_10px_40px_rgba(255,153,51,0.25)]' :
                  isOperator ? 'bg-white/5 text-saffron border border-white/5' : 
                  isAction ? 'bg-white/5 text-gray-400' : 'bg-transparent text-white border border-white/[0.03] hover:bg-white/[0.02]'
                }`}
              >
                {btn === 'del' ? <ChevronLeft /> : btn}
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/[0.03] flex justify-between items-center opacity-40 px-2 flex-col space-y-4">
           {showDemoHint && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex items-center space-x-2 bg-saffron/5 px-3 py-1.5 rounded-full border border-saffron/10"
             >
               <Terminal size={10} className="text-saffron" />
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-saffron/80">Emergency Override: 999=</span>
             </motion.div>
           )}
           <div className="w-full flex justify-between items-center">
             <span className="text-[9px] font-black uppercase tracking-[0.3em]">Status: Nominal</span>
             <div className="flex space-x-4">
                <div className="w-1 h-1 bg-saffron rounded-full animate-ping" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Protocol v0.4.7</span>
             </div>
           </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-[#080808] z-[100] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-saffron rounded-2xl flex items-center justify-center text-white shadow-xl shadow-saffron/10">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Security Vault</h3>
                    <p className="text-saffron text-[9px] font-black uppercase tracking-[0.3em] mt-1">Advanced Covert Controls</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X />
                </button>
              </div>

              <div className="space-y-10 flex-1 overflow-y-auto no-scrollbar">
                <section className="space-y-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-2">Identity Configuration</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                          localStorage.removeItem('rakshini_stealth_pin');
                          setPin('');
                          setIsSetupMode(true);
                          setSetupStep(1);
                          setShowSettings(false);
                      }}
                      className="w-full p-6 bg-white/[0.03] border border-white/[0.05] rounded-[32px] flex items-center justify-between group hover:bg-white/[0.05] transition-all"
                    >
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                             <Lock className="text-orange-500" size={18} />
                          </div>
                          <div className="text-left">
                             <p className="font-black text-sm">Change Access PIN</p>
                             <p className="text-[10px] text-gray-500 font-bold mt-1">Configure entry code sequence</p>
                          </div>
                       </div>
                       <ChevronLeft className="rotate-180 text-gray-600 group-hover:text-saffron transition-transform" />
                    </button>

                    <div className="p-6 bg-white/[0.03] border border-white/[0.05] rounded-[32px] flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-emergency/10 flex items-center justify-center">
                             <AlertCircle className="text-emergency" size={18} />
                          </div>
                          <div className="text-left">
                             <p className="font-black text-sm">Decoy System</p>
                             <p className="text-[10px] text-gray-500 font-bold mt-1">Current Trap: {decoyCode}</p>
                          </div>
                       </div>
                       <div className="flex space-x-2">
                          {['0000', '1234', '9999'].map(code => (
                            <button 
                              key={code}
                              onClick={() => {
                                localStorage.setItem('rakshini_decoy_pin', code);
                                setDecoyCode(code);
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                                decoyCode === code ? 'bg-saffron text-white' : 'bg-white/5 text-gray-500'
                              }`}
                            >
                              {code}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-2">System Exit</p>
                   <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full p-6 bg-saffron/10 border border-saffron/30 rounded-[32px] flex items-center space-x-4 text-saffron group hover:bg-saffron/20 transition-all shadow-lg shadow-saffron/5"
                   >
                     <div className="w-10 h-10 rounded-xl bg-saffron text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={18} />
                     </div>
                     <div className="text-left">
                        <p className="font-black text-sm uppercase tracking-tight">Manual override</p>
                        <p className="text-[10px] text-saffron/60 font-bold mt-1">Direct return to command center</p>
                     </div>
                   </button>
                </section>
              </div>

              <div className="mt-auto py-6 flex flex-col items-center">
                <div className="w-full h-px bg-white/[0.05] mb-6" />
                <p className="text-[10px] font-black tracking-[0.4em] text-gray-700 uppercase">Neural Handshake Active</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showDemoHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Swipe Right to Disengage</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
}
