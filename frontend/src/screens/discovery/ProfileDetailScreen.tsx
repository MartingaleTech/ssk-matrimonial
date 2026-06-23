import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Avatar, LoadingScreen } from '../../components';
import { profilesApi, Profile } from '../../api/profiles';
import { connectionsApi } from '../../api/connections';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface ProfileDetailScreenProps {
  [key: string]: any;
  route: { params: { profileId: string } };
  navigation: { goBack: () => void };
}

export function ProfileDetailScreen({ route, navigation }: ProfileDetailScreenProps) {
  const { profileId } = route.params;
  const { profile: myProfile } = useProfile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profilesApi.get(profileId)
      .then(({ data }) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleConnect = async () => {
    if (!myProfile) return;
    try {
      await connectionsApi.send({
        from_profile_id: myProfile.id,
        to_profile_id: profileId,
      });
    } catch { /* silent */ }
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

      {profileId !== myProfile?.id && (
        <Button title="Send Connection Request" onPress={handleConnect} />
      )}
    </ScrollView>
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
});
