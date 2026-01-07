import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';

type SegmentOption = {
  key: string;
  label: string;
  disabled?: boolean;
};

type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        },
      ]}
    >
      {options.map((option) => {
        const isActive = option.key === value;
        const isDisabled = option.disabled;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option.key)}
            disabled={isDisabled}
            style={[
              styles.segment,
              isActive && { backgroundColor: colors.accentOverlay },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: isActive ? colors.accent : colors.textSecondary },
                isDisabled && { color: colors.textTertiary },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  segment: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
