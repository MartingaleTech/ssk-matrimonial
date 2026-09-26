import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, StepNavigation } from '../../components';
import { photosApi } from '../../api/photos';
import { useProfile } from '../../context';
import { useEntitlements } from '../../hooks';
import { colors, spacing, typography, borderRadius } from '../../theme';

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const ALLOWED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));

function resolveContentType(asset: ImagePicker.ImagePickerAsset): string {
  if (asset.mimeType && ALLOWED_MIME_TYPES.has(asset.mimeType)) return asset.mimeType;
  const ext = asset.uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[ext] ?? 'image/jpeg';
}

async function uploadToStorage(
  profileId: string,
  asset: ImagePicker.ImagePickerAsset,
  isPrimary: boolean,
) {
  const contentType = resolveContentType(asset);
  const visibility = 'public';

  const { data: presigned } = await photosApi.presign(profileId, {
    content_type: contentType,
    visibility,
  });

  const fileResponse = await fetch(asset.uri);
  const blob = await fileResponse.blob();

  const putResponse = await fetch(presigned.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!putResponse.ok) {
    throw new Error(`Storage upload failed with status ${putResponse.status}`);
  }

  return photosApi.upload(profileId, {
    url: presigned.public_url,
    storage_key: presigned.storage_key,
    is_primary: isPrimary,
    visibility,
  });
}

interface PhotoUploadScreenProps {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

export function PhotoUploadScreen({ navigation }: PhotoUploadScreenProps) {
  const { profile } = useProfile();
  const { entitlements } = useEntitlements();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const maxPhotos = entitlements.photo_limit;
  const slots = Array.from({ length: maxPhotos }, (_, index) => index);

  const promptUpgrade = () => {
    Alert.alert(
      'Photo limit reached',
      `Basic profiles can have ${maxPhotos} photos. Upgrade to Premium from Settings for 10 photo slots.`,
      [{ text: 'OK' }],
    );
  };

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
    if (photos.length >= maxPhotos) {
      if (entitlements.plan === 'basic') promptUpgrade();
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    const imageUri = asset.uri;
    setPhotos((prev) => [...prev, imageUri]);

    if (profile) {
      setUploading(true);
      try {
        const isPrimary = photos.length === 0;
        await uploadToStorage(profile.id, asset, isPrimary);
      } catch {
        Alert.alert('Upload Error', 'Failed to upload photo. Please try again.');
        setPhotos((prev) => prev.filter((uri) => uri !== imageUri));
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
      <StepNavigation screenName="ProfilePhotos" navigation={navigation} />

      <Text style={styles.title}>Upload Photos</Text>
      <Text style={styles.hint}>
        Add up to {maxPhotos} photos. First photo will be your primary photo.
      </Text>

      <View style={styles.grid}>
        {slots.map((index) => (
          <TouchableOpacity
            key={index}
            style={styles.photoSlot}
            onPress={photos[index] ? () => handleRemovePhoto(index) : handleAddPhoto}
            disabled={uploading || (!photos[index] && photos.length >= maxPhotos)}
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
        <Button title="Save & Next" onPress={handleNext} loading={uploading} />
        <Button title="Skip" variant="outline" onPress={handleNext} style={styles.skip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
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
