import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { RpeValue } from '@/src/types/workout';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface RPESelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (rpe: RpeValue) => void;
  currentValue?: RpeValue;
}

const RPE_OPTIONS = [
  { value: 6 as RpeValue, color: Colors.success, label: '6' },
  { value: 7 as RpeValue, color: '#84cc16', label: '7' },
  { value: 8 as RpeValue, color: '#eab308', label: '8' },
  { value: 9 as RpeValue, color: '#f97316', label: '9' },
  { value: 10 as RpeValue, color: Colors.error, label: '10' },
];

export function RPESelector({ visible, onClose, onSelect, currentValue }: RPESelectorProps) {
  const handleSelect = (rpe: RpeValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(rpe);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
            <View style={styles.content}>
              {RPE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: option.color },
                    pressed && styles.pressed,
                    currentValue === option.value && styles.selected,
                  ]}
                >
                  <Text style={styles.buttonText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1c1c1e',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  buttonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
