import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ScaleIcon,
} from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, isAuthenticated } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const unitLabel = profile?.preferred_units === 'metric' ? 'Kilograms (kg)' : 'Pounds (lbs)';

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedLogo />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Profile</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isAuthenticated ? (
            <>
              {/* User Info Card */}
              <GlassCard style={styles.userCard}>
                <View style={styles.avatarContainer}>
                  <UserCircleIcon color={Colors.success} size={60} strokeWidth={1} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {profile?.full_name || 'Fortis User'}
                  </Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
              </GlassCard>

              {/* Settings Section */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Preferences</Text>

                <View style={styles.settingsCard}>
                  <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
                    <View style={styles.settingsRowLeft}>
                      <ScaleIcon color={Colors.textSecondary} size={20} strokeWidth={2} />
                      <Text style={styles.settingsLabel}>Weight Units</Text>
                    </View>
                    <Text style={styles.settingsValue}>{unitLabel}</Text>
                  </TouchableOpacity>

                  <View style={styles.settingsDivider} />

                  <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
                    <View style={styles.settingsRowLeft}>
                      <Cog6ToothIcon color={Colors.textSecondary} size={20} strokeWidth={2} />
                      <Text style={styles.settingsLabel}>App Settings</Text>
                    </View>
                    <Text style={styles.settingsValue}>Coming soon</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Out Section */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                  disabled={isSigningOut}
                  activeOpacity={0.7}
                >
                  <ArrowRightOnRectangleIcon color={Colors.error} size={20} strokeWidth={2} />
                  <Text style={styles.signOutText}>
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Version */}
              <Text style={styles.version}>Fortis v1.0.0</Text>
            </>
          ) : (
            <View style={styles.notSignedIn}>
              <Text style={styles.notSignedInText}>
                Sign in to access your profile
              </Text>
              <TouchableOpacity
                style={styles.signInButton}
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
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  titleContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontFamily: 'BankGothicMediumBT',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  settingsValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: Spacing.lg,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: Spacing.lg,
  },
  signOutText: {
    ...Typography.button,
    color: Colors.error,
  },
  version: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  notSignedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  notSignedInText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  signInButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['3xl'],
    borderRadius: BorderRadius.lg,
  },
  signInButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
