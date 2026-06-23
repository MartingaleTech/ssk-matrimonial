import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Card } from '../../components';
import { useAuth, useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface AccountSettingsScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function AccountSettingsScreen({ navigation }: AccountSettingsScreenProps) {
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.sectionTitle}>Manage</Text>
        <Button title="Privacy Settings" variant="outline" onPress={() => navigation.navigate('PrivacySettings')} style={styles.btn} />
        <Button title="Notification Settings" variant="outline" onPress={() => navigation.navigate('NotificationSettings')} style={styles.btn} />
        <Button title="Managers" variant="outline" onPress={() => navigation.navigate('ManagerList')} style={styles.btn} />
      </Card>

      <View style={styles.danger}>
        <Button title="Logout" variant="outline" onPress={handleLogout} />
        <Button title="Delete Profile" variant="outline" onPress={handleDeleteProfile} style={styles.deleteBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
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
