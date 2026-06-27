import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, Input, Card, StepNavigation } from '../../components';
import { authApi } from '../../api/auth';
import { verificationApi } from '../../api/verification';
import { profilesApi } from '../../api/profiles';
import { useAuth, useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface VerificationScreenProps {
  navigation?: { navigate: (screen: string) => void; goBack: () => void };
}

export function VerificationScreen({ navigation }: VerificationScreenProps) {
  const { user, logout } = useAuth();
  const { profile, refreshProfile } = useProfile();

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [completing, setCompleting] = useState(false);

  const handleSendEmailOtp = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email address found on your account.');
      return;
    }
    setEmailLoading(true);
    try {
      await authApi.sendOtp({ email: user.email, channel: 'email' });
      setEmailOtpSent(true);
      Alert.alert('OTP Sent', `A verification code has been sent to ${user.email}`);
    } catch {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.email || !emailCode) return;
    setEmailLoading(true);
    try {
      await authApi.verifyOtp({ email: user.email, code: emailCode });
      if (profile) {
        await verificationApi.email({ profile_id: profile.id });
      }
      setEmailVerified(true);
      Alert.alert('Verified', 'Email verified successfully!');
    } catch {
      Alert.alert('Error', 'Invalid or expired verification code.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!user?.phone) {
      Alert.alert('Error', 'No phone number found on your account.');
      return;
    }
    setPhoneLoading(true);
    try {
      await authApi.sendOtp({ phone: user.phone, channel: 'sms' });
      setPhoneOtpSent(true);
      Alert.alert('OTP Sent', `A verification code has been sent to ${user.phone}`);
    } catch {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!user?.phone || !phoneCode) return;
    setPhoneLoading(true);
    try {
      await authApi.verifyOtp({ phone: user.phone, code: phoneCode });
      if (profile) {
        await verificationApi.phone({ profile_id: profile.id });
      }
      setPhoneVerified(true);
      Alert.alert('Verified', 'Phone verified successfully!');
    } catch {
      Alert.alert('Error', 'Invalid or expired verification code.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Exit Verification',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ],
    );
  };

  const handleCompleteProfile = async () => {
    if (!profile) return;

    const hasEmail = !!user?.email;
    const hasPhone = !!user?.phone;

    if (hasEmail && !emailVerified) {
      Alert.alert('Verification Required', 'Please verify your email address before continuing.');
      return;
    }
    if (hasPhone && !phoneVerified) {
      Alert.alert('Verification Required', 'Please verify your phone number before continuing.');
      return;
    }
    if (!hasEmail && !hasPhone) {
      Alert.alert('Error', 'At least one contact method (email or phone) is required.');
      return;
    }

    setCompleting(true);
    try {
      await profilesApi.update(profile.id, {
        profile_status: 'active',
        email_verified: emailVerified,
        phone_verified: phoneVerified,
      });
      await refreshProfile(profile.id);
    } catch {
      Alert.alert('Error', 'Failed to complete profile. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {navigation && <StepNavigation screenName="ProfileVerification" navigation={navigation} />}

      <Text style={styles.title}>Verify Your Identity</Text>
      {!navigation && (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.hint}>
        Verify your email and phone number to complete your profile. Your profile must be verified before you can view or connect with other profiles.
      </Text>

      {user?.email ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Email Verification</Text>
          <Text style={styles.contactValue}>{user.email}</Text>

          {emailVerified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : !emailOtpSent ? (
            <Button title="Send Verification Code" onPress={handleSendEmailOtp} loading={emailLoading} />
          ) : (
            <View>
              <Input
                label="Enter verification code"
                placeholder="123456"
                value={emailCode}
                onChangeText={setEmailCode}
                keyboardType="numeric"
                maxLength={6}
              />
              <Button title="Verify Email" onPress={handleVerifyEmail} loading={emailLoading} />
              <Button title="Resend Code" variant="outline" onPress={handleSendEmailOtp} style={styles.resendBtn} />
            </View>
          )}
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Email Verification</Text>
          <Text style={styles.notAvailable}>No email address on account. Add one in account settings.</Text>
        </Card>
      )}

      {user?.phone ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Phone Verification</Text>
          <Text style={styles.contactValue}>{user.phone}</Text>

          {phoneVerified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : !phoneOtpSent ? (
            <Button title="Send Verification Code" onPress={handleSendPhoneOtp} loading={phoneLoading} />
          ) : (
            <View>
              <Input
                label="Enter verification code"
                placeholder="123456"
                value={phoneCode}
                onChangeText={setPhoneCode}
                keyboardType="numeric"
                maxLength={6}
              />
              <Button title="Verify Phone" onPress={handleVerifyPhone} loading={phoneLoading} />
              <Button title="Resend Code" variant="outline" onPress={handleSendPhoneOtp} style={styles.resendBtn} />
            </View>
          )}
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Phone Verification</Text>
          <Text style={styles.notAvailable}>No phone number on account. Add one in account settings.</Text>
        </Card>
      )}

      <Button
        title="Complete Profile"
        onPress={handleCompleteProfile}
        loading={completing}
        disabled={
          (!!user?.email && !emailVerified) ||
          (!!user?.phone && !phoneVerified) ||
          (!user?.email && !user?.phone)
        }
        style={styles.completeBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  step: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  hint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  contactValue: { ...typography.body, color: colors.primary, marginBottom: spacing.md },
  verifiedBadge: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifiedText: { ...typography.body, color: colors.white, fontWeight: '600' },
  notAvailable: { ...typography.bodySmall, color: colors.textLight },
  resendBtn: { marginTop: spacing.sm },
  completeBtn: { marginTop: spacing.lg },
  logoutBtn: { alignSelf: 'flex-end', marginBottom: spacing.md, paddingVertical: spacing.sm },
  logoutText: { ...typography.bodySmall, color: colors.error, fontWeight: '600' },
});
