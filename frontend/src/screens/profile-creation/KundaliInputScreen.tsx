import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input, StepNavigation } from '../../components';
import { kundaliApi } from '../../api/kundali';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface KundaliInputScreenProps {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

export function KundaliInputScreen({ navigation }: KundaliInputScreenProps) {
  const { profile } = useProfile();
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!profile || !birthDate || !birthTime || !birthPlace) {
      Alert.alert('Error', 'Please fill birth date, time, and place');
      return;
    }
    setLoading(true);
    try {
      await kundaliApi.generate({
        profile_id: profile.id,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_place: birthPlace,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        timezone: '+5:30',
      });
      navigation.navigate('ProfileKundaliSummary');
    } catch {
      Alert.alert('Error', 'Failed to generate kundali');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StepNavigation screenName="ProfileKundaliInput" navigation={navigation} />

      <Text style={styles.title}>Kundali Details</Text>

      <Input label="Birth Date" placeholder="YYYY-MM-DD" value={birthDate} onChangeText={setBirthDate} />
      <Input label="Birth Time" placeholder="HH:MM (24hr)" value={birthTime} onChangeText={setBirthTime} />
      <Input label="Birth Place" placeholder="City of birth" value={birthPlace} onChangeText={setBirthPlace} />
      <Input label="Latitude" placeholder="e.g. 19.076" value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" />
      <Input label="Longitude" placeholder="e.g. 72.877" value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" />

      <Button title="Generate Kundali" onPress={handleGenerate} loading={loading} />
      <Button title="Skip" variant="outline" onPress={() => navigation.navigate('ProfilePhotos')} style={styles.skip} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  skip: { marginTop: spacing.sm },
});
