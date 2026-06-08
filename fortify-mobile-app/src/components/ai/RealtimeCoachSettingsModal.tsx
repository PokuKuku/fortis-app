import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BaseModal } from '@/src/components/ui/BaseModal';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  CANON_COACH_PERSONALITIES,
  COACH_PERSONALITY_LABELS,
  COACH_VOICE_LABELS,
  COACH_VOICES,
  type AICoachPersonality,
  type AICoachVoice,
  type RealtimeCoachPreferences,
} from '@/src/types/realtimeCoach';
import { getIntensityLabel } from '@/src/utils/realtimeCoach';
import {
  MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS,
  sanitizeCustomScenarioInstructions,
} from '@/src/utils/realtimeCoachPrompt';

interface RealtimeCoachSettingsModalProps {
  visible: boolean;
  preferences: RealtimeCoachPreferences;
  onChange: (preferences: RealtimeCoachPreferences) => Promise<void> | void;
  onClose: () => void;
}

const CUSTOM_COACH_SAVE_ERROR = 'Couldn’t save Custom Coach. Try again.';

export function RealtimeCoachSettingsModal({
  visible,
  preferences,
  onChange,
  onClose,
}: RealtimeCoachSettingsModalProps) {
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [sliderWidth, setSliderWidth] = useState(1);
  const [draftIntensity, setDraftIntensity] = useState(preferences.intensity);
  const [customInstructionsDraft, setCustomInstructionsDraft] = useState('');
  const [isSavingCustomCoach, setIsSavingCustomCoach] = useState(false);
  const [customCoachSaveError, setCustomCoachSaveError] = useState<string | null>(null);
  const draftIntensityRef = useRef(preferences.intensity);
  const customCoachInputRef = useRef<TextInput>(null);
  const wasVisibleRef = useRef(false);
  const sliderRef = useRef<View>(null);
  const sliderPageXRef = useRef<number | null>(null);
  const modalWidth = Math.min(380, Math.max(320, windowWidth - Spacing.xl * 2));
  const maxContentHeight = Math.max(320, windowHeight - Spacing['4xl'] * 2 - 120);
  const optionBg = isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.045)';
  const sliderBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const sliderKnobSize = 22;
  const usableSliderWidth = Math.max(1, sliderWidth - sliderKnobSize);
  const isCustomCoachSelected = preferences.personality === 'custom';
  const savedCustomInstructions = sanitizeCustomScenarioInstructions(preferences.customInstructions);
  const sanitizedCustomInstructionsDraft = sanitizeCustomScenarioInstructions(customInstructionsDraft);
  const isCustomCoachSaveDisabled = isSavingCustomCoach
    || !sanitizedCustomInstructionsDraft
    || (isCustomCoachSelected && sanitizedCustomInstructionsDraft === savedCustomInstructions);
  const coachingStyleOptions = useMemo<AICoachPersonality[]>(() => {
    if (preferences.personality === 'hype') {
      return [...CANON_COACH_PERSONALITIES, 'hype'];
    }

    return CANON_COACH_PERSONALITIES;
  }, [preferences.personality]);

  useEffect(() => {
    draftIntensityRef.current = preferences.intensity;
    setDraftIntensity(preferences.intensity);
  }, [preferences.intensity]);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setCustomInstructionsDraft(savedCustomInstructions);
      setCustomCoachSaveError(null);
      setIsSavingCustomCoach(false);
    }
    wasVisibleRef.current = visible;
  }, [savedCustomInstructions, visible]);

  const updatePersonality = (personality: AICoachPersonality) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void onChange({ ...preferences, personality });
  };

  const selectCustomCoach = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    customCoachInputRef.current?.focus();
  };

  const updateVoice = (voice: AICoachVoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void onChange({ ...preferences, voice });
  };

  const saveCustomCoach = async () => {
    if (isCustomCoachSaveDisabled) return;

    setIsSavingCustomCoach(true);
    setCustomCoachSaveError(null);
    try {
      await onChange({
        ...preferences,
        personality: 'custom',
        customInstructions: sanitizedCustomInstructionsDraft,
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    } catch {
      setCustomCoachSaveError(CUSTOM_COACH_SAVE_ERROR);
    } finally {
      setIsSavingCustomCoach(false);
    }
  };

  const handleSliderLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(Math.max(1, event.nativeEvent.layout.width));
    sliderRef.current?.measureInWindow((pageX) => {
      sliderPageXRef.current = pageX;
    });
  };

  const setDraftIntensityFromPageX = useCallback((pageX: number) => {
    const sliderPageX = sliderPageXRef.current;
    if (sliderPageX === null) return;

    const intensity = Math.min(
      1,
      Math.max(0, (pageX - sliderPageX - sliderKnobSize / 2) / usableSliderWidth)
    );
    draftIntensityRef.current = intensity;
    setDraftIntensity(intensity);
  }, [usableSliderWidth]);

  const commitDraftIntensity = useCallback(() => {
    void onChange({ ...preferences, intensity: draftIntensityRef.current });
  }, [onChange, preferences]);

  const sliderResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const pageX = event.nativeEvent.pageX;
      sliderRef.current?.measureInWindow((sliderPageX) => {
        sliderPageXRef.current = sliderPageX;
        setDraftIntensityFromPageX(pageX);
      });
    },
    onPanResponderMove: (event) => {
      setDraftIntensityFromPageX(event.nativeEvent.pageX);
    },
    onPanResponderRelease: commitDraftIntensity,
    onPanResponderTerminate: commitDraftIntensity,
  }), [commitDraftIntensity, setDraftIntensityFromPageX]);

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
      <ScrollView
        style={{ maxHeight: maxContentHeight }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.controlBlock}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Coaching Style</Text>
          <View style={styles.optionRow}>
            {coachingStyleOptions.map((personality) => {
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
                    { color: selected ? colors.accentForegroundOnFill : colors.textPrimary },
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
            ref={sliderRef}
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

        <View style={styles.controlBlock}>
          <View style={styles.controlLabelRow}>
            <Pressable
              testID="realtime-coach-custom-coach-select-button"
              onPress={selectCustomCoach}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityState={{ selected: isCustomCoachSelected }}
            >
              <Text
                style={[
                  styles.controlLabel,
                  {
                    color: isCustomCoachSelected ? colors.accent : colors.textSecondary,
                  },
                ]}
              >
                Custom Coach
              </Text>
            </Pressable>
            <Text style={[styles.controlValue, { color: colors.textTertiary }]}>
              {customInstructionsDraft.length}/{MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS}
            </Text>
          </View>
          <TextInput
            ref={customCoachInputRef}
            testID="realtime-coach-custom-coach-input"
            value={customInstructionsDraft}
            onChangeText={(value) => {
              setCustomInstructionsDraft(value);
              setCustomCoachSaveError(null);
            }}
            placeholder="Describe your coach here"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.customCoachInput,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.065)' : 'rgba(0,0,0,0.035)',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)',
                color: colors.textPrimary,
              },
            ]}
            multiline
            maxLength={MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS}
            textAlignVertical="top"
            returnKeyType="done"
          />
          {customCoachSaveError ? (
            <Text
              testID="realtime-coach-custom-coach-save-error"
              style={[styles.saveError, { color: colors.error }]}
            >
              {customCoachSaveError}
            </Text>
          ) : null}
          <Pressable
            testID="realtime-coach-custom-coach-save-button"
            accessibilityRole="button"
            accessibilityState={{ disabled: isCustomCoachSaveDisabled }}
            disabled={isCustomCoachSaveDisabled}
            onPress={() => { void saveCustomCoach(); }}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: colors.accent,
                opacity: isCustomCoachSaveDisabled ? 0.42 : pressed ? 0.78 : 1,
              },
            ]}
          >
            {isSavingCustomCoach ? (
              <ActivityIndicator size="small" color={colors.accentForegroundOnFill} />
            ) : (
              <Text style={[styles.saveButtonText, { color: colors.accentForegroundOnFill }]}>
                Save Custom Coach
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
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
    gap: Spacing.md,
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
    width: '48%',
    flexGrow: 1,
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
  customCoachInput: {
    ...Typography.body,
    minHeight: 112,
    maxHeight: 160,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  saveError: {
    ...Typography.caption,
    textAlign: 'center',
  },
  saveButton: {
    minHeight: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  saveButtonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
});
