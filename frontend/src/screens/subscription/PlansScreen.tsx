import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, LoadingScreen, ScreenContainer } from '../../components';
import { subscriptionsApi, PlanCode, SubscriptionPlan } from '../../api/subscriptions';
import { useEntitlements } from '../../hooks';
import { colors, spacing, typography } from '../../theme';
import { formatPrice } from './formatPrice';

interface PlansScreenProps {
  navigation: { navigate: (screen: string, params?: object) => void };
}

const FEATURE_LABELS: Record<PlanCode, string[]> = {
  basic: ['5 profile photos', 'Search and connections', 'Chat with connections'],
  premium: [
    '10 profile photos',
    'Favorite profiles',
    'Kundali matching and compatible matches',
    'Everything in Basic',
  ],
};

export function PlansScreen({ navigation }: PlansScreenProps) {
  const { entitlements, country, loading: entitlementsLoading } = useEntitlements();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entitlementsLoading) return;
    subscriptionsApi
      .plans(country ?? undefined)
      .then(({ data }) => {
        setPlans(data.plans);
        setCurrency(data.currency);
      })
      .catch(() => setError('Could not load plans. Please try again.'))
      .finally(() => setLoading(false));
  }, [country, entitlementsLoading]);

  if (loading || entitlementsLoading) return <LoadingScreen />;

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose your plan</Text>
        <Text style={styles.subtitle}>
          Prices are shown in {currency} for your region.
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}

        {plans.map((plan) => {
          const isCurrent = entitlements.plan === plan.code;
          return (
            <Card key={plan.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {plan.price && (
                  <Text style={styles.price}>
                    {formatPrice(plan.price.amount, plan.price.currency)}
                    <Text style={styles.interval}>/{plan.price.interval}</Text>
                  </Text>
                )}
              </View>

              {(FEATURE_LABELS[plan.code] ?? []).map((feature) => (
                <Text key={feature} style={styles.feature}>
                  • {feature}
                </Text>
              ))}

              {isCurrent ? (
                <Text style={styles.currentLabel}>
                  Current plan{entitlements.is_free_trial ? ' (free trial)' : ''}
                </Text>
              ) : (
                <Button
                  title={`Choose ${plan.name}`}
                  onPress={() =>
                    navigation.navigate('Checkout', {
                      planCode: plan.code,
                      planName: plan.name,
                      amount: plan.price?.amount ?? 0,
                      currency: plan.price?.currency ?? currency,
                    })
                  }
                  style={styles.cta}
                />
              )}
            </Card>
          );
        })}

        <Text style={styles.note}>
          On the iOS App Store, digital subscriptions must be sold through Apple
          In-App Purchase. Apple Pay via Stripe applies to the web and Android
          checkout flows.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { ...typography.h3, color: colors.text },
  price: { ...typography.h3, color: colors.primary },
  interval: { ...typography.bodySmall, color: colors.textSecondary },
  feature: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  currentLabel: { ...typography.body, color: colors.success, marginTop: spacing.md },
  cta: { marginTop: spacing.md },
  error: { ...typography.body, color: colors.error, marginBottom: spacing.md },
  note: { ...typography.bodySmall, color: colors.textLight, marginTop: spacing.lg },
});
