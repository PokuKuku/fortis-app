/**
 * ChatInput Component
 *
 * Premium, sleek input area with:
 * - Smooth focus animations
 * - Floating image preview
 * - Voice input with pulse animation
 * - Auto-expanding text input
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  RecognizerIntentEnableLanguageSwitch,
} from 'expo-speech-recognition';
import type { ExpoSpeechRecognitionResultEvent } from 'expo-speech-recognition';
import {
  PaperAirplaneIcon,
  CameraIcon,
  MicrophoneIcon,
  XMarkIcon,
  StopIcon,
} from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { AIImageMimeType } from '@/src/types/ai';
import { useTheme } from '@/src/contexts/ThemeContext';

interface SelectedImage {
  uri: string;
  base64: string;
  mimeType: AIImageMimeType;
}

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImageSelect?: (image: SelectedImage) => void;
  onImageClear?: () => void;
  selectedImage?: SelectedImage | null;
  disabled?: boolean;
  placeholder?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const DICTATION_LANGUAGE_TAGS = [
  'en-US',
  'en-GB',
  'en-AU',
  'en-CA',
  'es-ES',
  'es-MX',
  'fr-FR',
  'pt-BR',
];

const DICTATION_CONTEXT_STRINGS = [
  'workout',
  'training',
  'session',
  'warm up',
  'cool down',
  'set',
  'sets',
  'rep',
  'reps',
  'RPE',
  'RIR',
  'AMRAP',
  'EMOM',
  'HIIT',
  'PR',
  'PB',
  '1RM',
  '5RM',
  'superset',
  'dropset',
  'tempo',
  'rest',
  'rest day',
  'deload',
  'volume',
  'intensity',
  'bench press',
  'deadlift',
  'squat',
  'front squat',
  'back squat',
  'overhead press',
  'shoulder press',
  'row',
  'barbell row',
  'dumbbell row',
  'pull up',
  'pullup',
  'chin up',
  'push up',
  'pushup',
  'dip',
  'lunge',
  'split squat',
  'hip thrust',
  'glute bridge',
  'romanian deadlift',
  'RDL',
  'lat pulldown',
  'leg press',
  'calf raise',
  'kettlebell',
  'dumbbell',
  'barbell',
  'plate',
  'kg',
  'kgs',
  'kilogram',
  'kilograms',
  'lb',
  'lbs',
  'pound',
  'pounds',
  'interval',
  'cardio',
  'mobility',
  'stretch',
  'stretching',
  'core',
  'plank',
  'burpee',
  'bike',
  'rower',
  'treadmill',
  'zone 2',
  'entrenamiento',
  'series',
  'repeticiones',
  'sentadilla',
  'peso muerto',
  'press de banca',
  'dominadas',
  'flexiones',
  'zancadas',
];

const normalizeTranscript = (transcript: string) => transcript.trim();

const buildDictationValue = (baseText: string, transcript: string) => {
  const trimmedTranscript = normalizeTranscript(transcript);
  if (!trimmedTranscript) return baseText;
  if (!baseText) return trimmedTranscript;
  const needsSpace = !/\s$/.test(baseText);
  return `${baseText}${needsSpace ? ' ' : ''}${trimmedTranscript}`;
};

const pickBestTranscript = (event: ExpoSpeechRecognitionResultEvent) => {
  if (!event?.results?.length) return '';
  let best = event.results[0];

  for (const result of event.results) {
    if (result.confidence > best.confidence) {
      best = result;
      continue;
    }
    if (result.confidence === best.confidence && result.transcript.length > best.transcript.length) {
      best = result;
    }
  }

  return best.transcript;
};

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onImageSelect,
  onImageClear,
  selectedImage,
  disabled = false,
  placeholder = 'Ask about your training...',
}: ChatInputProps) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const dictationActiveRef = useRef(false);
  const dictationLastTranscriptRef = useRef('');
  const dictationBaseTextRef = useRef('');

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
    listeningText: { color: colors.accent },
    removeImageButton: {
      borderColor: colors.background,
    },
  };

  // Animation values
  const borderOpacity = useSharedValue(0);
  const sendScale = useSharedValue(1);
  const micPulse = useSharedValue(1);

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

  // Recording pulse animation
  useEffect(() => {
    if (isRecording) {
      micPulse.value = withRepeat(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      micPulse.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording, micPulse]);

  // Use accent color for focus border
  const accentColor = colors.accent;
  const containerStyle = useAnimatedStyle(() => ({
    borderColor: borderOpacity.value > 0 ? colors.accentBorder : 'transparent',
    borderWidth: borderOpacity.value > 0 ? 1.5 : 1,
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
    opacity: canSend ? 1 : 0.4,
  }));

  const micPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micPulse.value }],
  }));

  const handleSend = () => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend();
  };

  const handleImagePick = async () => {
    if (!onImageSelect) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert('Add Image', 'Choose an image source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera access is required.');
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            base64: true,
          });

          if (!result.canceled && result.assets[0]?.base64) {
            const asset = result.assets[0];
            const base64 = asset.base64;
            if (base64) {
              onImageSelect({
                uri: asset.uri,
                base64,
                mimeType: (asset.mimeType || 'image/jpeg') as AIImageMimeType,
              });
            }
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Photo library access is required.');
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            base64: true,
          });

          if (!result.canceled && result.assets[0]?.base64) {
            const asset = result.assets[0];
            const base64 = asset.base64;
            if (base64) {
              onImageSelect({
                uri: asset.uri,
                base64,
                mimeType: (asset.mimeType || 'image/jpeg') as AIImageMimeType,
              });
            }
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Speech recognition event handlers
  useSpeechRecognitionEvent('result', (event) => {
    if (!dictationActiveRef.current) return;
    const transcript = normalizeTranscript(pickBestTranscript(event));
    if (!transcript || transcript === dictationLastTranscriptRef.current) return;
    dictationLastTranscriptRef.current = transcript;
    const nextValue = buildDictationValue(dictationBaseTextRef.current, transcript);
    onChangeText(nextValue);
  });

  useSpeechRecognitionEvent('end', () => {
    dictationActiveRef.current = false;
    dictationLastTranscriptRef.current = '';
    setIsRecording(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'no-speech' || event.error === 'speech-timeout') {
      dictationActiveRef.current = false;
      dictationLastTranscriptRef.current = '';
      setIsRecording(false);
      return;
    }
    console.error('Speech recognition error:', event.error);
    dictationActiveRef.current = false;
    dictationLastTranscriptRef.current = '';
    setIsRecording(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  });

  const handleVoiceToggle = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        await ExpoSpeechRecognitionModule.stop();
      } catch {
        // Ignore errors when stopping
      }
      setIsRecording(false);
    } else {
      if (dictationActiveRef.current) return;
      // Start recording
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Check permissions
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert(
          'Microphone Permission',
          'Voice input requires microphone access. Please enable it in Settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Start recognition
      try {
        await ExpoSpeechRecognitionModule.start({
          lang: DICTATION_LANGUAGE_TAGS[0],
          interimResults: true,
          continuous: false,
          addsPunctuation: true,
          contextualStrings: DICTATION_CONTEXT_STRINGS,
          androidIntentOptions: {
            EXTRA_ENABLE_LANGUAGE_DETECTION: true,
            EXTRA_ENABLE_LANGUAGE_SWITCH:
              RecognizerIntentEnableLanguageSwitch.LANGUAGE_SWITCH_BALANCED,
            EXTRA_LANGUAGE_DETECTION_ALLOWED_LANGUAGES: DICTATION_LANGUAGE_TAGS,
            EXTRA_LANGUAGE_SWITCH_ALLOWED_LANGUAGES: DICTATION_LANGUAGE_TAGS,
          },
        });
        dictationActiveRef.current = true;
        dictationLastTranscriptRef.current = '';
        dictationBaseTextRef.current = value;
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        dictationActiveRef.current = false;
        Alert.alert('Error', 'Failed to start voice input. Please try again.');
      }
    }
  }, [isRecording, onChangeText, value]);

  return (
    <View style={[styles.wrapper, themedStyles.wrapper]}>
      {/* Floating Image Preview - only show when image handling is enabled */}
      {selectedImage && onImageClear && (
        <Animated.View
          entering={SlideInUp.duration(250).springify()}
          exiting={FadeOut.duration(150)}
          style={styles.imagePreviewWrapper}
        >
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[styles.removeImageButton, themedStyles.removeImageButton]}
              onPress={onImageClear}
              activeOpacity={0.8}
              accessibilityLabel="Remove attached image"
              accessibilityRole="button"
            >
              <XMarkIcon color={Colors.white} size={12} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Listening indicator */}
      {isRecording && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={styles.listeningIndicator}
        >
          <Text style={[styles.listeningText, themedStyles.listeningText]}>Listening...</Text>
        </Animated.View>
      )}

      {/* Main Input Container */}
      <Animated.View style={[styles.container, themedStyles.container, containerStyle]}>
        {/* Camera Button - only show when image handling is enabled */}
        {onImageSelect && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleImagePick}
            disabled={disabled}
            activeOpacity={0.7}
            accessibilityLabel="Attach image"
            accessibilityRole="button"
            accessibilityHint="Choose from camera or photo library"
          >
            <CameraIcon
              color={disabled ? colors.textTertiary : colors.textSecondary}
              size={IconSizes.md}
            />
          </TouchableOpacity>
        )}

        {/* Voice Button */}
        <AnimatedTouchableOpacity
          style={[styles.iconButton, isRecording && styles.recordingButton]}
          onPress={handleVoiceToggle}
          disabled={disabled}
          activeOpacity={0.7}
          accessibilityLabel={isRecording ? "Stop recording" : "Start voice input"}
          accessibilityRole="button"
          accessibilityState={{ selected: isRecording }}
        >
          <Animated.View style={isRecording ? micPulseStyle : undefined}>
            {isRecording ? (
              <StopIcon color={Colors.error} size={IconSizes.md} />
            ) : (
              <MicrophoneIcon
                color={disabled ? colors.textTertiary : colors.textSecondary}
                size={IconSizes.md}
              />
            )}
          </Animated.View>
        </AnimatedTouchableOpacity>

        {/* Text Input */}
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

        {/* Send Button */}
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
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  imagePreviewWrapper: {
    marginBottom: Spacing.sm,
  },
  imagePreview: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    minHeight: 48,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  recordingButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  listeningIndicator: {
    marginBottom: Spacing.sm,
  },
  listeningText: {
    ...Typography.caption,
    // color now applied dynamically via themedStyles.listeningText
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
