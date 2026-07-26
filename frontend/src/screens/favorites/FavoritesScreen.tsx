import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Avatar, Button, Card, LoadingScreen, ScreenContainer } from '../../components';
import { favoritesApi, Favorite } from '../../api/favorites';
import { useProfile } from '../../context';
import { useEntitlements } from '../../hooks';
import { colors, spacing, typography } from '../../theme';

interface FavoritesScreenProps {
  navigation: { navigate: (screen: string, params?: object) => void };
}

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { profile } = useProfile();
  const { entitlements, loading: entitlementsLoading } = useEntitlements();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile || !entitlements.can_favorite) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await favoritesApi.list(profile.id);
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [profile, entitlements.can_favorite]);

  useEffect(() => {
    if (!entitlementsLoading) {
      load();
    }
  }, [entitlementsLoading, load]);

  if (entitlementsLoading || loading) return <LoadingScreen />;

  if (!entitlements.can_favorite) {
    return (
      <ScreenContainer>
        <View style={styles.upgrade}>
          <Text style={styles.title}>Favorites is a premium feature</Text>
          <Text style={styles.subtitle}>
            Upgrade to Premium to save profiles you like and revisit them anytime.
          </Text>
          <Button title="See Premium plans" onPress={() => navigation.navigate('Plans')} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={favorites}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.title}>Favorites</Text>}
        ListEmptyComponent={
          <Text style={styles.subtitle}>
            No favorites yet. Tap the favorite button on a profile to save it here.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ProfileDetail', { profileId: item.favorited_profile_id })
            }
          >
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <Avatar name={item.favorited_profile?.display_name ?? 'Profile'} size={48} />
                <View style={styles.cardText}>
                  <Text style={styles.name}>
                    {item.favorited_profile?.display_name ?? 'Profile'}
                  </Text>
                  {item.favorited_profile && (
                    <Text style={styles.meta}>
                      {item.favorited_profile.gender} • {item.favorited_profile.height_cm}cm •{' '}
                      {item.favorited_profile.marital_status}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  upgrade: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardText: { flex: 1 },
  name: { ...typography.h3, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
});
