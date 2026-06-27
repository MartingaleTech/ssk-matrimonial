import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input } from '../../components';
import { profilesApi } from '../../api/profiles';
import { useAuth, useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface BasicInfoScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function BasicInfoScreen({ navigation }: BasicInfoScreenProps) {
  const { user } = useAuth();
  const { setProfile, setManagerInfo } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!displayName || !gender || !dob || !heightCm || !maritalStatus) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await profilesApi.create({
        display_name: displayName,
        gender,
        date_of_birth: dob,
        height_cm: parseInt(heightCm),
        marital_status: maritalStatus,
      });
      setProfile(data.profile);
      setManagerInfo(data.manager.id, data.manager.role);
      navigation.navigate('ProfileEducation');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create profile';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Basic Information</Text>
      <Text style={styles.step}>Step 1 of 9</Text>

      <Input label="Display Name" placeholder="Your name" value={displayName} onChangeText={setDisplayName} />
      <Input label="Gender" placeholder="male / female" value={gender} onChangeText={setGender} />
      <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} />
      <Input label="Height (cm)" placeholder="170" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" />
      <Input label="Marital Status" placeholder="never_married / divorced / widowed" value={maritalStatus} onChangeText={setMaritalStatus} />

      <Button title="Next" onPress={handleNext} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  step: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
});
