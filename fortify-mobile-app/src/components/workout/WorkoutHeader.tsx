import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ClockIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { scale, moderateScale, responsiveValue } from '@/src/utils/responsive';
import { formatElapsedTime } from '@/src/hooks/useElapsedTime';
import { formatRestTime } from '@/src/hooks/useRestTimerTick';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { MuscleHeatmap } from './MuscleHeatmap';
import type { MuscleKey } from '@/src/utils/muscleTaxonomy';
import * as Haptics from 'expo-haptics';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { useInAppTour } from '@/src/contexts/InAppTourContext';

const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const BUTTON_PADDING = scale(Spacing.sm);
const BUTTON_RADIUS = scale(BorderRadius.lg);
const ICON_SIZE = scale(20);
const LEFT_COLUMN_GAP = scale(Spacing.sm);
const LEFT_COLUMN_MARGIN_TOP = scale(Spacing.sm);
const ELAPSED_FONT_SIZE = moderateScale(FontSizes.base);
const ELAPSED_SMALL_FONT_SIZE = moderateScale(FontSizes.sm);
const ELAPSED_MIN_WIDTH = scale(45);
const SEPARATOR_PADDING_X = scale(6);
const SEPARATOR_MARGIN_LEFT = -scale(2);
const SEPARATOR_FONT_SIZE = moderateScale(FontSizes.base);
const REST_TIMER_PADDING_X = scale(Spacing.md);
const REST_TIMER_PADDING_Y = scale(Spacing.xs);
const REST_TIMER_FONT_SIZE = moderateScale(FontSizes.base);
const REST_TIMER_MIN_WIDTH = scale(40);
const REST_TIMER_BUTTON_WIDTH = scale(88);
const RIGHT_COLUMN_GAP = scale(Spacing.xs);
const RIGHT_COLUMN_MARGIN_TOP = -scale(Spacing.xs);
const WORKOUT_NAME_SIZE = moderateScale(FontSizes.base);
const WORKOUT_NAME_LETTER_SPACING = moderateScale(1);
const TIMER_LETTER_SPACING = moderateScale(0.5);
const HEATMAP_SCALE = responsiveValue(0.16, 0.18, 0.2);
const TOP_BAR_OFFSET = scale(6);

const COMPACT_ELAPSED_FONT_SIZE = moderateScale(FontSizes.sm);
const COMPACT_ELAPSED_MIN_WIDTH = scale(38);
const COMPACT_SEPARATOR_FONT_SIZE = moderateScale(FontSizes.sm);
const COMPACT_REST_TIMER_PADDING_X = scale(Spacing.sm);
const COMPACT_REST_TIMER_PADDING_Y = scale(Spacing.xs);
const COMPACT_REST_TIMER_FONT_SIZE = moderateScale(FontSizes.sm);
const COMPACT_REST_TIMER_BUTTON_WIDTH = scale(74);

interface WorkoutHeaderTopBarProps {
  onCancelPress: () => void;
  onTimerSettingsPress: () => void;
  onRestTimerPress: () => void;
  showCompactTimers: boolean;
  elapsed: number;
  displaySeconds: number;
  restTimerColor: string;
  restTimerBgColor: string;
}

interface WorkoutHeaderDetailsProps {
  onRestTimerPress: () => void;
  muscleLevels?: Record<MuscleKey, number>;
  elapsed: number;
  displaySeconds: number;
  restTimerColor: string;
  restTimerBgColor: string;
  workoutName?: string | null;
}

export function WorkoutHeaderTopBar({
  onCancelPress,
  onTimerSettingsPress,
  onRestTimerPress,
  showCompactTimers,
  elapsed,
  displaySeconds,
  restTimerColor,
  restTimerBgColor,
}: WorkoutHeaderTopBarProps) {
  const { colors, isDark } = useTheme();
  const { isTourActive, activeStepId } = useInAppTour();

  const themedStyles = {
    clockButton: {
      backgroundColor: isDark ? 'rgba(163, 163, 163, 0.2)' : 'rgba(0, 0, 0, 0.06)',
    },
    cancelButton: {
      backgroundColor: isDark ? colors.errorOverlay : 'rgba(239, 68, 68, 0.1)',
    },
    elapsedTime: { color: colors.textPrimary },
    separator: { color: colors.textTertiary },
  };

  const handleRestTimerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRestTimerPress();
  };

  const shouldAnchorRestTimerSettings = isTourActive && activeStepId === 'rest_timer_settings';

  const wrapAnchor = (enabled: boolean, id: string, node: JSX.Element) =>
    enabled ? <TourAnchor id={id}>{node}</TourAnchor> : node;

  const renderTimers = (compact: boolean) => (
    <View style={[styles.timersRowBase, compact ? styles.timersRowCompact : styles.timersRow]}>
      <Text
        style={[
          styles.elapsedTime,
          themedStyles.elapsedTime,
          compact && styles.elapsedTimeCompact,
          !compact && elapsed >= 3600 && styles.elapsedTimeSmall,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {formatElapsedTime(elapsed)}
      </Text>
      <Text
        style={[
          styles.separator,
          themedStyles.separator,
          compact && styles.separatorCompact,
        ]}
      >
        |
      </Text>
      <Pressable
        onPress={handleRestTimerPress}
        style={[
          styles.restTimerButton,
          { backgroundColor: restTimerBgColor },
          compact && styles.restTimerButtonCompact,
        ]}
      >
          <Text
            style={[
              styles.restTimerText,
              { color: restTimerColor },
              compact && styles.restTimerTextCompact,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {formatRestTime(displaySeconds)}
          </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.topContainer}>
      <View style={styles.topRow}>
        {wrapAnchor(
          shouldAnchorRestTimerSettings,
          TOUR_ANCHOR_IDS.restTimerSettings,
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTimerSettingsPress();
            }}
            style={({ pressed }) => [
              styles.clockButton,
              themedStyles.clockButton,
              pressed && styles.pressed,
            ]}
          >
            <ClockIcon size={ICON_SIZE} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
        )}

        <View style={styles.topCenter}>
          {showCompactTimers ? renderTimers(true) : null}
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCancelPress();
          }}
          style={({ pressed }) => [
            styles.cancelButton,
            themedStyles.cancelButton,
            pressed && styles.pressed,
          ]}
        >
          <XMarkIcon size={ICON_SIZE} color={colors.error} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

export function WorkoutHeaderDetails({
  onRestTimerPress,
  muscleLevels,
  elapsed,
  displaySeconds,
  restTimerColor,
  restTimerBgColor,
  workoutName,
}: WorkoutHeaderDetailsProps) {
  const { colors } = useTheme();
  const { isTourActive, activeStepId } = useInAppTour();
  const fallbackWorkoutName = useWorkoutStore(s => s.activeSession?.name ?? null);
  const workoutTitle = workoutName ?? fallbackWorkoutName;

  const themedStyles = {
    elapsedTime: { color: colors.textPrimary },
    separator: { color: colors.textTertiary },
    workoutName: { color: colors.textPrimary },
  };

  const handleRestTimerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRestTimerPress();
  };

  const shouldAnchorRestTimer = isTourActive && activeStepId === 'rest_timer';
  const wrapAnchor = (enabled: boolean, id: string, node: JSX.Element) =>
    enabled ? <TourAnchor id={id}>{node}</TourAnchor> : node;

  return (
    <View style={styles.detailsContainer}>
      <View style={styles.contentRow}>
        <View style={styles.leftColumn}>
          {workoutTitle && (
            <Text
              style={[styles.workoutName, themedStyles.workoutName]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              allowFontScaling={false}
            >
              {workoutTitle}
            </Text>
          )}

          <View style={[styles.timersRowBase, styles.timersRow]}>
          <Text
            style={[
              styles.elapsedTime,
              themedStyles.elapsedTime,
              elapsed >= 3600 && styles.elapsedTimeSmall,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {formatElapsedTime(elapsed)}
          </Text>
            <Text style={[styles.separator, themedStyles.separator]}>|</Text>
            {wrapAnchor(
              shouldAnchorRestTimer,
              TOUR_ANCHOR_IDS.restTimer,
              <Pressable
                onPress={handleRestTimerPress}
                style={[
                  styles.restTimerButton,
                  { backgroundColor: restTimerBgColor },
                ]}
              >
                <Text
                  style={[styles.restTimerText, { color: restTimerColor }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {formatRestTime(displaySeconds)}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.rightColumn}>
          <MuscleHeatmap
            muscleLevels={muscleLevels}
            scale={HEATMAP_SCALE}
            compact
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: TOP_BAR_OFFSET,
    paddingBottom: scale(Spacing.sm),
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  topCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
    paddingHorizontal: scale(Spacing.sm),
    minWidth: 0,
  },
  clockButton: {
    backgroundColor: 'rgba(163, 163, 163, 0.2)',
    padding: BUTTON_PADDING,
    borderRadius: BUTTON_RADIUS,
  },
  cancelButton: {
    backgroundColor: Colors.errorOverlay,
    padding: BUTTON_PADDING,
    borderRadius: BUTTON_RADIUS,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  detailsContainer: {
    paddingBottom: scale(Spacing.md),
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    gap: LEFT_COLUMN_GAP,
    marginTop: LEFT_COLUMN_MARGIN_TOP,
    flex: 1,
  },
  timersRowBase: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timersRow: {
    justifyContent: 'flex-start',
    width: '100%',
    maxWidth: '100%',
  },
  timersRowCompact: {
    gap: scale(Spacing.xs),
    justifyContent: 'center',
    alignSelf: 'center',
  },
  elapsedTime: {
    fontSize: ELAPSED_FONT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: TIMER_LETTER_SPACING,
    minWidth: ELAPSED_MIN_WIDTH,
    flexShrink: 1,
  },
  elapsedTimeSmall: {
    fontSize: ELAPSED_SMALL_FONT_SIZE,
  },
  elapsedTimeCompact: {
    fontSize: COMPACT_ELAPSED_FONT_SIZE,
    minWidth: COMPACT_ELAPSED_MIN_WIDTH,
  },
  separator: {
    color: Colors.textTertiary,
    marginLeft: SEPARATOR_MARGIN_LEFT,
    paddingHorizontal: SEPARATOR_PADDING_X,
    fontSize: SEPARATOR_FONT_SIZE,
    flexShrink: 0,
  },
  separatorCompact: {
    fontSize: COMPACT_SEPARATOR_FONT_SIZE,
  },
  restTimerButton: {
    width: REST_TIMER_BUTTON_WIDTH,
    paddingHorizontal: REST_TIMER_PADDING_X,
    paddingVertical: REST_TIMER_PADDING_Y,
    borderRadius: BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  restTimerButtonCompact: {
    width: COMPACT_REST_TIMER_BUTTON_WIDTH,
    paddingHorizontal: COMPACT_REST_TIMER_PADDING_X,
    paddingVertical: COMPACT_REST_TIMER_PADDING_Y,
  },
  restTimerText: {
    fontSize: REST_TIMER_FONT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    fontVariant: ['tabular-nums'],
    letterSpacing: TIMER_LETTER_SPACING,
    textAlign: 'center',
    minWidth: REST_TIMER_MIN_WIDTH,
    flexShrink: 1,
  },
  restTimerTextCompact: {
    fontSize: COMPACT_REST_TIMER_FONT_SIZE,
    minWidth: REST_TIMER_MIN_WIDTH,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: RIGHT_COLUMN_GAP,
    alignSelf: 'flex-end',
    marginTop: RIGHT_COLUMN_MARGIN_TOP,
  },
  workoutName: {
    fontSize: WORKOUT_NAME_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: WORKOUT_NAME_LETTER_SPACING,
  },
});
