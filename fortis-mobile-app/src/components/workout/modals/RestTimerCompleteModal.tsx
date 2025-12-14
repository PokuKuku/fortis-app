import { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Clock } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, Easing } from 'react-native-reanimated';

interface RestTimerCompleteModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function RestTimerCompleteModal({
  visible,
  onDismiss,
}: RestTimerCompleteModalProps) {
  // Trigger haptic feedback when modal appears
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(250).easing(Easing.out(Easing.cubic))} exiting={FadeOut.duration(200).easing(Easing.in(Easing.cubic))} style={styles.backdrop}>
        <Pressable style={styles.centeredView} onPress={onDismiss} activeOpacity={1}>
          <Animated.View entering={ZoomIn.duration(300).easing(Easing.out(Easing.cubic))} exiting={ZoomOut.duration(200).easing(Easing.in(Easing.cubic))}>
            <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
              <StainlessSteelPattern />

              {/* Content */}
              <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Clock size={48} color={Colors.success} strokeWidth={2} />
                </View>

                {/* Title */}
                <Text style={styles.title}>Time's Up!</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                  Rest period complete. Ready for your next set?
                </Text>

                {/* Button */}
                <GlassButton style={styles.button} onPress={onDismiss}>
                  <Text style={styles.buttonText}>Let's Go</Text>
                </GlassButton>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  container: {
    width: 300,
    backgroundColor: '#222222',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['3xl'],
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
});
