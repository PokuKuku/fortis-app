import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { InformationCircleIcon, ArrowPathIcon, TrashIcon, DocumentTextIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';

interface ExerciseKebabPopoverProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  onReplace: () => void;
  onViewDetails: () => void;
  onStickyNote: () => void;
  hasStickyNote: boolean;
  onAddNote: () => void;
  hasNote: boolean;
  position: { top: number; left: number };
}

export function ExerciseKebabPopover({
  visible,
  onClose,
  onDelete,
  onReplace,
  onViewDetails,
  onStickyNote,
  hasStickyNote,
  onAddNote,
  hasNote,
  position,
}: ExerciseKebabPopoverProps) {
  const popoverScale = useRef(new Animated.Value(0)).current;
  const popoverOpacity = useRef(new Animated.Value(0)).current;
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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
          {
            top: position.top,
            left: position.left,
            opacity: popoverOpacity,
            transform: [{ scale: popoverScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onViewDetails)}
        >
          <InformationCircleIcon color="#DFE2E6" size={18} strokeWidth={2} />
          <Text style={styles.optionText}>View Details</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
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
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleAction(onAddNote)}
            >
              <DocumentTextIcon color="#DFE2E6" size={18} strokeWidth={2} />
              <Text style={styles.optionText}>Add Note</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onReplace)}
        >
          <ArrowPathIcon color="#DFE2E6" size={18} strokeWidth={2} />
          <Text style={styles.optionText}>Replace Exercise</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
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
    minWidth: 170,
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
