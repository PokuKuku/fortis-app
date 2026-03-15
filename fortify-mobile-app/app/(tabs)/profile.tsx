import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Cog6ToothIcon, FireIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ProfileHeader } from '@/src/components/profile/ProfileHeader';
import { StatsOverviewCard } from '@/src/components/profile/StatsOverviewCard';
import { PersonalRecordsCard } from '@/src/components/profile/PersonalRecordsCard';
import { WeeklyMuscleHeatmapCard } from '@/src/components/profile/WeeklyMuscleHeatmapCard';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';
import { format, startOfDay, startOfWeek, subWeeks } from 'date-fns';

const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const HEADER_PADDING_TOP = scale(Spacing.lg);
const HEADER_PADDING_BOTTOM = scale(Spacing.md);
const SETTINGS_BUTTON_SIZE = scale(40);
const SETTINGS_ICON_SIZE = scale(24);
const HEADER_MIN_HEIGHT = SETTINGS_BUTTON_SIZE;
const TITLE_PADDING_BOTTOM = scale(Spacing.md);
const SECTION_TITLE_SIZE = moderateScale(24);
const STREAK_BADGE_PADDING_X = scale(Spacing.sm);
const STREAK_BADGE_PADDING_Y = scale(Spacing.xs);
const STREAK_BADGE_RADIUS = scale(Spacing.lg);
const STREAK_BADGE_GAP = scale(Spacing.xs);
const STREAK_BADGE_TEXT_SIZE = moderateScale(12);
const STREAK_ICON_SIZE = scale(14);
const SCROLL_PADDING_BOTTOM = scale(120);
const SECTION_SPACING = scale(Spacing.lg);
const NOT_SIGNED_IN_PADDING_TOP = scale(80);
const BODY_TEXT_SIZE = moderateScale(16);
const BODY_LINE_HEIGHT = moderateScale(24);
const BUTTON_TEXT_SIZE = moderateScale(16);
const BUTTON_LINE_HEIGHT = moderateScale(24);
const SIGNIN_PADDING_Y = scale(Spacing.md);
const SIGNIN_PADDING_X = scale(Spacing['3xl']);
const SIGNIN_RADIUS = scale(10);
const SIGNIN_TEXT_MARGIN = scale(Spacing.xl);

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();
  const { sessions: historySessions } = useWorkoutHistorySource({ enabled: isAuthenticated });

  const weeklyStreak = (() => {
    if (!isAuthenticated) return 0;
    if (historySessions.length === 0) return 0;
    const weekStarts = new Set<string>();
    historySessions.forEach((session) => {
      const sessionDate = startOfDay(new Date(session.completedAt ?? session.startedAt));
      const weekStart = startOfWeek(sessionDate, { weekStartsOn: 1 });
      weekStarts.add(format(weekStart, 'yyyy-MM-dd'));
    });

    let streak = 0;
    const currentWeekStart = startOfWeek(startOfDay(new Date()), { weekStartsOn: 1 });
    const lastWeekStart = subWeeks(currentWeekStart, 1);
    let cursor: Date | null = null;

    if (weekStarts.has(format(currentWeekStart, 'yyyy-MM-dd'))) {
      cursor = currentWeekStart;
    } else if (weekStarts.has(format(lastWeekStart, 'yyyy-MM-dd'))) {
      cursor = lastWeekStart;
    }

    if (!cursor) return 0;
    while (weekStarts.has(format(cursor, 'yyyy-MM-dd'))) {
      streak += 1;
      cursor = subWeeks(cursor, 1);
    }
    return streak;
  })();

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <AnimatedLogo />
          </View>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettingsPress}
              activeOpacity={0.7}
            >
              <Cog6ToothIcon color={colors.textSecondary} size={SETTINGS_ICON_SIZE} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Profile</Text>
            {isAuthenticated && (
              <View
                style={[
                  styles.streakBadge,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                  },
                ]}
              >
                <FireIcon color="#ef4444" size={STREAK_ICON_SIZE} strokeWidth={2} />
                <Text style={[styles.streakText, { color: colors.textPrimary }]}>
                  {weeklyStreak} week streak
                </Text>
              </View>
            )}
          </View>

          {isAuthenticated ? (
            <>
              {/* Profile Header with Avatar, Name, and Weekly Activity */}
              <View style={styles.section}>
                <ProfileHeader />
              </View>

              {/* Weekly Muscle Heatmap */}
              <View style={styles.section}>
                <WeeklyMuscleHeatmapCard />
              </View>

              {/* Stats Overview */}
              <View style={styles.section}>
                <StatsOverviewCard />
              </View>

              {/* Personal Records */}
              <View style={styles.section}>
                <PersonalRecordsCard />
              </View>
            </>
          ) : (
            <View style={styles.notSignedIn}>
              <Text style={[styles.notSignedInText, { color: colors.textSecondary }]}>
                Sign in to access your profile
              </Text>
              <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: colors.accent }]}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
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
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    minHeight: HEADER_MIN_HEIGHT + HEADER_PADDING_TOP + HEADER_PADDING_BOTTOM,
  },
  logoContainer: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  settingsButton: {
    position: 'absolute',
    right: HORIZONTAL_PADDING,
    top: HEADER_PADDING_TOP,
    width: SETTINGS_BUTTON_SIZE,
    height: SETTINGS_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingBottom: TITLE_PADDING_BOTTOM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: SECTION_TITLE_SIZE,
    fontFamily: 'BankGothicBT-Medium',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: STREAK_BADGE_GAP,
    borderRadius: STREAK_BADGE_RADIUS,
    borderWidth: 1,
    paddingHorizontal: STREAK_BADGE_PADDING_X,
    paddingVertical: STREAK_BADGE_PADDING_Y,
  },
  streakText: {
    fontSize: STREAK_BADGE_TEXT_SIZE,
    fontWeight: '600',
    fontFamily: 'BankGothicBT-Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: SCROLL_PADDING_BOTTOM,
  },
  section: {
    marginBottom: SECTION_SPACING,
  },
  notSignedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: NOT_SIGNED_IN_PADDING_TOP,
  },
  notSignedInText: {
    ...Typography.body,
    fontSize: BODY_TEXT_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
    marginBottom: SIGNIN_TEXT_MARGIN,
  },
  signInButton: {
    paddingVertical: SIGNIN_PADDING_Y,
    paddingHorizontal: SIGNIN_PADDING_X,
    borderRadius: SIGNIN_RADIUS,
  },
  signInButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: BUTTON_TEXT_SIZE,
    lineHeight: BUTTON_LINE_HEIGHT,
  },
});
