import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Button, Card, Avatar, LoadingScreen } from '../../components';
import { managersApi, Manager } from '../../api/managers';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface ManagerListScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function ManagerListScreen({ navigation }: ManagerListScreenProps) {
  const { profile } = useProfile();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    if (!profile) return;
    try {
      const { data } = await managersApi.list(profile.id);
      setManagers(Array.isArray(data) ? data : []);
    } catch {
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (managerId: string) => {
    if (!profile) return;
    Alert.alert('Remove Manager', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await managersApi.remove(profile.id, managerId);
            loadManagers();
          } catch {
            Alert.alert('Error', 'Failed to remove manager');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Managers</Text>
        <Button title="Add" onPress={() => navigation.navigate('AddManager')} style={styles.addBtn} />
      </View>

      <FlatList
        data={managers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Avatar name={item.user_id} size={44} />
              <View style={styles.info}>
                <Text style={styles.role}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}</Text>
                <Text style={styles.meta}>{item.is_primary ? 'Primary' : 'Added'} • {new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              {!item.is_primary && (
                <Button title="Remove" variant="outline" onPress={() => handleRemove(item.id)} style={styles.removeBtn} />
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No managers</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text },
  addBtn: { paddingHorizontal: spacing.md, minHeight: 40 },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: spacing.md },
  role: { ...typography.body, fontWeight: '600', color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary },
  removeBtn: { paddingHorizontal: spacing.sm, minHeight: 36 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
