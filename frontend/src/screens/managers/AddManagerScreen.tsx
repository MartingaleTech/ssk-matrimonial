import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Input } from '../../components';
import { managersApi } from '../../api/managers';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface AddManagerScreenProps {
  navigation: { goBack: () => void };
}

export function AddManagerScreen({ navigation }: AddManagerScreenProps) {
  const { profile } = useProfile();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!profile || !email) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    setLoading(true);
    try {
      await managersApi.add(profile.id, { email, role });
      Alert.alert('Success', 'Manager added successfully');
      navigation.goBack();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add manager';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Manager</Text>
      <Text style={styles.subtitle}>Invite someone to help manage this profile</Text>

      <Input label="Email" placeholder="manager@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Role" placeholder="parent / family_member" value={role} onChangeText={setRole} />

      <Button title="Add Manager" onPress={handleAdd} loading={loading} />
      <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.cancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  cancel: { marginTop: spacing.sm },
});
