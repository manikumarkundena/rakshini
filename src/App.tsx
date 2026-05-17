import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/useStore';
import Layout from './components/Layout';

// Pages
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import SOSPage from './pages/SOSPage';
import Vault from './pages/Vault';
import Profile from './pages/Profile';
import Calculator from './pages/Calculator';
import AIAssistant from './pages/AIAssistant';
import About from './pages/About';
import CommunityReport from './pages/CommunityReport';
import Guardians from './pages/Guardians';

export default function App() {
  const { setUser, setProfile, setLoading, fetchProfile } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchProfile(user.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading, fetchProfile]);

  return (
    <Router>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/sos" element={<SOSPage />} />
            <Route path="/guardians" element={<Guardians />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/about" element={<About />} />
            <Route path="/reports" element={<CommunityReport />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </Router>
  );
}

