import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input, Card } from '../../components';
import { preferencesApi } from '../../api/preferences';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface EditPreferencesScreenProps {
  navigation: { goBack: () => void };
}

export function EditPreferencesScreen({ navigation }: EditPreferencesScreenProps) {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [heightMin, setHeightMin] = useState('');
  const [heightMax, setHeightMax] = useState('');
  const [maritalStatusAllowed, setMaritalStatusAllowed] = useState('');
  const [educationLevels, setEducationLevels] = useState('');
  const [occupations, setOccupations] = useState('');
  const [locations, setLocations] = useState('');
  const [dietPreferences, setDietPreferences] = useState('');
  const [smokingPreference, setSmokingPreference] = useState('');
  const [drinkingPreference, setDrinkingPreference] = useState('');

  useEffect(() => {
    if (profile) loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const loadPreferences = async () => {
    if (!profile) return;
    setLoadingData(true);
    try {
      const { data } = await preferencesApi.get(profile.id);
      setAgeMin(data.age_min != null ? String(data.age_min) : '');
      setAgeMax(data.age_max != null ? String(data.age_max) : '');
      setHeightMin(data.height_min_cm != null ? String(data.height_min_cm) : '');
      setHeightMax(data.height_max_cm != null ? String(data.height_max_cm) : '');
      setMaritalStatusAllowed(data.marital_status_allowed?.join(', ') || '');
      setEducationLevels(data.education_levels?.join(', ') || '');
      setOccupations(data.occupations?.join(', ') || '');
      setLocations(data.locations?.join(', ') || '');
      setDietPreferences(data.diet_preferences?.join(', ') || '');
      setSmokingPreference(data.smoking_preference || '');
      setDrinkingPreference(data.drinking_preference || '');
    } catch {
      Alert.alert('Error', 'Failed to load preferences');
    } finally {
      setLoadingData(false);
    }
  };

  const parseList = (value: string): string[] | null => {
    if (!value.trim()) return null;
    return value.split(',').map((s) => s.trim()).filter(Boolean);
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
        marital_status_allowed: parseList(maritalStatusAllowed),
        education_levels: parseList(educationLevels),
        occupations: parseList(occupations),
        locations: parseList(locations),
        diet_preferences: parseList(dietPreferences),
        smoking_preference: smokingPreference || null,
        drinking_preference: drinkingPreference || null,
      });
      Alert.alert('Success', 'Preferences updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Age & Height</Text>
        <Input label="Minimum Age" placeholder="21" value={ageMin} onChangeText={setAgeMin} keyboardType="numeric" />
        <Input label="Maximum Age" placeholder="35" value={ageMax} onChangeText={setAgeMax} keyboardType="numeric" />
        <Input label="Minimum Height (cm)" placeholder="150" value={heightMin} onChangeText={setHeightMin} keyboardType="numeric" />
        <Input label="Maximum Height (cm)" placeholder="185" value={heightMax} onChangeText={setHeightMax} keyboardType="numeric" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Background</Text>
        <Input label="Marital Status" placeholder="never_married, divorced (comma separated)" value={maritalStatusAllowed} onChangeText={setMaritalStatusAllowed} />
        <Input label="Education Levels" placeholder="Masters, PhD (comma separated)" value={educationLevels} onChangeText={setEducationLevels} />
        <Input label="Occupations" placeholder="Engineer, Doctor (comma separated)" value={occupations} onChangeText={setOccupations} />
        <Input label="Preferred Locations" placeholder="Mumbai, Delhi (comma separated)" value={locations} onChangeText={setLocations} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Lifestyle</Text>
        <Input label="Diet Preferences" placeholder="vegetarian, vegan (comma separated)" value={dietPreferences} onChangeText={setDietPreferences} />
        <Input label="Smoking Preference" placeholder="never / occasionally / no_preference" value={smokingPreference} onChangeText={setSmokingPreference} />
        <Input label="Drinking Preference" placeholder="never / occasionally / no_preference" value={drinkingPreference} onChangeText={setDrinkingPreference} />
      </Card>

      <Button title="Save Preferences" onPress={handleSave} loading={loading} />
      <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.cancelBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  cancelBtn: { marginTop: spacing.sm, marginBottom: spacing.lg },
});
