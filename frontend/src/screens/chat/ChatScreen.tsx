import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { chatApi, ChatMessage } from '../../api/chat';
import { useProfile } from '../../context';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface ChatScreenProps {
  [key: string]: any;
  route: { params: { threadId: string; otherProfileId: string } };
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void; setOptions: (opts: Record<string, unknown>) => void };
}

export function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { threadId, otherProfileId } = route.params;
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileDetail', { profileId: otherProfileId })}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>View Profile</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, otherProfileId]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data } = await chatApi.getMessages(threadId);
      const msgs = Array.isArray(data) ? data : data.messages || [];
      setMessages(msgs.reverse());
    } catch { /* silent */ }
  };

  const handleSend = async () => {
    if (!input.trim() || !profile) return;
    setSending(true);
    try {
      const { data } = await chatApi.sendMessage(threadId, {
        content: input.trim(),
        profile_id: profile.id,
      });
      setMessages((prev) => [...prev, data]);
      setInput('');
    } catch { /* silent */ }
    setSending(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.sender_profile_id === profile?.id;
    return (
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, isMine && styles.myMessageText]}>{item.content}</Text>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending || !input.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  messages: { padding: spacing.md, paddingBottom: spacing.sm },
  bubble: { maxWidth: '75%', padding: spacing.sm + 2, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
  myBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  messageText: { ...typography.body, color: colors.text },
  myMessageText: { color: colors.white },
  time: { ...typography.caption, color: colors.textLight, marginTop: 2, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', padding: spacing.sm, borderTopWidth: 1, borderColor: colors.border, alignItems: 'center' },
  input: { flex: 1, ...typography.body, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm },
  sendBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  sendText: { ...typography.button, color: colors.white },
  headerBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  headerBtnText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
});
