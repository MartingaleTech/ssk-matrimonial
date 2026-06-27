import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Input, Card } from '../../components';
import { profilesApi } from '../../api/profiles';
import { useProfile } from '../../context';
import { colors, spacing, typography } from '../../theme';

interface EditProfileScreenProps {
  navigation: { goBack: () => void };
}

export function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { profile, refreshProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  const [highestEducation, setHighestEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [incomeRange, setIncomeRange] = useState('');

  const [familyType, setFamilyType] = useState('');
  const [familyValues, setFamilyValues] = useState('');

  const [diet, setDiet] = useState('');
  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');

  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (profile) loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const loadProfileData = async () => {
    if (!profile) return;
    setLoadingData(true);
    try {
      const { data } = await profilesApi.get(profile.id);
      setDisplayName(data.display_name || '');
      setGender(data.gender || '');
      setDob(data.date_of_birth || '');
      setHeightCm(data.height_cm ? String(data.height_cm) : '');
      setMaritalStatus(data.marital_status || '');
      setAboutMe(data.about_me || '');

      const bd = data.basic_details as Record<string, string> | undefined;
      const ec = data.education_career as Record<string, string> | undefined;
      const fi = data.family_info as Record<string, string> | undefined;
      const ls = data.lifestyle as Record<string, string> | undefined;
      const loc = data.location as Record<string, string> | undefined;

      if (ec) {
        setHighestEducation(ec.highest_education || '');
        setOccupation(ec.occupation || '');
        setCompanyName(ec.company_name || '');
        setIncomeRange(ec.annual_income_range || '');
      }
      if (fi) {
        setFamilyType(fi.family_type || '');
        setFamilyValues(fi.family_values || '');
      }
      if (ls) {
        setDiet(ls.diet || '');
        setSmoking(ls.smoking || '');
        setDrinking(ls.drinking || '');
      }
      if (loc) {
        setCountry(loc.country || '');
        setState(loc.state || '');
        setCity(loc.city || '');
      }
      void bd;
    } catch {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!displayName || !gender || !dob) {
      Alert.alert('Error', 'Display name, gender, and date of birth are required');
      return;
    }
    setLoading(true);
    try {
      await profilesApi.update(profile.id, {
        display_name: displayName,
        gender,
        date_of_birth: dob,
        height_cm: heightCm ? parseInt(heightCm) : undefined,
        marital_status: maritalStatus,
        about_me: aboutMe || undefined,
      });

      await profilesApi.updateEducationCareer(profile.id, {
        highest_education: highestEducation || undefined,
        occupation: occupation || undefined,
        company_name: companyName || undefined,
        annual_income_range: incomeRange || undefined,
      });

      await profilesApi.updateFamilyInfo(profile.id, {
        family_type: familyType || undefined,
        family_values: familyValues || undefined,
      });

      await profilesApi.updateLifestyle(profile.id, {
        diet: diet || undefined,
        smoking: smoking || undefined,
        drinking: drinking || undefined,
      });

      await profilesApi.updateLocation(profile.id, {
        country: country || undefined,
        state: state || undefined,
        city: city || undefined,
      });

      await refreshProfile(profile.id);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Input label="Display Name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
        <Input label="Gender" value={gender} onChangeText={setGender} placeholder="male / female" />
        <Input label="Date of Birth" value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" />
        <Input label="Height (cm)" value={heightCm} onChangeText={setHeightCm} placeholder="170" keyboardType="numeric" />
        <Input label="Marital Status" value={maritalStatus} onChangeText={setMaritalStatus} placeholder="never_married / divorced / widowed" />
        <Input label="About Me" value={aboutMe} onChangeText={setAboutMe} placeholder="Tell us about yourself" multiline numberOfLines={3} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Education & Career</Text>
        <Input label="Highest Education" value={highestEducation} onChangeText={setHighestEducation} placeholder="e.g. Masters" />
        <Input label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="e.g. Software Engineer" />
        <Input label="Company" value={companyName} onChangeText={setCompanyName} placeholder="Company name" />
        <Input label="Income Range" value={incomeRange} onChangeText={setIncomeRange} placeholder="e.g. 10-15 LPA" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Family</Text>
        <Input label="Family Type" value={familyType} onChangeText={setFamilyType} placeholder="joint / nuclear" />
        <Input label="Family Values" value={familyValues} onChangeText={setFamilyValues} placeholder="traditional / moderate / liberal" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Lifestyle</Text>
        <Input label="Diet" value={diet} onChangeText={setDiet} placeholder="vegetarian / non_vegetarian / vegan" />
        <Input label="Smoking" value={smoking} onChangeText={setSmoking} placeholder="never / occasionally / regularly" />
        <Input label="Drinking" value={drinking} onChangeText={setDrinking} placeholder="never / occasionally / regularly" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Input label="Country" value={country} onChangeText={setCountry} placeholder="India" />
        <Input label="State" value={state} onChangeText={setState} placeholder="Your state" />
        <Input label="City" value={city} onChangeText={setCity} placeholder="Your city" />
      </Card>

      <Button title="Save Changes" onPress={handleSave} loading={loading} />
      <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.cancelBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  cancelBtn: { marginTop: spacing.sm, marginBottom: spacing.lg },
});
