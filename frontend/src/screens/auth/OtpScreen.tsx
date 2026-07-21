import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Button, ScreenContainer } from '../../components';
import { authApi } from '../../api/auth';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface OtpScreenProps {
  [key: string]: any;
  route: { params: { userId: string; channel: string; destination: string } };
  navigation: { goBack: () => void };
}

export function OtpScreen({ route, navigation }: OtpScreenProps) {
  const { userId, channel, destination } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }
    setLoading(true);
    try {
      const verifyData = channel === 'email'
        ? { email: destination, code }
        : { phone: destination, code };
      await authApi.verifyOtp(verifyData);
      Alert.alert('Success', 'Verification complete');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const sendData = channel === 'email'
        ? { email: destination, channel }
        : { phone: destination, channel };
      await authApi.sendOtp(sendData);
      Alert.alert('OTP Sent', 'A new OTP has been sent');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <ScreenContainer style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {destination}
      </Text>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputs.current[index] = ref; }}
            style={[styles.otpInput, digit ? styles.otpFilled : null]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <Button title="Verify" onPress={handleVerify} loading={loading} />
      <Button title="Resend OTP" variant="outline" onPress={handleResend} style={styles.resend} />
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  otpFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  resend: {
    marginTop: spacing.md,
  },
});
