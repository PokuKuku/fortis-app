import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { SetType } from '@/src/types/workout';
import { useWorkoutStore } from '@/src/store/workoutStore';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Easing } from 'react-native-reanimated';

interface SetTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: SetType) => void;
  onRemove: () => void;
  currentType: SetType;
  setIndex: number;
  anchorPosition?: { x: number; y: number };
  hideFailure?: boolean;
}

export function SetTypeSelector({
  visible,
  onClose,
  onSelect,
  onRemove,
  currentType,
  setIndex,
  anchorPosition,
  hideFailure = false,
}: SetTypeSelectorProps) {
  const { colors, isDark } = useTheme();
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: colors.background,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    },
    optionSelected: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    optionPressed: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    label: { color: colors.textSecondary },
    labelSelected: { color: colors.textPrimary },
    duration: { color: colors.textTertiary },
    divider: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    removeLabel: { color: colors.error },
  };

  // Format seconds to display string
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Off';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const SET_TYPE_OPTIONS = [
    {
      type: 'normal' as SetType,
      label: 'Normal',
      color: Colors.textPrimary,
      getIcon: (index: number) => (index + 1).toString(),
      duration: restTimerSettings.normalSeconds,
    },
    {
      type: 'warmup' as SetType,
      label: 'Warm Up',
      color: '#eab308',
      getIcon: () => 'W',
      duration: restTimerSettings.warmupSeconds,
    },
    {
      type: 'failure' as SetType,
      label: 'Failure',
      color: Colors.error,
      getIcon: () => 'F',
      duration: restTimerSettings.normalSeconds,
    },
    {
      type: 'dropset' as SetType,
      label: 'Drop Set',
      color: '#3b82f6',
      getIcon: () => 'D',
      duration: restTimerSettings.dropsetSeconds,
    },
  ];

  const filteredOptions = hideFailure
    ? SET_TYPE_OPTIONS.filter(opt => opt.type !== 'failure')
    : SET_TYPE_OPTIONS;

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
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(150).easing(Easing.in(Easing.cubic))}
          style={[
            styles.popover,
            anchorPosition && {
              top: anchorPosition.y,
              left: anchorPosition.x,
            },
          ]}
        >
          <View style={[styles.container, themedStyles.container]}>
            <StainlessSteelPattern />

            <View style={styles.content}>
              {filteredOptions.map((option) => (
                <Pressable
                  key={option.type}
                  onPress={() => handleSelect(option.type)}
                  style={({ pressed }) => [
                    styles.option,
                    currentType === option.type && themedStyles.optionSelected,
                    pressed && themedStyles.optionPressed,
                  ]}
                >
                  <Text style={[styles.icon, { color: option.color }]}>
                    {option.getIcon(setIndex)}
                  </Text>
                  <Text style={[
                    styles.label,
                    themedStyles.label,
                    currentType === option.type && themedStyles.labelSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.duration, themedStyles.duration]}>
                    {formatDuration(option.duration)}
                  </Text>
                </Pressable>
              ))}

              {/* Divider */}
              <View style={[styles.divider, themedStyles.divider]} />

              {/* Remove option */}
              <Pressable
                onPress={handleRemove}
                style={({ pressed }) => [
                  styles.option,
                  pressed && themedStyles.optionPressed,
                ]}
              >
                <Trash2 size={16} color={colors.error} strokeWidth={2} />
                <Text style={[styles.label, themedStyles.removeLabel]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  popover: {
    position: 'absolute',
    top: 120,
    left: 40,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 210,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    zIndex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  optionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  icon: {
    width: 20,
    fontSize: FontSizes.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  duration: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  removeLabel: {
    color: Colors.error,
  },
});
