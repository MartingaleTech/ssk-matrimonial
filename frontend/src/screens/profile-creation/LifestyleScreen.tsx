import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input } from '../../components';
import { profilesApi } from '../../api/profiles';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface LifestyleScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function LifestyleScreen({ navigation }: LifestyleScreenProps) {
  const { profile } = useProfile();
  const [diet, setDiet] = useState('');
  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await profilesApi.updateLifestyle(profile.id, {
        diet,
        smoking,
        drinking,
        hobbies: hobbies ? hobbies.split(',').map((h) => h.trim()) : [],
      });
      navigation.navigate('ProfileLocation');
    } catch {
      Alert.alert('Error', 'Failed to save lifestyle info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Lifestyle</Text>
      <Text style={styles.step}>Step 4 of 8</Text>

      <Input label="Diet" placeholder="vegetarian / non_vegetarian / vegan" value={diet} onChangeText={setDiet} />
      <Input label="Smoking" placeholder="never / occasionally / regularly" value={smoking} onChangeText={setSmoking} />
      <Input label="Drinking" placeholder="never / occasionally / regularly" value={drinking} onChangeText={setDrinking} />
      <Input label="Hobbies" placeholder="reading, cooking, travel (comma separated)" value={hobbies} onChangeText={setHobbies} />

      <Button title="Next" onPress={handleNext} loading={loading} />
      <Button title="Skip" variant="outline" onPress={() => navigation.navigate('ProfileLocation')} style={styles.skip} />
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
