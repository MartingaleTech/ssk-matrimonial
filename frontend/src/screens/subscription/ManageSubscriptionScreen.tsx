import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Card, LoadingScreen, ScreenContainer } from '../../components';
import { subscriptionsApi } from '../../api/subscriptions';
import { useProfile } from '../../context';
import { useEntitlements } from '../../hooks';
import { colors, spacing, typography } from '../../theme';

interface ManageSubscriptionScreenProps {
  navigation: { navigate: (screen: string) => void };
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : '—';
}

export function ManageSubscriptionScreen({ navigation }: ManageSubscriptionScreenProps) {
  const { profile } = useProfile();
  const { entitlements, subscription, loading, refresh } = useEntitlements();
  const [cancelling, setCancelling] = useState(false);

  const performCancel = async () => {
    if (!profile) return;
    setCancelling(true);
    try {
      await subscriptionsApi.cancel(profile.id);
      await refresh();
    } catch {
      Alert.alert('Error', 'Could not cancel the subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel subscription',
      'You will keep premium features until the end of the current period.',
      [
        { text: 'Keep plan' },
        { text: 'Cancel plan', style: 'destructive', onPress: () => { performCancel(); } },
      ],
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Manage Subscription</Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Plan</Text>
            <Text style={styles.value}>{entitlements.plan}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{subscription?.status ?? 'none'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Free trial</Text>
            <Text style={styles.value}>{entitlements.is_free_trial ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Renews / ends</Text>
            <Text style={styles.value}>
              {formatDate(subscription?.current_period_end ?? null)}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Included</Text>
          <Text style={styles.feature}>• {entitlements.photo_limit} profile photos</Text>
          <Text style={styles.feature}>
            • Favorites: {entitlements.can_favorite ? 'included' : 'premium only'}
          </Text>
          <Text style={styles.feature}>
            • Kundali matching:{' '}
            {entitlements.can_use_kundali_matching ? 'included' : 'premium only'}
          </Text>
        </Card>

        {entitlements.plan === 'premium' ? (
          <Button
            title="Cancel Subscription"
            variant="outline"
            onPress={handleCancel}
            loading={cancelling}
          />
        ) : (
          <Button title="Upgrade to Premium" onPress={() => navigation.navigate('Plans')} />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.body, color: colors.text },
  feature: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});
