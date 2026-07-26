import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  LoadingScreen,
  PhotoGallery,
  ScreenContainer,
} from '../../components';
import { profilesApi, Profile } from '../../api/profiles';
import { photosApi, Photo } from '../../api/photos';
import { useEntitlements } from '../../hooks';
import { colors, spacing, typography } from '../../theme';

interface MyProfileScreenProps {
  navigation: { navigate: (screen: string, params?: object) => void };
}

export function MyProfileScreen({ navigation }: MyProfileScreenProps) {
  const { entitlements } = useEntitlements();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    profilesApi
      .getMe()
      .then(async ({ data }) => {
        if (cancelled || !data.profile) return;
        setProfile(data.profile);
        try {
          const { data: photoData } = await photosApi.list(data.profile.id);
          if (!cancelled) setPhotos(Array.isArray(photoData) ? photoData : []);
        } catch {
          if (!cancelled) setPhotos([]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingScreen />;
  if (!profile) return <Text style={styles.error}>Profile not found</Text>;

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={profile.display_name} size={80} />
          <Text style={styles.name}>{profile.display_name}</Text>
          <Text style={styles.meta}>
            {profile.gender} • {profile.height_cm}cm • {profile.marital_status}
          </Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            Photos ({photos.length}/{entitlements.photo_limit})
          </Text>
          <PhotoGallery photos={photos} emptyLabel="You have not added any photos yet." />
          {entitlements.plan === 'basic' && (
            <Button
              title="Upgrade for 10 photo slots"
              variant="outline"
              onPress={() => navigation.navigate('Plans')}
              style={styles.upgrade}
            />
          )}
        </Card>

        {profile.about_me && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>{profile.about_me}</Text>
          </Card>
        )}

        <Button title="Edit Profile" variant="outline" onPress={() => navigation.navigate('EditProfile')} />
      </ScrollView>
    </ScreenContainer>
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
  upgrade: { marginTop: spacing.md },
  error: { ...typography.body, color: colors.error, textAlign: 'center', marginTop: spacing.xxl },
});
