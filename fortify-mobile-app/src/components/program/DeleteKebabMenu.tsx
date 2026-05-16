/**
 * DeleteKebabMenu
 *
 * A kebab menu (⋮) with a single delete option.
 * Used for removing workouts from programs and exercises from workouts.
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import {
  EllipsisVerticalIcon,
  InformationCircleIcon,
  PencilIcon,
  PlayIcon,
  TrashIcon,
} from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';

interface DeleteKebabMenuProps {
  /** Label shown on the delete option (e.g., "Delete Workout", "Delete Exercise") */
  deleteLabel?: string;
  /** Optional handler for opening the details view */
  onViewDetails?: () => void;
  /** Optional handler for setting this workout as the next program workout */
  onSetAsNext?: () => void;
  /** Optional handler for editing this workout */
  onEdit?: () => void;
  /** Called when delete is confirmed */
  onDelete: () => void;
}

const POPOVER_MARGIN = 12;
const POPOVER_MIN_WIDTH = 170;
const OPTION_HEIGHT = 46;
const DIVIDER_HEIGHT = 9;
const POPOVER_VERTICAL_PADDING = Spacing.xs * 2;

export function DeleteKebabMenu({
  deleteLabel = 'Delete',
  onViewDetails,
  onSetAsNext,
  onEdit,
  onDelete,
}: DeleteKebabMenuProps) {
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: POPOVER_MARGIN });
  const buttonRef = useRef<View>(null);

  // Theme-aware styles
  const themedStyles = {
    kebabButtonPressed: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' },
    popover: {
      backgroundColor: isDark ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    },
    optionText: { color: colors.textPrimary },
    divider: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' },
  };

  const popoverScale = useRef(new Animated.Value(0)).current;
  const popoverOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(popoverScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(popoverOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(popoverScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(popoverOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOpen = useCallback(() => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      const optionCount = 1
        + (onViewDetails ? 1 : 0)
        + (onSetAsNext ? 1 : 0)
        + (onEdit ? 1 : 0);
      const dividerCount = Math.max(0, optionCount - 1);
      const estimatedPopoverHeight =
        POPOVER_VERTICAL_PADDING + optionCount * OPTION_HEIGHT + dividerCount * DIVIDER_HEIGHT;
      const belowTop = y + height + 4;
      const aboveTop = y - estimatedPopoverHeight - 4;
      const wouldOverflowBottom = belowTop + estimatedPopoverHeight > windowHeight - POPOVER_MARGIN;
      const resolvedTop = wouldOverflowBottom
        ? Math.max(POPOVER_MARGIN, aboveTop)
        : Math.min(belowTop, windowHeight - estimatedPopoverHeight - POPOVER_MARGIN);
      const resolvedRight = Math.max(
        POPOVER_MARGIN,
        Math.min(windowWidth - POPOVER_MIN_WIDTH - POPOVER_MARGIN, windowWidth - (x + width))
      );

      setPosition({
        top: resolvedTop,
        right: resolvedRight,
      });
      setVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  }, [onEdit, onSetAsNext, onViewDetails, windowHeight, windowWidth]);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const handleDelete = useCallback(() => {
    // Fire delete immediately - don't wait for animation
    // This prevents race conditions between animation cleanup and delete operation
    onDelete();
    handleClose();
  }, [onDelete, handleClose]);

  const handleViewDetails = useCallback(() => {
    if (!onViewDetails) return;
    onViewDetails();
    handleClose();
  }, [handleClose, onViewDetails]);

  const handleSetAsNext = useCallback(() => {
    if (!onSetAsNext) return;
    onSetAsNext();
    handleClose();
  }, [handleClose, onSetAsNext]);

  const handleEdit = useCallback(() => {
    if (!onEdit) return;
    onEdit();
    handleClose();
  }, [handleClose, onEdit]);

  return (
    <>
      {/* Kebab Button */}
      <Pressable
        ref={buttonRef}
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.kebabButton,
          pressed && themedStyles.kebabButtonPressed,
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <EllipsisVerticalIcon
          color={colors.textSecondary}
          size={20}
          strokeWidth={2}
        />
      </Pressable>

      {/* Popover Modal */}
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.popover,
            themedStyles.popover,
            {
              top: position.top,
              right: position.right,
              opacity: popoverOpacity,
              transform: [{ scale: popoverScale }],
            },
          ]}
        >
          {onViewDetails ? (
            <>
              <TouchableOpacity style={styles.option} onPress={handleViewDetails}>
                <InformationCircleIcon color={colors.textSecondary} size={18} strokeWidth={2} />
                <Text style={[styles.optionText, themedStyles.optionText]}>View Details</Text>
              </TouchableOpacity>
              <View style={[styles.divider, themedStyles.divider]} />
            </>
          ) : null}
          {onSetAsNext ? (
            <>
              <TouchableOpacity style={styles.option} onPress={handleSetAsNext}>
                <PlayIcon color={colors.textSecondary} size={18} strokeWidth={2} />
                <Text style={[styles.optionText, themedStyles.optionText]}>Set as Next</Text>
              </TouchableOpacity>
              <View style={[styles.divider, themedStyles.divider]} />
            </>
          ) : null}
          {onEdit ? (
            <>
              <TouchableOpacity style={styles.option} onPress={handleEdit}>
                <PencilIcon color={colors.textSecondary} size={18} strokeWidth={2} />
                <Text style={[styles.optionText, themedStyles.optionText]}>Edit Workout</Text>
              </TouchableOpacity>
              <View style={[styles.divider, themedStyles.divider]} />
            </>
          ) : null}
          <TouchableOpacity style={styles.option} onPress={handleDelete}>
            <TrashIcon color={Colors.error} size={18} strokeWidth={2} />
            <Text style={styles.deleteText}>{deleteLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  kebabButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  kebabButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  popover: {
    position: 'absolute',
    backgroundColor: 'rgba(36, 36, 36, 0.95)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1000,
    minWidth: 160,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: Spacing.xs,
  },
});
