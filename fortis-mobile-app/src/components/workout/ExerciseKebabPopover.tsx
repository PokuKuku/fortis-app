import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Info, RefreshCw, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface ExerciseKebabPopoverProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  onReplace: () => void;
  onViewDetails: () => void;
  position: { top: number; left: number };
}

export function ExerciseKebabPopover({
  visible,
  onClose,
  onDelete,
  onReplace,
  onViewDetails,
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

  // @ts-ignore - accessing internal value for early return
  if (!visible && popoverOpacity._value === 0) {
    return null;
  }

  const handleAction = (action: () => void) => {
    setPendingAction(() => action);
    onClose();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        pointerEvents={visible ? 'auto' : 'none'}
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
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onViewDetails)}
        >
          <Info color="#DFE2E6" size={18} strokeWidth={2} />
          <Text style={styles.optionText}>View Details</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onReplace)}
        >
          <RefreshCw color="#DFE2E6" size={18} strokeWidth={2} />
          <Text style={styles.optionText}>Replace Exercise</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleAction(onDelete)}
        >
          <Trash2 color={Colors.error} size={18} strokeWidth={2} />
          <Text style={[styles.optionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
});
