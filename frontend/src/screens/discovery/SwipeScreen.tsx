import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Card, LoadingScreen } from '../../components';
import { searchApi } from '../../api/search';
import { connectionsApi } from '../../api/connections';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';


interface SwipeScreenProps {
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
}

interface MatchProfile {
  profile_id: string;
  display_name?: string;
  gender?: string;
  age?: number;
  city?: string;
  occupation?: string;
  education_level?: string;
}

export function SwipeScreen({ navigation }: SwipeScreenProps) {
  const { profile } = useProfile();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) loadMatches();
    else setLoading(false);
  }, [profile]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const { data } = await searchApi.recommended({ profile_id: profile?.id });
      setMatches(Array.isArray(data) ? data : data.results || []);
    } catch {
      // Silently fail - empty state will show
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!profile || !matches[currentIndex]) return;
    try {
      await connectionsApi.send({
        from_profile_id: profile.id,
        to_profile_id: matches[currentIndex].profile_id,
      });
      nextCard();
    } catch {
      Alert.alert('Error', 'Failed to send connection request');
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) return <LoadingScreen />;

  const current = matches[currentIndex];

  if (!current) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No More Profiles</Text>
        <Text style={styles.emptyText}>Check back later for new matches</Text>
        <Button title="Refresh" onPress={loadMatches} style={styles.refreshBtn} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{current.display_name || 'Profile'}</Text>
          <Text style={styles.details}>
            {current.age ? `${current.age} yrs` : ''}{current.city ? ` • ${current.city}` : ''}
          </Text>
          {current.occupation && <Text style={styles.occupation}>{current.occupation}</Text>}
          {current.education_level && <Text style={styles.education}>{current.education_level}</Text>}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button title="Skip" variant="outline" onPress={nextCard} style={styles.actionBtn} />
        <Button title="Connect" onPress={handleConnect} style={styles.actionBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  card: { flex: 1, marginBottom: spacing.lg, justifyContent: 'flex-end' },
  profileInfo: { padding: spacing.md },
  name: { ...typography.h2, color: colors.text },
  details: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  occupation: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  education: { ...typography.bodySmall, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary },
  refreshBtn: { marginTop: spacing.lg },
});
