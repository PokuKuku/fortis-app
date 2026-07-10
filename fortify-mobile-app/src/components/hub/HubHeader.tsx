import { View, Text, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';

interface HubHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  titleStyle?: TextStyle;
}

export function HubHeader({ title, onBack, rightAction, titleStyle }: HubHeaderProps) {
  const { colors, isDark } = useTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleRightAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rightAction?.onPress();
  };

  // Theme-aware button styles
  const backButtonStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
  };

  const rightButtonStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.backButton, backButtonStyle]}
        activeOpacity={0.7}
      >
        <ChevronLeftIcon
          color={colors.textPrimary}
          size={24}
          strokeWidth={2}
        />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.textPrimary }, titleStyle]} numberOfLines={1}>
        {title}
      </Text>

      {rightAction ? (
        <TouchableOpacity
          onPress={handleRightAction}
          style={[styles.rightButton, rightButtonStyle]}
          activeOpacity={0.7}
        >
          <Text style={[styles.rightButtonText, { color: colors.accent }]}>{rightAction.label}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  rightButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  rightButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
