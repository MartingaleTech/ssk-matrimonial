import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input, StepNavigation } from '../../components';
import { profilesApi } from '../../api/profiles';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface BasicInfoScreenProps {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

export function BasicInfoScreen({ navigation }: BasicInfoScreenProps) {
  const { profile, setProfile, setManagerInfo } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setGender(profile.gender || '');
      setDob(profile.date_of_birth || '');
      setHeightCm(profile.height_cm ? String(profile.height_cm) : '');
      setMaritalStatus(profile.marital_status || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const handleNext = async () => {
    if (!displayName || !gender || !dob || !heightCm || !maritalStatus) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      if (profile) {
        const { data } = await profilesApi.update(profile.id, {
          display_name: displayName,
          gender,
          date_of_birth: dob,
          height_cm: parseInt(heightCm),
          marital_status: maritalStatus,
        });
        setProfile(data);
      } else {
        const { data } = await profilesApi.create({
          display_name: displayName,
          gender,
          date_of_birth: dob,
          height_cm: parseInt(heightCm),
          marital_status: maritalStatus,
        });
        setProfile(data.profile);
        setManagerInfo(data.manager.id, data.manager.role);
      }
      navigation.navigate('ProfileEducation');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save profile';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StepNavigation screenName="ProfileBasicInfo" navigation={navigation} />

      <Text style={styles.title}>Basic Information</Text>

      <Input label="Display Name" placeholder="Your name" value={displayName} onChangeText={setDisplayName} />
      <Input label="Gender" placeholder="male / female" value={gender} onChangeText={setGender} />
      <Input label="Date of Birth" placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} />
      <Input label="Height (cm)" placeholder="170" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" />
      <Input label="Marital Status" placeholder="never_married / divorced / widowed" value={maritalStatus} onChangeText={setMaritalStatus} />

      <Button title="Save & Next" onPress={handleNext} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
});
