import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth, useProfile } from '../context';
import { LoadingScreen } from '../components';
import { AuthStack } from './AuthStack';
import { ProfileCreationStack } from './ProfileCreationStack';
import { MainTabs } from './MainTabs';
import { ProfileDetailScreen } from '../screens/discovery/ProfileDetailScreen';
import { AdvancedSearchScreen } from '../screens/discovery/AdvancedSearchScreen';
import { TopMatchesScreen } from '../screens/discovery/TopMatchesScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { ChatInfoScreen } from '../screens/chat/ChatInfoScreen';
import { ConnectionRequestScreen } from '../screens/connections/ConnectionRequestScreen';
import { ManagerListScreen } from '../screens/managers/ManagerListScreen';
import { AddManagerScreen } from '../screens/managers/AddManagerScreen';
import { PrivacySettingsScreen } from '../screens/settings/PrivacySettingsScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { EditPreferencesScreen } from '../screens/settings/EditPreferencesScreen';
import { KundaliViewScreen } from '../screens/kundali/KundaliSummaryScreen';
import { GunaBreakdownScreen } from '../screens/kundali/GunaBreakdownScreen';
import { KundaliPreferencesScreen } from '../screens/kundali/KundaliPreferencesScreen';
import { KundaliCompatibleMatchesScreen } from '../screens/kundali/KundaliCompatibleMatchesScreen';
import { VerificationScreen } from '../screens/profile-creation/VerificationScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { profile, hasCompletedProfile, isProfileLoading } = useProfile();

  if (isLoading || (isAuthenticated && isProfileLoading)) return <LoadingScreen />;

  const needsVerification = profile?.profile_status === 'pending_verification';

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : needsVerification ? (
        <VerificationScreen />
      ) : !hasCompletedProfile ? (
        <ProfileCreationStack />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ title: 'Profile' }} />
          <Stack.Screen name="AdvancedSearch" component={AdvancedSearchScreen} options={{ title: 'Search' }} />
          <Stack.Screen name="TopMatches" component={TopMatchesScreen} options={{ title: 'Top Matches' }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Chat' }} />
          <Stack.Screen name="ChatInfo" component={ChatInfoScreen} options={{ title: 'Chat Info' }} />
          <Stack.Screen name="ConnectionRequest" component={ConnectionRequestScreen} options={{ title: 'Connect' }} />
          <Stack.Screen name="ManagerList" component={ManagerListScreen} options={{ title: 'Managers' }} />
          <Stack.Screen name="AddManager" component={AddManagerScreen} options={{ title: 'Add Manager' }} />
          <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ title: 'Privacy' }} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notifications' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="EditPreferences" component={EditPreferencesScreen} options={{ title: 'Partner Preferences' }} />
          <Stack.Screen name="KundaliSummary" component={KundaliViewScreen} options={{ title: 'Kundali' }} />
          <Stack.Screen name="GunaBreakdown" component={GunaBreakdownScreen} options={{ title: 'Guna Match' }} />
          <Stack.Screen name="KundaliPreferences" component={KundaliPreferencesScreen} options={{ title: 'Kundali Preferences' }} />
          <Stack.Screen name="KundaliMatches" component={KundaliCompatibleMatchesScreen} options={{ title: 'Compatible Matches' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
