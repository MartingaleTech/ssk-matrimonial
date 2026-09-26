import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, ScreenContainer } from '../../components';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface ForgotPasswordScreenProps {
  navigation: { goBack: () => void };
}

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setCodeSent(true);
      Alert.alert('Code Sent', 'If an account exists, a reset code has been sent.');
    } catch {
      Alert.alert('Error', 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Enter the code you received');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid or expired code';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {codeSent
              ? `Enter the code sent to ${email} and choose a new password`
              : "We'll send a one-time code to your registered email"}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!codeSent}
          />
          {codeSent && (
            <>
              <Input
                label="Code"
                placeholder="6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
              <Input
                label="New Password"
                placeholder="At least 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </>
          )}
          <Button
            title={codeSent ? 'Reset Password' : 'Send Code'}
            onPress={codeSent ? handleReset : handleSendCode}
            loading={loading}
            disabled={loading}
          />
          {codeSent && (
            <Button title="Resend Code" variant="outline" onPress={handleSendCode} disabled={loading} />
          )}
        </View>

        <TouchableOpacity style={styles.toggle} onPress={() => navigation.goBack()}>
          <Text style={styles.toggleText}>
            Remembered it? <Text style={styles.toggleLink}>Back to Login</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: { marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary },
  form: { gap: spacing.sm },
  toggle: { marginTop: spacing.lg, alignItems: 'center' },
  toggleText: { ...typography.body, color: colors.textSecondary },
  toggleLink: { color: colors.primary, fontWeight: '600' },
});
