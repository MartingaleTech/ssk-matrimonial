import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Card, ScreenContainer } from '../../components';
import { profilesApi } from '../../api/profiles';
import { useAuth, useProfile } from '../../context';
import { useEntitlements } from '../../hooks';
import { colors, spacing, typography } from '../../theme';

interface AccountSettingsScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function AccountSettingsScreen({ navigation }: AccountSettingsScreenProps) {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { entitlements } = useEntitlements();
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { performLogout(); } },
    ]);
  };

  const performDeleteProfile = async () => {
    if (!profile) return;
    setDeleting(true);
    try {
      await profilesApi.delete(profile.id);
      await logout();
    } catch {
      Alert.alert('Error', 'Failed to delete profile. Please try again.');
      setDeleting(false);
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'This action cannot be undone. Your profile, connections, and messages will be permanently deleted.',
      [
        { text: 'Cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { performDeleteProfile(); } },
      ],
    );
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Account Settings</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'Not set'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user?.phone || 'Not set'}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Plan</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Current plan</Text>
          <Text style={styles.value}>
            {entitlements.plan}{entitlements.is_free_trial ? ' (trial)' : ''}
          </Text>
        </View>
        {entitlements.plan === 'basic' && (
          <Button title="Upgrade to Premium" onPress={() => navigation.navigate('Plans')} style={styles.btn} />
        )}
        <Button title="Manage Subscription" variant="outline" onPress={() => navigation.navigate('ManageSubscription')} style={styles.btn} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Button title="My Profile" variant="outline" onPress={() => navigation.navigate('MyProfile')} style={styles.btn} />
        <Button title="Favorites" variant="outline" onPress={() => navigation.navigate('Favorites')} style={styles.btn} />
        <Button title="Edit Profile" variant="outline" onPress={() => navigation.navigate('EditProfile')} style={styles.btn} />
        <Button title="Partner Preferences" variant="outline" onPress={() => navigation.navigate('EditPreferences')} style={styles.btn} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Manage</Text>
        <Button title="Privacy Settings" variant="outline" onPress={() => navigation.navigate('PrivacySettings')} style={styles.btn} />
        <Button title="Notification Settings" variant="outline" onPress={() => navigation.navigate('NotificationSettings')} style={styles.btn} />
        <Button title="Managers" variant="outline" onPress={() => navigation.navigate('ManagerList')} style={styles.btn} />
      </Card>

      <View style={styles.danger}>
        <Button title="Logout" variant="outline" onPress={handleLogout} loading={loggingOut} />
        <Button title="Delete Profile" variant="outline" onPress={handleDeleteProfile} loading={deleting} style={styles.deleteBtn} />
      </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.body, color: colors.text },
  btn: { marginBottom: spacing.sm },
  danger: { marginTop: spacing.xl },
  deleteBtn: { marginTop: spacing.sm, borderColor: colors.error },
});
