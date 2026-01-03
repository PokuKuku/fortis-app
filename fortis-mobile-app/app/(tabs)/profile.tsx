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
import { Cog6ToothIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ProfileHeader } from '@/src/components/profile/ProfileHeader';
import { StatsOverviewCard } from '@/src/components/profile/StatsOverviewCard';
import { PersonalRecordsCard } from '@/src/components/profile/PersonalRecordsCard';
import { WeeklyMuscleHeatmapCard } from '@/src/components/profile/WeeklyMuscleHeatmapCard';
import { Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { scale, moderateScale } from '@/src/utils/responsive';

const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const HEADER_PADDING_TOP = scale(Spacing.lg);
const HEADER_PADDING_BOTTOM = scale(Spacing.md);
const SETTINGS_BUTTON_SIZE = scale(40);
const SETTINGS_ICON_SIZE = scale(24);
const TITLE_PADDING_BOTTOM = scale(Spacing.md);
const SECTION_TITLE_SIZE = moderateScale(24);
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
  const { colors } = useTheme();

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
          <AnimatedLogo />
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

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Profile</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
  },
  settingsButton: {
    width: SETTINGS_BUTTON_SIZE,
    height: SETTINGS_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: TITLE_PADDING_BOTTOM,
  },
  sectionTitle: {
    fontSize: SECTION_TITLE_SIZE,
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
