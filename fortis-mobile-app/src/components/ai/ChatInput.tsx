/**
 * ChatInput Component
 *
 * Premium, sleek input area with:
 * - Smooth focus animations
 * - Auto-expanding text input
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PaperAirplaneIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled = false,
  placeholder = 'Ask about your training...',
}: ChatInputProps) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Dynamic theme-aware styles
  const themedStyles = {
    wrapper: {
      backgroundColor: colors.background,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    container: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    input: { color: colors.textPrimary },
    sendButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    sendButtonActive: {
      backgroundColor: colors.accent,
    },
  };

  // Animation values
  const borderOpacity = useSharedValue(0);
  const sendScale = useSharedValue(1);

  const canSend = value.trim().length > 0 && !disabled;

  // Focus animation
  useEffect(() => {
    borderOpacity.value = withTiming(isFocused ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  }, [isFocused, borderOpacity]);

  // Send button animation
  useEffect(() => {
    if (canSend) {
      sendScale.value = withSpring(1.05, { damping: 15, stiffness: 300 });
    } else {
      sendScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  }, [canSend, sendScale]);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: borderOpacity.value > 0 ? colors.accentBorder : 'transparent',
    borderWidth: borderOpacity.value > 0 ? 1.5 : 1,
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
    opacity: canSend ? 1 : 0.4,
  }));

  const handleSend = () => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend();
  };

  return (
    <View style={[styles.wrapper, themedStyles.wrapper]}>
      <Animated.View style={[styles.container, themedStyles.container, containerStyle]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, themedStyles.input]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          maxLength={2000}
          editable={!disabled}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        <AnimatedTouchableOpacity
          style={[styles.sendButton, themedStyles.sendButton, canSend && themedStyles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
          accessibilityLabel="Send message"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSend }}
        >
          <Animated.View style={sendButtonStyle}>
            <PaperAirplaneIcon
              color={canSend ? Colors.white : colors.textTertiary}
              size={IconSizes.md}
            />
          </Animated.View>
        </AnimatedTouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  sendButtonActive: {
    // backgroundColor now applied dynamically via themedStyles.sendButtonActive
  },
});

export default ChatInput;
