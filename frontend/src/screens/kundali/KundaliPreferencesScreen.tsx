import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Button, Input, Card } from '../../components';
import { kundaliApi } from '../../api/kundali';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

export function KundaliPreferencesScreen() {
  const { profile } = useProfile();
  const [requireMatch, setRequireMatch] = useState(false);
  const [minScore, setMinScore] = useState('18');
  const [preferredRashi, setPreferredRashi] = useState('');
  const [preferredNakshatra, setPreferredNakshatra] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await kundaliApi.updatePreferences(profile.id, {
        require_kundali_match: requireMatch,
        minimum_guna_score: minScore ? parseInt(minScore) : 18,
        preferred_rashi: preferredRashi ? preferredRashi.split(',').map((s) => s.trim()) : [],
        preferred_nakshatra: preferredNakshatra ? preferredNakshatra.split(',').map((s) => s.trim()) : [],
      });
      Alert.alert('Saved', 'Kundali preferences updated');
    } catch {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kundali Preferences</Text>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Require Kundali Match</Text>
          <Switch value={requireMatch} onValueChange={setRequireMatch} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <Input label="Minimum Guna Score (out of 36)" placeholder="18" value={minScore} onChangeText={setMinScore} keyboardType="numeric" />
      <Input label="Preferred Rashi" placeholder="Mesha, Vrishabha (comma separated)" value={preferredRashi} onChangeText={setPreferredRashi} />
      <Input label="Preferred Nakshatra" placeholder="Ashwini, Bharani (comma separated)" value={preferredNakshatra} onChangeText={setPreferredNakshatra} />

      <Button title="Save Preferences" onPress={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.body, color: colors.text },
});
