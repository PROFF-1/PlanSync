import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';
import { getUserProfile, UserProfile } from './firebaseAuth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        // Cache user profile in AsyncStorage
        if (profile) {
          await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const signOut = async () => {
    try {
      const { signOut: firebaseSignOut } = await import('./firebaseAuth');
      await firebaseSignOut();
      
      // Clear cached data
      await AsyncStorage.multiRemove(['user', 'userProfile']);
      
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Load cached user data on app start
  const loadCachedUserData = async () => {
    try {
      const cachedProfile = await AsyncStorage.getItem('userProfile');
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
      }
    } catch (error) {
      console.error('Error loading cached user data:', error);
    }
  };

  useEffect(() => {
    // Load cached data first for instant UI
    loadCachedUserData();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User signed in' : 'User signed out');
      setUser(user);
      
      if (user) {
        // Cache user info
        await AsyncStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }));
        
        // Fetch user profile from Firestore
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          // Cache user profile
          if (profile) {
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        // Clear cached data when signed out
        await AsyncStorage.multiRemove(['user', 'userProfile']);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};