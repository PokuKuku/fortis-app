import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrophyIcon, ChevronRightIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTopPersonalRecords } from '@/src/hooks/useTopPersonalRecords';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { format } from 'date-fns';

interface PRRowProps {
  rank: number;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
  unit: string;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
}

function PRRow({ rank, exerciseName, weight, reps, date, unit, colors, isDark }: PRRowProps) {
  return (
    <View style={styles.prRow}>
      <View style={[
        styles.rankBadge,
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }
      ]}>
        <Text style={[styles.rankText, { color: colors.textSecondary }]}>{rank}</Text>
      </View>
      <View style={styles.prInfo}>
        <Text style={[styles.exerciseName, { color: colors.textPrimary }]} numberOfLines={1}>
          {exerciseName}
        </Text>
        <Text style={[styles.prDetails, { color: colors.textSecondary }]}>
          {weight} {unit} × {reps} reps • {format(date, 'MMM d')}
        </Text>
      </View>
      {rank <= 3 && (
        <TrophyIcon
          color={rank === 1 ? '#fbbf24' : rank === 2 ? '#a3a3a3' : '#cd7f32'}
          size={18}
          strokeWidth={2}
        />
      )}
    </View>
  );
}

/**
 * PersonalRecordsCard - Summary card that opens a full-screen personal records modal.
 */
export function PersonalRecordsCard() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(width);
  const prs = useTopPersonalRecords(5);
  const units = profile?.preferred_units || 'imperial';
  const unitLabel = units === 'metric' ? 'kg' : 'lbs';

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (shareTimeoutRef.current) {
        clearTimeout(shareTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      translateX.value = width;
      translateX.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [isModalVisible, translateX, width]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleOpenModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    if (!isModalVisible) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    translateX.value = withTiming(width, {
      duration: 240,
      easing: Easing.in(Easing.cubic),
    });
    closeTimeoutRef.current = setTimeout(() => {
      setIsModalVisible(false);
    }, 240);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (shareTimeoutRef.current) {
      clearTimeout(shareTimeoutRef.current);
    }
    handleCloseModal();
    shareTimeoutRef.current = setTimeout(() => {
      router.push({ pathname: '/profile/share', params: { type: 'personal_records' } });
    }, 260);
  };

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const dividerStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  };

  const summaryText = prs.length === 0
    ? 'No PRs logged yet'
    : `${prs.length} PR${prs.length === 1 ? '' : 's'} tracked`;

  return (
    <>
      <TouchableOpacity
        style={[styles.summaryCard, cardStyle]}
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        <View style={styles.summaryText}>
          <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Personal Records</Text>
          <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>{summaryText}</Text>
        </View>
        <ChevronRightIcon color={colors.textSecondary} size={20} strokeWidth={2} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="none"
        presentationStyle="overFullScreen"
        transparent
        onRequestClose={handleCloseModal}
      >
        <Animated.View style={[styles.modalContainer, { backgroundColor: colors.background }, animatedModalStyle]}>
          <StainlessSteelPattern />
          <View style={styles.modalSafeArea}>
            <View style={[styles.modalHeader, { paddingTop: insets.top + Spacing.lg }]}>
              <View style={styles.headerSide}>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.headerButton}
                  activeOpacity={0.7}
                >
                  <ChevronLeftIcon size={24} color={colors.textPrimary} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalTitleWrapper}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Personal Records</Text>
              </View>
              <View style={[styles.headerSide, styles.headerSideRight]}>
                <TouchableOpacity
                  onPress={handleShare}
                  style={[
                    styles.shareButton,
                    { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={[styles.modalContent, { paddingBottom: Spacing['3xl'] + insets.bottom }]}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.modalCard, cardStyle]}>
                {prs.length === 0 ? (
                  <View style={styles.emptyState}>
                    <TrophyIcon color={colors.textSecondary} size={32} strokeWidth={1.5} />
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No PRs yet</Text>
                    <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>
                      Complete workouts to track your heaviest lifts
                    </Text>
                  </View>
                ) : (
                  <View style={styles.prList}>
                    {prs.map((pr, index) => (
                      <React.Fragment key={pr.exerciseId}>
                        <PRRow
                          rank={index + 1}
                          exerciseName={pr.exerciseName}
                          weight={pr.maxWeight}
                          reps={pr.reps}
                          date={pr.date}
                          unit={unitLabel}
                          colors={colors}
                          isDark={isDark}
                        />
                        {index < prs.length - 1 && <View style={[styles.divider, dividerStyle]} />}
                      </React.Fragment>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  summaryTitle: {
    ...Typography.body,
    fontWeight: '600',
    fontFamily: 'BankGothicBT-Medium',
    marginBottom: Spacing.xs,
  },
  summarySubtitle: {
    ...Typography.caption,
  },
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 1,
  },
  headerSide: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  modalTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
    textAlign: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
  },
  modalCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  prList: {
    gap: 0,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  prInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  exerciseName: {
    ...Typography.body,
    marginBottom: 2,
  },
  prDetails: {
    ...Typography.caption,
  },
  divider: {
    height: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyStateText: {
    ...Typography.body,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
