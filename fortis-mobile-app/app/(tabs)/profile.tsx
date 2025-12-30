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
              <Cog6ToothIcon color={colors.textSecondary} size={24} strokeWidth={2} />
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
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'BankGothicBT-Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  notSignedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  notSignedInText: {
    ...Typography.body,
    marginBottom: Spacing.xl,
  },
  signInButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['3xl'],
    borderRadius: 10,
  },
  signInButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
});
