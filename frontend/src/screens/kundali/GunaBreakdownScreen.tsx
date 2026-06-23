import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, LoadingScreen } from '../../components';
import { kundaliApi, GunaMatchResult } from '../../api/kundali';
import { useProfile } from '../../context';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface GunaBreakdownScreenProps {
  route?: { params?: { matchId?: string; profile2Id?: string } };
}

export function GunaBreakdownScreen({ route }: GunaBreakdownScreenProps) {
  const { profile } = useProfile();
  const [matches, setMatches] = useState<GunaMatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      kundaliApi.getMatch(profile.id)
        .then(({ data }) => setMatches(Array.isArray(data) ? data : [data]))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profile]);

  if (loading) return <LoadingScreen />;

  const gunaLabels: Record<string, { label: string; max: number }> = {
    varna: { label: 'Varna', max: 1 },
    vashya: { label: 'Vashya', max: 2 },
    tara: { label: 'Tara', max: 3 },
    yoni: { label: 'Yoni', max: 4 },
    graha_maitri: { label: 'Graha Maitri', max: 5 },
    gana: { label: 'Gana', max: 6 },
    bhakoot: { label: 'Bhakoot', max: 7 },
    nadi: { label: 'Nadi', max: 8 },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Guna Match Breakdown</Text>

      {matches.length === 0 ? (
        <Text style={styles.empty}>No match results available yet.</Text>
      ) : (
        matches.map((match) => (
          <Card key={match.id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.score}>{match.guna_total_score}/36</Text>
              <Text style={styles.quality}>{match.match_quality}</Text>
            </View>

            {match.guna_breakdown && Object.entries(match.guna_breakdown).map(([key, score]) => {
              const info = gunaLabels[key];
              if (!info) return null;
              return (
                <View key={key} style={styles.gunaRow}>
                  <Text style={styles.gunaLabel}>{info.label}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${(score / info.max) * 100}%` }]} />
                  </View>
                  <Text style={styles.gunaScore}>{score}/{info.max}</Text>
                </View>
              );
            })}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  score: { ...typography.h2, color: colors.primary },
  quality: { ...typography.body, color: colors.textSecondary, textTransform: 'capitalize' },
  gunaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  gunaLabel: { ...typography.bodySmall, color: colors.text, width: 90 },
  barBg: { flex: 1, height: 8, backgroundColor: colors.surface, borderRadius: 4, marginHorizontal: spacing.sm },
  barFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  gunaScore: { ...typography.caption, color: colors.textSecondary, width: 30, textAlign: 'right' },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
