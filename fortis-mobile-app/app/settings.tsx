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
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeftIcon,
  ArrowRightOnRectangleIcon,
  ScaleIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useAuth } from '@/src/contexts/AuthContext';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
}

function SettingsRow({ icon, label, value, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsRowLeft}>
        {icon}
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <Text style={styles.settingsValue}>{value}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, updateProfile, signOut } = useAuth();
  const bodyType = useWorkoutStore((s) => s.bodyType);
  const setBodyType = useWorkoutStore((s) => s.setBodyType);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const unitLabel = profile?.preferred_units === 'metric' ? 'Kilograms (kg)' : 'Pounds (lbs)';
  const bodyTypeLabel = bodyType === 'male' ? 'Male' : 'Female';

  const handleToggleUnits = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newUnits = profile?.preferred_units === 'metric' ? 'imperial' : 'metric';
    await updateProfile({ preferred_units: newUnits });
  };

  const handleToggleBodyType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBodyType(bodyType === 'male' ? 'female' : 'male');
  };

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
            try {
              await signOut();
              router.replace('/');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeftIcon color={Colors.textPrimary} size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Preferences</Text>

            <View style={styles.settingsCard}>
              <SettingsRow
                icon={<ScaleIcon color={Colors.textSecondary} size={20} strokeWidth={2} />}
                label="Weight Units"
                value={unitLabel}
                onPress={handleToggleUnits}
              />

              <View style={styles.settingsDivider} />

              <SettingsRow
                icon={<UserIcon color={Colors.textSecondary} size={20} strokeWidth={2} />}
                label="Body Type"
                value={bodyTypeLabel}
                onPress={handleToggleBodyType}
              />
            </View>
          </View>

          {/* App Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>App</Text>

            <View style={styles.settingsCard}>
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
          </View>

          {/* Version */}
          <Text style={styles.version}>Fortis v1.0.0</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
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
});
