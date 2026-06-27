import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input, StepNavigation } from '../../components';
import { profilesApi } from '../../api/profiles';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface EducationCareerScreenProps {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

export function EducationCareerScreen({ navigation }: EducationCareerScreenProps) {
  const { profile } = useProfile();
  const [highestEducation, setHighestEducation] = useState('');
  const [educationDetails, setEducationDetails] = useState('');
  const [occupation, setOccupation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [workCity, setWorkCity] = useState('');
  const [workCountry, setWorkCountry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await profilesApi.updateEducationCareer(profile.id, {
        highest_education: highestEducation,
        education_details: educationDetails,
        occupation,
        company_name: companyName,
        annual_income_range: incomeRange,
        work_location_city: workCity,
        work_location_country: workCountry,
      });
      navigation.navigate('ProfileFamily');
    } catch {
      Alert.alert('Error', 'Failed to save education details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StepNavigation screenName="ProfileEducation" navigation={navigation} />

      <Text style={styles.title}>Education & Career</Text>

      <Input label="Highest Education" placeholder="e.g. Masters" value={highestEducation} onChangeText={setHighestEducation} />
      <Input label="Education Details" placeholder="e.g. MBA from IIM" value={educationDetails} onChangeText={setEducationDetails} />
      <Input label="Occupation" placeholder="e.g. Software Engineer" value={occupation} onChangeText={setOccupation} />
      <Input label="Company Name" placeholder="Company" value={companyName} onChangeText={setCompanyName} />
      <Input label="Annual Income Range" placeholder="e.g. 10-15 LPA" value={incomeRange} onChangeText={setIncomeRange} />
      <Input label="Work City" placeholder="City" value={workCity} onChangeText={setWorkCity} />
      <Input label="Work Country" placeholder="Country" value={workCountry} onChangeText={setWorkCountry} />

      <Button title="Save & Next" onPress={handleNext} loading={loading} />
      <Button title="Skip" variant="outline" onPress={() => navigation.navigate('ProfileFamily')} style={styles.skip} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  skip: { marginTop: spacing.sm },
});
