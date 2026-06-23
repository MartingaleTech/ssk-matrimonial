import React, { createContext, useContext, useState, ReactNode } from 'react';
import { profilesApi, Profile } from '../api/profiles';

interface ProfileContextType {
  profile: Profile | null;
  managerId: string | null;
  managerRole: string | null;
  setProfile: (profile: Profile | null) => void;
  setManagerInfo: (managerId: string, role: string) => void;
  refreshProfile: (profileId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [managerRole, setManagerRole] = useState<string | null>(null);

  const setManagerInfo = (id: string, role: string) => {
    setManagerId(id);
    setManagerRole(role);
  };

  const refreshProfile = async (profileId: string) => {
    const { data } = await profilesApi.get(profileId);
    setProfile(data);
  };

  return (
    <ProfileContext.Provider
      value={{ profile, managerId, managerRole, setProfile, setManagerInfo, refreshProfile }}
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
