/**
 * StreamingText Component
 *
 * Typewriter animation for AI responses.
 * Characters appear gradually with a blinking cursor.
 * Tap to skip to full text.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, Pressable, StyleSheet, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

interface StreamingTextProps {
  /** The full text to stream */
  text: string;
  /** Speed in milliseconds per character (default: 12ms) */
  speed?: number;
  /** Whether streaming is enabled (false = show full text immediately) */
  streaming?: boolean;
  /** Callback when streaming completes */
  onComplete?: () => void;
  /** Text style to apply */
  style?: TextStyle;
  /** Whether to show the cursor */
  showCursor?: boolean;
}

export function StreamingText({
  text,
  speed = 12,
  streaming = true,
  onComplete,
  style,
  showCursor = true,
}: StreamingTextProps) {
  const { colors } = useTheme();
  const [displayedText, setDisplayedText] = useState(streaming ? '' : text);
  const [isComplete, setIsComplete] = useState(!streaming);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cursor blink animation
  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    if (!isComplete && showCursor) {
      cursorOpacity.value = withRepeat(
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      cursorOpacity.value = 0;
    }
  }, [isComplete, showCursor, cursorOpacity]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  // Streaming effect
  useEffect(() => {
    if (!streaming) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    // Reset for new text
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        // Add characters in small chunks for smoother feel
        const chunkSize = text[indexRef.current] === ' ' ? 2 : 1;
        const nextIndex = Math.min(indexRef.current + chunkSize, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        indexRef.current = nextIndex;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed, streaming, onComplete]);

  // Skip to full text on tap
  const handlePress = useCallback(() => {
    if (!isComplete && streaming) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
    }
  }, [isComplete, streaming, text, onComplete]);

  return (
    <Pressable onPress={handlePress} disabled={isComplete}>
      <Text style={[styles.text, { color: colors.textPrimary }, style]}>
        {displayedText}
        {!isComplete && showCursor && (
          <Animated.Text style={[styles.cursor, cursorStyle]}>|</Animated.Text>
        )}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    color: Colors.textPrimary,
  },
  cursor: {
    color: Colors.success,
    fontWeight: '300',
  },
});

export default StreamingText;
