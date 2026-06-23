import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen, LoginScreen, OtpScreen, AccountSetupChoiceScreen } from '../screens/auth';
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
} from '../screens/profile-creation';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OtpScreen} />
      <Stack.Screen name="AccountSetupChoice" component={AccountSetupChoiceScreen} />
      <Stack.Screen name="ProfileBasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="ProfileEducation" component={EducationCareerScreen} />
      <Stack.Screen name="ProfileFamily" component={FamilyInfoScreen} />
      <Stack.Screen name="ProfileLifestyle" component={LifestyleScreen} />
      <Stack.Screen name="ProfileLocation" component={LocationScreen} />
      <Stack.Screen name="ProfileKundaliInput" component={KundaliInputScreen} />
      <Stack.Screen name="ProfileKundaliSummary" component={KundaliSummaryScreen} />
      <Stack.Screen name="ProfilePhotos" component={PhotoUploadScreen} />
      <Stack.Screen name="ProfilePreferences" component={PartnerPreferencesScreen} />
    </Stack.Navigator>
  );
}
