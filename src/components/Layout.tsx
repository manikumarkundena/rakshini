
import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Shield, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafetyStore } from '../store/useStore';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Map, label: 'Map', path: '/map' },
  { icon: Shield, label: 'SOS', path: '/sos', special: true },
  { icon: Lock, label: 'Vault', path: '/vault' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isNavHidden = useSafetyStore(state => state.isNavHidden);
  const hideNav = ['/', '/onboarding', '/auth', '/calculator', '/assistant'].includes(location.pathname) || isNavHidden;

  return (
    <div className="relative min-h-screen bg-cream overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-saffron/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-amber-glow/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(253,248,245,0.4)_100%)]" />
      </div>

      <main className={`relative z-10 flex flex-col items-center ${!hideNav ? 'pb-36' : ''}`}>
        <div className={`w-full flex-1 ${location.pathname === '/map' ? '' : 'max-w-[1600px]'}`}>
          {children}
        </div>
      </main>

      <AnimatePresence>
        {!hideNav && (
          <motion.nav 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[40] px-6 pb-8 pt-4"
          >
            <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-white/20 rounded-full cinematic-shadow flex items-center justify-between px-4 py-2">
              {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              if (item.special) {
                return (
                  <NavLink key={item.path} to={item.path} className="relative -top-8">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-16 h-16 saffron-gradient rounded-full flex items-center justify-center shadow-lg shadow-saffron/40 ring-4 ring-white"
                    >
                      <Icon className="text-white w-8 h-8" />
                    </motion.div>
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center px-3 py-1 space-y-1"
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={`${isActive ? 'text-saffron' : 'text-gray-400'}`}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-saffron' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute bottom-[-2px] w-1 h-1 bg-saffron rounded-full"
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
    </div>
  );
}
