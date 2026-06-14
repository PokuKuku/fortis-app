import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { AICoachPersonality, RealtimeCoachPreferences } from '@/src/types/realtimeCoach';
import {
  MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS,
  sanitizeCustomScenarioInstructions,
} from '@/src/utils/realtimeCoachPrompt';

interface CustomScenarioSheetProps {
  visible: boolean;
  preferences: RealtimeCoachPreferences;
  onChange: (preferences: RealtimeCoachPreferences) => Promise<void> | void;
  onClose: () => void;
}

const CUSTOM_COACH_SAVE_ERROR = 'Couldn’t save Custom Coach. Try again.';

const SCENARIO_PRESETS: Array<{ label: string; value: AICoachPersonality }> = [
  { label: 'Standard Coach', value: 'direct' },
  { label: 'Drill Sergeant', value: 'drill_sergeant' },
  { label: 'Roast Master', value: 'roast' },
];

export function CustomScenarioSheet({
  visible,
  preferences,
  onChange,
  onClose,
}: CustomScenarioSheetProps) {
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const wasVisibleRef = useRef(false);
  const [customInstructionsDraft, setCustomInstructionsDraft] = useState('');
  const [isSavingCustomCoach, setIsSavingCustomCoach] = useState(false);
  const [customCoachSaveError, setCustomCoachSaveError] = useState<string | null>(null);
  const sheetWidth = Math.min(width, 520);
  const sheetMaxHeight = Math.max(360, height * 0.72);
  const selectedPresetPersonality = SCENARIO_PRESETS.some((preset) => preset.value === preferences.personality)
    ? preferences.personality
    : null;
  const savedCustomInstructions = sanitizeCustomScenarioInstructions(preferences.customInstructions);
  const isCustomCoachSelected = preferences.personality === 'custom';
  const sanitizedDraft = sanitizeCustomScenarioInstructions(customInstructionsDraft);
  const isCustomCoachSaveDisabled = isSavingCustomCoach
    || !sanitizedDraft
    || (isCustomCoachSelected && sanitizedDraft === savedCustomInstructions);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setCustomInstructionsDraft(savedCustomInstructions);
      setCustomCoachSaveError(null);
      setIsSavingCustomCoach(false);
    }
    wasVisibleRef.current = visible;
  }, [savedCustomInstructions, visible]);

  const sheetStyle = {
    width: sheetWidth,
    maxHeight: sheetMaxHeight,
    backgroundColor: isDark ? '#181818' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  };
  const segmentedStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.045)',
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  };
  const inputStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.065)' : 'rgba(0,0,0,0.035)',
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)',
    color: colors.textPrimary,
  };
  const customCoachPillStyle = {
    backgroundColor: isCustomCoachSelected
      ? colors.accent
      : isDark
        ? 'rgba(255,255,255,0.055)'
        : 'rgba(0,0,0,0.045)',
    borderColor: isCustomCoachSelected
      ? colors.accent
      : isDark
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.1)',
  };
  const updatePersonality = (personality: AICoachPersonality) => {
    if (personality === preferences.personality) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void onChange({ ...preferences, personality });
  };

  const selectCustomCoach = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    inputRef.current?.focus();
  };

  const saveCustomCoach = async () => {
    if (isCustomCoachSaveDisabled) return;

    setIsSavingCustomCoach(true);
    setCustomCoachSaveError(null);
    try {
      await onChange({
        ...preferences,
        personality: 'custom',
        customInstructions: sanitizedDraft,
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    } catch {
      setCustomCoachSaveError(CUSTOM_COACH_SAVE_ERROR);
    } finally {
      setIsSavingCustomCoach(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(240).easing(Easing.out(Easing.quad))}
        exiting={FadeOut.duration(200).easing(Easing.inOut(Easing.quad))}
        style={styles.backdrop}
      >
        <Pressable
          testID="custom-scenario-backdrop"
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoider}
          pointerEvents="box-none"
        >
          <Animated.View
            entering={SlideInDown.springify().damping(24).stiffness(210).mass(0.9)}
            exiting={SlideOutDown.duration(280).easing(Easing.inOut(Easing.cubic))}
            style={[styles.sheet, sheetStyle]}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Coaching Style</Text>
            </View>

            <View style={[styles.segmented, segmentedStyle]}>
              {SCENARIO_PRESETS.map((preset) => {
                const selected = preset.value === selectedPresetPersonality;
                return (
                  <Pressable
                    key={preset.value}
                    testID={`custom-scenario-preset-${preset.value}`}
                    onPress={() => updatePersonality(preset.value)}
                    style={[
                      styles.segment,
                      selected && { backgroundColor: colors.accent },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[
                        styles.segmentText,
                        { color: selected ? colors.accentForegroundOnFill : colors.textSecondary },
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.inputBlock}>
              <View style={styles.labelRow}>
                <Pressable
                  testID="custom-coach-select-button"
                  onPress={selectCustomCoach}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isCustomCoachSelected }}
                  style={[styles.customCoachPill, customCoachPillStyle]}
                >
                  <Text
                    style={[
                      styles.customCoachPillText,
                      {
                        color: isCustomCoachSelected
                          ? colors.accentForegroundOnFill
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    Custom Coach
                  </Text>
                </Pressable>
                <Text style={[styles.count, { color: colors.textTertiary }]}>
                  {customInstructionsDraft.length}/{MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS}
                </Text>
              </View>
              <TextInput
                ref={inputRef}
                testID="custom-scenario-instructions-input"
                value={customInstructionsDraft}
                onChangeText={(value) => {
                  setCustomInstructionsDraft(value);
                  setCustomCoachSaveError(null);
                }}
                placeholder="Describe your coach here"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, inputStyle]}
                multiline
                maxLength={MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS}
                textAlignVertical="top"
                returnKeyType="done"
              />
              {customCoachSaveError ? (
                <Text
                  testID="custom-coach-save-error"
                  style={[styles.saveError, { color: colors.error }]}
                >
                  {customCoachSaveError}
                </Text>
              ) : null}
              <Pressable
                testID="custom-coach-save-button"
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
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  keyboardAvoider: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.lg,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(140,140,140,0.42)',
    alignSelf: 'center',
  },
  header: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 22,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  segmented: {
    minHeight: 48,
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  segmentText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  inputBlock: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  customCoachPill: {
    minHeight: 38,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  customCoachPillText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  count: {
    ...Typography.caption,
  },
  input: {
    ...Typography.body,
    minHeight: 132,
    maxHeight: 180,
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
