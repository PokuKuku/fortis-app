import { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import {
  FocusedMuscleHeatmapIcon,
  type FocusedHeatmapCrop,
} from '@/src/components/onboarding/FocusedMuscleHeatmapIcon';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius } from '@/constants/Sizes';
import { type Slug } from 'react-native-body-highlighter';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';
import type { MuscleFocus } from '@/src/utils/onboardingProgram';
import type { MuscleKey } from '@/src/utils/muscleTaxonomy';

type MuscleFocusOption = {
  value: MuscleFocus;
  title: string;
  side: 'front' | 'back';
  crop: FocusedHeatmapCrop;
  muscleLevels: Partial<Record<MuscleKey, number>>;
  highlightSlugs?: Slug[];
};

const OPTIONS: MuscleFocusOption[] = [
  {
    value: 'chest',
    title: 'Chest',
    side: 'front',
    crop: 'chest',
    muscleLevels: { chest: 5 },
  },
  {
    value: 'back',
    title: 'Back',
    side: 'back',
    crop: 'back',
    muscleLevels: {
      lats: 5,
      upper_back: 5,
      lower_back: 5,
    },
  },
  {
    value: 'shoulders',
    title: 'Shoulders',
    side: 'front',
    crop: 'shoulders',
    muscleLevels: {
      front_delts: 5,
      side_delts: 5,
      rear_delts: 5,
    },
  },
  {
    value: 'arms',
    title: 'Arms',
    side: 'front',
    crop: 'arms',
    muscleLevels: {
      biceps: 5,
      triceps: 5,
      forearms: 5,
    },
  },
  {
    value: 'legs',
    title: 'Legs',
    side: 'front',
    crop: 'legs',
    muscleLevels: {
      quads: 5,
      hamstrings: 5,
      calves: 5,
    },
    highlightSlugs: ['quadriceps', 'adductors', 'calves', 'tibialis'],
  },
  {
    value: 'glutes',
    title: 'Glutes',
    side: 'back',
    crop: 'glutes',
    muscleLevels: { glutes: 5 },
  },
  {
    value: 'core',
    title: 'Core',
    side: 'front',
    crop: 'core',
    muscleLevels: {
      abs: 5,
      obliques: 5,
    },
  },
];

function MuscleFocusHeatmapIcon({ option }: { option: MuscleFocusOption }) {
  return (
    <View style={styles.heatmapIcon} pointerEvents="none">
      <FocusedMuscleHeatmapIcon
        muscleLevels={option.muscleLevels}
        side={option.side}
        crop={option.crop}
        highlightSlugs={option.highlightSlugs}
        width={64}
        height={48}
      />
    </View>
  );
}

export default function OnboardingMuscleFocusScreen() {
  useOnboardingFunnelScreen('Q15. Muscle Focus');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<MuscleFocus[]>([]);
  const isDisabled = selected.length === 0;

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive) return;
      const storedFocuses = (state?.muscle_focuses?.filter(Boolean) ?? []) as MuscleFocus[];
      const storedPrimary = (state?.muscle_focus ?? null) as MuscleFocus | null;
      const visibleFocuses = (storedFocuses.length > 0 ? storedFocuses : storedPrimary ? [storedPrimary] : [])
        .filter((focus) => focus !== 'balanced');
      setSelected(visibleFocuses);
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: MuscleFocus) => {
    setSelected((prev) => {
      const wasSelected = prev.includes(value);
      const nextSelected = wasSelected
        ? prev.filter((focus) => focus !== value)
        : [...prev.filter((focus) => focus !== 'balanced'), value];

      void updateOnboardingState({
        muscle_focuses: nextSelected,
        muscle_focus: nextSelected[0] ?? undefined,
      });

      return nextSelected;
    });
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted('muscle_focus', {
      muscle_focuses: selected.join(', '),
      muscle_focus: selected[0] ?? null,
    });
    router.push('/onboarding/fitness-priorities');
  };

  return (
    <OnboardingScreen
      step={11}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="What areas do you want to focus on?"
      subtitle={undefined}
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
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <View key={option.value} style={styles.optionTile}>
            <OnboardingOptionCard
              title={option.title}
              leadingAccessory={<MuscleFocusHeatmapIcon option={option} />}
              selected={selected.includes(option.value)}
              layout="grid"
              onSelect={() => handleSelect(option.value)}
            />
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionTile: {
    width: '48%',
  },
  heatmapIcon: {
    width: 64,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
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
