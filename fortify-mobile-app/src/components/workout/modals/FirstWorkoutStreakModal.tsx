import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { GlassButton } from '@/components/GlassButton';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { moderateScale, scale } from '@/src/utils/responsive';

type FirstWorkoutStreakModalProps = {
  visible: boolean;
  userName?: string | null;
  onClose: () => void;
};

const getFirstName = (name?: string | null): string => {
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName || 'You';
};

function StreakBolt({ color, width, height }: { color: string; width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 260 430" accessibilityLabel="Workout streak">
      <Path
        d="M166 8c16.7 0 28.7 16 24.2 32.1L154.3 169H240c18.6 0 29.8 20.6 19.7 36.2L84.9 416.9c-11.8 18-39.6 6.8-35.5-14.4L76.7 262H22.3C3.6 262-7.7 241.2 2.7 225.6L144.9 19.2C149.6 12.2 157.5 8 166 8Z"
        fill={color}
      />
    </Svg>
  );
}

function GraffitiMarks({
  accentColor,
  mutedColor,
  width,
  height,
}: {
  accentColor: string;
  mutedColor: string;
  width: number;
  height: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 360 420" pointerEvents="none">
      <Path
        d="M44 76c58-35 132-40 197-12 28 12 50 29 69 51"
        stroke={accentColor}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.42}
      />
      <Path
        d="M62 95c64-28 134-26 203 8"
        stroke={mutedColor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.42}
      />
      <Path
        d="M45 306c46 22 94 31 145 26 47-5 87-22 123-49"
        stroke={accentColor}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.32}
      />
      <Path
        d="M56 332c39 18 90 25 153 13"
        stroke={mutedColor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.36}
      />
      <Path
        d="M282 156l23-34M305 156l-23-34"
        stroke={accentColor}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.38}
      />
      <Path
        d="M54 210l24-30M80 210l-25-30"
        stroke={mutedColor}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.34}
      />
      <Path
        d="M116 58c16-14 34-19 55-16M196 369c28 5 53 0 75-14"
        stroke={accentColor}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.28}
      />
      <Circle cx={38} cy={128} r={4} fill={accentColor} opacity={0.35} />
      <Circle cx={71} cy={140} r={2.5} fill={mutedColor} opacity={0.42} />
      <Circle cx={310} cy={83} r={3.5} fill={accentColor} opacity={0.3} />
      <Circle cx={327} cy={116} r={2.5} fill={mutedColor} opacity={0.38} />
      <Circle cx={48} cy={294} r={3} fill={mutedColor} opacity={0.36} />
      <Circle cx={322} cy={286} r={4} fill={accentColor} opacity={0.28} />
      <Circle cx={288} cy={335} r={2.5} fill={mutedColor} opacity={0.34} />
    </Svg>
  );
}

export function FirstWorkoutStreakModal({
  visible,
  userName,
  onClose,
}: FirstWorkoutStreakModalProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const firstName = getFirstName(userName);
  const isCompactHeight = height < 740;
  const horizontalPadding = width < 390 ? Spacing.lg : Spacing['2xl'];
  const boltWidth = Math.min(width * 0.62, scale(270));
  const boltHeight = isCompactHeight ? scale(330) : scale(390);
  const boltColor = isDark ? 'rgba(143, 101, 38, 0.62)' : 'rgba(177, 125, 43, 0.28)';
  const graffitiWidth = Math.min(width * 0.88, scale(360));
  const graffitiHeight = isCompactHeight ? scale(340) : scale(420);
  const graffitiAccent = isDark ? colors.accent : colors.accentBorder;
  const graffitiMuted = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.22)';
  const title = firstName === 'You'
    ? "Don't lose your streak!"
    : `${firstName}, don't lose your streak!`;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleCommit = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StainlessSteelPattern />
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
          <View
            style={[
              styles.header,
              {
                paddingTop: Math.max(insets.top + Spacing.sm, Spacing['3xl']),
                paddingHorizontal: horizontalPadding,
              },
            ]}
          >
            <View style={styles.headerSpacer} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close streak milestone"
              hitSlop={12}
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <XMarkIcon color={colors.textPrimary} size={26} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View
            style={[
              styles.content,
              {
                paddingHorizontal: horizontalPadding,
                paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.lg,
              },
            ]}
          >
            <View style={[styles.hero, { minHeight: isCompactHeight ? scale(350) : scale(440) }]}>
              <View style={styles.graffitiWrap}>
                <GraffitiMarks
                  accentColor={graffitiAccent}
                  mutedColor={graffitiMuted}
                  width={graffitiWidth}
                  height={graffitiHeight}
                />
              </View>
              <View style={styles.boltWrap}>
                <StreakBolt color={boltColor} width={boltWidth} height={boltHeight} />
              </View>
              <View style={styles.streakCopy}>
                <Text style={[styles.streakNumber, { color: colors.textPrimary }]}>1</Text>
                <Text style={[styles.streakLabel, { color: colors.textPrimary }]}>day streak</Text>
              </View>
            </View>

            <View style={styles.messageBlock}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Log your next session to protect your habit.
              </Text>
            </View>

            <GlassButton
              style={styles.commitButton}
              onPress={handleCommit}
              hapticFeedback="impactMedium"
            >
              <Text style={[styles.commitButtonText, { color: colors.accentForegroundOnFill }]}>
                I'm committed
              </Text>
            </GlassButton>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: scale(58),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSpacer: {
    width: scale(46),
    height: scale(46),
  },
  closeButton: {
    width: scale(46),
    height: scale(46),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: Spacing['2xl'],
  },
  hero: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  boltWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  graffitiWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCopy: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(18),
  },
  streakNumber: {
    fontSize: moderateScale(116),
    lineHeight: moderateScale(126),
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  streakLabel: {
    marginTop: -scale(10),
    fontSize: moderateScale(34),
    lineHeight: moderateScale(42),
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
  messageBlock: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontSize: moderateScale(28),
    lineHeight: moderateScale(36),
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(20),
    lineHeight: moderateScale(30),
    fontWeight: '500',
    letterSpacing: 0,
    textAlign: 'center',
  },
  commitButton: {
    minHeight: scale(58),
    borderRadius: BorderRadius.full,
  },
  commitButtonText: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
