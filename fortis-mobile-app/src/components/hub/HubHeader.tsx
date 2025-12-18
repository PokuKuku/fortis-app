import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';

interface HubHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function HubHeader({ title, onBack, rightAction }: HubHeaderProps) {
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleRightAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rightAction?.onPress();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <ChevronLeftIcon
          color={Colors.textPrimary}
          size={24}
          strokeWidth={2}
        />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {rightAction ? (
        <TouchableOpacity
          onPress={handleRightAction}
          style={styles.rightButton}
          activeOpacity={0.7}
        >
          <Text style={styles.rightButtonText}>{rightAction.label}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  rightButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  rightButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.success,
  },
});
