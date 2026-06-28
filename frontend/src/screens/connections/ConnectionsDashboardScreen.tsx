import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Card, Avatar, Button, LoadingScreen } from '../../components';
import { connectionsApi, Connection } from '../../api/connections';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface ConnectionsDashboardScreenProps {
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
}

export function ConnectionsDashboardScreen({ navigation }: ConnectionsDashboardScreenProps) {
  const { profile } = useProfile();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filter, setFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) loadConnections();
    else setLoading(false);
  }, [filter, profile]);

  const loadConnections = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data } = await connectionsApi.list({ profile_id: profile.id, status: filter });
      setConnections(Array.isArray(data) ? data : []);
    } catch {
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    if (!profile) return;
    try {
      await connectionsApi.accept(id, { profile_id: profile.id });
      loadConnections();
    } catch {
      Alert.alert('Error', 'Failed to accept connection');
    }
  };

  const handleReject = async (id: string) => {
    if (!profile) return;
    try {
      await connectionsApi.reject(id, { profile_id: profile.id });
      loadConnections();
    } catch {
      Alert.alert('Error', 'Failed to reject connection');
    }
  };

  const handleResend = async (id: string) => {
    if (!profile) return;
    try {
      await connectionsApi.resend(id, { profile_id: profile.id });
      Alert.alert('Success', 'Connection request resent');
      loadConnections();
    } catch {
      Alert.alert('Error', 'Failed to resend connection request');
    }
  };

  const getOtherProfile = (item: Connection) => {
    const isIncoming = item.to_profile_id === profile?.id;
    if (isIncoming) {
      return {
        id: item.from_profile_id,
        displayName: item.from_profile?.display_name || 'Unknown',
        direction: 'Incoming' as const,
      };
    }
    return {
      id: item.to_profile_id,
      displayName: item.to_profile?.display_name || 'Unknown',
      direction: 'Sent' as const,
    };
  };

  const handleViewProfile = (profileId: string) => {
    navigation.navigate('ProfileDetail', { profileId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connections</Text>

      <View style={styles.filters}>
        {['pending', 'accepted', 'rejected', 'cancelled'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, filter === s && styles.filterActive]}
            onPress={() => setFilter(s)}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <LoadingScreen /> : (
        <FlatList
          data={connections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const other = getOtherProfile(item);
            const isIncoming = other.direction === 'Incoming';
            return (
              <TouchableOpacity onPress={() => handleViewProfile(other.id)}>
                <Card style={styles.card}>
                  <View style={styles.row}>
                    <Avatar name={other.displayName} size={44} />
                    <View style={styles.info}>
                      <Text style={styles.name}>{other.displayName}</Text>
                      <Text style={styles.meta}>
                        {other.direction} • {new Date(item.requested_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => handleViewProfile(other.id)}
                    >
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>
                  {isIncoming && item.status === 'pending' && (
                    <View style={styles.actions}>
                      <Button title="Accept" onPress={() => handleAccept(item.id)} style={styles.actionBtn} />
                      <Button title="Reject" variant="outline" onPress={() => handleReject(item.id)} style={styles.actionBtn} />
                    </View>
                  )}
                  {!isIncoming && (item.status === 'rejected' || item.status === 'cancelled') && (
                    <View style={styles.actions}>
                      <Button title="Resend Request" onPress={() => handleResend(item.id)} style={styles.actionBtn} />
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No {filter} connections</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  filters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.surface },
  filterActive: { backgroundColor: colors.primary },
  filterText: { ...typography.bodySmall, color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.body, fontWeight: '500', color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary },
  viewBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  viewBtnText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
