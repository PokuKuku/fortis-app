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
} from 'expo-speech-recognition';
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

interface SelectedImage {
  uri: string;
  base64: string;
  mimeType: AIImageMimeType;
}

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImageSelect: (image: SelectedImage) => void;
  onImageClear: () => void;
  selectedImage: SelectedImage | null;
  disabled?: boolean;
  placeholder?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const borderOpacity = useSharedValue(0);
  const sendScale = useSharedValue(1);
  const micPulse = useSharedValue(1);

  const canSend = (value.trim().length > 0 || selectedImage) && !disabled;

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

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(34, 197, 94, ${borderOpacity.value * 0.4})`,
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
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0]?.transcript || '';
      if (transcript) {
        // Append to existing text or replace
        onChangeText(value ? `${value} ${transcript}` : transcript);
      }
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
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
          lang: 'en-US',
          interimResults: true,
          continuous: false,
        });
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        Alert.alert('Error', 'Failed to start voice input. Please try again.');
      }
    }
  }, [isRecording]);

  return (
    <View style={styles.wrapper}>
      {/* Floating Image Preview */}
      {selectedImage && (
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
              style={styles.removeImageButton}
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
          <Text style={styles.listeningText}>Listening...</Text>
        </Animated.View>
      )}

      {/* Main Input Container */}
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Camera Button */}
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
            color={disabled ? Colors.textTertiary : Colors.textSecondary}
            size={IconSizes.md}
          />
        </TouchableOpacity>

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
                color={disabled ? Colors.textTertiary : Colors.textSecondary}
                size={IconSizes.md}
              />
            )}
          </Animated.View>
        </AnimatedTouchableOpacity>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={selectedImage ? 'Describe the workout (optional)...' : placeholder}
          placeholderTextColor={Colors.textTertiary}
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
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
          accessibilityLabel="Send message"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSend }}
        >
          <Animated.View style={sendButtonStyle}>
            <PaperAirplaneIcon
              color={canSend ? Colors.white : Colors.textTertiary}
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
  },
  recordingButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  listeningIndicator: {
    marginBottom: Spacing.sm,
  },
  listeningText: {
    ...Typography.caption,
    color: Colors.success,
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
    backgroundColor: Colors.success,
  },
});

export default ChatInput;
