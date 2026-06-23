import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { Button, Card } from '../../components';
import client from '../../api/client';
import { colors, spacing, typography } from '../../theme';

export function NotificationSettingsScreen() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [connectionNotifs, setConnectionNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await client.patch('/notifications/settings', {
        email_enabled: emailEnabled,
        sms_enabled: smsEnabled,
        push_enabled: pushEnabled,
        connection_notifications: connectionNotifs,
        message_notifications: messageNotifs,
        marketing_notifications: marketingNotifs,
      });
      Alert.alert('Saved', 'Notification settings updated');
    } catch {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Channels</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>SMS</Text>
          <Switch value={smsEnabled} onValueChange={setSmsEnabled} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Push</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Types</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Connection Requests</Text>
          <Switch value={connectionNotifs} onValueChange={setConnectionNotifs} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Messages</Text>
          <Switch value={messageNotifs} onValueChange={setMessageNotifs} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Marketing</Text>
          <Switch value={marketingNotifs} onValueChange={setMarketingNotifs} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <Button title="Save" onPress={handleSave} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  label: { ...typography.body, color: colors.text },
});
