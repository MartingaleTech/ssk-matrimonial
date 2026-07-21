import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  edges?: Edge[];
}

export function ScreenContainer({
  children,
  style,
  edges = ['top'],
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
