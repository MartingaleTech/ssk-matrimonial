import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profilesApi, Profile } from '../api/profiles';
import { useAuth } from './AuthContext';

const PROFILE_KEY = 'active_profile';
const MANAGER_KEY = 'active_manager';

interface ProfileContextType {
  profile: Profile | null;
  managerId: string | null;
  managerRole: string | null;
  hasCompletedProfile: boolean;
  setProfile: (profile: Profile | null) => void;
  setManagerInfo: (managerId: string, role: string) => void;
  refreshProfile: (profileId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [managerRole, setManagerRole] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadStoredProfile();
    } else {
      setProfileState(null);
      setManagerId(null);
      setManagerRole(null);
    }
  }, [isAuthenticated]);

  const loadStoredProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      const storedManager = await AsyncStorage.getItem(MANAGER_KEY);
      if (storedProfile) {
        setProfileState(JSON.parse(storedProfile));
      }
      if (storedManager) {
        const mgr = JSON.parse(storedManager);
        setManagerId(mgr.id);
        setManagerRole(mgr.role);
      }
    } catch { /* silent */ }
  };

  const setProfile = (p: Profile | null) => {
    setProfileState(p);
    if (p) {
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    } else {
      AsyncStorage.removeItem(PROFILE_KEY);
    }
  };

  const setManagerInfo = (id: string, role: string) => {
    setManagerId(id);
    setManagerRole(role);
    AsyncStorage.setItem(MANAGER_KEY, JSON.stringify({ id, role }));
  };

  const refreshProfile = async (profileId: string) => {
    const { data } = await profilesApi.get(profileId);
    setProfile(data);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        managerId,
        managerRole,
        hasCompletedProfile: profile?.profile_status === 'active',
        setProfile,
        setManagerInfo,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
