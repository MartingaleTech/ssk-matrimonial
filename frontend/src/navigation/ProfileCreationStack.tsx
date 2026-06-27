import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
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
import { ProfileCreationProvider } from '../context';
import { useAuth } from '../context';
import { colors, typography } from '../theme';

import { ProfileCreationParamList } from './types';

const Stack = createNativeStackNavigator<ProfileCreationParamList>();

function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Exit Profile Setup',
      'Are you sure you want to logout? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ],
    );
  }, [logout]);

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

export function ProfileCreationStack() {
  return (
    <ProfileCreationProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          headerRight: () => <LogoutButton />,
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
    </ProfileCreationProvider>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
});
