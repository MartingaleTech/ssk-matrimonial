import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, LoadingScreen } from '../../components';
import { kundaliApi, KundaliData } from '../../api/kundali';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface KundaliSummaryScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function KundaliViewScreen({ navigation }: KundaliSummaryScreenProps) {
  const { profile } = useProfile();
  const [kundali, setKundali] = useState<KundaliData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      kundaliApi.get(profile.id)
        .then(({ data }) => setKundali(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profile]);

  if (loading) return <LoadingScreen />;

  if (!kundali) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Kundali Generated</Text>
        <Text style={styles.emptyText}>Generate your kundali to see astrological details and compatibility scores.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kundali Summary</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Core Details</Text>
        <Row label="Rashi" value={kundali.rashi} />
        <Row label="Nakshatra" value={kundali.nakshatra} />
        <Row label="Lagna" value={kundali.lagna} />
        <Row label="Manglik Status" value={kundali.manglik_status} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Birth Details</Text>
        <Row label="Date" value={kundali.birth_date} />
        <Row label="Time" value={kundali.birth_time} />
        <Row label="Place" value={kundali.birth_place} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Source</Text>
        <Row label="Generated" value={kundali.kundali_generated ? 'Yes' : 'No'} />
        <Row label="Source" value={kundali.kundali_source} />
      </Card>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.body, color: colors.text, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
