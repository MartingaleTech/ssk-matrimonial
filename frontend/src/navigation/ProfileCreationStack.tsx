import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BasicInfoScreen,
  EducationCareerScreen,
  FamilyInfoScreen,
  LifestyleScreen,
  LocationScreen,
  KundaliInputScreen,
  KundaliSummaryScreen,
  PhotoUploadScreen,
  PartnerPreferencesScreen,
  VerificationScreen,
} from '../screens/profile-creation';
import { colors } from '../theme';

import { ProfileCreationParamList } from './types';

const Stack = createNativeStackNavigator<ProfileCreationParamList>();

export function ProfileCreationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="ProfileBasicInfo" component={BasicInfoScreen} options={{ title: 'Basic Info', headerBackVisible: false }} />
      <Stack.Screen name="ProfileEducation" component={EducationCareerScreen} options={{ title: 'Education & Career' }} />
      <Stack.Screen name="ProfileFamily" component={FamilyInfoScreen} options={{ title: 'Family Info' }} />
      <Stack.Screen name="ProfileLifestyle" component={LifestyleScreen} options={{ title: 'Lifestyle' }} />
      <Stack.Screen name="ProfileLocation" component={LocationScreen} options={{ title: 'Location' }} />
      <Stack.Screen name="ProfileKundaliInput" component={KundaliInputScreen} options={{ title: 'Kundali Details' }} />
      <Stack.Screen name="ProfileKundaliSummary" component={KundaliSummaryScreen} options={{ title: 'Kundali Summary' }} />
      <Stack.Screen name="ProfilePhotos" component={PhotoUploadScreen} options={{ title: 'Photos' }} />
      <Stack.Screen name="ProfilePreferences" component={PartnerPreferencesScreen} options={{ title: 'Partner Preferences' }} />
      <Stack.Screen name="ProfileVerification" component={VerificationScreen} options={{ title: 'Verification' }} />
    </Stack.Navigator>
  );
}
