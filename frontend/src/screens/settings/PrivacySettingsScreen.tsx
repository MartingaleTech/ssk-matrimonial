import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { Button, Card } from '../../components';
import { useProfile } from '../../context';
import client from '../../api/client';
import { colors, spacing, typography } from '../../theme';

export function PrivacySettingsScreen() {
  const { profile } = useProfile();
  const [showFullName, setShowFullName] = useState(true);
  const [showWorkDetails, setShowWorkDetails] = useState(true);
  const [showLocationCity, setShowLocationCity] = useState(true);
  const [showKundaliPublic, setShowKundaliPublic] = useState(false);
  const [allowChatRequests, setAllowChatRequests] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await client.patch(`/profiles/${profile.id}/privacy`, {
        show_full_name: showFullName,
        show_work_details: showWorkDetails,
        show_location_city: showLocationCity,
        show_kundali_public: showKundaliPublic,
        allow_non_connected_chat_requests: allowChatRequests,
      });
      Alert.alert('Saved', 'Privacy settings updated');
    } catch {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Settings</Text>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Show Full Name</Text>
          <Switch value={showFullName} onValueChange={setShowFullName} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Show Work Details</Text>
          <Switch value={showWorkDetails} onValueChange={setShowWorkDetails} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Show Location City</Text>
          <Switch value={showLocationCity} onValueChange={setShowLocationCity} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Show Kundali Publicly</Text>
          <Switch value={showKundaliPublic} onValueChange={setShowKundaliPublic} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Allow Chat Requests</Text>
          <Switch value={allowChatRequests} onValueChange={setAllowChatRequests} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <Button title="Save" onPress={handleSave} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  label: { ...typography.body, color: colors.text },
});
