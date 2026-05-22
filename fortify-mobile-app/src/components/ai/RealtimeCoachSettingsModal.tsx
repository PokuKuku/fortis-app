import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BaseModal } from '@/src/components/ui/BaseModal';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  COACH_PERSONALITIES,
  COACH_PERSONALITY_LABELS,
  COACH_VOICE_LABELS,
  COACH_VOICES,
  type AICoachPersonality,
  type AICoachVoice,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';
import { getIntensityLabel } from '@/src/utils/realtimeCoach';

interface RealtimeCoachSettingsModalProps {
  visible: boolean;
  preferences: RealtimeCoachPreferences;
  onChange: (preferences: RealtimeCoachPreferences) => void;
  onClose: () => void;
}

export function RealtimeCoachSettingsModal({
  visible,
  preferences,
  onChange,
  onClose,
}: RealtimeCoachSettingsModalProps) {
  const { colors, isDark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [sliderWidth, setSliderWidth] = useState(1);
  const [draftIntensity, setDraftIntensity] = useState(preferences.intensity);
  const draftIntensityRef = useRef(preferences.intensity);
  const modalWidth = Math.min(380, Math.max(320, windowWidth - Spacing.xl * 2));
  const optionBg = isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.045)';
  const sliderBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const sliderKnobSize = 22;
  const usableSliderWidth = Math.max(1, sliderWidth - sliderKnobSize);

  useEffect(() => {
    draftIntensityRef.current = preferences.intensity;
    setDraftIntensity(preferences.intensity);
  }, [preferences.intensity]);

  const updatePersonality = (personality: AICoachPersonality) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({ ...preferences, personality });
  };

  const updateVoice = (voice: AICoachVoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({ ...preferences, voice });
  };

  const handleSliderLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(Math.max(1, event.nativeEvent.layout.width));
  };

  const setDraftIntensityFromX = useCallback((locationX: number) => {
    const intensity = Math.min(
      1,
      Math.max(0, (locationX - sliderKnobSize / 2) / usableSliderWidth)
    );
    draftIntensityRef.current = intensity;
    setDraftIntensity(intensity);
  }, [usableSliderWidth]);

  const commitDraftIntensity = useCallback(() => {
    onChange({ ...preferences, intensity: draftIntensityRef.current });
  }, [onChange, preferences]);

  const sliderResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      setDraftIntensityFromX(event.nativeEvent.locationX);
    },
    onPanResponderMove: (event) => {
      setDraftIntensityFromX(event.nativeEvent.locationX);
    },
    onPanResponderRelease: commitDraftIntensity,
    onPanResponderTerminate: commitDraftIntensity,
  }), [commitDraftIntensity, setDraftIntensityFromX]);

  const knobLeft = draftIntensity * usableSliderWidth;
  const knobCenter = knobLeft + sliderKnobSize / 2;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Voice Coach"
      titleStyle={styles.title}
      width={modalWidth}
    >
      <View style={styles.content}>
        <View style={styles.controlBlock}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Personality</Text>
          <View style={styles.optionRow}>
            {COACH_PERSONALITIES.map((personality) => {
              const selected = personality === preferences.personality;
              return (
                <Pressable
                  key={personality}
                  onPress={() => updatePersonality(personality)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected
                        ? colors.accent
                        : optionBg,
                      borderColor: selected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    { color: selected ? Colors.white : colors.textPrimary },
                  ]}>
                    {COACH_PERSONALITY_LABELS[personality]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.controlBlock}>
          <View style={styles.controlLabelRow}>
            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Intensity</Text>
            <Text style={[styles.controlValue, { color: colors.textPrimary }]}>
              {getIntensityLabel(draftIntensity)}
            </Text>
          </View>
          <View
            onLayout={handleSliderLayout}
            style={styles.sliderTouchArea}
            {...sliderResponder.panHandlers}
          >
            <View style={[styles.sliderTrack, { backgroundColor: sliderBg }]}>
              <View style={[styles.sliderFill, { width: knobCenter, backgroundColor: colors.accent }]} />
            </View>
            <View
              style={[
                styles.sliderKnob,
                {
                  left: knobLeft,
                  width: sliderKnobSize,
                  height: sliderKnobSize,
                  borderRadius: sliderKnobSize / 2,
                  backgroundColor: colors.background,
                  borderColor: colors.accent,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.controlBlock}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Voice</Text>
          <View style={styles.optionRow}>
            {COACH_VOICES.map((voice) => {
              const selected = voice === preferences.voice;
              return (
                <Pressable
                  key={voice}
                  onPress={() => updateVoice(voice)}
                  style={[
                    styles.voiceOption,
                    {
                      backgroundColor: selected
                        ? colors.accentOverlay
                        : optionBg,
                      borderColor: selected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                    {COACH_VOICE_LABELS[voice]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 24,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  content: {
    gap: Spacing.lg,
  },
  controlBlock: {
    gap: Spacing.md,
  },
  controlLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    ...Typography.labelSmall,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  controlValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  voiceOption: {
    width: '48%',
    minHeight: 42,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  optionText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  sliderTouchArea: {
    height: 34,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
  },
  sliderKnob: {
    position: 'absolute',
    borderWidth: 4,
  },
});
