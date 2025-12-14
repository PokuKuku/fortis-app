import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { SetType } from '@/src/types/workout';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface SetTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: SetType) => void;
  onRemove: () => void;
  currentType: SetType;
  setIndex: number;
}

const SET_TYPE_OPTIONS = [
  {
    type: 'normal' as SetType,
    label: 'Normal',
    color: Colors.textPrimary,
    getIcon: (index: number) => (index + 1).toString(),
  },
  {
    type: 'warmup' as SetType,
    label: 'Warm Up',
    color: '#eab308',
    getIcon: () => 'W',
  },
  {
    type: 'failure' as SetType,
    label: 'Failure',
    color: Colors.error,
    getIcon: () => 'F',
  },
  {
    type: 'dropset' as SetType,
    label: 'Drop Set',
    color: '#3b82f6',
    getIcon: () => 'D',
  },
];

export function SetTypeSelector({
  visible,
  onClose,
  onSelect,
  onRemove,
  currentType,
  setIndex,
}: SetTypeSelectorProps) {
  const handleSelect = (type: SetType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(type);
    onClose();
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.centeredView}
        >
          <Animated.View
            entering={SlideInDown.duration(250)}
            exiting={SlideOutDown.duration(200)}
          >
            <Pressable
              style={styles.container}
              onPress={(e) => e.stopPropagation()}
            >
              {SET_TYPE_OPTIONS.map((option) => (
                <Pressable
                  key={option.type}
                  onPress={() => handleSelect(option.type)}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={[styles.icon, { color: option.color }]}>
                    {option.getIcon(setIndex)}
                  </Text>
                  <Text style={styles.label}>{option.label}</Text>
                </Pressable>
              ))}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Remove option */}
              <Pressable
                onPress={handleRemove}
                style={({ pressed }) => [
                  styles.option,
                  styles.removeOption,
                  pressed && styles.optionPressed,
                ]}
              >
                <Trash2 size={16} color={Colors.error} strokeWidth={2} />
                <Text style={[styles.label, styles.removeLabel]}>Remove</Text>
              </Pressable>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  container: {
    backgroundColor: '#1c1c1e',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 160,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  optionPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  icon: {
    width: 20,
    fontSize: FontSizes.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: Spacing.xs,
  },
  removeOption: {
    // Additional styling for remove option if needed
  },
  removeLabel: {
    color: Colors.error,
  },
});
