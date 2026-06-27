export type RootStackParamList = {
  Main: undefined;
  ProfileDetail: { profileId: string };
  AdvancedSearch: undefined;
  TopMatches: undefined;
  ChatScreen: { threadId: string; otherProfileId: string };
  ChatInfo: { threadId: string; otherProfileId: string };
  ConnectionRequest: { toProfileId: string; displayName?: string };
  ManagerList: undefined;
  AddManager: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  EditProfile: undefined;
  EditPreferences: undefined;
  KundaliSummary: undefined;
  GunaBreakdown: { matchId?: string; profile2Id?: string } | undefined;
  KundaliPreferences: undefined;
  KundaliMatches: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  OTP: { userId: string; channel: string; destination: string };
  AccountSetupChoice: undefined;
};

export type ProfileCreationParamList = {
  ProfileBasicInfo: undefined;
  ProfileEducation: undefined;
  ProfileFamily: undefined;
  ProfileLifestyle: undefined;
  ProfileLocation: undefined;
  ProfileKundaliInput: undefined;
  ProfileKundaliSummary: undefined;
  ProfilePhotos: undefined;
  ProfilePreferences: undefined;
  ProfileVerification: undefined;
};
