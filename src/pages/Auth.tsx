
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useStore';
import PageTransition from '../components/PageTransition';
import { Mail, ChevronRight, Loader2, AlertTriangle, ShieldCheck, Lock, User as UserIcon, Copy, Check } from 'lucide-react';
import DemoHint from '../components/DemoHint';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser, setProfile, setLoading: setAuthLoading, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [error, setError] = useState<string | null>(null);

  const DEMO_EMAIL = 'founder@rakshini.ai';
  const DEMO_PASSWORD = 'Rakshini@Shunya123';

  const syncUserProfile = async (firebaseUser: any, nameOverride?: string) => {
    const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    const isDemo = firebaseUser.email === DEMO_EMAIL;

    if (!profileSnap.exists()) {
      const newProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: isDemo ? 'Manikumar K' : (nameOverride || firebaseUser.displayName || 'Rakshini User'),
          photoURL: firebaseUser.photoURL || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          role: isDemo ? 'Founder & Architect' : 'Guardian Member',
          aiAlias: isDemo ? 'Rakshini Admin' : 'Secure User',
          guardianLevel: isDemo ? 'Primary Node' : 'Enrolled Node',
          protocolTier: isDemo ? 'Shunya Core' : 'Base Tier',
          statusLabel: 'Secured Account • Active',
          safetyScore: 100,
          createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
      setProfile(newProfile as any);
    } else {
      const existingProfile = profileSnap.data();
      // For demo purposes, we might want to ensure the demo fields are set if it's the demo account
      if (isDemo && !existingProfile.role) {
          const updatedDemoProfile = {
              ...existingProfile,
              role: 'Founder & Architect',
              aiAlias: 'Rakshini Admin',
              guardianLevel: 'Primary Node',
              protocolTier: 'Shunya Core',
              statusLabel: 'Secured Account • Active',
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), updatedDemoProfile);
          setProfile(updatedDemoProfile as any);
      } else {
          setProfile(existingProfile as any);
      }
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDemoAccess = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user);
      setUser(result.user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Google sign-in error", err);
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/operation-not-allowed') {
          setError('Google Sign-In is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.');
        } else if (err.code === 'auth/invalid-credential') {
          setError('Invalid identity credentials. Please try again or use the email authentication protocol.');
        } else {
          setError(err.message || 'Identity authentication failed.');
        }
      } else {
        setError('An unexpected identity error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'signup' && !displayName) {
        setError('Full name is required for registration.');
        return;
    }

    try {
        setLoading(true);
        setError(null);
        
        if (mode === 'login') {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await syncUserProfile(result.user);
            setUser(result.user);
        } else {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await syncUserProfile(result.user, displayName);
            setUser(result.user);
        }
        
        navigate('/dashboard');
    } catch (err: any) {
        console.error("Auth error", err);
        if (err instanceof FirebaseError) {
            if (err.code === 'auth/operation-not-allowed') {
                setError('Email/Password authentication is not enabled in your Firebase Console. Please go to Authentication > Sign-in method and enable "Email/Password".');
            } else if (err.code === 'auth/invalid-credential') {
                setError('Invalid credentials provided. Please verify your email and passkey, or use the Load Demo Credentials button.');
            } else {
                setError(err.message || "Authentication protocol failed.");
            }
        } else {
            setError("An unexpected authentication error occurred.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
            <div className="mb-10 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-black rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl rotate-3 relative group"
                >
                    <div className="absolute inset-0 bg-saffron/20 rounded-3xl blur-xl group-hover:bg-saffron/40 transition-all" />
                    <div className="w-12 h-12 border-2 border-saffron/30 rounded-full flex items-center justify-center p-1 relative z-10">
                        <ShieldCheck className="text-saffron w-8 h-8" />
                    </div>
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">
                    {mode === 'login' ? 'Rakshini Hub' : 'Secure Entry'}
                </h2>
                <p className="text-gray-500 font-medium tracking-tight">
                    {mode === 'login' ? 'Return to your secure safety environment.' : 'Initialize your personal protection protocol.'}
                </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 text-red-500 p-4 rounded-2xl text-[11px] font-black tracking-wider uppercase border border-red-100 flex items-start space-x-3 mb-6"
                        >
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full h-16 bg-white border-2 border-gray-50 rounded-2xl flex items-center justify-center space-x-4 shadow-sm hover:border-saffron/20 transition-all"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="font-black text-gray-800 tracking-tight">Identity Hub (Google)</span>
                    </motion.button>

                    <div className="flex items-center space-x-4">
                        <div className="flex-1 h-[1px] bg-gray-100" />
                        <span className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">or</span>
                        <div className="flex-1 h-[1px] bg-gray-100" />
                    </div>

                    {mode === 'login' && (
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDemoAccess}
                            className="w-full h-14 bg-saffron/5 border border-saffron/20 text-saffron rounded-2xl flex items-center justify-center space-x-3 transition-colors hover:bg-saffron/10 mb-4"
                        >
                            <ShieldCheck size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Load Demo Credentials</span>
                        </motion.button>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Identification Name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-800 outline-none ring-2 ring-transparent focus:ring-saffron/20 border border-gray-100 transition-all placeholder:text-gray-300"
                                        required
                                    />
                                    <div className="absolute right-4 top-4 text-gray-300">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Neural Address (Email)</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-800 outline-none ring-2 ring-transparent focus:ring-saffron/20 border border-gray-100 transition-all placeholder:text-gray-300"
                                    required
                                />
                                <div className="absolute right-4 top-4 text-gray-300">
                                    <Mail className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Passkey (Password)</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-800 outline-none ring-2 ring-transparent focus:ring-saffron/20 border border-gray-100 transition-all placeholder:text-gray-300"
                                    required
                                />
                                <div className="absolute right-4 top-4 text-gray-300">
                                    <Lock className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full h-16 bg-black text-white font-black rounded-2xl shadow-xl flex items-center justify-center space-x-3 group overflow-hidden relative"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin text-saffron" /> : (
                                <>
                                    <span className="relative z-10">{mode === 'login' ? 'Authenticate Portal' : 'Register Protocol'}</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-saffron/0 via-saffron/10 to-saffron/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="text-center">
                        <button 
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-[11px] font-black text-gray-400 hover:text-saffron transition-colors uppercase tracking-widest"
                        >
                            {mode === 'login' ? "New Guardian Member? Sign Up" : "Returning Member? Sign In"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center space-y-8">
                <div className="flex items-center justify-center space-x-2 opacity-50">
                    <ShieldCheck size={14} className="text-saffron" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Encrypted End-to-End</span>
                </div>
                
                <p className="text-gray-300 text-[10px] px-10 leading-relaxed font-medium uppercase tracking-widest">
                    By accessing Rakshini, you agree to our <br/> 
                    <span className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">Terms of Service</span> & 
                    <span className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"> Safety Policy</span>
                </p>
            </div>
        </div>
        <DemoHint id="login_auth" message="Use Founder Credentials for VIP Preview" position="bottom" />
      </div>
    </PageTransition>
  );
}
