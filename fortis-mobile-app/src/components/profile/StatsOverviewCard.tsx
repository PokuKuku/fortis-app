import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  FireIcon,
  ClockIcon,
  TrophyIcon,
} from 'react-native-heroicons/outline';
import { useProfileStats } from '@/src/hooks/useProfileStats';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

/**
 * Format volume with appropriate units (K for thousands)
 */
function formatVolume(volume: number, units: 'imperial' | 'metric' = 'imperial'): string {
  const unit = units === 'metric' ? 'kg' : 'lbs';
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M ${unit}`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K ${unit}`;
  }
  return `${volume.toLocaleString()} ${unit}`;
}

/**
 * Format seconds into hours and minutes
 */
function formatTime(totalSeconds: number): string {
  if (totalSeconds === 0) return '0h';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  iconBgStyle?: { backgroundColor: string };
}

function StatItem({ icon, value, label, colors, iconBgStyle }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, iconBgStyle]}>{icon}</View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

/**
 * StatsOverviewCard - Displays volume-focused workout statistics.
 */
export function StatsOverviewCard() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const stats = useProfileStats();
  const units = profile?.preferred_units || 'imperial';

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const statIconStyle = {
    backgroundColor: colors.accentOverlay,
  };

  const handleShareRecap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/profile/share', params: { type: 'monthly' } });
  };

  return (
    <View style={[styles.container, cardStyle]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Your Stats</Text>
        <TouchableOpacity
          style={[styles.shareButton, { borderColor: colors.border }]}
          onPress={handleShareRecap}
          activeOpacity={0.8}
        >
          <Text style={[styles.shareButtonText, { color: colors.textSecondary }]}>Share</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <StatItem
          icon={<FireIcon color={colors.accent} size={20} strokeWidth={2} />}
          value={formatVolume(stats.totalVolume, units)}
          label="Volume Lifted"
          colors={colors}
          iconBgStyle={statIconStyle}
        />
        <StatItem
          icon={<TrophyIcon color={colors.accent} size={20} strokeWidth={2} />}
          value={stats.totalWorkouts.toString()}
          label="Workouts"
          colors={colors}
          iconBgStyle={statIconStyle}
        />
        <StatItem
          icon={<ClockIcon color={colors.accent} size={20} strokeWidth={2} />}
          value={formatTime(stats.totalTimeSeconds)}
          label="Time Trained"
          colors={colors}
          iconBgStyle={statIconStyle}
        />
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
  sectionHeader: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor now applied via iconBgStyle (colors.accentOverlay)
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    ...Typography.caption,
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
