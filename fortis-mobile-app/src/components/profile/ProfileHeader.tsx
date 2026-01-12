import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { UserCircleIcon, CameraIcon, PencilIcon, CheckIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useActivityHeatmap } from '@/src/hooks/useActivityHeatmap';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Spacing, BorderRadius, Sizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

const HEATMAP_CELL_SIZE = 10;
const HEATMAP_CELL_GAP = 4;
const HEATMAP_DAY_LABEL_WIDTH = 28;

function withAlpha(color: string, alpha: number): string {
  if (!color.startsWith('#') || color.length !== 7) {
    return color;
  }
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getIntensityLevel(volume: number, maxVolume: number): 0 | 1 | 2 | 3 | 4 {
  if (volume <= 0 || maxVolume <= 0) return 0;
  const ratio = volume / maxVolume;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

/**
 * ProfileHeader - Displays avatar, name, email with inline editing,
 * plus training activity heatmap.
 */
export function ProfileHeader() {
  const router = useRouter();
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const { colors, isDark } = useTheme();
  const completedSessions = useWorkoutStore((state) => state.completedSessions);
  const { weeks, monthLabels, maxVolume, isLoading, hasActivity } = useActivityHeatmap(
    user?.id,
    'year',
    52,
    completedSessions
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile?.full_name || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const nameInputRef = useRef<TextInput>(null);

  const intensityColors = useMemo(() => ({
    level1: withAlpha(colors.accent, 0.2),
    level2: withAlpha(colors.accent, 0.4),
    level3: withAlpha(colors.accent, 0.6),
    level4: colors.accent,
  }), [colors.accent]);
  const gridWidth = useMemo(() => {
    if (weeks.length === 0) return 0;
    return (weeks.length * (HEATMAP_CELL_SIZE + HEATMAP_CELL_GAP)) - HEATMAP_CELL_GAP;
  }, [weeks.length]);

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
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingAvatar(true);
      setLocalAvatarUri(result.assets[0].uri);
      try {
        if (uploadAvatar) {
          const { error } = await uploadAvatar(result.assets[0].uri, {
            base64: result.assets[0].base64,
            mimeType: result.assets[0].mimeType,
          });
          if (error) {
            throw error;
          }
        } else {
          await updateProfile({ avatar_url: result.assets[0].uri });
        }
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload avatar. Please try again.');
      } finally {
        setLocalAvatarUri(null);
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

  const handleShareActivity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/profile/share', params: { type: 'activity' } });
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
          ) : (localAvatarUri || profile?.avatar_url) ? (
            <Image source={{ uri: localAvatarUri || profile?.avatar_url || '' }} style={styles.avatarImage} />
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
              <Text
                style={[styles.userName, { color: colors.textPrimary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {profile?.full_name || 'Tap to add name'}
              </Text>
              <View style={styles.nameIcon}>
                <PencilIcon color={colors.textSecondary} size={14} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          )}

          <Text
            style={[styles.userEmail, { color: colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Training Activity Heatmap */}
      <View style={[styles.chartSection, dividerStyle]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>Training Activity</Text>
          <TouchableOpacity
            style={[
              styles.shareButton,
              { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
            ]}
            onPress={handleShareActivity}
            activeOpacity={0.8}
          >
            <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heatmapContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heatmapScroll}
          >
            <View>
              <View style={styles.monthLabelsRow}>
                <View style={{ width: HEATMAP_DAY_LABEL_WIDTH }} />
                <View style={[styles.monthLabelsTrack, { width: gridWidth }]}>
                  {monthLabels.map((label) => (
                    <Text
                      key={`${label.label}-${label.weekIndex}`}
                      style={[
                        styles.monthLabel,
                        {
                          color: colors.textSecondary,
                          left: label.weekIndex * (HEATMAP_CELL_SIZE + HEATMAP_CELL_GAP),
                        },
                      ]}
                    >
                      {label.label}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.heatmapRow}>
                <View style={styles.dayLabelsColumn}>
                  <Text style={[styles.dayLabel, { color: colors.textTertiary }]}>Mon</Text>
                  <Text style={[styles.dayLabel, { color: colors.textTertiary }]}>Wed</Text>
                  <Text style={[styles.dayLabel, { color: colors.textTertiary }]}>Fri</Text>
                </View>
                <View style={[styles.weeksRow, { width: gridWidth }]}>
                  {weeks.map((week, weekIndex) => (
                    <View key={`week-${weekIndex}`} style={styles.weekColumn}>
                  {week.days.map((day, dayIndex) => {
                    const baseColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                    const intensity = getIntensityLevel(day.volume, maxVolume);
                    const backgroundColor = day.hasActivity
                      ? (intensity === 0 || maxVolume <= 0
                        ? intensityColors.level1
                        : intensity === 1
                          ? intensityColors.level1
                          : intensity === 2
                            ? intensityColors.level2
                            : intensity === 3
                              ? intensityColors.level3
                              : intensityColors.level4)
                      : baseColor;
                    return (
                      <View
                            key={`day-${weekIndex}-${dayIndex}`}
                            style={[
                              styles.heatmapCell,
                              { backgroundColor },
                            ]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.legendRow}>
            <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>Less</Text>
            <View style={styles.legendCells}>
              <View style={[styles.legendCell, { backgroundColor: intensityColors.level1 }]} />
              <View style={[styles.legendCell, { backgroundColor: intensityColors.level2 }]} />
              <View style={[styles.legendCell, { backgroundColor: intensityColors.level3 }]} />
              <View style={[styles.legendCell, { backgroundColor: intensityColors.level4 }]} />
            </View>
            <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>More</Text>
          </View>

          {!hasActivity && !isLoading && (
            <Text style={[styles.emptyStateText, { color: colors.textTertiary }]}>No workouts logged yet</Text>
          )}
        </View>
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
    minWidth: 0,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  userName: {
    ...Typography.h3,
    flexShrink: 1,
    minWidth: 0,
  },
  nameIcon: {
    flexShrink: 0,
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
    minHeight: Sizes.minTouchTarget,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
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
  heatmapContainer: {
    marginTop: Spacing.sm,
  },
  heatmapScroll: {
    paddingRight: Spacing.sm,
  },
  monthLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  monthLabelsTrack: {
    height: 16,
    position: 'relative',
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
  },
  heatmapRow: {
    flexDirection: 'row',
  },
  dayLabelsColumn: {
    width: HEATMAP_DAY_LABEL_WIDTH,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  weeksRow: {
    flexDirection: 'row',
    gap: HEATMAP_CELL_GAP,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: HEATMAP_CELL_GAP,
  },
  heatmapCell: {
    width: HEATMAP_CELL_SIZE,
    height: HEATMAP_CELL_SIZE,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  legendCells: {
    flexDirection: 'row',
    gap: HEATMAP_CELL_GAP,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyStateText: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
});
