import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getRealtimeCoachPreferences, setRealtimeCoachPreferences } from '@/src/services/realtimeCoachPreferencesService';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';
import {
  COACH_VOICE_LABELS,
  COACH_VOICES,
  DEFAULT_REALTIME_COACH_PREFERENCES,
  type AICoachVoice,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';
import { moderateScale, scale } from '@/src/utils/responsive';

const VOICE_PREVIEW_AUDIO: Record<AICoachVoice, number> = {
  marin: require('../../assets/audio/voice-previews/marin.m4a'),
  cedar: require('../../assets/audio/voice-previews/cedar.m4a'),
  coral: require('../../assets/audio/voice-previews/coral.m4a'),
  verse: require('../../assets/audio/voice-previews/verse.m4a'),
};

const PREVIEW_AUDIO_MODE = {
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  interruptionModeIOS: InterruptionModeIOS.DoNotMix,
  interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
};

function VoiceBars({ selected, playing }: { selected: boolean; playing: boolean }) {
  const { colors, isDark } = useTheme();
  const barColor = selected ? colors.accentForegroundOnFill : colors.accent;
  const inactiveColor = isDark ? 'rgba(255,255,255,0.54)' : 'rgba(30,41,59,0.46)';
  const heights = [18, 28, 44, 34, 40, 24];

  return (
    <View style={styles.bars} accessibilityElementsHidden>
      {heights.map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={[
            styles.bar,
            {
              height: scale(playing && index % 2 === 0 ? height + 8 : height),
              backgroundColor: playing || selected ? barColor : inactiveColor,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function OnboardingCoachVoiceScreen() {
  useOnboardingFunnelScreen('Q20. Voice Coach Voice');

  const router = useRouter();
  const { colors, isDark } = useTheme();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [preferences, setPreferences] = useState<RealtimeCoachPreferences>(
    DEFAULT_REALTIME_COACH_PREFERENCES
  );
  const [playingVoice, setPlayingVoice] = useState<AICoachVoice | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadPreferences = async () => {
      const loaded = await getRealtimeCoachPreferences();
      if (!isActive) return;
      setPreferences(loaded);
    };

    void loadPreferences();

    return () => {
      isActive = false;
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, []);

  const stopPreview = async () => {
    const currentSound = soundRef.current;
    soundRef.current = null;
    setPlayingVoice(null);
    if (currentSound) {
      await currentSound.unloadAsync();
    }
  };

  const handleSelectVoice = async (voice: AICoachVoice) => {
    Haptics.selectionAsync();
    const nextPreferences = { ...preferences, voice };
    setPreferences(nextPreferences);
    void setRealtimeCoachPreferences(nextPreferences);

    try {
      await stopPreview();
      await Audio.setAudioModeAsync(PREVIEW_AUDIO_MODE);
      const { sound } = await Audio.Sound.createAsync(
        VOICE_PREVIEW_AUDIO[voice],
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            void stopPreview();
          }
        }
      );
      soundRef.current = sound;
      setPlayingVoice(voice);
    } catch {
      setPlayingVoice(null);
    }
  };

  const handleContinue = () => {
    trackOnboardingStepCompleted('coach_voice', {
      coach_voice: preferences.voice,
    });
    router.push('/onboarding/metrics-intro');
  };

  return (
    <OnboardingScreen
      step={19}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Choose your AI trainer's voice"
      subtitle="You can change this later."
      onBack={() => router.back()}
      bodyAlign="center"
      contentGap={Spacing.xl}
      footer={
        <GlassButton style={styles.button} onPress={handleContinue} hapticFeedback="impactMedium">
          <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Next</Text>
        </GlassButton>
      }
    >
      <View style={styles.grid}>
        {COACH_VOICES.map((voice) => {
          const selected = preferences.voice === voice;
          const playing = playingVoice === voice;
          return (
            <View key={voice} style={styles.voiceItem}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Preview ${COACH_VOICE_LABELS[voice]}`}
                accessibilityState={{ selected }}
                onPress={() => void handleSelectVoice(voice)}
                style={[
                  styles.voiceButton,
                  {
                    backgroundColor: selected
                      ? colors.accent
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.045)',
                    borderColor: selected ? colors.accent : colors.glassBorder,
                    shadowColor: isDark ? '#000000' : '#1D2433',
                  },
                  playing ? styles.voiceButtonPlaying : null,
                ]}
              >
                <VoiceBars selected={selected} playing={playing} />
              </Pressable>
              <Text
                style={[
                  styles.voiceLabel,
                  { color: selected ? colors.accent : colors.textPrimary },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {COACH_VOICE_LABELS[voice]}
              </Text>
            </View>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: scale(Spacing.xl),
  },
  voiceItem: {
    width: '48%',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  voiceButton: {
    width: scale(124),
    height: scale(124),
    maxWidth: '100%',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 4,
  },
  voiceButtonPlaying: {
    transform: [{ scale: 1.03 }],
  },
  bars: {
    height: scale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(7),
  },
  bar: {
    width: scale(7),
    borderRadius: BorderRadius.full,
  },
  voiceLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(17),
    letterSpacing: 0,
    textAlign: 'center',
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
