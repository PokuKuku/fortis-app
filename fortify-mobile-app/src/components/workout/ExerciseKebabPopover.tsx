import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { InformationCircleIcon, ArrowPathIcon, TrashIcon, DocumentTextIcon, AdjustmentsHorizontalIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/src/contexts/ThemeContext';

interface ExerciseKebabPopoverProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  onReplace: () => void;
  onViewDetails: () => void;
  onStickyNote: () => void;
  onEditTarget: () => void;
  hasStickyNote: boolean;
  onAddNote: () => void;
  hasNote: boolean;
  position: { top: number; left: number };
}

const POPOVER_MARGIN = 12;
const POPOVER_WIDTH = 220;
const OPTION_HEIGHT = 46;
const DIVIDER_HEIGHT = 9;
const POPOVER_VERTICAL_PADDING = 8;

export function ExerciseKebabPopover({
  visible,
  onClose,
  onDelete,
  onReplace,
  onViewDetails,
  onStickyNote,
  onEditTarget,
  hasStickyNote,
  onAddNote,
  hasNote,
  position,
}: ExerciseKebabPopoverProps) {
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const popoverScale = useRef(new Animated.Value(0)).current;
  const popoverOpacity = useRef(new Animated.Value(0)).current;
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const optionCount = hasNote ? 5 : 6;
  const estimatedPopoverHeight =
    POPOVER_VERTICAL_PADDING + optionCount * OPTION_HEIGHT + (optionCount - 1) * DIVIDER_HEIGHT;
  const resolvedTop = Math.min(
    Math.max(POPOVER_MARGIN, position.top),
    Math.max(POPOVER_MARGIN, windowHeight - estimatedPopoverHeight - POPOVER_MARGIN)
  );
  const resolvedLeft = Math.min(
    Math.max(POPOVER_MARGIN, position.left),
    Math.max(POPOVER_MARGIN, windowWidth - POPOVER_WIDTH - POPOVER_MARGIN)
  );

  // Theme-aware styles
  const themedStyles = {
    popover: {
      backgroundColor: isDark ? 'rgba(36, 36, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    optionText: { color: colors.textPrimary },
    divider: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' },
  };

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
      ]).start(() => {
        // Execute pending action after animation completes
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      });
    }
  }, [visible, pendingAction]);

  const handleAction = (action: () => void) => {
    setPendingAction(() => action);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.popover,
          themedStyles.popover,
          {
            top: resolvedTop,
            left: resolvedLeft,
            opacity: popoverOpacity,
            transform: [{ scale: popoverScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onViewDetails)}
        >
          <InformationCircleIcon color={colors.textSecondary} size={18} strokeWidth={2} />
          <Text style={[styles.optionText, themedStyles.optionText]}>View Details</Text>
        </TouchableOpacity>
        <View style={[styles.divider, themedStyles.divider]} />
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onEditTarget)}
        >
          <AdjustmentsHorizontalIcon color={colors.textSecondary} size={18} strokeWidth={2} />
          <Text style={[styles.optionText, themedStyles.optionText]}>Set Target</Text>
        </TouchableOpacity>
        <View style={[styles.divider, themedStyles.divider]} />
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onStickyNote)}
        >
          <DocumentTextIcon color="#60a5fa" size={18} strokeWidth={2} />
          <Text style={[styles.optionText, styles.stickyNoteText]}>
            {hasStickyNote ? 'Edit Sticky Note' : 'Add Sticky Note'}
          </Text>
        </TouchableOpacity>
        {!hasNote && (
          <>
            <View style={[styles.divider, themedStyles.divider]} />
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleAction(onAddNote)}
            >
              <DocumentTextIcon color={colors.textSecondary} size={18} strokeWidth={2} />
              <Text style={[styles.optionText, themedStyles.optionText]}>Add Note</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={[styles.divider, themedStyles.divider]} />
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onReplace)}
        >
          <ArrowPathIcon color={colors.textSecondary} size={18} strokeWidth={2} />
          <Text style={[styles.optionText, themedStyles.optionText]}>Replace Exercise</Text>
        </TouchableOpacity>
        <View style={[styles.divider, themedStyles.divider]} />
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onDelete)}
        >
          <TrashIcon color={Colors.error} size={18} strokeWidth={2} />
          <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  popover: {
    position: 'absolute',
    backgroundColor: 'rgba(36, 36, 36, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1000,
    width: POPOVER_WIDTH,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DFE2E6',
  },
  deleteText: {
    color: Colors.error,
  },
  stickyNoteText: {
    color: '#60a5fa',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
});
