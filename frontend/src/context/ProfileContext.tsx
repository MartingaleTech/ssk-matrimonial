import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  isProfileLoading: boolean;
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
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fetchProfileFromBackend = useCallback(async () => {
    try {
      const { data } = await profilesApi.getMe();
      if (data.profile) {
        setProfileState(data.profile);
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
        if (data.manager) {
          setManagerId(data.manager.id);
          setManagerRole(data.manager.role);
          await AsyncStorage.setItem(MANAGER_KEY, JSON.stringify(data.manager));
        }
      } else {
        setProfileState(null);
        setManagerId(null);
        setManagerRole(null);
        await AsyncStorage.removeItem(PROFILE_KEY);
        await AsyncStorage.removeItem(MANAGER_KEY);
      }
    } catch {
      // If backend fetch fails, fall back to cached AsyncStorage data
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
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      setIsProfileLoading(true);
      fetchProfileFromBackend().finally(() => {
        setIsProfileLoading(false);
      });
    } else {
      setProfileState(null);
      setManagerId(null);
      setManagerRole(null);
      setIsProfileLoading(false);
    }
  }, [isAuthenticated, token, fetchProfileFromBackend]);

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
        isProfileLoading,
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
