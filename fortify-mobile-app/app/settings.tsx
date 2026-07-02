import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import {
  ChevronLeftIcon,
  ArrowRightOnRectangleIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
  SunIcon,
  SwatchIcon,
  ChatBubbleLeftEllipsisIcon,
  BugAntIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  BellIcon,
  SparklesIcon,
} from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme, type ThemeMode, ACCENT_COLOR_LABELS } from '@/src/contexts/ThemeContext';
import { AccentColorPicker } from '@/src/components/ui/AccentColorPicker';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { exportWorkoutsToCSV } from '@/src/utils/exportWorkouts';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { supabase } from '@/src/lib/supabase';
import {
  hasAIDataSharingConsent,
  requestAIDataSharingConsent,
  setAIDataSharingConsent,
} from '@/src/services/aiConsentService';
import {
  ensureMicrophonePermission,
  getMicrophonePermissionStatus,
  openMicrophoneSettings,
} from '@/src/services/microphonePermissionService';
import {
  getNotificationPermissionStatus,
  openNotificationSettings,
  requestNotificationPermission,
  requestNotificationPermissionIfNeeded,
} from '@/src/services/notificationPermissionService';
import { RealtimeCoachSettingsModal } from '@/src/components/ai/RealtimeCoachSettingsModal';
import { useRealtimeCoachPreferences } from '@/src/hooks/useRealtimeCoachPreferences';

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

const BUNDLED_APP_VERSION: string | undefined = (() => {
  try {
    return require('../app.json')?.expo?.version;
  } catch {
    return undefined;
  }
})();

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
  const APP_VERSION =
    BUNDLED_APP_VERSION ??
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    '1.1.4';
  const router = useRouter();
  const { colors, isDark, mode, setMode, accentColor } = useTheme();
  const { profile, signOut } = useAuth();
  const { sessions: historySessions, isLoading: historyLoading } = useWorkoutHistorySource({
    enabled: Boolean(profile?.id),
  });
  const {
    preferences: realtimeCoachPreferences,
    updatePreferences: updateRealtimeCoachPreferences,
  } = useRealtimeCoachPreferences();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const [showVoiceCoachSettings, setShowVoiceCoachSettings] = useState(false);
  const [aiDataSharingAllowed, setAIDataSharingAllowed] = useState<boolean>(false);
  const [microphoneAllowed, setMicrophoneAllowed] = useState<boolean>(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(false);

  const TERMS_OF_SERVICE_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? '';
  const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? '';

  // Theme mode labels
  const themeModeLabel: Record<ThemeMode, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };

  const openExternalLink = async (url: string, label: string) => {
    if (!url) {
      Alert.alert('Missing link', `${label} link is not configured yet.`);
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Unable to open link', 'Please try again later.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link', 'Please try again later.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const refreshMicrophonePermission = async () => {
      const permission = await getMicrophonePermissionStatus();
      if (isMounted) {
        setMicrophoneAllowed(permission.granted);
      }
    };
    const refreshNotificationPermission = async () => {
      const permission = await getNotificationPermissionStatus();
      if (isMounted) {
        setNotificationsAllowed(permission?.granted === true || permission?.status === 'granted');
      }
    };

    void (async () => {
      const allowed = await hasAIDataSharingConsent();
      if (isMounted) {
        setAIDataSharingAllowed(allowed);
      }
      await refreshMicrophonePermission();
      await refreshNotificationPermission();
    })();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshMicrophonePermission();
        void refreshNotificationPermission();
      }
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
    };
  }, []);

  const handleAIDataSharingPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (aiDataSharingAllowed) {
      Alert.alert(
        'Disable AI data sharing?',
        'Fortify will stop sending your prompts and workout context to OpenAI until you re-enable this setting.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                await setAIDataSharingConsent(false);
                setAIDataSharingAllowed(false);
              })();
            },
          },
        ]
      );
      return;
    }

    const allowed = await requestAIDataSharingConsent({ forcePrompt: true });
    setAIDataSharingAllowed(allowed);
  };

  const handleMicrophoneAccessPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const currentPermission = await getMicrophonePermissionStatus();
    if (currentPermission.granted || currentPermission.status !== 'undetermined') {
      setMicrophoneAllowed(currentPermission.granted);
      Alert.alert(
        'Microphone access',
        'Microphone access is controlled by your device settings. Open Settings to allow or disable it for Fortify.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              void openMicrophoneSettings();
            },
          },
        ]
      );
      return;
    }

    const permission = await ensureMicrophonePermission();
    setMicrophoneAllowed(permission.granted);

    if (permission.granted) {
      return;
    }

    Alert.alert(
      'Microphone access',
      'Microphone access is controlled by your device settings. Open Settings to allow it for Fortify.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            void openMicrophoneSettings();
          },
        },
      ]
    );
  };

  const handleNotificationAccessPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const currentPermission = await getNotificationPermissionStatus();
    if (!currentPermission) {
      Alert.alert('Notifications', 'Notification permissions are not available on this device.');
      return;
    }

    const isAllowed = currentPermission.granted || currentPermission.status === 'granted';
    if (isAllowed) {
      setNotificationsAllowed(true);
      Alert.alert(
        'Notifications',
        'Notification access is controlled by your device settings. Open Settings to allow or disable it for Fortify.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              void openNotificationSettings();
            },
          },
        ]
      );
      return;
    }

    const canAskInApp = currentPermission.status === 'undetermined' || currentPermission.canAskAgain === true;
    if (canAskInApp) {
      const nextPermission = currentPermission.status === 'undetermined'
        ? await requestNotificationPermissionIfNeeded()
        : await requestNotificationPermission();
      const nextAllowed = nextPermission?.granted === true || nextPermission?.status === 'granted';
      setNotificationsAllowed(nextAllowed);
      if (nextAllowed) return;
    } else {
      setNotificationsAllowed(false);
    }

    Alert.alert(
      'Notifications',
      'Notification access is controlled by your device settings. Open Settings to allow it for Fortify.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            void openNotificationSettings();
          },
        },
      ]
    );
  };

  const handleToggleTheme = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Cycle: system → light → dark → system
    const nextMode: ThemeMode = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    await setMode(nextMode);
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
    const subject = encodeURIComponent('Fortify App Feedback');
    const body = encodeURIComponent(
      `\n\n---\nApp Version: ${APP_VERSION}\nPlease describe your feedback or issue above.`
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
    console.log('[Settings] Sign out pressed');
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
            console.log('[Settings] Sign out confirmed');
            setIsSigningOut(true);
            try {
              await signOut();
              console.log('[Settings] Sign out completed');
              router.replace('/onboarding/welcome');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !session) {
                throw new Error('Please sign in again to delete your account.');
              }

              const invokeDelete = async (accessToken: string) =>
                supabase.functions.invoke('delete-account', {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                });

              const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
              if (refreshError) {
                console.warn('[Settings] Failed to refresh session before delete', refreshError);
              }

              let accessToken =
                refreshedData.session?.access_token ??
                session.access_token;
              if (!accessToken) {
                throw new Error('Please sign in again to delete your account.');
              }

              let { error } = await invokeDelete(accessToken);
              const context = (error as { context?: { body?: unknown; status?: number } } | null)?.context;
              const statusCode = context?.status;

              if (error && (statusCode === 401 || statusCode === 403)) {
                const { data: retryRefreshData, error: retryRefreshError } = await supabase.auth.refreshSession();
                if (!retryRefreshError && retryRefreshData.session?.access_token) {
                  accessToken = retryRefreshData.session.access_token;
                  ({ error } = await invokeDelete(accessToken));
                }
              }

              if (error) {
                const latestContext = (error as { context?: { body?: unknown } }).context;
                const rawBody = latestContext?.body;
                let detailedMessage: string | null = null;
                if (rawBody) {
                  try {
                    const parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
                    detailedMessage = parsed?.error?.message ?? parsed?.message ?? null;
                  } catch {
                    detailedMessage = typeof rawBody === 'string' ? rawBody : null;
                  }
                }
                throw new Error(detailedMessage || error.message || 'Unable to delete account.');
              }
              try {
                await signOut();
              } catch (signOutError) {
                console.warn('[Settings] Sign out after delete failed', signOutError);
              }
              router.replace('/onboarding/welcome');
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Unable to delete account.';
              Alert.alert('Delete failed', message);
            } finally {
              setIsDeletingAccount(false);
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

  const dangerCardStyle = {
    backgroundColor: isDark ? 'rgba(255, 82, 82, 0.14)' : 'rgba(255, 82, 82, 0.1)',
    borderColor: isDark ? 'rgba(255, 82, 82, 0.35)' : 'rgba(255, 82, 82, 0.28)',
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
                icon={<AdjustmentsHorizontalIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Training Preferences"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/settings/preferences');
                }}
                showChevron
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<SparklesIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Voice Coach"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowVoiceCoachSettings(true);
                }}
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
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<BugAntIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Report a Bug"
                onPress={handleSendFeedback}
                colors={colors}
                isDark={isDark}
              />
            </View>
          </View>

          {/* Legal & Security Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Legal & Security</Text>

            <View style={[styles.settingsCard, cardStyle]}>
              <SettingsRow
                icon={<MicrophoneIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Microphone"
                value={microphoneAllowed ? 'Allowed' : 'Not allowed'}
                onPress={handleMicrophoneAccessPress}
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<BellIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Notifications"
                value={notificationsAllowed ? 'Allowed' : 'Not allowed'}
                onPress={handleNotificationAccessPress}
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<DocumentTextIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="AI Coaching"
                value={aiDataSharingAllowed ? 'Allowed' : 'Not allowed'}
                onPress={handleAIDataSharingPress}
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<DocumentTextIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Terms & Conditions"
                onPress={() => openExternalLink(TERMS_OF_SERVICE_URL, 'Terms & Conditions')}
                colors={colors}
                isDark={isDark}
              />

              <View style={[styles.settingsDivider, dividerStyle]} />

              <SettingsRow
                icon={<DocumentTextIcon color={colors.textSecondary} size={20} strokeWidth={2} />}
                label="Privacy Policy"
                onPress={() => openExternalLink(PRIVACY_POLICY_URL, 'Privacy Policy')}
                colors={colors}
                isDark={isDark}
              />
            </View>
          </View>

          {/* App Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>App</Text>

            <TouchableOpacity
              style={[styles.settingsCard, cardStyle, styles.signOutButton]}
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

          {/* Danger Zone Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.error }]}>Danger Zone</Text>

            <View style={[styles.settingsCard, cardStyle, dangerCardStyle]}>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleDeleteAccount}
                disabled={isDeletingAccount}
                activeOpacity={0.7}
              >
                <TrashIcon color={colors.error} size={20} strokeWidth={2} />
                <Text style={[styles.dangerText, { color: colors.error }]}>
                  {isDeletingAccount ? 'Deleting account...' : 'Permanently delete account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Version */}
          <Text style={[styles.version, { color: colors.textSecondary }]}>Fortify v{APP_VERSION}</Text>
        </ScrollView>
      </SafeAreaView>

      {/* Accent Color Picker Modal */}
      <AccentColorPicker
        visible={showAccentPicker}
        onClose={() => setShowAccentPicker(false)}
      />

      <RealtimeCoachSettingsModal
        visible={showVoiceCoachSettings}
        preferences={realtimeCoachPreferences}
        onChange={updateRealtimeCoachPreferences}
        onClose={() => setShowVoiceCoachSettings(false)}
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
    fontFamily: 'BankGothicBT-Medium',
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
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  dangerText: {
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
