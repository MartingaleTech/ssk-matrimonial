import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, ProfileProvider } from './src/context';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
