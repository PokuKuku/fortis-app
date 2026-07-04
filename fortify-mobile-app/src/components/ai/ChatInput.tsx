/**
 * ChatInput Component
 *
 * Premium, sleek input area with:
 * - Smooth focus animations
 * - Auto-expanding text input
 * - Live voice dictation for AI chat
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { MicrophoneIcon, PaperAirplaneIcon, PlusIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import { openMicrophoneSettings } from '@/src/services/microphonePermissionService';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAddMedia?: () => void;
  onRequestAIConsent?: () => Promise<boolean>;
  hasAttachments?: boolean;
  disabled?: boolean;
  suppressVoicePermissionPrompt?: boolean;
  placeholder?: string;
}

type VoicePhase = 'idle' | 'listening' | 'processing';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type SpeechRecognitionPermissionResponse = {
  granted: boolean;
  canAskAgain?: boolean;
};

type SpeechRecognitionResultEvent = {
  results: Array<{ transcript: string }>;
};

type SpeechRecognitionErrorEvent = {
  error?: string;
  message?: string;
};

type SpeechRecognitionModuleShape = {
  requestPermissionsAsync: () => Promise<SpeechRecognitionPermissionResponse>;
  start: (options: {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    maxAlternatives: number;
  }) => void;
  stop: () => void;
  abort: () => void;
  addListener: (
    eventName: 'start' | 'result' | 'error' | 'end',
    listener: (event?: unknown) => void
  ) => { remove: () => void };
};
const ExpoSpeechRecognitionModule =
  requireOptionalNativeModule<SpeechRecognitionModuleShape>('ExpoSpeechRecognition');

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onAddMedia,
  onRequestAIConsent,
  hasAttachments = false,
  disabled = false,
  suppressVoicePermissionPrompt = false,
  placeholder = 'Ask about your training...',
}: ChatInputProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState(false);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const inputRef = useRef<TextInput>(null);
  const transcriptRef = useRef('');
  const isTearingDownVoiceRef = useRef(false);
  const hasActiveDictationRequestRef = useRef(false);

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
    actionButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    sendButtonActive: {
      backgroundColor: colors.accent,
    },
    voiceButtonActive: {
      backgroundColor: Colors.error,
    },
    voiceButtonProcessing: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    voiceTrack: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    voiceTranscript: { color: colors.textPrimary },
    voicePlaceholder: { color: colors.textTertiary },
  };

  const isVoiceBusy = voicePhase !== 'idle';
  const hasTypedValue = value.trim().length > 0;
  const canSend = (hasTypedValue || hasAttachments) && !disabled && !isVoiceBusy;
  const canUseVoice = !disabled;

  const borderOpacity = useSharedValue(0);
  const actionScale = useSharedValue(1);

  useEffect(() => {
    borderOpacity.value = withTiming(isFocused || isVoiceBusy ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  }, [borderOpacity, isFocused, isVoiceBusy]);

  useEffect(() => {
    if (canSend || voicePhase === 'listening') {
      actionScale.value = withSpring(1.05, { damping: 15, stiffness: 300 });
    } else {
      actionScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  }, [actionScale, canSend, voicePhase]);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: borderOpacity.value > 0 ? colors.accentBorder : 'transparent',
    borderWidth: borderOpacity.value > 0 ? 1.5 : 1,
  }));

  const actionButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: actionScale.value }],
    opacity: disabled ? 0.45 : 1,
  }));

  const resetVoiceState = useCallback(() => {
    setVoicePhase('idle');
    setLiveTranscript('');
    transcriptRef.current = '';
  }, []);

  const showVoicePermissionAlert = useCallback((message: string, canOpenSettings: boolean) => {
    if (canOpenSettings) {
      Alert.alert(
        'Voice dictation unavailable',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              void openMicrophoneSettings();
            },
          },
        ]
      );
      return;
    }

    Alert.alert('Voice dictation unavailable', message);
  }, []);

  useEffect(() => {
    if (!ExpoSpeechRecognitionModule) {
      return;
    }

    const startSubscription = ExpoSpeechRecognitionModule.addListener('start', () => {
      setVoicePhase('listening');
    });

    const resultSubscription = ExpoSpeechRecognitionModule.addListener('result', (event) => {
      const payload = event as SpeechRecognitionResultEvent | undefined;
      if (!payload) return;
      const nextTranscript = payload.results[0]?.transcript?.trim() ?? '';
      if (!nextTranscript) return;
      setLiveTranscript(nextTranscript);
      transcriptRef.current = nextTranscript;
    });

    const errorSubscription = ExpoSpeechRecognitionModule.addListener('error', (event) => {
      const payload = event as SpeechRecognitionErrorEvent | undefined;
      const shouldOpenSettings =
        payload?.error === 'not-allowed' || payload?.error === 'service-not-allowed';
      const isAborted =
        payload?.error === 'aborted' ||
        payload?.message?.toLowerCase().includes('aborted') === true;
      const shouldSuppressAlert =
        suppressVoicePermissionPrompt ||
        isTearingDownVoiceRef.current ||
        isAborted ||
        !hasActiveDictationRequestRef.current;

      hasActiveDictationRequestRef.current = false;
      resetVoiceState();
      if (shouldSuppressAlert) {
        return;
      }
      showVoicePermissionAlert(
        payload?.message || 'Unable to use voice dictation right now.',
        shouldOpenSettings
      );
    });

    const endSubscription = ExpoSpeechRecognitionModule.addListener('end', () => {
      const transcript = transcriptRef.current.trim();
      hasActiveDictationRequestRef.current = false;
      resetVoiceState();

      if (!transcript) {
        return;
      }

      onChangeText(transcript);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });

    return () => {
      startSubscription.remove();
      resultSubscription.remove();
      errorSubscription.remove();
      endSubscription.remove();
    };
  }, [onChangeText, resetVoiceState, showVoicePermissionAlert, suppressVoicePermissionPrompt]);

  useEffect(() => {
    return () => {
      isTearingDownVoiceRef.current = true;
      hasActiveDictationRequestRef.current = false;
      ExpoSpeechRecognitionModule?.abort();
    };
  }, []);

  const handleSendPress = useCallback(() => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend();
  }, [canSend, onSend]);

  const handleMicPress = useCallback(async () => {
    if (!canUseVoice || suppressVoicePermissionPrompt) return;

    if (!ExpoSpeechRecognitionModule) {
      Alert.alert(
        'Voice dictation unavailable',
        'This build does not include the speech recognition native module yet. Rebuild the app with `npx expo run:ios` or `npx expo run:android` and try again.'
      );
      return;
    }

    if (voicePhase === 'listening') {
      setVoicePhase('processing');
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    if (voicePhase === 'processing') {
      return;
    }

    try {
      if (onRequestAIConsent) {
        const allowed = await onRequestAIConsent();
        if (!allowed) return;
      }

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        showVoicePermissionAlert(
          permission.canAskAgain === false
            ? 'Microphone or speech recognition access is off. Enable it in Settings to chat by voice.'
            : 'Microphone and speech recognition permission are required to use AI voice chat.',
          permission.canAskAgain === false
        );
        return;
      }

      transcriptRef.current = '';
      setLiveTranscript('');
      setVoicePhase('listening');
      hasActiveDictationRequestRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
      });
    } catch (error) {
      hasActiveDictationRequestRef.current = false;
      resetVoiceState();
      Alert.alert(
        'Voice dictation unavailable',
        error instanceof Error ? error.message : 'Unable to start voice dictation right now.'
      );
    }
  }, [canUseVoice, onRequestAIConsent, resetVoiceState, showVoicePermissionAlert, suppressVoicePermissionPrompt, voicePhase]);

  return (
    <View
      style={[
        styles.wrapper,
        themedStyles.wrapper,
        { paddingBottom: Math.max(Spacing['2xl'], insets.bottom + Spacing.sm) },
      ]}
    >
      <Animated.View style={[styles.container, themedStyles.container, containerStyle]}>
        {isVoiceBusy ? (
          <View style={[styles.voiceTrack, themedStyles.voiceTrack]}>
            <Text
              style={[
                styles.voiceTranscript,
                liveTranscript.length > 0
                  ? themedStyles.voiceTranscript
                  : themedStyles.voicePlaceholder,
              ]}
              numberOfLines={3}
            >
              {liveTranscript || (voicePhase === 'processing' ? 'Finishing transcript...' : 'Start speaking...')}
            </Text>
          </View>
        ) : (
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
        )}

        <View style={styles.actions}>
          <AnimatedTouchableOpacity
            style={[
              styles.actionButton,
              themedStyles.actionButton,
              voicePhase === 'listening' && themedStyles.voiceButtonActive,
              voicePhase === 'processing' && themedStyles.voiceButtonProcessing,
              actionButtonStyle,
            ]}
            onPress={() => {
              void handleMicPress();
            }}
            disabled={!canUseVoice || disabled}
            activeOpacity={0.8}
            accessibilityLabel={voicePhase === 'listening' ? 'Stop voice dictation' : 'Start voice dictation'}
            accessibilityRole="button"
          >
            <MicrophoneIcon
              color={voicePhase === 'listening' ? Colors.white : colors.textSecondary}
              size={IconSizes.md}
            />
          </AnimatedTouchableOpacity>

          {onAddMedia && (
            <AnimatedTouchableOpacity
              testID="chat-add-media"
              style={[styles.actionButton, themedStyles.actionButton, actionButtonStyle]}
              onPress={onAddMedia}
              disabled={disabled}
              activeOpacity={0.8}
              accessibilityLabel="Add photos or video"
              accessibilityRole="button"
            >
              <PlusIcon color={colors.textSecondary} size={IconSizes.md} />
            </AnimatedTouchableOpacity>
          )}

          <AnimatedTouchableOpacity
            style={[
              styles.actionButton,
              themedStyles.actionButton,
              canSend && themedStyles.sendButtonActive,
              actionButtonStyle,
            ]}
            onPress={handleSendPress}
            disabled={!canSend}
            activeOpacity={0.8}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            <PaperAirplaneIcon
              color={canSend ? colors.accentForegroundOnFill : colors.textTertiary}
              size={IconSizes.md}
            />
          </AnimatedTouchableOpacity>
        </View>
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
  voiceTrack: {
    flex: 1,
    minHeight: 36,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
  },
  voiceTranscript: {
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default ChatInput;
