import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Photo } from '../api/photos';
import { colors, spacing, typography, borderRadius } from '../theme';

interface PhotoGalleryProps {
  photos: Photo[];
  emptyLabel?: string;
}

export function PhotoGallery({ photos, emptyLabel = 'No photos yet' }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {photos.map((photo) => (
        <View key={photo.id} style={styles.item}>
          <Image source={{ uri: photo.url }} style={styles.image} />
          {photo.is_primary && <Text style={styles.primary}>Primary</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  item: { width: 120 },
  image: {
    width: 120,
    height: 160,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  primary: { ...typography.bodySmall, color: colors.primary, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary },
});
