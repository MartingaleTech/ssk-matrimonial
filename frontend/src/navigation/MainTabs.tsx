import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SwipeScreen } from '../screens/discovery/SwipeScreen';
import { ConnectionsDashboardScreen } from '../screens/connections/ConnectionsDashboardScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { AccountSettingsScreen } from '../screens/settings/AccountSettingsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
      }}
    >
      <Tab.Screen name="Discover" component={SwipeScreen} options={{ tabBarLabel: 'Discover' }} />
      <Tab.Screen name="Connections" component={ConnectionsDashboardScreen} options={{ tabBarLabel: 'Connections' }} />
      <Tab.Screen name="Chat" component={ChatListScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Settings" component={AccountSettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}
