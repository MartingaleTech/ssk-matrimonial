import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from '../../components';
import { colors, spacing, typography } from '../../theme';

interface WelcomeScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>SSK Matrimony</Text>
        <Text style={styles.subtitle}>
          Find your perfect match within the SSK community
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Login"
          onPress={() => navigation.navigate('Login')}
        />
        <Button
          title="Create Account"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={styles.registerBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xxl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  registerBtn: {
    marginTop: spacing.sm,
  },
});
