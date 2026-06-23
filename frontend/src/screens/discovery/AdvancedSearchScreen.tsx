import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Button, Input, Card } from '../../components';
import { searchApi, SearchParams } from '../../api/search';
import { colors, spacing, typography } from '../../theme';

interface AdvancedSearchScreenProps {
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
}

interface SearchResult {
  profile_id: string;
  display_name?: string;
  age?: number;
  city?: string;
  occupation?: string;
}

export function AdvancedSearchScreen({ navigation }: AdvancedSearchScreenProps) {
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [city, setCity] = useState('');
  const [community, setCommunity] = useState('');
  const [education, setEducation] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params: SearchParams = {};
      if (ageMin) params.age_min = parseInt(ageMin);
      if (ageMax) params.age_max = parseInt(ageMax);
      if (city) params.city = city;
      if (community) params.community = community;
      if (education) params.education_level = education;
      const { data } = await searchApi.search(params);
      setResults(Array.isArray(data) ? data : data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Advanced Search</Text>

      <Input label="Min Age" placeholder="21" value={ageMin} onChangeText={setAgeMin} keyboardType="numeric" />
      <Input label="Max Age" placeholder="35" value={ageMax} onChangeText={setAgeMax} keyboardType="numeric" />
      <Input label="City" placeholder="Mumbai" value={city} onChangeText={setCity} />
      <Input label="Community" placeholder="SSK" value={community} onChangeText={setCommunity} />
      <Input label="Education" placeholder="Masters" value={education} onChangeText={setEducation} />

      <Button title="Search" onPress={handleSearch} loading={loading} />

      {searched && results.length === 0 && !loading && (
        <Text style={styles.noResults}>No profiles found matching your criteria</Text>
      )}

      {results.map((item) => (
        <TouchableOpacity
          key={item.profile_id}
          onPress={() => navigation.navigate('ProfileDetail', { profileId: item.profile_id })}
        >
          <Card style={styles.resultCard}>
            <Text style={styles.resultName}>{item.display_name || 'Profile'}</Text>
            <Text style={styles.resultMeta}>
              {item.age ? `${item.age} yrs` : ''}{item.city ? ` • ${item.city}` : ''}
            </Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  noResults: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
  resultCard: { marginTop: spacing.md },
  resultName: { ...typography.body, fontWeight: '600', color: colors.text },
  resultMeta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
});
