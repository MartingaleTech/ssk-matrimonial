import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, ScreenContainer } from '../../components';
import { colors, spacing, typography } from '../../theme';

interface AccountSetupChoiceScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function AccountSetupChoiceScreen({ navigation }: AccountSetupChoiceScreenProps) {
  return (
    <ScreenContainer style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>Setup Your Account</Text>
      <Text style={styles.subtitle}>How would you like to get started?</Text>

      <TouchableOpacity onPress={() => navigation.navigate('ProfileBasicInfo')}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Create My Profile</Text>
          <Text style={styles.cardDesc}>I am looking for a match for myself</Text>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ProfileBasicInfo')}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Create Profile for Family Member</Text>
          <Text style={styles.cardDesc}>I am helping a family member find a match</Text>
        </Card>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
