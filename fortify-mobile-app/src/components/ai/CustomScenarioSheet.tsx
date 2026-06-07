import React from 'react';
import {
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
  onChange: (preferences: RealtimeCoachPreferences) => void;
  onClose: () => void;
}

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
  const sheetWidth = Math.min(width, 520);
  const sheetMaxHeight = Math.max(360, height * 0.72);
  const selectedPresetPersonality = SCENARIO_PRESETS.some((preset) => preset.value === preferences.personality)
    ? preferences.personality
    : null;
  const customInstructions = preferences.customInstructions ?? '';
  const isCustomCoachSelected = preferences.personality === 'custom';

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
    onChange({ ...preferences, personality });
  };

  const selectCustomCoach = () => {
    if (isCustomCoachSelected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({ ...preferences, personality: 'custom' });
  };

  const updateCustomInstructions = (value: string) => {
    onChange({
      ...preferences,
      customInstructions: sanitizeCustomScenarioInstructions(value),
    });
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
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[
          styles.backdrop,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.64)' : 'rgba(0,0,0,0.36)' },
        ]}
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
            entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))}
            exiting={SlideOutDown.duration(240).easing(Easing.in(Easing.cubic))}
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
                  {customInstructions.length}/{MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS}
                </Text>
              </View>
              <TextInput
                testID="custom-scenario-instructions-input"
                value={customInstructions}
                onChangeText={updateCustomInstructions}
                placeholder="Describe your coach here"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, inputStyle]}
                multiline
                maxLength={MAX_CUSTOM_SCENARIO_INSTRUCTIONS_CHARS}
                textAlignVertical="top"
                returnKeyType="done"
              />
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
});
