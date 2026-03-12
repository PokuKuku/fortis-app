import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useWeeklyMuscles } from '@/src/hooks/useWeeklyMuscles';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { WeeklyTierMuscleHeatmap } from '@/src/components/profile/WeeklyTierMuscleHeatmap';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

/**
 * WeeklyMuscleHeatmapCard - Displays a body heatmap of muscles trained
 * in the last 7 days on the Profile tab.
 */
export function WeeklyMuscleHeatmapCard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { muscleLevels, loading, hasWorkouts } = useWeeklyMuscles();
  const bodyType = useWorkoutStore((state) => state.bodyType);

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const handleShareSignature = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/profile/share', params: { type: 'signature' } });
  };

  return (
    <View style={[styles.container, cardStyle]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Muscles Hit This Week
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      ) : (
        <View style={styles.heatmapContent}>
          <WeeklyTierMuscleHeatmap
            muscleLevels={hasWorkouts ? muscleLevels : {}}
            gender={bodyType}
            scale={0.45}
            compact
          />
          {!hasWorkouts && null}
        </View>
      )}

      <View style={styles.shareRow}>
        <TouchableOpacity
          style={[
            styles.shareButton,
            { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
          ]}
          onPress={handleShareSignature}
          activeOpacity={0.8}
        >
          <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    ...Typography.caption,
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapContent: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  shareButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  shareButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
