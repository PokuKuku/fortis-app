import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingSegmentedControl } from '@/src/components/onboarding/OnboardingSegmentedControl';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { moderateScale, scale } from '@/src/utils/responsive';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

type FitnessPriority = 'strength' | 'muscle_growth' | 'fat_loss' | 'conditioning' | 'mobility' | 'consistency';
type PriorityLevel = 'off' | 'medium' | 'high';

const OPTIONS: Array<{ value: FitnessPriority; title: string; description: string }> = [
  { value: 'strength', title: 'Strength', description: 'Heavier lifts and measurable progression' },
  { value: 'muscle_growth', title: 'Muscle Growth', description: 'More hypertrophy-focused training volume' },
  { value: 'conditioning', title: 'Conditioning', description: 'Work capacity and heart-rate challenge' },
  { value: 'mobility', title: 'Mobility', description: 'Movement quality and joint-friendly work' },
  { value: 'consistency', title: 'Consistency', description: 'A plan that is easier to repeat' },
];

const VALID_PRIORITIES = new Set<FitnessPriority>(OPTIONS.map((option) => option.value));
const LEVEL_OPTIONS = [
  { label: 'Off', value: 'off' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const createEmptyPriorityLevels = (): Record<FitnessPriority, PriorityLevel> => ({
  strength: 'off',
  muscle_growth: 'off',
  fat_loss: 'off',
  conditioning: 'off',
  mobility: 'off',
  consistency: 'off',
});

const getPrioritiesFromLevels = (levels: Record<FitnessPriority, PriorityLevel>): FitnessPriority[] => [
  ...OPTIONS.filter((option) => levels[option.value] === 'high').map((option) => option.value),
  ...OPTIONS.filter((option) => levels[option.value] === 'medium').map((option) => option.value),
];

export default function OnboardingFitnessPrioritiesScreen() {
  useOnboardingFunnelScreen('Q13. Fitness Priorities');

  const router = useRouter();
  const { colors } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isCompactLayout = windowWidth < 380 || windowHeight < 760;
  const [priorityLevels, setPriorityLevels] = useState<Record<FitnessPriority, PriorityLevel>>(
    createEmptyPriorityLevels
  );
  const selectedPriorities = useMemo(() => getPrioritiesFromLevels(priorityLevels), [priorityLevels]);
  const isDisabled = selectedPriorities.length === 0;

  useEffect(() => {
    let isActive = true;
    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const stored = (state?.fitness_priorities ?? []).filter((value): value is FitnessPriority =>
        VALID_PRIORITIES.has(value as FitnessPriority)
      );
      const nextLevels = {
        ...createEmptyPriorityLevels(),
        ...Object.fromEntries(stored.map((value) => [value, 'high' as PriorityLevel])),
      };
      const nextPriorities = getPrioritiesFromLevels(nextLevels);
      setPriorityLevels(nextLevels);
      if ((state?.fitness_priorities ?? []).join(',') !== nextPriorities.join(',')) {
        void updateOnboardingState({ fitness_priorities: nextPriorities });
      }
    };
    void loadState();
    return () => {
      isActive = false;
    };
  }, []);

  const handlePriorityLevelChange = (priority: FitnessPriority, level: PriorityLevel) => {
    setPriorityLevels((prev) => {
      const nextLevels = { ...prev, [priority]: level };
      const nextPriorities = getPrioritiesFromLevels(nextLevels);
      void updateOnboardingState({ fitness_priorities: nextPriorities });
      return nextLevels;
    });
  };

  const handleContinue = () => {
    if (isDisabled) return;
    trackOnboardingStepCompleted('fitness_priorities', {
      fitness_priorities: selectedPriorities.join(', '),
    });
    router.push('/onboarding/consistency');
  };

  return (
    <OnboardingScreen
      step={12}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Tune your program focus"
      subtitle="Set what your plan should emphasize most."
      contentGap={Spacing.lg}
      onBack={() => router.back()}
      floatingFooter={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={isDisabled}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={[styles.options, isCompactLayout && styles.optionsCompact]}>
        {OPTIONS.map((option) => {
          return (
            <GlassCard
              key={option.value}
              padding={scale(isCompactLayout ? Spacing.md : Spacing.lg)}
              style={styles.tuningCard}
            >
              <View style={[styles.priorityHeader, isCompactLayout && styles.priorityHeaderCompact]}>
                <View style={styles.priorityTextStack}>
                  <Text
                    style={[
                      styles.priorityTitle,
                      isCompactLayout && styles.priorityTitleCompact,
                      { color: colors.textPrimary },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.84}
                  >
                    {option.title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.priorityDescription,
                      isCompactLayout && styles.priorityDescriptionCompact,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
              </View>
              <OnboardingSegmentedControl
                options={LEVEL_OPTIONS}
                value={priorityLevels[option.value]}
                onChange={(level) => handlePriorityLevelChange(option.value, level as PriorityLevel)}
              />
            </GlassCard>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 12,
  },
  optionsCompact: {
    gap: 10,
  },
  tuningCard: {
    borderRadius: BorderRadius.xl,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(Spacing.md),
    marginBottom: scale(Spacing.sm),
  },
  priorityHeaderCompact: {
    marginBottom: scale(Spacing.xs),
  },
  priorityTextStack: {
    flex: 1,
    minWidth: 0,
    gap: scale(Spacing.xs),
  },
  priorityTitle: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(16),
    letterSpacing: moderateScale(1.2),
  },
  priorityTitleCompact: {
    fontSize: moderateScale(15),
  },
  priorityDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(19),
  },
  priorityDescriptionCompact: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(17),
  },
  button: {
    height: 54,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
