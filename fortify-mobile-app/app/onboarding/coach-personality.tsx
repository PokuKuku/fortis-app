import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getRealtimeCoachPreferences, setRealtimeCoachPreferences } from '@/src/services/realtimeCoachPreferencesService';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';
import {
  CANON_COACH_PERSONALITIES,
  COACH_PERSONALITY_LABELS,
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type AICoachPersonality,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';

const PERSONALITY_DESCRIPTIONS: Partial<Record<AICoachPersonality, string>> = {
  supportive: 'Encouraging and calm.',
  direct: 'Clear and practical.',
  drill_sergeant: 'Strict and intense.',
  hype: 'High-energy motivation.',
  roast: 'Playful tough love.',
};

const PICK_LATER_PERSONALITY = DEFAULT_REALTIME_COACH_PREFERENCES.personality;

export default function OnboardingCoachPersonalityScreen() {
  useOnboardingFunnelScreen('Q19. Voice Coach Personality');

  const router = useRouter();
  const { colors } = useTheme();
  const [preferences, setPreferences] = useState<RealtimeCoachPreferences>(
    DEFAULT_REALTIME_COACH_PREFERENCES
  );
  const [selectedPersonality, setSelectedPersonality] = useState<AICoachPersonality | null>(null);
  const [pickedLater, setPickedLater] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const [loadedPreferences, onboardingState] = await Promise.all([
        getRealtimeCoachPreferences(),
        getOnboardingState(),
      ]);
      if (!isActive) return;

      setPreferences(loadedPreferences);
      if (onboardingState?.coach_personality === 'pick_later') {
        setPickedLater(true);
        setSelectedPersonality(null);
      } else if (onboardingState?.coach_personality) {
        setPickedLater(false);
        setSelectedPersonality(onboardingState.coach_personality);
      }
    };

    void loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const personalityOptions: AICoachPersonality[] = preferences.personality === 'hype'
    ? [...CANON_COACH_PERSONALITIES, 'hype']
    : CANON_COACH_PERSONALITIES;
  const hasSelection = pickedLater || selectedPersonality !== null;

  const handleSelect = (personality: AICoachPersonality) => {
    const nextPreferences = {
      ...preferences,
      personality,
    };
    setPickedLater(false);
    setSelectedPersonality(personality);
    setPreferences(nextPreferences);
    void setRealtimeCoachPreferences(nextPreferences);
    void updateOnboardingState({ coach_personality: personality });
  };

  const handlePickLater = () => {
    const nextPreferences = {
      ...preferences,
      personality: PICK_LATER_PERSONALITY,
    };
    setPickedLater(true);
    setSelectedPersonality(null);
    setPreferences(nextPreferences);
    void setRealtimeCoachPreferences(nextPreferences);
    void updateOnboardingState({ coach_personality: 'pick_later' });
  };

  const handleContinue = () => {
    if (!hasSelection) return;

    trackOnboardingStepCompleted('coach_personality', {
      coach_personality: pickedLater ? 'pick_later' : selectedPersonality,
      ...(pickedLater ? { saved_coach_personality: PICK_LATER_PERSONALITY } : {}),
    });
    router.push('/onboarding/metrics-intro');
  };

  return (
    <OnboardingScreen
      step={18}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Choose your AI trainer's tone"
      subtitle="You can change this later."
      onBack={() => router.back()}
      contentGap={Spacing.xl}
      floatingFooter={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={!hasSelection}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.options}>
        {personalityOptions.map((personality) => (
          <OnboardingOptionCard
            key={personality}
            title={COACH_PERSONALITY_LABELS[personality]}
            description={PERSONALITY_DESCRIPTIONS[personality]}
            selected={!pickedLater && selectedPersonality === personality}
            onSelect={() => handleSelect(personality)}
          />
        ))}
        <OnboardingOptionCard
          title="I'll pick later"
          description="Create a custom AI tone later."
          selected={pickedLater}
          onSelect={handlePickLater}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: Spacing.sm,
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
