import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input } from '../../components';
import { profilesApi } from '../../api/profiles';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface FamilyInfoScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function FamilyInfoScreen({ navigation }: FamilyInfoScreenProps) {
  const { profile } = useProfile();
  const [familyType, setFamilyType] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [brothers, setBrothers] = useState('');
  const [sisters, setSisters] = useState('');
  const [familyStatus, setFamilyStatus] = useState('');
  const [familyValues, setFamilyValues] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await profilesApi.updateFamilyInfo(profile.id, {
        family_type: familyType,
        father_occupation: fatherOccupation,
        mother_occupation: motherOccupation,
        siblings_brothers: brothers ? parseInt(brothers) : 0,
        siblings_sisters: sisters ? parseInt(sisters) : 0,
        family_status: familyStatus,
        family_values: familyValues,
      });
      navigation.navigate('ProfileLifestyle');
    } catch {
      Alert.alert('Error', 'Failed to save family info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Family Information</Text>
      <Text style={styles.step}>Step 3 of 8</Text>

      <Input label="Family Type" placeholder="joint / nuclear" value={familyType} onChangeText={setFamilyType} />
      <Input label="Father's Occupation" placeholder="Occupation" value={fatherOccupation} onChangeText={setFatherOccupation} />
      <Input label="Mother's Occupation" placeholder="Occupation" value={motherOccupation} onChangeText={setMotherOccupation} />
      <Input label="Brothers" placeholder="0" value={brothers} onChangeText={setBrothers} keyboardType="numeric" />
      <Input label="Sisters" placeholder="0" value={sisters} onChangeText={setSisters} keyboardType="numeric" />
      <Input label="Family Status" placeholder="middle_class / upper_middle / affluent" value={familyStatus} onChangeText={setFamilyStatus} />
      <Input label="Family Values" placeholder="traditional / moderate / liberal" value={familyValues} onChangeText={setFamilyValues} />

      <Button title="Next" onPress={handleNext} loading={loading} />
      <Button title="Skip" variant="outline" onPress={() => navigation.navigate('ProfileLifestyle')} style={styles.skip} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  step: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  skip: { marginTop: spacing.sm },
});
