import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowPathIcon, SignalSlashIcon } from 'react-native-heroicons/outline';
import { BorderRadius, IconSizes, Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

interface AIConnectionErrorCardProps {
  onRetry: () => void;
}

export function AIConnectionErrorCard({ onRetry }: AIConnectionErrorCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.035)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceOverlay }]}>
        <SignalSlashIcon size={IconSizes.md} color={colors.textSecondary} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Connection interrupted</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>Your message is safe. Try again when you have a connection.</Text>

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={onRetry}
          activeOpacity={0.8}
          accessibilityLabel="Try sending message again"
          accessibilityRole="button"
        >
          <ArrowPathIcon size={IconSizes.sm} color={colors.accentForeground} strokeWidth={2.2} />
          <Text style={[styles.retryText, { color: colors.accentForeground }]}>Try again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
  },
  message: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  retryButton: {
    minHeight: 36,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  retryText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
