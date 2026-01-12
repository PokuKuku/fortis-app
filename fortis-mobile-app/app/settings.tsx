import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
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
  ArrowDownTrayIcon,
  ChevronRightIcon,
  SunIcon,
  SwatchIcon,
  ChatBubbleLeftEllipsisIcon,
  BugAntIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme, type ThemeMode, ACCENT_COLOR_LABELS } from '@/src/contexts/ThemeContext';
import { AccentColorPicker } from '@/src/components/ui/AccentColorPicker';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { exportWorkoutsToCSV } from '@/src/utils/exportWorkouts';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isLoading?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
}

function SettingsRow({ icon, label, value, onPress, showChevron, isLoading, colors, isDark }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress || isLoading}
    >
      <View style={styles.settingsRowLeft}>
        {icon}
        <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      <View style={styles.settingsRowRight}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <>
            {value && <Text style={[styles.settingsValue, { color: colors.textSecondary }]}>{value}</Text>}
            {showChevron && (
              <ChevronRightIcon color={colors.textTertiary} size={16} strokeWidth={2} />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, mode, setMode, accentColor } = useTheme();
  const { profile, updateProfile, signOut } = useAuth();
  const bodyType = useWorkoutStore((s) => s.bodyType);
  const setBodyType = useWorkoutStore((s) => s.setBodyType);
  const { sessions: historySessions, isLoading: historyLoading } = useWorkoutHistorySource();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  const unitLabel = profile?.preferred_units === 'metric' ? 'Kilograms (kg)' : 'Pounds (lbs)';
  const bodyTypeLabel = bodyType === 'male' ? 'Male' : 'Female';

  // Theme mode labels
  const themeModeLabel: Record<ThemeMode, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };

  const handleToggleTheme = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Cycle: system → light → dark → system
    const nextMode: ThemeMode = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    await setMode(nextMode);
  };

  const handleToggleUnits = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newUnits = profile?.preferred_units === 'metric' ? 'imperial' : 'metric';
    await updateProfile({ preferred_units: newUnits });
  };

  const handleToggleBodyType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBodyType(bodyType === 'male' ? 'female' : 'male');
  };

  const handleExportData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (historySessions.length === 0) {
      Alert.alert('No Data', 'You have no workout history to export.');
      return;
    }

    setIsExporting(true);
    try {
      const weightUnit = profile?.preferred_units === 'metric' ? 'kg' : 'lbs';
      const result = await exportWorkoutsToCSV(historySessions, weightUnit);

      if (!result.success) {
        Alert.alert('Export Failed', result.error || 'Failed to export workouts.');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'An unexpected error occurred.');
    } finally {
      setIsExporting(false);
    }
  };


  const handleSendFeedback = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const email = 'fortisfitnessapp@gmail.com';
    const subject = encodeURIComponent('Fortis App Feedback');
    const body = encodeURIComponent(
      '\n\n---\nApp Version: 1.0.0\nPlease describe your feedback or issue above.'
    );

    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'No Email App',
          `Please send your feedback to ${email}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Unable to Open Email',
        `Please send your feedback to ${email}`
      );
    }
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
              router.replace('/auth');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenExerciseLibrary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/exercises');
  };

  // Theme-aware card styles
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  const dividerStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeftIcon color={colors.textPrimary} size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Appearance</Text>

            <View style={[styles.settingsCard, cardStyle]}>
              <SettingsRow
                icon={<SunIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Theme"
                value={themeModeLabel[mode]}
                onPress={handleToggleTheme}
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<SwatchIcon color={accentColor === 'green' ? colors.accent : colors.textSecondary} size={20} strokeWidth={2} />}
                label="Accent Color"
                value={ACCENT_COLOR_LABELS[accentColor]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAccentPicker(true);
                }}
                showChevron
                colors={colors}
                isDark={isDark}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Preferences</Text>

            <View style={[styles.settingsCard, cardStyle]}>
              <SettingsRow
                icon={<ScaleIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Weight Units"
                value={unitLabel}
                onPress={handleToggleUnits}
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<UserIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Body Type"
                value={bodyTypeLabel}
                onPress={handleToggleBodyType}
                colors={colors}
                isDark={isDark}
              />
            </View>
          </View>

          {/* Data Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Data</Text>

            <View style={[styles.settingsCard, cardStyle]}>
              <SettingsRow
                icon={<MagnifyingGlassIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Exercise Library"
                onPress={handleOpenExerciseLibrary}
                showChevron
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<ArrowDownTrayIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Export to CSV"
                value={`${historySessions.length} workout${historySessions.length !== 1 ? 's' : ''}`}
                onPress={handleExportData}
                showChevron
                isLoading={isExporting || historyLoading}
                colors={colors}
                isDark={isDark}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Support</Text>

            <View style={[styles.settingsCard, cardStyle]}>
              <SettingsRow
                icon={<ChatBubbleLeftEllipsisIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Send Feedback"
                onPress={handleSendFeedback}
                showChevron
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<BugAntIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Report a Bug"
                onPress={handleSendFeedback}
                showChevron
                colors={colors}
                isDark={isDark}
              />
            </View>
          </View>

          {/* App Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>App</Text>

            <View style={[styles.settingsCard, cardStyle]}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                disabled={isSigningOut}
                activeOpacity={0.7}
              >
                <ArrowRightOnRectangleIcon color={colors.error} size={20} strokeWidth={2} />
                <Text style={[styles.signOutText, { color: colors.error }]}>
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Version */}
          <Text style={[styles.version, { color: colors.textSecondary }]}>Fortis v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>

      {/* Accent Color Picker Modal */}
      <AccentColorPicker
        visible={showAccentPicker}
        onClose={() => setShowAccentPicker(false)}
      />
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
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
