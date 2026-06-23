import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Card, Avatar } from '../../components';
import { blocksApi } from '../../api/blocks';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface ChatInfoScreenProps {
  [key: string]: any;
  route: { params: { threadId: string; otherProfileId: string } };
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void; goBack: () => void };
}

export function ChatInfoScreen({ route, navigation }: ChatInfoScreenProps) {
  const { otherProfileId } = route.params;
  const { profile } = useProfile();

  const handleViewProfile = () => {
    navigation.navigate('ProfileDetail', { profileId: otherProfileId });
  };

  const handleBlock = async () => {
    if (!profile) return;
    try {
      await blocksApi.block({
        blocked_by_profile_id: profile.id,
        blocked_profile_id: otherProfileId,
      });
      navigation.goBack();
    } catch { /* silent */ }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar name={otherProfileId} size={72} />
        <Text style={styles.name}>Chat Details</Text>
      </View>

      <Card style={styles.card}>
        <Button title="View Profile" onPress={handleViewProfile} />
      </Card>

      <Card style={styles.card}>
        <Button title="Block Profile" variant="outline" onPress={handleBlock} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  name: { ...typography.h3, color: colors.text, marginTop: spacing.md },
  card: { marginBottom: spacing.md },
});
