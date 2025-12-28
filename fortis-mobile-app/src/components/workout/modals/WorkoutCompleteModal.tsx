import { View, Text, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { WorkoutSession } from '@/src/types/workout';
import { getWorkoutSummary } from '@/src/store/workoutStore';
import { formatElapsedTime } from '@/src/hooks/useElapsedTime';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRef, useEffect } from 'react';

interface WorkoutCompleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSaveAsTemplate?: () => void;
  saveTemplateLabel?: string;
  session: WorkoutSession | null;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function WorkoutCompleteModal({
  visible,
  onClose,
  onConfirm,
  onSaveAsTemplate,
  saveTemplateLabel,
  session,
}: WorkoutCompleteModalProps) {
  const { colors, isDark } = useTheme();
  const confettiRef = useRef<ConfettiCannon>(null);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: isDark ? '#222222' : '#FFFFFF',
    },
    title: { color: colors.textPrimary },
    closeButton: {
      backgroundColor: isDark ? '#2a2a2a' : 'rgba(0, 0, 0, 0.05)',
    },
    congratsText: { color: colors.accent },
    statsCard: {
      backgroundColor: isDark ? '#1a1a1a' : 'rgba(0, 0, 0, 0.04)',
    },
    statLabel: { color: colors.textSecondary },
    statValue: { color: colors.textPrimary },
    saveTemplateButton: {
      borderColor: colors.accent,
    },
    saveTemplateButtonText: { color: colors.accent },
    saveTemplateButtonPressed: {
      backgroundColor: colors.accentOverlay,
    },
    // Dynamic confetti color - accent is the primary celebration color
    confettiColors: [colors.accent, '#ffd700', '#ffffff', '#f59e0b', '#ef4444'] as string[],
  };

  // Fire fireworks when modal opens
  useEffect(() => {
    if (visible) {
      // Small delay to ensure modal is visible before fireworks
      const timer = setTimeout(() => {
        confettiRef.current?.start();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  const handleSaveAsTemplate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSaveAsTemplate?.();
  };

  const summary = getWorkoutSummary(session);
  const duration = formatElapsedTime(summary.durationSeconds);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
        <Pressable style={styles.centeredView} onPress={onClose} activeOpacity={1}>
          <Animated.View entering={ZoomIn.duration(250)} exiting={ZoomOut.duration(200)}>
            <Pressable style={[styles.container, themedStyles.container]} onPress={(e) => e.stopPropagation()}>
              <StainlessSteelPattern />

              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, themedStyles.title]}>Workout Complete!</Text>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    themedStyles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <XMarkIcon size={20} color={colors.error} strokeWidth={2} />
                </Pressable>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={[styles.congratsText, themedStyles.congratsText]}>
                  Great work! You crushed it!
                </Text>

                {/* Stats Card */}
                <View style={[styles.statsCard, themedStyles.statsCard]}>
                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, themedStyles.statLabel]}>Exercises</Text>
                    <Text style={[styles.statValue, themedStyles.statValue]}>{summary.totalExercises}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, themedStyles.statLabel]}>Sets</Text>
                    <Text style={[styles.statValue, themedStyles.statValue]}>{summary.totalSets}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, themedStyles.statLabel]}>Duration</Text>
                    <Text style={[styles.statValue, themedStyles.statValue]}>{duration}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonGroup}>
                  {onSaveAsTemplate && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.saveTemplateButton,
                        themedStyles.saveTemplateButton,
                        pressed && themedStyles.saveTemplateButtonPressed,
                      ]}
                      onPress={handleSaveAsTemplate}
                    >
                      <Text style={[styles.saveTemplateButtonText, themedStyles.saveTemplateButtonText]}>
                        {saveTemplateLabel || 'Save as Template'}
                      </Text>
                    </Pressable>
                  )}
                  <GlassButton style={styles.doneButton} onPress={handleConfirm}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </GlassButton>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
      {/* Fireworks celebration effect - centered over modal */}
      <ConfettiCannon
        ref={confettiRef}
        count={100}
        origin={{ x: screenWidth / 2, y: screenHeight / 2 }}
        explosionSpeed={350}
        fallSpeed={3000}
        fadeOut
        autoStart={false}
        colors={themedStyles.confettiColors}
      />
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
    width: 340,
    backgroundColor: '#222222',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: Spacing['2xl'],
    backgroundColor: '#2a2a2a',
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    zIndex: 1,
  },
  congratsText: {
    fontSize: 18,
    fontWeight: '600',
    // color now applied via themedStyles (colors.accent)
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  statsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  buttonGroup: {
    gap: Spacing.md,
  },
  saveTemplateButton: {
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    // borderColor now applied via themedStyles.saveTemplateButton
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveTemplateButtonPressed: {
    // backgroundColor now applied via themedStyles.saveTemplateButtonPressed
  },
  saveTemplateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    // color now applied via themedStyles.saveTemplateButtonText
  },
  doneButton: {
    height: 44,
    borderRadius: BorderRadius.lg,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
