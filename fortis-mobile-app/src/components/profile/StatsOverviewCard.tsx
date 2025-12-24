import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  FireIcon,
  ClockIcon,
  TrophyIcon,
} from 'react-native-heroicons/outline';
import { GlassCard } from '@/components/GlassCard';
import { useProfileStats } from '@/src/hooks/useProfileStats';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

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
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/**
 * StatsOverviewCard - Displays volume-focused workout statistics.
 */
export function StatsOverviewCard() {
  const { profile } = useAuth();
  const stats = useProfileStats();
  const units = profile?.preferred_units || 'imperial';

  return (
    <GlassCard style={styles.container}>
      <Text style={styles.sectionHeader}>Your Stats</Text>
      <View style={styles.statsRow}>
        <StatItem
          icon={<FireIcon color={Colors.success} size={20} strokeWidth={2} />}
          value={formatVolume(stats.totalVolume, units)}
          label="Volume Lifted"
        />
        <StatItem
          icon={<TrophyIcon color={Colors.success} size={20} strokeWidth={2} />}
          value={stats.totalWorkouts.toString()}
          label="Workouts"
        />
        <StatItem
          icon={<ClockIcon color={Colors.success} size={20} strokeWidth={2} />}
          value={formatTime(stats.totalTimeSeconds)}
          label="Time Trained"
        />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  sectionHeader: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
