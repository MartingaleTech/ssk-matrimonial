import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const STEP_SCREENS = [
  'ProfileBasicInfo',
  'ProfileEducation',
  'ProfileFamily',
  'ProfileLifestyle',
  'ProfileLocation',
  'ProfileKundaliInput',
  'ProfileKundaliSummary',
  'ProfilePhotos',
  'ProfilePreferences',
  'ProfileVerification',
] as const;

export type StepScreen = typeof STEP_SCREENS[number];

interface ProfileCreationContextType {
  maxStepReached: number;
  markStepReached: (stepIndex: number) => void;
  getStepIndex: (screenName: StepScreen) => number;
  getScreenName: (stepIndex: number) => StepScreen | undefined;
  canNavigateForward: (currentStep: number) => boolean;
  totalSteps: number;
}

const ProfileCreationContext = createContext<ProfileCreationContextType | undefined>(undefined);

export function ProfileCreationProvider({ children }: { children: ReactNode }) {
  const [maxStepReached, setMaxStepReached] = useState(0);

  const markStepReached = useCallback((stepIndex: number) => {
    setMaxStepReached((prev) => Math.max(prev, stepIndex));
  }, []);

  const getStepIndex = useCallback((screenName: StepScreen): number => {
    return STEP_SCREENS.indexOf(screenName);
  }, []);

  const getScreenName = useCallback((stepIndex: number): StepScreen | undefined => {
    return STEP_SCREENS[stepIndex];
  }, []);

  const canNavigateForward = useCallback((currentStep: number): boolean => {
    return currentStep < maxStepReached;
  }, [maxStepReached]);

  return (
    <ProfileCreationContext.Provider
      value={{
        maxStepReached,
        markStepReached,
        getStepIndex,
        getScreenName,
        canNavigateForward,
        totalSteps: STEP_SCREENS.length,
      }}
    >
      {children}
    </ProfileCreationContext.Provider>
  );
}

export function useProfileCreation(): ProfileCreationContextType {
  const context = useContext(ProfileCreationContext);
  if (!context) {
    throw new Error('useProfileCreation must be used within ProfileCreationProvider');
  }
  return context;
}
