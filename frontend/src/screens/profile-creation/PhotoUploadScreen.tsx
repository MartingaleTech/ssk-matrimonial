import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { Button } from '../../components';
import { useProfile } from '../../context';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface PhotoUploadScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function PhotoUploadScreen({ navigation }: PhotoUploadScreenProps) {
  const _profile = useProfile();
  const [photos] = useState<string[]>([]);

  const handleAddPhoto = () => {
    // In a real app, this would use expo-image-picker
    Alert.alert('Photo Upload', 'Image picker will be integrated with expo-image-picker');
  };

  const handleNext = () => {
    navigation.navigate('ProfilePreferences');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Photos</Text>
      <Text style={styles.step}>Step 7 of 8</Text>
      <Text style={styles.hint}>Add up to 6 photos. First photo will be your primary photo.</Text>

      <View style={styles.grid}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TouchableOpacity key={index} style={styles.photoSlot} onPress={handleAddPhoto}>
            {photos[index] ? (
              <Image source={{ uri: photos[index] }} style={styles.photo} />
            ) : (
              <Text style={styles.addText}>+</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Next" onPress={handleNext} />
        <Button title="Skip" variant="outline" onPress={handleNext} style={styles.skip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  step: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  hint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  photoSlot: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%', borderRadius: borderRadius.md },
  addText: { fontSize: 32, color: colors.textLight },
  actions: { marginTop: 'auto' },
  skip: { marginTop: spacing.sm },
});
