import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input } from '../../components';
import { profilesApi } from '../../api/profiles';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface LocationScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function LocationScreen({ navigation }: LocationScreenProps) {
  const { profile } = useProfile();
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await profilesApi.updateLocation(profile.id, {
        country,
        state,
        city,
        pincode,
      });
      navigation.navigate('ProfileKundaliInput');
    } catch {
      Alert.alert('Error', 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Location</Text>
      <Text style={styles.step}>Step 5 of 9</Text>

      <Input label="Country" placeholder="India" value={country} onChangeText={setCountry} />
      <Input label="State" placeholder="Your state" value={state} onChangeText={setState} />
      <Input label="City" placeholder="Your city" value={city} onChangeText={setCity} />
      <Input label="Pincode" placeholder="560001" value={pincode} onChangeText={setPincode} keyboardType="numeric" />

      <Button title="Next" onPress={handleNext} loading={loading} />
      <Button title="Skip" variant="outline" onPress={() => navigation.navigate('ProfileKundaliInput')} style={styles.skip} />
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
