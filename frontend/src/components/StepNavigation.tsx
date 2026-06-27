import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useProfileCreation, StepScreen } from '../context/ProfileCreationContext';
import { colors, spacing, typography } from '../theme';

interface StepNavigationProps {
  screenName: StepScreen;
  navigation: { navigate: (screen: string) => void; goBack: () => void };
}

export function StepNavigation({ screenName, navigation }: StepNavigationProps) {
  const { maxStepReached, markStepReached, getStepIndex, getScreenName, canNavigateForward, totalSteps } = useProfileCreation();

  const currentStep = getStepIndex(screenName);

  useEffect(() => {
    markStepReached(currentStep);
  }, [currentStep, markStepReached]);

  const handleBack = () => {
    if (currentStep > 0) {
      navigation.goBack();
    }
  };

  const handleForward = () => {
    if (canNavigateForward(currentStep)) {
      const nextScreen = getScreenName(currentStep + 1);
      if (nextScreen) {
        navigation.navigate(nextScreen);
      }
    }
  };

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex <= maxStepReached && stepIndex !== currentStep) {
      const targetScreen = getScreenName(stepIndex);
      if (targetScreen) {
        navigation.navigate(targetScreen);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleStepPress(i)}
            disabled={i > maxStepReached}
            style={styles.dotWrapper}
          >
            <View
              style={[
                styles.dot,
                i === currentStep && styles.dotActive,
                i < currentStep && i <= maxStepReached && styles.dotCompleted,
                i > maxStepReached && styles.dotDisabled,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.stepText}>Step {currentStep + 1} of {totalSteps}</Text>

      <View style={styles.navButtons}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={currentStep === 0}
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
        >
          <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleForward}
          disabled={!canNavigateForward(currentStep)}
          style={[styles.navButton, !canNavigateForward(currentStep) && styles.navButtonDisabled]}
        >
          <Text style={[styles.navButtonText, !canNavigateForward(currentStep) && styles.navButtonTextDisabled]}>
            Forward
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dotWrapper: {
    padding: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotCompleted: {
    backgroundColor: colors.success,
  },
  dotDisabled: {
    backgroundColor: colors.border,
    opacity: 0.4,
  },
  stepText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: colors.textLight,
  },
});
