import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Avatar, Button, LoadingScreen } from '../../components';
import { kundaliApi } from '../../api/kundali';
import { useProfile } from '../../context';
import { useEntitlements } from '../../hooks';
import { colors, spacing, typography } from '../../theme';

interface KundaliCompatibleMatchesScreenProps {
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
}

interface KundaliMatch {
  profile_id: string;
  display_name?: string;
  rashi?: string;
  nakshatra?: string;
  guna_total_score?: number;
  manglik_status?: string;
}

export function KundaliCompatibleMatchesScreen({ navigation }: KundaliCompatibleMatchesScreenProps) {
  const { profile } = useProfile();
  const { entitlements, loading: entitlementsLoading } = useEntitlements();
  const [matches, setMatches] = useState<KundaliMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const canUseKundaliMatching = entitlements.can_use_kundali_matching;

  useEffect(() => {
    if (entitlementsLoading) return;
    if (!profile || !canUseKundaliMatching) {
      setLoading(false);
      return;
    }
    kundaliApi.searchByKundali({ profile_id: profile.id })
      .then(({ data }) => setMatches(Array.isArray(data) ? data : data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile, canUseKundaliMatching, entitlementsLoading]);

  if (loading || entitlementsLoading) return <LoadingScreen />;

  if (!canUseKundaliMatching) {
    return (
      <View style={styles.upgrade}>
        <Text style={styles.title}>Kundali matching is a premium feature</Text>
        <Text style={styles.meta}>
          Upgrade to Premium to see guna scores and Kundali compatible matches.
        </Text>
        <Button title="See Premium plans" onPress={() => navigation.navigate('Plans')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kundali Compatible Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.profile_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail', { profileId: item.profile_id })}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <Avatar name={item.display_name} size={48} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.display_name || 'Profile'}</Text>
                  <Text style={styles.meta}>
                    {item.rashi}{item.nakshatra ? ` • ${item.nakshatra}` : ''}
                  </Text>
                </View>
                {item.guna_total_score !== undefined && (
                  <View style={styles.score}>
                    <Text style={styles.scoreText}>{item.guna_total_score}/36</Text>
                  </View>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No kundali-compatible matches found. Ensure your kundali is generated.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  upgrade: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.body, fontWeight: '600', color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  score: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12 },
  scoreText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
