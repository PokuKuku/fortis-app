import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { getModalWidth } from '@/src/utils/responsive';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

interface FinishConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function FinishConfirmationModal({ visible, onClose, onConfirm }: FinishConfirmationModalProps) {
  const { colors, isDark } = useTheme();

  // Theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: isDark ? '#222222' : '#FFFFFF',
    },
    title: { color: colors.textPrimary },
    message: { color: colors.textSecondary },
    closeButton: {
      backgroundColor: isDark ? '#2a2a2a' : 'rgba(0, 0, 0, 0.08)',
    },
    keepButton: {
      backgroundColor: isDark ? '#333333' : 'rgba(0, 0, 0, 0.08)',
    },
    keepButtonText: { color: colors.textPrimary },
    finishButton: {
      backgroundColor: colors.accentOverlay,
    },
    finishButtonText: { color: colors.accent },
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
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
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
        <Pressable style={styles.centeredView} onPress={onClose} activeOpacity={1}>
          <Animated.View entering={ZoomIn.duration(250)} exiting={ZoomOut.duration(200)}>
            <Pressable style={[styles.container, themedStyles.container]} onPress={(e) => e.stopPropagation()}>
              <StainlessSteelPattern />

              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, themedStyles.title]}>Finish Workout?</Text>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    themedStyles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <XMarkIcon size={20} color={colors.textSecondary} strokeWidth={2} />
                </Pressable>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={[styles.message, themedStyles.message]}>
                  Are you sure you want to finish this workout?
                </Text>

                {/* Action Buttons */}
                <View style={styles.actions}>
                  <Pressable
                    onPress={onClose}
                    style={({ pressed }) => [
                      styles.keepButton,
                      themedStyles.keepButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={[styles.keepButtonText, themedStyles.keepButtonText]}>Keep Going</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleConfirm}
                    style={({ pressed }) => [
                      styles.finishButton,
                      themedStyles.finishButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={[styles.finishButtonText, themedStyles.finishButtonText]}>Finish</Text>
                  </Pressable>
                </View>
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
    width: getModalWidth(320),
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
  message: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  keepButton: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  keepButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  finishButton: {
    flex: 1,
    // backgroundColor now applied via themedStyles.finishButton
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    // color now applied via themedStyles.finishButtonText
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
