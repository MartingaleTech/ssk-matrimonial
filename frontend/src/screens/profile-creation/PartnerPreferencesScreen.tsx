import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input } from '../../components';
import { preferencesApi } from '../../api/preferences';
import { profilesApi } from '../../api/profiles';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

export function PartnerPreferencesScreen() {
  const { profile, refreshProfile } = useProfile();
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [heightMin, setHeightMin] = useState('');
  const [heightMax, setHeightMax] = useState('');
  const [educationLevels, setEducationLevels] = useState('');
  const [occupations, setOccupations] = useState('');
  const [locations, setLocations] = useState('');
  const [loading, setLoading] = useState(false);

  const completeProfile = async () => {
    if (!profile) return;
    await profilesApi.update(profile.id, { profile_status: 'active' });
    await refreshProfile(profile.id);
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await preferencesApi.update(profile.id, {
        age_min: ageMin ? parseInt(ageMin) : null,
        age_max: ageMax ? parseInt(ageMax) : null,
        height_min_cm: heightMin ? parseInt(heightMin) : null,
        height_max_cm: heightMax ? parseInt(heightMax) : null,
        education_levels: educationLevels ? educationLevels.split(',').map((s) => s.trim()) : null,
        occupations: occupations ? occupations.split(',').map((s) => s.trim()) : null,
        locations: locations ? locations.split(',').map((s) => s.trim()) : null,
      });
      await completeProfile();
    } catch {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await completeProfile();
    } catch {
      Alert.alert('Error', 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Partner Preferences</Text>
      <Text style={styles.step}>Step 8 of 8</Text>

      <Input label="Minimum Age" placeholder="21" value={ageMin} onChangeText={setAgeMin} keyboardType="numeric" />
      <Input label="Maximum Age" placeholder="35" value={ageMax} onChangeText={setAgeMax} keyboardType="numeric" />
      <Input label="Minimum Height (cm)" placeholder="150" value={heightMin} onChangeText={setHeightMin} keyboardType="numeric" />
      <Input label="Maximum Height (cm)" placeholder="185" value={heightMax} onChangeText={setHeightMax} keyboardType="numeric" />
      <Input label="Education Levels" placeholder="Masters, PhD (comma separated)" value={educationLevels} onChangeText={setEducationLevels} />
      <Input label="Occupations" placeholder="Engineer, Doctor (comma separated)" value={occupations} onChangeText={setOccupations} />
      <Input label="Preferred Locations" placeholder="Mumbai, Delhi (comma separated)" value={locations} onChangeText={setLocations} />

      <Button title="Complete Profile" onPress={handleSave} loading={loading} />
      <Button title="Skip" variant="outline" onPress={handleSkip} style={styles.skip} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  step: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  skip: { marginTop: spacing.sm },
});
