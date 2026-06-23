import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, Input } from '../../components';
import { connectionsApi } from '../../api/connections';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface ConnectionRequestScreenProps {
  [key: string]: any;
  route: { params: { toProfileId: string; displayName?: string } };
  navigation: { goBack: () => void };
}

export function ConnectionRequestScreen({ route, navigation }: ConnectionRequestScreenProps) {
  const { toProfileId, displayName } = route.params;
  const { profile } = useProfile();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await connectionsApi.send({
        from_profile_id: profile.id,
        to_profile_id: toProfileId,
        message: message || undefined,
      });
      Alert.alert('Success', 'Connection request sent');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Connection Request</Text>
      <Text style={styles.subtitle}>to {displayName || 'this profile'}</Text>

      <Input
        label="Message (optional)"
        placeholder="Write a brief introduction..."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <Button title="Send Request" onPress={handleSend} loading={loading} />
      <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.cancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  textArea: { height: 100, textAlignVertical: 'top' },
  cancel: { marginTop: spacing.sm },
});
