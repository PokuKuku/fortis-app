/**
 * BaseModal
 *
 * Reusable modal component that encapsulates the app's consistent modal styling.
 * Includes StainlessSteelPattern background, animations, and standard header layout.
 *
 * Supports both dark and light themes.
 *
 * @example
 * // Simple confirmation modal
 * <BaseModal visible={visible} onClose={onClose} title="Confirm Action">
 *   <Text style={modalStyles.message}>Are you sure?</Text>
 *   <View style={modalStyles.actions}>
 *     <Pressable style={modalStyles.cancelButton} onPress={onClose}>
 *       <Text style={modalStyles.cancelButtonText}>Cancel</Text>
 *     </Pressable>
 *     <Pressable style={modalStyles.successButton} onPress={onConfirm}>
 *       <Text style={modalStyles.successButtonText}>Confirm</Text>
 *     </Pressable>
 *   </View>
 * </BaseModal>
 *
 * @example
 * // Theme-aware modal (recommended)
 * const styles = useModalStyles();
 * <BaseModal visible={visible} onClose={onClose} title="Confirm">
 *   <Text style={styles.message}>Are you sure?</Text>
 *   <View style={styles.actions}>
 *     <Pressable style={styles.cancelButton} onPress={onClose}>
 *       <Text style={styles.cancelButtonText}>Cancel</Text>
 *     </Pressable>
 *   </View>
 * </BaseModal>
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';

export interface BaseModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title displayed in header */
  title: string;
  /** Optional icon displayed before the title */
  icon?: React.ReactNode;
  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean;
  /** Close button icon color (default: theme-aware) */
  closeButtonColor?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Whether tapping backdrop closes modal (default: true) */
  closeOnBackdropPress?: boolean;
  /** Whether to trigger haptic on close (default: true) */
  hapticOnClose?: boolean;
  /** Container width (default: 320) */
  width?: number;
  /** Modal content animation (default: 'zoom') */
  animation?: 'zoom' | 'slide_from_right';
}

export function BaseModal({
  visible,
  onClose,
  title,
  icon,
  showCloseButton = true,
  closeButtonColor,
  children,
  closeOnBackdropPress = true,
  hapticOnClose = true,
  width = 320,
  animation = 'zoom',
}: BaseModalProps) {
  const { colors, isDark } = useTheme();

  // Theme-aware colors
  const themedCloseButtonColor = closeButtonColor || colors.textSecondary;
  const containerBg = isDark ? '#222222' : '#FFFFFF';
  const closeButtonBg = isDark ? '#2a2a2a' : '#F0F0F0';

  const handleClose = () => {
    if (hapticOnClose) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      handleClose();
    }
  };

  if (!visible) return null;

  const contentEntering =
    animation === 'slide_from_right'
      ? SlideInRight.duration(250)
      : ZoomIn.duration(250);
  const contentExiting =
    animation === 'slide_from_right'
      ? SlideOutRight.duration(200)
      : ZoomOut.duration(200);

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
        style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }]}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={handleBackdropPress}
        />
        <View style={styles.centeredView} pointerEvents="box-none">
          <Animated.View
            entering={contentEntering}
            exiting={contentExiting}
          >
            <View style={[styles.container, { width, backgroundColor: containerBg }]}>
              <StainlessSteelPattern />

              {/* Header */}
              <View style={styles.header}>
                {showCloseButton && (
                  <Pressable
                    onPress={handleClose}
                    style={({ pressed }) => [
                      styles.closeButton,
                      { backgroundColor: closeButtonBg },
                      pressed && styles.closeButtonPressed,
                    ]}
                  >
                    <XMarkIcon size={20} color={themedCloseButtonColor} strokeWidth={2} />
                  </Pressable>
                )}
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
              </View>

              {/* Content */}
              <View style={styles.content}>{children}</View>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
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
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
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
});

/**
 * Hook for theme-aware modal button and text styles.
 * Use this instead of the static modalStyles for proper theme support.
 */
export function useModalStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(() => ({
    // Message text
    message: {
      fontSize: FontSizes.base,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing['2xl'],
      lineHeight: 22,
    } as TextStyle,

    // Button container for two-button layouts
    actions: {
      flexDirection: 'row',
      gap: Spacing.md,
    } as ViewStyle,

    // Base button style
    buttonBase: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
    } as ViewStyle,

    // Cancel/neutral button
    cancelButton: {
      flex: 1,
      backgroundColor: isDark ? '#333333' : '#E5E5E5',
      paddingVertical: 12,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
    } as ViewStyle,
    cancelButtonText: {
      fontSize: FontSizes.base,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    // Success button (green)
    successButton: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
      paddingVertical: 12,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
    } as ViewStyle,
    successButtonText: {
      fontSize: FontSizes.base,
      fontWeight: '700',
      color: colors.success,
    } as TextStyle,

    // Warning button (amber)
    warningButton: {
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)',
      paddingVertical: 12,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
    } as ViewStyle,
    warningButtonText: {
      fontSize: FontSizes.base,
      fontWeight: '700',
      color: colors.warning,
    } as TextStyle,

    // Error/destructive button (red)
    errorButton: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
      paddingVertical: 12,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
    } as ViewStyle,
    errorButtonText: {
      fontSize: FontSizes.base,
      fontWeight: '700',
      color: colors.error,
    } as TextStyle,

    // Pressed state
    buttonPressed: {
      opacity: 0.7,
    } as ViewStyle,
  }), [colors, isDark]);
}

/**
 * Pre-built modal button and text styles for consistent styling across modals.
 * Use these with Pressable components inside BaseModal.
 *
 * @deprecated Use useModalStyles() hook for theme-aware styles.
 */
export const modalStyles = StyleSheet.create({
  // Message text
  message: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  } as TextStyle,

  // Button container for two-button layouts
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  } as ViewStyle,

  // Base button style (extend with color variants)
  buttonBase: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  } as ViewStyle,

  // Cancel/neutral button (gray)
  cancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  } as ViewStyle,
  cancelButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  } as TextStyle,

  // Success button (green)
  successButton: {
    flex: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  } as ViewStyle,
  successButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.success,
  } as TextStyle,

  // Warning button (amber)
  warningButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  } as ViewStyle,
  warningButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#f59e0b',
  } as TextStyle,

  // Error/destructive button (red)
  errorButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  } as ViewStyle,
  errorButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.error,
  } as TextStyle,

  // Pressed state (apply conditionally)
  buttonPressed: {
    opacity: 0.7,
  } as ViewStyle,
});
