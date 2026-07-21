import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, Avatar, LoadingScreen } from '../../components';
import { profilesApi, Profile } from '../../api/profiles';
import { connectionsApi, Connection } from '../../api/connections';
import { useProfile } from '../../context';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface ProfileDetailScreenProps {
  [key: string]: any;
  route: { params: { profileId: string } };
  navigation: { goBack: () => void };
}

export function ProfileDetailScreen({ route }: ProfileDetailScreenProps) {
  const { profileId } = route.params;
  const { profile: myProfile } = useProfile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnProfile = profileId === myProfile?.id;

  const loadConnection = useCallback(async () => {
    if (!myProfile || isOwnProfile) {
      setConnection(null);
      return;
    }
    try {
      const { data } = await connectionsApi.list({ profile_id: myProfile.id });
      const list = Array.isArray(data) ? data : [];
      const match = list.find(
        (c) =>
          (c.from_profile_id === myProfile.id && c.to_profile_id === profileId) ||
          (c.to_profile_id === myProfile.id && c.from_profile_id === profileId),
      );
      setConnection(match ?? null);
    } catch {
      setConnection(null);
    }
  }, [myProfile, profileId, isOwnProfile]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      profilesApi
        .get(profileId)
        .then(({ data }) => setProfile(data))
        .catch(() => {}),
      loadConnection(),
    ]).finally(() => setLoading(false));
  }, [profileId, loadConnection]);

  const runAction = async (
    fn: () => Promise<unknown>,
    errorMsg: string,
  ) => {
    if (!myProfile) return;
    setActionLoading(true);
    try {
      await fn();
      await loadConnection();
    } catch {
      Alert.alert('Error', errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnect = () =>
    runAction(
      () =>
        connectionsApi.send({
          from_profile_id: myProfile!.id,
          to_profile_id: profileId,
        }),
      'Failed to send connection request',
    );

  const handleAccept = () =>
    runAction(
      () => connectionsApi.accept(connection!.id, { profile_id: myProfile!.id }),
      'Failed to accept connection',
    );

  const handleReject = () =>
    runAction(
      () => connectionsApi.reject(connection!.id, { profile_id: myProfile!.id }),
      'Failed to reject connection',
    );

  const handleCancel = () =>
    runAction(
      () => connectionsApi.cancel(connection!.id, { profile_id: myProfile!.id }),
      'Failed to cancel request',
    );

  const handleResend = () =>
    runAction(
      () => connectionsApi.resend(connection!.id, { profile_id: myProfile!.id }),
      'Failed to resend request',
    );

  const renderConnectionAction = () => {
    if (isOwnProfile) return null;

    const isSender = connection?.from_profile_id === myProfile?.id;

    if (!connection) {
      return <Button title="Send Connection Request" onPress={handleConnect} loading={actionLoading} />;
    }

    switch (connection.status) {
      case 'pending':
        return isSender ? (
          <View>
            <StatusBadge label="Request Sent" tone="pending" />
            <Button title="Cancel Request" variant="outline" onPress={handleCancel} loading={actionLoading} style={styles.spaced} />
          </View>
        ) : (
          <View>
            <StatusBadge label="Wants to connect with you" tone="pending" />
            <View style={styles.actionRow}>
              <Button title="Accept" onPress={handleAccept} loading={actionLoading} style={styles.actionBtn} />
              <Button title="Reject" variant="outline" onPress={handleReject} loading={actionLoading} style={styles.actionBtn} />
            </View>
          </View>
        );
      case 'accepted':
        return <StatusBadge label="Connected" tone="success" />;
      case 'rejected':
        return isSender ? (
          <View>
            <StatusBadge label="Request Declined" tone="error" />
            <Button title="Resend Request" onPress={handleResend} loading={actionLoading} style={styles.spaced} />
          </View>
        ) : (
          <StatusBadge label="You declined this request" tone="error" />
        );
      case 'cancelled':
        return isSender ? (
          <View>
            <StatusBadge label="Request Cancelled" tone="pending" />
            <Button title="Resend Request" onPress={handleResend} loading={actionLoading} style={styles.spaced} />
          </View>
        ) : (
          <StatusBadge label="Request was cancelled" tone="pending" />
        );
      default:
        return null;
    }
  };

  if (loading) return <LoadingScreen />;
  if (!profile) return <Text style={styles.error}>Profile not found</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar name={profile.display_name} size={80} />
        <Text style={styles.name}>{profile.display_name}</Text>
        <Text style={styles.meta}>
          {profile.gender} • {profile.height_cm}cm • {profile.marital_status}
        </Text>
      </View>

      {profile.about_me && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>{profile.about_me}</Text>
        </Card>
      )}

      {renderConnectionAction()}
    </ScrollView>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'pending' | 'success' | 'error' }) {
  const toneStyle =
    tone === 'success' ? styles.badgeSuccess : tone === 'error' ? styles.badgeError : styles.badgePending;
  return (
    <View style={[styles.badge, toneStyle]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  name: { ...typography.h2, color: colors.text, marginTop: spacing.md },
  meta: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  section: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  sectionText: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.body, color: colors.error, textAlign: 'center', marginTop: spacing.xxl },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1 },
  spaced: { marginTop: spacing.sm },
  badge: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  badgePending: { backgroundColor: colors.surface },
  badgeSuccess: { backgroundColor: colors.success },
  badgeError: { backgroundColor: colors.primaryLight },
  badgeText: { ...typography.body, fontWeight: '600', color: colors.text },
});
