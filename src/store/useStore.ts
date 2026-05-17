
import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber?: string;
  bio?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  gender?: string;
  role?: string;
  aiAlias?: string;
  guardianLevel?: string;
  protocolTier?: string;
  statusLabel?: string;
  safetyScore: number;
  lastSeenLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

interface AuthStore {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  fetchProfile: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: localStorage.getItem('rakshini_profile') ? JSON.parse(localStorage.getItem('rakshini_profile')!) : null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => {
    if (profile) {
      localStorage.setItem('rakshini_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('rakshini_profile');
    }
    set({ profile });
  },
  setLoading: (loading) => set({ loading }),
  updateProfile: (updates) => set((state) => {
    const newProfile = state.profile ? { ...state.profile, ...updates } : null;
    if (newProfile) {
      localStorage.setItem('rakshini_profile', JSON.stringify(newProfile));
    }
    return { profile: newProfile };
  }),
  fetchProfile: async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data() as UserProfile;
        localStorage.setItem('rakshini_profile', JSON.stringify(profileData));
        set({ profile: profileData });
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  }
}));

interface SafetyStore {
  isSOSEnabled: boolean;
  currentRiskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  isStealthMode: boolean;
  isNavHidden: boolean;
  setSOSEnabled: (enabled: boolean) => void;
  setRiskLevel: (level: 'LOW' | 'MODERATE' | 'HIGH') => void;
  setStealthMode: (enabled: boolean) => void;
  setNavHidden: (hidden: boolean) => void;
}

export const useSafetyStore = create<SafetyStore>((set) => ({
  isSOSEnabled: false,
  currentRiskLevel: 'LOW',
  isStealthMode: false,
  isNavHidden: false,
  setSOSEnabled: (enabled) => set({ isSOSEnabled: enabled }),
  setRiskLevel: (level) => set({ currentRiskLevel: level }),
  setStealthMode: (enabled) => set({ isStealthMode: enabled }),
  setNavHidden: (hidden) => set({ isNavHidden: hidden }),
}));
