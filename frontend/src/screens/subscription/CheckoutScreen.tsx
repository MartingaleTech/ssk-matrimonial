import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Card, ScreenContainer } from '../../components';
import { subscriptionsApi, PlanCode } from '../../api/subscriptions';
import { paymentsApi } from '../../api/payments';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';
import { formatPrice } from './formatPrice';

interface CheckoutScreenProps {
  route: {
    params: {
      planCode: PlanCode;
      planName: string;
      amount: number;
      currency: string;
    };
  };
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

export function CheckoutScreen({ route, navigation }: CheckoutScreenProps) {
  const { planCode, planName, amount, currency } = route.params;
  const { profile } = useProfile();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!profile) return;
    setProcessing(true);
    try {
      const { data } = await subscriptionsApi.checkout({
        profile_id: profile.id,
        plan_code: planCode,
      });
      const outcome = await paymentsApi.pay(data);

      if (outcome.status === 'completed') {
        Alert.alert(
          'Payment received',
          'Your subscription activates as soon as the payment is confirmed.',
          [{ text: 'OK', onPress: () => navigation.navigate('ManageSubscription') }],
        );
      } else if (outcome.status === 'cancelled') {
        Alert.alert('Payment not completed', outcome.message ?? 'You cancelled the payment.');
      } else {
        Alert.alert('Payment failed', outcome.message ?? 'Please try another payment method.');
      }
    } catch {
      Alert.alert('Error', 'Could not start checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Checkout</Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Plan</Text>
            <Text style={styles.value}>{planName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Billed monthly</Text>
            <Text style={styles.value}>{formatPrice(amount, currency)}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Payment methods</Text>
          <Text style={styles.info}>
            {currency === 'INR'
              ? 'UPI, netbanking and cards are available through Razorpay.'
              : 'Cards, Apple Pay and ACH bank debit are available through Stripe.'}
          </Text>
        </Card>

        <Button
          title={`Pay ${formatPrice(amount, currency)}`}
          onPress={handlePay}
          loading={processing}
        />
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.cancel}
        />
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
  info: { ...typography.bodySmall, color: colors.textSecondary },
  cancel: { marginTop: spacing.sm },
});
