import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { UserCircleIcon, CameraIcon, PencilIcon, CheckIcon } from 'react-native-heroicons/outline';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useWeeklyActivity } from '@/src/hooks/useWeeklyActivity';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

// Try to import victory-native, fall back gracefully if Skia unavailable
let ChartsAvailable = false;
let CartesianChart: any, Bar: any;

try {
  const victory = require('victory-native');
  CartesianChart = victory.CartesianChart;
  Bar = victory.Bar;
  ChartsAvailable = true;
} catch (e) {
  // Skia not available - charts will show fallback
}

/**
 * Format volume with K for thousands
 */
function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(0)}K`;
  }
  return volume.toString();
}

/**
 * Simple bar chart fallback when Skia is not available
 */
function SimpleBarsView({ data }: { data: Array<{ day: string; volume: number }> }) {
  const { colors, isDark } = useTheme();
  const maxVolume = Math.max(...data.map(d => d.volume), 1);

  return (
    <View style={styles.simpleBarsContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.simpleBarWrapper}>
          <View style={[
            styles.simpleBarTrack,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }
          ]}>
            <View
              style={[
                styles.simpleBar,
                { height: `${(item.volume / maxVolume) * 100}%`, backgroundColor: colors.accent }
              ]}
            />
          </View>
          <Text style={[styles.simpleBarLabel, { color: colors.textSecondary }]}>{item.day}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * ProfileHeader - Displays avatar, name, email with inline editing,
 * plus weekly activity chart.
 */
export function ProfileHeader() {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const { colors, isDark } = useTheme();
  const weeklyData = useWeeklyActivity();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile?.full_name || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  const units = profile?.preferred_units || 'imperial';
  const unitLabel = units === 'metric' ? 'kg' : 'lbs';
  const hasActivity = weeklyData.some(d => d.volume > 0);

  // Prepare data for chart
  const chartData = weeklyData.map((d, index) => ({
    x: index,
    volume: d.volume,
    day: d.day,
  }));

  const handleAvatarPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to change your avatar.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingAvatar(true);
      try {
        if (uploadAvatar) {
          await uploadAvatar(result.assets[0].uri);
        } else {
          await updateProfile({ avatar_url: result.assets[0].uri });
        }
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload avatar. Please try again.');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleNamePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditedName(profile?.full_name || '');
    setIsEditingName(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const handleNameSave = async () => {
    const trimmedName = editedName.trim();
    if (trimmedName === profile?.full_name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      await updateProfile({ full_name: trimmedName || null });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Save Failed', 'Failed to save name. Please try again.');
      setEditedName(profile?.full_name || '');
    } finally {
      setIsSavingName(false);
      setIsEditingName(false);
    }
  };

  const handleNameBlur = () => {
    if (isEditingName && !isSavingName) {
      handleNameSave();
    }
  };

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
  };

  const dividerStyle = {
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  };

  const avatarContainerStyle = {
    backgroundColor: colors.accentOverlay,
  };

  const cameraIconBadgeStyle = {
    backgroundColor: colors.accent,
  };

  const saveButtonStyle = {
    backgroundColor: colors.accentOverlay,
  };

  return (
    <View style={[styles.container, cardStyle]}>
      {/* Top row: Avatar + User Info */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <TouchableOpacity
          style={[styles.avatarContainer, avatarContainerStyle]}
          onPress={handleAvatarPress}
          disabled={isUploadingAvatar}
          activeOpacity={0.7}
        >
          {isUploadingAvatar ? (
            <View style={styles.avatarLoading}>
              <ActivityIndicator color={colors.accent} size="small" />
            </View>
          ) : profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <UserCircleIcon color={colors.accent} size={56} strokeWidth={1} />
          )}
          <View style={[styles.cameraIconBadge, cameraIconBadgeStyle, { borderColor: colors.background }]}>
            <CameraIcon color={colors.white} size={12} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.userInfo}>
          {isEditingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                ref={nameInputRef}
                style={[styles.nameInput, inputStyle, { color: colors.textPrimary }]}
                value={editedName}
                onChangeText={setEditedName}
                onBlur={handleNameBlur}
                onSubmitEditing={handleNameSave}
                placeholder="Enter your name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                maxLength={50}
              />
              <TouchableOpacity
                style={[styles.saveButton, saveButtonStyle]}
                onPress={handleNameSave}
                disabled={isSavingName}
              >
                {isSavingName ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <CheckIcon color={colors.accent} size={20} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.nameContainer}
              onPress={handleNamePress}
              activeOpacity={0.7}
            >
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {profile?.full_name || 'Tap to add name'}
              </Text>
              <PencilIcon color={colors.textSecondary} size={14} strokeWidth={2} />
            </TouchableOpacity>
          )}

          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>
      </View>

      {/* Weekly Activity Chart */}
      <View style={[styles.chartSection, dividerStyle]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>Weekly Activity</Text>
          {hasActivity && (
            <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>{unitLabel}</Text>
          )}
        </View>

        {!hasActivity ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textTertiary }]}>No workouts this week</Text>
          </View>
        ) : !ChartsAvailable ? (
          <SimpleBarsView data={chartData} />
        ) : (
          <View style={styles.chartContainer}>
            <CartesianChart
              data={chartData}
              xKey="x"
              yKeys={['volume']}
              padding={{ top: 20, bottom: 30, left: 10, right: 10 }}
              domainPadding={{ top: 20, bottom: 10, left: 20, right: 20 }}
              axisOptions={{
                tickCount: { x: 7, y: 4 },
                labelColor: colors.textSecondary,
                lineColor: {
                  grid: { x: 'transparent', y: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                  frame: 'transparent',
                },
                formatXLabel: (value: number) => chartData[value]?.day || '',
                formatYLabel: (value: number) => formatVolume(value),
              }}
            >
              {({ points, chartBounds }: { points: { volume: any[] }; chartBounds: any }) => (
                <Bar
                  points={points.volume}
                  chartBounds={chartBounds}
                  color={colors.accent}
                  barWidth={24}
                  roundedCorners={{ topLeft: 4, topRight: 4 }}
                  animate={{ type: 'timing', duration: 500 }}
                />
              )}
            </CartesianChart>
          </View>
        )}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    // backgroundColor now applied via avatarContainerStyle (colors.accentOverlay)
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    position: 'relative',
  },
  avatarLoading: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    // backgroundColor now applied via cameraIconBadgeStyle (colors.accent)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  userName: {
    ...Typography.h3,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  nameInput: {
    flex: 1,
    ...Typography.h3,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor now applied via saveButtonStyle (colors.accentOverlay)
    alignItems: 'center',
    justifyContent: 'center',
  },
  userEmail: {
    ...Typography.caption,
  },
  // Chart section
  chartSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  unitLabel: {
    ...Typography.caption,
  },
  chartContainer: {
    height: 160,
    marginHorizontal: -Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    ...Typography.caption,
  },
  // Simple bars fallback
  simpleBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: Spacing.md,
  },
  simpleBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  simpleBarTrack: {
    width: 20,
    height: 80,
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  simpleBar: {
    width: '100%',
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  simpleBarLabel: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.sm,
  },
});
