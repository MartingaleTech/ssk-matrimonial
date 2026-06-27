import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components';
import { photosApi } from '../../api/photos';
import { useProfile } from '../../context';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface PhotoUploadScreenProps {
  navigation: { navigate: (screen: string) => void };
}

export function PhotoUploadScreen({ navigation }: PhotoUploadScreenProps) {
  const { profile } = useProfile();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to upload profile photos. Please grant permission in your device settings.',
        [{ text: 'OK' }],
      );
      return false;
    }
    return true;
  };

  const handleAddPhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const imageUri = result.assets[0].uri;
    setPhotos((prev) => [...prev, imageUri]);

    if (profile) {
      setUploading(true);
      try {
        const isPrimary = photos.length === 0;
        await photosApi.upload(profile.id, {
          url: imageUri,
          is_primary: isPrimary,
          visibility: 'public',
        });
      } catch {
        Alert.alert('Upload Error', 'Photo saved locally but failed to sync to server.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    navigation.navigate('ProfilePreferences');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Photos</Text>
      <Text style={styles.step}>Step 7 of 9</Text>
      <Text style={styles.hint}>Add up to 6 photos. First photo will be your primary photo.</Text>

      <View style={styles.grid}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TouchableOpacity
            key={index}
            style={styles.photoSlot}
            onPress={photos[index] ? () => handleRemovePhoto(index) : handleAddPhoto}
            disabled={uploading || (!photos[index] && photos.length >= 6)}
          >
            {photos[index] ? (
              <View style={styles.photoWrapper}>
                <Image source={{ uri: photos[index] }} style={styles.photo} />
                <View style={styles.removeOverlay}>
                  <Text style={styles.removeText}>x</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.addText}>+</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Next" onPress={handleNext} loading={uploading} />
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
    overflow: 'hidden',
  },
  photoWrapper: { width: '100%', height: '100%' },
  photo: { width: '100%', height: '100%', borderRadius: borderRadius.md },
  removeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  addText: { fontSize: 32, color: colors.textLight },
  actions: { marginTop: 'auto' },
  skip: { marginTop: spacing.sm },
});
