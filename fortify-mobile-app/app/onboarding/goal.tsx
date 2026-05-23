import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

type FitnessGoal =
  | 'build_muscle'
  | 'general_health'
  | 'improve_strength'
  | 'lose_fat'
  | 'stay_consistent';

type FitnessOutcome =
  | 'build_visible_muscle'
  | 'strength_progress'
  | 'lose_body_fat'
  | 'improve_conditioning'
  | 'move_better'
  | 'training_consistency'
  | 'feel_strong_capable'
  | 'body_confidence'
  | 'daily_energy'
  | 'stay_consistent_long_term'
  | 'overall_health';

const OUTCOME_TO_GOAL: Record<FitnessOutcome, FitnessGoal> = {
  build_visible_muscle: 'build_muscle',
  strength_progress: 'improve_strength',
  lose_body_fat: 'lose_fat',
  improve_conditioning: 'general_health',
  move_better: 'general_health',
  training_consistency: 'stay_consistent',
  feel_strong_capable: 'improve_strength',
  body_confidence: 'lose_fat',
  daily_energy: 'general_health',
  stay_consistent_long_term: 'stay_consistent',
  overall_health: 'general_health',
};

const GOAL_TO_DEFAULT_OUTCOME: Record<FitnessGoal, FitnessOutcome> = {
  build_muscle: 'build_visible_muscle',
  general_health: 'improve_conditioning',
  improve_strength: 'strength_progress',
  lose_fat: 'lose_body_fat',
  stay_consistent: 'training_consistency',
};

const OPTIONS: Array<{ value: FitnessOutcome; title: string }> = [
  { value: 'build_visible_muscle', title: 'Build visible muscle' },
  { value: 'strength_progress', title: 'Get stronger' },
  { value: 'improve_conditioning', title: 'Improve conditioning' },
  { value: 'move_better', title: 'Move better' },
  { value: 'training_consistency', title: 'Train consistently' },
];

const VALID_OUTCOMES = new Set<FitnessOutcome>(Object.keys(OUTCOME_TO_GOAL) as FitnessOutcome[]);
const VALID_GOALS = new Set<FitnessGoal>([
  'build_muscle',
  'general_health',
  'improve_strength',
  'lose_fat',
  'stay_consistent',
]);

const isFitnessOutcome = (value: unknown): value is FitnessOutcome => {
  return typeof value === 'string' && VALID_OUTCOMES.has(value as FitnessOutcome);
};

const isFitnessGoal = (value: unknown): value is FitnessGoal => {
  return typeof value === 'string' && VALID_GOALS.has(value as FitnessGoal);
};

const dedupeGoals = (outcomes: FitnessOutcome[]): FitnessGoal[] => {
  const goals = outcomes.map((outcome) => OUTCOME_TO_GOAL[outcome]);
  return goals.filter((goal, index) => goals.indexOf(goal) === index);
};

const mapStoredGoalsToOutcomes = (goals: FitnessGoal[]): FitnessOutcome[] => {
  return goals.map((goal) => GOAL_TO_DEFAULT_OUTCOME[goal]).filter(Boolean);
};

const normalizeOutcomes = (outcomes: FitnessOutcome[]): FitnessOutcome[] => {
  const normalized = outcomes.map((outcome) => GOAL_TO_DEFAULT_OUTCOME[OUTCOME_TO_GOAL[outcome]]);
  return normalized.filter((outcome, index) => normalized.indexOf(outcome) === index);
};

export default function OnboardingGoalScreen() {
  useOnboardingFunnelScreen('Q14. What is your fitness goal?');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<FitnessOutcome[]>([]);
  const isDisabled = selected.length === 0;

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const storedOutcomes = state?.fitness_outcomes?.filter(isFitnessOutcome) ?? [];
      if (storedOutcomes.length > 0) {
        setSelected(normalizeOutcomes(storedOutcomes));
        return;
      }

      const storedGoals = state?.fitness_goals?.filter(isFitnessGoal) ?? [];
      const storedPrimary = isFitnessGoal(state?.fitness_goal) ? state.fitness_goal : null;
      const nextGoals = storedGoals.length > 0
        ? storedGoals
        : storedPrimary
          ? [storedPrimary]
          : [];
      setSelected(mapStoredGoalsToOutcomes(nextGoals));
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: FitnessOutcome) => {
    setSelected((prev) => {
      const wasSelected = prev.includes(value);
      if (!wasSelected && prev.length >= 3) {
        return prev;
      }

      const nextSelected = wasSelected
        ? prev.filter((goal) => goal !== value)
        : [...prev, value];
      const fitnessGoals = dedupeGoals(nextSelected);

      void updateOnboardingState({
        fitness_outcomes: nextSelected,
        fitness_goals: fitnessGoals,
        fitness_goal: fitnessGoals[0] ?? undefined,
      });

      return nextSelected;
    });
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted('fitness_goals', {
      fitness_outcomes: selected.join(', '),
      fitness_goals: dedupeGoals(selected).join(', '),
    });
    router.push('/onboarding/motivation');
  };

  return (
    <OnboardingScreen
      step={3}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What fitness outcome do you want to achieve with Fortify?"
      subtitle="Select up to 3. Rank in order of importance."
      onBack={() => router.back()}
      footer={
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
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const rank = selected.indexOf(option.value);
          return (
            <OnboardingOptionCard
              key={option.value}
              title={option.title}
              selected={rank !== -1}
              rank={rank === -1 ? null : rank + 1}
              onSelect={() => handleSelect(option.value)}
            />
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
