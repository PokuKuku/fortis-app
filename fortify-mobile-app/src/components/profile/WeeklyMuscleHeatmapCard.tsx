import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useWeeklyMuscles } from '@/src/hooks/useWeeklyMuscles';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { WeeklyTierMuscleHeatmap } from '@/src/components/profile/WeeklyTierMuscleHeatmap';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { InformationCircleIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Colors } from '@/constants/Colors';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

/**
 * WeeklyMuscleHeatmapCard - Displays a body heatmap of muscles trained
 * in the last 7 days on the Profile tab.
 */
export function WeeklyMuscleHeatmapCard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { muscleLevels, loading, hasWorkouts } = useWeeklyMuscles();
  const bodyType = useWorkoutStore((state) => state.bodyType);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const handleShareSignature = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/profile/share', params: { type: 'signature' } });
  };

  const openHelpModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHelpModal(true);
  };

  const closeHelpModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHelpModal(false);
  };

  return (
    <>
    <View style={[styles.container, cardStyle]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Muscles Hit This Week
        </Text>
        <TouchableOpacity
          style={[
            styles.helpButton,
            { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
          ]}
          onPress={openHelpModal}
          activeOpacity={0.8}
        >
          <InformationCircleIcon color={colors.accent} size={16} strokeWidth={2} />
        </TouchableOpacity>
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
    <Modal transparent visible={showHelpModal} animationType="none" onRequestClose={closeHelpModal}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeHelpModal} />
        <Animated.View
          entering={ZoomIn.duration(250)}
          exiting={ZoomOut.duration(200)}
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? Colors.background : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        >
          <StainlessSteelPattern />
          <View style={styles.modalHeader}>
            <View style={styles.headerSpacer} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Tier Heatmap</Text>
            <TouchableOpacity onPress={closeHelpModal} style={styles.modalCloseButton} activeOpacity={0.7}>
              <XMarkIcon size={18} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              This map shows which muscles you trained most this week using completed working sets only.
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Warm-up sets do not count. Primary muscles get full credit and secondary muscles get partial credit.
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Tiers are based on weekly set-equivalent volume:
            </Text>
            <View style={styles.tierList}>
              <Text style={[styles.tierLine, { color: colors.textPrimary }]}>S: 18+ sets</Text>
              <Text style={[styles.tierLine, { color: colors.textPrimary }]}>A: 13 to {'<'}18</Text>
              <Text style={[styles.tierLine, { color: colors.textPrimary }]}>B: 9 to {'<'}13</Text>
              <Text style={[styles.tierLine, { color: colors.textPrimary }]}>C: 5 to {'<'}9</Text>
              <Text style={[styles.tierLine, { color: colors.textPrimary }]}>D: 3 to {'<'}5</Text>
              <Text style={[styles.tierLine, { color: colors.textPrimary }]}>E: 0.5 to {'<'}3</Text>
            </View>
            <Text style={[styles.modalHint, { color: colors.textTertiary }]}>
              Gray means that muscle group had little or no work this week.
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
    </>
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
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  helpButton: {
    position: 'absolute',
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerSpacer: {
    width: 28,
    height: 28,
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  modalTitle: {
    ...Typography.caption,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 16,
    letterSpacing: 1,
    textAlign: 'center',
  },
  modalBody: {
    gap: Spacing.sm,
  },
  modalText: {
    ...Typography.body,
    lineHeight: 21,
  },
  tierList: {
    marginTop: Spacing.xs,
    gap: 6,
  },
  tierLine: {
    ...Typography.body,
    fontFamily: 'BankGothicBT-Medium',
  },
  modalHint: {
    ...Typography.body,
    fontSize: 13,
    marginTop: Spacing.xs,
  },
});
