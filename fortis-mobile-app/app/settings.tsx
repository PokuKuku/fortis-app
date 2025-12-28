import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import {
  ChevronLeftIcon,
  ArrowRightOnRectangleIcon,
  ScaleIcon,
  UserIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronRightIcon,
  SparklesIcon,
  SunIcon,
} from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme, type ThemeMode } from '@/src/contexts/ThemeContext';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { exportWorkoutsToCSV } from '@/src/utils/exportWorkouts';
import { parseWorkoutCsv, type ImportSource } from '@/src/utils/importWorkouts';
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
  const { colors, isDark, mode, setMode } = useTheme();
  const { profile, updateProfile, signOut } = useAuth();
  const bodyType = useWorkoutStore((s) => s.bodyType);
  const setBodyType = useWorkoutStore((s) => s.setBodyType);
  const completedSessions = useWorkoutStore((s) => s.completedSessions);
  const importCompletedSessions = useWorkoutStore((s) => s.importCompletedSessions);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const unitLabel = profile?.preferred_units === 'metric' ? 'Kilograms (kg)' : 'Pounds (lbs)';
  const bodyTypeLabel = bodyType === 'male' ? 'Male' : 'Female';
  const workoutCount = completedSessions.length;

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

    if (completedSessions.length === 0) {
      Alert.alert('No Data', 'You have no workout history to export.');
      return;
    }

    setIsExporting(true);
    try {
      const weightUnit = profile?.preferred_units === 'metric' ? 'kg' : 'lbs';
      const result = await exportWorkoutsToCSV(completedSessions, weightUnit);

      if (!result.success) {
        Alert.alert('Export Failed', result.error || 'Failed to export workouts.');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'An unexpected error occurred.');
    } finally {
      setIsExporting(false);
    }
  };

  const runCsvImport = async (source: ImportSource) => {
    setIsImporting(true);
    try {
      const { getDocumentAsync } = await import('expo-document-picker').catch((error) => {
        throw new Error(
          `Document picker unavailable. Rebuild the dev client after installing expo-document-picker. (${error instanceof Error ? error.message : 'unknown error'})`
        );
      });

      const pickerResult = await getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled) {
        return;
      }

      const asset = pickerResult.assets?.[0];
      if (!asset?.uri) {
        Alert.alert('Import Failed', 'Could not read the selected file.');
        return;
      }

      const csvText = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const { sessions, createdCustomExercises } = await parseWorkoutCsv(csvText, source);

      if (sessions.length === 0) {
        Alert.alert('No Workouts Found', 'This CSV did not contain any workouts to import.');
        return;
      }

      const { imported, skipped, skippedSync } = await importCompletedSessions(sessions);
      const customCount = createdCustomExercises.length;

      let message = `Imported ${imported} workout${imported === 1 ? '' : 's'}.`;
      if (skipped > 0) {
        message += ` Skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}.`;
      }
      if (customCount > 0) {
        message += ` Added ${customCount} custom exercise${customCount === 1 ? '' : 's'}.`;
      }
      if (skippedSync > 0) {
        message += ` ${skippedSync} workout${skippedSync === 1 ? '' : 's'} not synced because they include custom exercises.`;
      }

      Alert.alert('Import Complete', message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      Alert.alert('Import Failed', message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Import CSV',
      'Choose the source app format for your CSV.',
      [
        { text: 'Strong', onPress: () => runCsvImport('strong') },
        { text: 'Hevy / Generic', onPress: () => runCsvImport('generic') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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

          {/* AI Personalization */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Personalization</Text>

            <View style={[styles.settingsCard, cardStyle]}>
              <SettingsRow
                icon={<SparklesIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Goals & Metrics"
                onPress={() => router.push('/goals')}
                showChevron
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
                icon={<ArrowUpTrayIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Import from CSV"
                onPress={handleImportData}
                showChevron
                isLoading={isImporting}
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<ArrowDownTrayIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Export to CSV"
                value={`${workoutCount} workout${workoutCount !== 1 ? 's' : ''}`}
                onPress={handleExportData}
                showChevron
                isLoading={isExporting}
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
