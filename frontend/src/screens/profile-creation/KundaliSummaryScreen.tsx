import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, LoadingScreen, StepNavigation } from '../../components';
import { kundaliApi, KundaliData } from '../../api/kundali';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface KundaliSummaryScreenProps {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

export function KundaliSummaryScreen({ navigation }: KundaliSummaryScreenProps) {
  const { profile } = useProfile();
  const [kundali, setKundali] = useState<KundaliData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      kundaliApi.get(profile.id)
        .then(({ data }) => setKundali(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profile]);

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StepNavigation screenName="ProfileKundaliSummary" navigation={navigation} />

      <Text style={styles.title}>Kundali Summary</Text>

      {kundali ? (
        <>
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Rashi:</Text>
              <Text style={styles.value}>{kundali.rashi}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nakshatra:</Text>
              <Text style={styles.value}>{kundali.nakshatra}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Lagna:</Text>
              <Text style={styles.value}>{kundali.lagna}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Manglik Status:</Text>
              <Text style={styles.value}>{kundali.manglik_status}</Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Birth Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{kundali.birth_date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>{kundali.birth_time}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Place:</Text>
              <Text style={styles.value}>{kundali.birth_place}</Text>
            </View>
          </Card>
        </>
      ) : (
        <Text style={styles.noData}>No kundali data available</Text>
      )}

      <Button title="Next" onPress={() => navigation.navigate('ProfilePhotos')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.body, color: colors.text, fontWeight: '500' },
  noData: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.xl },
});
