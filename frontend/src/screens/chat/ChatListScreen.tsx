import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Avatar, Card, LoadingScreen, ScreenContainer } from '../../components';
import { chatApi, ChatThread } from '../../api/chat';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface ChatListScreenProps {
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
}

export function ChatListScreen({ navigation }: ChatListScreenProps) {
  const { profile } = useProfile();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      chatApi.getThreads(profile.id)
        .then(({ data }) => setThreads(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profile]);

  if (loading) return <LoadingScreen />;

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherProfileId = item.profile1_id === profile?.id
            ? item.profile2_id
            : item.profile1_id;
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('ChatScreen', { threadId: item.id, otherProfileId })}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <Avatar name={otherProfileId} size={48} />
                  <View style={styles.info}>
                    <Text style={styles.name}>Chat</Text>
                    <Text style={styles.meta}>
                      {item.last_message_at
                        ? new Date(item.last_message_at).toLocaleDateString()
                        : 'No messages yet'}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations yet. Connect with profiles to start chatting.</Text>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.body, fontWeight: '500', color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
