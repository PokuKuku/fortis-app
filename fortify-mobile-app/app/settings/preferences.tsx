import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { supabase } from '@/src/lib/supabase';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { BaseModal, useModalStyles } from '@/src/components/ui/BaseModal';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { WorkoutScheduleEditorModal } from '@/src/components/workout/WorkoutScheduleEditorModal';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { useWorkoutSchedule } from '@/src/hooks/useWorkoutSchedule';
import { useWorkoutRetentionPreferences } from '@/src/hooks/useWorkoutRetentionPreferences';
import {
  getNotificationPermissionStatus,
  openNotificationSettings,
  requestNotificationPermission,
  requestNotificationPermissionIfNeeded,
} from '@/src/services/notificationPermissionService';
import { formatReminderTime, normalizeReminderTime } from '@/src/utils/workoutRetention';

const LB_PER_KG = 2.20462;
const KG_PER_LB = 1 / LB_PER_KG;
const KG_MIN = 40;
const KG_MAX = 180;
const LB_MIN = 80;
const LB_MAX = 400;
const CM_MIN = 120;
const CM_MAX = 220;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const roundTo = (value: number, decimals = 1) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

type TrainingExperience = 'none' | 'beginner' | 'intermediate' | 'advanced';

type TrainingEnvironment = 'gym' | 'home' | 'hybrid';

type FitnessGoal = 'build_muscle' | 'general_health' | 'improve_strength' | 'stay_consistent';

type GoalOption = {
  value: FitnessGoal;
  title: string;
  description: string;
};

type ExperienceOption = {
  value: TrainingExperience;
  title: string;
  description: string;
};

type TrainingEnvironmentOption = {
  value: TrainingEnvironment;
  title: string;
  description: string;
};

type ReminderDialMode = 'hour' | 'minute';

const GOAL_OPTIONS: GoalOption[] = [
  { value: 'build_muscle', title: 'Build muscle', description: 'Prioritize hypertrophy and consistent volume.' },
  { value: 'general_health', title: 'General health', description: 'Balance strength, mobility, and consistency.' },
  { value: 'improve_strength', title: 'Improve strength', description: 'Focus on progressive overload and heavy sets.' },
  { value: 'stay_consistent', title: 'Stay consistent', description: 'Build routines that are easy to sustain.' },
];

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  { value: 'none', title: 'New to training', description: 'Just starting out.' },
  { value: 'beginner', title: 'Beginner', description: 'Some experience, still building basics.' },
  { value: 'intermediate', title: 'Intermediate', description: 'Consistent training and solid foundation.' },
  { value: 'advanced', title: 'Advanced', description: 'Highly experienced with structured training.' },
];

const TRAINING_ENVIRONMENT_OPTIONS: TrainingEnvironmentOption[] = [
  {
    value: 'gym',
    title: 'Gym',
    description: 'Full gym access: barbells, machines, cables, dumbbells.',
  },
  {
    value: 'home',
    title: 'Home',
    description: 'Minimal setup: bodyweight, dumbbells, bands, and space to train.',
  },
  {
    value: 'hybrid',
    title: 'Hybrid',
    description: 'A mix of gym days and home sessions.',
  },
];

const EXPERIENCE_LABELS: Record<TrainingExperience, string> = {
  none: 'New to training',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const GOAL_LABELS: Record<FitnessGoal, string> = {
  build_muscle: 'Build muscle',
  general_health: 'General health',
  improve_strength: 'Improve strength',
  stay_consistent: 'Stay consistent',
};

const TRAINING_ENVIRONMENT_LABELS: Record<TrainingEnvironment, string> = {
  gym: 'Gym',
  home: 'Home',
  hybrid: 'Hybrid',
};

const formatWeight = (weightKg: number | null | undefined, units: 'imperial' | 'metric') => {
  if (!weightKg) return '—';
  if (units === 'metric') {
    return `${roundTo(weightKg, 1).toFixed(1)} kg`;
  }
  const weightLb = weightKg * LB_PER_KG;
  return `${roundTo(weightLb, 1).toFixed(1)} lb`;
};

const formatHeight = (heightCm: number | null | undefined, units: 'imperial' | 'metric') => {
  if (!heightCm) return '—';
  if (units === 'metric') {
    return `${Math.round(heightCm)} cm`;
  }
  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
};

interface PreferenceRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

function PreferenceRow({ label, value, onPress, showChevron, disabled, colors }: PreferenceRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress || disabled}
    >
      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>}
        {showChevron && <Text style={[styles.rowChevron, { color: colors.textTertiary }]}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

interface ReminderTimeDialProps {
  mode: ReminderDialMode;
  hour: number;
  minute: number;
  size: number;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
}

function ReminderTimeDial({
  mode,
  hour,
  minute,
  size,
  isDark,
  colors,
  onChangeHour,
  onChangeMinute,
}: ReminderTimeDialProps) {
  const radius = size / 2;
  const center = radius;
  const isCompact = size < 225;
  const markSize = isCompact ? 28 : 32;
  const knobSize = isCompact ? 18 : 20;
  const markerRadius = radius - (isCompact ? 16 : 18);
  const knobRadius = radius - (isCompact ? 22 : 24);
  const selectedValue = mode === 'hour' ? hour : minute;
  const steps = mode === 'hour' ? 12 : 60;
  const selectedIndex = mode === 'hour' ? hour % 12 : minute;
  const selectedAngle = (selectedIndex / steps) * 360;
  const selectedRadians = ((selectedAngle - 90) * Math.PI) / 180;
  const knobX = center + Math.cos(selectedRadians) * knobRadius;
  const knobY = center + Math.sin(selectedRadians) * knobRadius;
  const lastHapticValueRef = useRef<number | null>(null);

  const setValueFromLocation = (x: number, y: number) => {
    const dx = x - center;
    const dy = y - center;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalized = (angle + 90 + 360) % 360;

    if (mode === 'hour') {
      const nextIndex = Math.round(normalized / 30) % 12;
      const nextHour = nextIndex === 0 ? 12 : nextIndex;
      onChangeHour(nextHour);
      if (lastHapticValueRef.current !== nextHour) {
        lastHapticValueRef.current = nextHour;
        Haptics.selectionAsync().catch(() => undefined);
      }
      return;
    }

    const nextMinute = Math.round(normalized / 6) % 60;
    onChangeMinute(nextMinute);
    const hapticTick = Math.round(nextMinute / 5) % 12;
    if (nextMinute % 5 === 0 && lastHapticValueRef.current !== hapticTick) {
      lastHapticValueRef.current = hapticTick;
      Haptics.selectionAsync().catch(() => undefined);
    }
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      setValueFromLocation(event.nativeEvent.locationX, event.nativeEvent.locationY);
    },
    onPanResponderMove: (event) => {
      setValueFromLocation(event.nativeEvent.locationX, event.nativeEvent.locationY);
    },
  }), [mode, onChangeHour, onChangeMinute, center]);

  const marks = useMemo(() => {
    const count = mode === 'hour' ? 12 : 12;
    return Array.from({ length: count }, (_, index) => {
      const value = mode === 'hour' ? (index === 0 ? 12 : index) : index * 5;
      const angleDeg = mode === 'hour' ? index * 30 : index * 30;
      const radians = ((angleDeg - 90) * Math.PI) / 180;
      const x = center + Math.cos(radians) * markerRadius;
      const y = center + Math.sin(radians) * markerRadius;
      const isSelected = mode === 'hour'
        ? value === hour
        : value === Math.round(minute / 5) * 5 || (value === 0 && minute >= 58);

      return {
        key: `${mode}-${value}`,
        label: mode === 'hour' ? String(value) : String(value).padStart(2, '0'),
        x,
        y,
        isSelected,
      };
    });
  }, [center, hour, markerRadius, minute, mode]);

  return (
    <View
      style={[
        styles.dial,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        },
      ]}
      {...panResponder.panHandlers}
    >
      {marks.map((mark) => (
        <View
          key={mark.key}
          pointerEvents="none"
          style={[
            styles.dialMark,
            {
              left: mark.x - markSize / 2,
              top: mark.y - markSize / 2,
              width: markSize,
              height: markSize,
              borderRadius: markSize / 2,
              backgroundColor: mark.isSelected ? colors.accent : 'transparent',
            },
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[
              styles.dialMarkText,
              isCompact && styles.dialMarkTextCompact,
              { color: mark.isSelected ? colors.accentForegroundOnFill : colors.textSecondary },
            ]}
          >
            {mark.label}
          </Text>
        </View>
      ))}

      <View
        pointerEvents="none"
        style={[
          styles.dialKnob,
          {
            left: knobX - knobSize / 2,
            top: knobY - knobSize / 2,
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
          },
        ]}
      />
      <View pointerEvents="none" style={styles.dialCenter}>
        <Text allowFontScaling={false} style={[styles.dialValue, { color: colors.textPrimary }]}>
          {mode === 'hour' ? selectedValue : String(selectedValue).padStart(2, '0')}
        </Text>
        <Text allowFontScaling={false} style={[styles.dialModeLabel, { color: colors.textSecondary }]}>
          {mode}
        </Text>
      </View>
    </View>
  );
}

export default function SettingsPreferencesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { user, profile, updateProfile } = useAuth();
  const {
    scheduleDays,
    isSaving: isSavingSchedule,
    saveScheduleDays,
  } = useWorkoutSchedule();
  const { sessions: weeklyRecapSessions } = useWorkoutHistorySource({
    enabled: __DEV__ && Boolean(user),
    syncToStore: false,
  });
  const {
    reminderTime,
    setReminderTime,
  } = useWorkoutRetentionPreferences();
  const bodyType = useWorkoutStore((s) => s.bodyType);
  const setBodyType = useWorkoutStore((s) => s.setBodyType);
  const modalStyles = useModalStyles();
  const isCompactReminderLayout = windowHeight < 720;
  const reminderModalWidth = Math.min(360, Math.max(288, windowWidth - Spacing.lg * 2));
  const reminderDialSize = Math.max(
    196,
    Math.min(
      isCompactReminderLayout ? 220 : 252,
      reminderModalWidth - Spacing.xl * 2,
      windowHeight - (isCompactReminderLayout ? 430 : 470)
    )
  );

  const units = profile?.preferred_units === 'metric' ? 'metric' : 'imperial';
  const weightLabel = formatWeight(profile?.weight_kg, units);
  const heightLabel = formatHeight(profile?.height_cm, units);
  const experienceLabel = profile?.lifting_experience
    ? EXPERIENCE_LABELS[profile.lifting_experience as TrainingExperience]
    : '—';
  const goalLabel = profile?.fitness_goal
    ? GOAL_LABELS[profile.fitness_goal as FitnessGoal]
    : '—';
  const trainingEnvironmentLabel = profile?.training_environment
    ? TRAINING_ENVIRONMENT_LABELS[profile.training_environment]
    : '—';
  const bodyTypeLabel = bodyType === 'male' ? 'Male' : 'Female';
  const reminderTimeLabel = formatReminderTime(reminderTime);

  const [measurementsOpen, setMeasurementsOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [trainingEnvironmentOpen, setTrainingEnvironmentOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reminderTimeOpen, setReminderTimeOpen] = useState(false);
  const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [isSavingTrainingEnvironment, setIsSavingTrainingEnvironment] = useState(false);

  const [heightCmInput, setHeightCmInput] = useState('');
  const [heightFeetInput, setHeightFeetInput] = useState('');
  const [heightInchesInput, setHeightInchesInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [reminderDialMode, setReminderDialMode] = useState<ReminderDialMode>('hour');
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [reminderPeriod, setReminderPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (!measurementsOpen) return;

    if (units === 'metric') {
      setHeightCmInput(profile?.height_cm ? String(Math.round(profile.height_cm)) : '');
      setWeightInput(profile?.weight_kg ? String(roundTo(profile.weight_kg, 1)) : '');
      setHeightFeetInput('');
      setHeightInchesInput('');
      return;
    }

    if (profile?.height_cm) {
      const totalInches = Math.round(profile.height_cm / 2.54);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      setHeightFeetInput(String(feet));
      setHeightInchesInput(String(inches));
    } else {
      setHeightFeetInput('');
      setHeightInchesInput('');
    }

    if (profile?.weight_kg) {
      const weightLb = roundTo(profile.weight_kg * LB_PER_KG, 1);
      setWeightInput(String(weightLb));
    } else {
      setWeightInput('');
    }

    setHeightCmInput('');
  }, [measurementsOpen, profile?.height_cm, profile?.weight_kg, units]);

  useEffect(() => {
    if (!reminderTimeOpen) return;
    const isPm = reminderTime.hour >= 12;
    const twelveHour = reminderTime.hour % 12 || 12;
    setReminderHour(twelveHour);
    setReminderMinute(reminderTime.minute);
    setReminderPeriod(isPm ? 'PM' : 'AM');
    setReminderDialMode('hour');
  }, [reminderTime.hour, reminderTime.minute, reminderTimeOpen]);

  const handleToggleUnits = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextUnits = units === 'metric' ? 'imperial' : 'metric';
    await updateProfile({ preferred_units: nextUnits });
  };

  const handleToggleBodyType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBodyType(bodyType === 'male' ? 'female' : 'male');
  };

  const handleSaveMeasurements = async () => {
    if (!user) return;

    let heightCm: number | null = null;
    let weightKg: number | null = null;
    let weightMetric: { value: number; unit: 'kg' | 'lb' } | null = null;

    if (units === 'metric') {
      if (heightCmInput.trim()) {
        const parsed = Number(heightCmInput);
        if (Number.isNaN(parsed)) {
          Alert.alert('Invalid height', 'Enter a valid height in centimeters.');
          return;
        }
        heightCm = clamp(Math.round(parsed), CM_MIN, CM_MAX);
      }

      if (weightInput.trim()) {
        const parsed = Number(weightInput);
        if (Number.isNaN(parsed)) {
          Alert.alert('Invalid weight', 'Enter a valid weight in kilograms.');
          return;
        }
        const clamped = clamp(roundTo(parsed, 1), KG_MIN, KG_MAX);
        weightKg = clamped;
        weightMetric = { value: clamped, unit: 'kg' };
      }
    } else {
      const feetValue = heightFeetInput.trim() ? Number(heightFeetInput) : null;
      const inchesValue = heightInchesInput.trim() ? Number(heightInchesInput) : 0;
      if (heightFeetInput.trim()) {
        if (feetValue === null || Number.isNaN(feetValue) || feetValue <= 0) {
          Alert.alert('Invalid height', 'Enter a valid height in feet and inches.');
          return;
        }
        if (Number.isNaN(inchesValue)) {
          Alert.alert('Invalid height', 'Enter a valid height in inches.');
          return;
        }
        const totalInches = feetValue * 12 + (inchesValue ?? 0);
        heightCm = clamp(Math.round(totalInches * 2.54), CM_MIN, CM_MAX);
      }

      if (weightInput.trim()) {
        const parsed = Number(weightInput);
        if (Number.isNaN(parsed)) {
          Alert.alert('Invalid weight', 'Enter a valid weight in pounds.');
          return;
        }
        const clamped = clamp(roundTo(parsed, 1), LB_MIN, LB_MAX);
        weightKg = roundTo(clamped * KG_PER_LB, 1);
        weightMetric = { value: clamped, unit: 'lb' };
      }
    }

    if (heightCm === null && weightKg === null) {
      setMeasurementsOpen(false);
      return;
    }

    setIsSavingMeasurements(true);
    try {
      const updates: { height_cm?: number | null; weight_kg?: number | null } = {};
      if (heightCm !== null) updates.height_cm = heightCm;
      if (weightKg !== null) updates.weight_kg = weightKg;

      const { error } = await updateProfile(updates);
      if (error) {
        Alert.alert('Update failed', error.message);
        return;
      }

      if (weightMetric) {
        const { error: weightError } = await supabase.from('user_body_metrics').insert({
          user_id: user.id,
          weight: weightMetric.value,
          unit: weightMetric.unit,
        });
        if (weightError) {
          console.warn('Failed to save weight metric:', weightError.message);
        }
      }

      setMeasurementsOpen(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } finally {
      setIsSavingMeasurements(false);
    }
  };

  const handleSelectExperience = async (value: TrainingExperience) => {
    if (!profile) return;
    setIsSavingExperience(true);
    const { error } = await updateProfile({ lifting_experience: value });
    setIsSavingExperience(false);
    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }
    setExperienceOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  const handleSelectGoal = async (value: FitnessGoal) => {
    if (!profile) return;
    setIsSavingGoal(true);
    const { error } = await updateProfile({ fitness_goal: value });
    setIsSavingGoal(false);
    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }
    setGoalOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  const handleSelectTrainingEnvironment = async (value: TrainingEnvironment) => {
    if (!profile) return;
    setIsSavingTrainingEnvironment(true);
    const { error } = await updateProfile({ training_environment: value });
    setIsSavingTrainingEnvironment(false);
    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }
    setTrainingEnvironmentOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  const handleSaveSchedule = async (days: number[]) => {
    const { error } = await saveScheduleDays(days, { sessions: weeklyRecapSessions });
    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }
    setScheduleOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  const ensureNotificationsAllowed = async () => {
    try {
      const permission = await getNotificationPermissionStatus();
      if (!permission) return false;
      if (permission.granted || permission.status === 'granted') return true;

      const canAskInApp = permission.status === 'undetermined' || permission.canAskAgain === true;
      if (canAskInApp) {
        const nextPermission = permission.status === 'undetermined'
          ? await requestNotificationPermissionIfNeeded()
          : await requestNotificationPermission();
        if (nextPermission?.granted || nextPermission?.status === 'granted') return true;
      }

      await new Promise<void>((resolve) => {
        Alert.alert(
          'Turn on notifications',
          'Fortify needs notification access to send workout reminders.',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => resolve(),
            },
            {
              text: 'Open Settings',
              onPress: () => {
                void openNotificationSettings().finally(resolve);
              },
            },
          ],
          { onDismiss: resolve }
        );
      });
      return false;
    } catch {
      return false;
    }
  };

  const handleOpenWorkoutSchedule = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const notificationsAllowed = await ensureNotificationsAllowed();
    if (!notificationsAllowed) return;
    setScheduleOpen(true);
  };

  const handleOpenReminderTime = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const notificationsAllowed = await ensureNotificationsAllowed();
    if (!notificationsAllowed) return;
    setReminderTimeOpen(true);
  };

  const handleSaveReminderTime = async () => {
    const hour24 = reminderPeriod === 'PM'
      ? (reminderHour % 12) + 12
      : reminderHour % 12;
    await setReminderTime(normalizeReminderTime({ hour: hour24, minute: reminderMinute }));
    setReminderTimeOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeftIcon color={colors.textPrimary} size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Training Preferences</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Body</Text>
            <View style={[styles.card, cardStyle]}>
              <PreferenceRow
                label="Measurements"
                value={`${heightLabel} • ${weightLabel}`}
                onPress={() => setMeasurementsOpen(true)}
                showChevron
                colors={colors}
              />
              <View style={[styles.divider, dividerStyle]} />
              <PreferenceRow
                label="Weight Units"
                value={units === 'metric' ? 'Kilograms (kg)' : 'Pounds (lb)'}
                onPress={handleToggleUnits}
                colors={colors}
              />
              <View style={[styles.divider, dividerStyle]} />
              <PreferenceRow
                label="Body Type"
                value={bodyTypeLabel}
                onPress={handleToggleBodyType}
                colors={colors}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Training</Text>
            <View style={[styles.card, cardStyle]}>
              <PreferenceRow
                label="Training Experience"
                value={experienceLabel}
                onPress={() => setExperienceOpen(true)}
                showChevron
                colors={colors}
              />
              <View style={[styles.divider, dividerStyle]} />
              <PreferenceRow
                label="Primary Goal"
                value={goalLabel}
                onPress={() => setGoalOpen(true)}
                showChevron
                colors={colors}
              />
              <View style={[styles.divider, dividerStyle]} />
              <PreferenceRow
                label="Training Environment"
                value={trainingEnvironmentLabel}
                onPress={() => setTrainingEnvironmentOpen(true)}
                showChevron
                colors={colors}
              />
              <View style={[styles.divider, dividerStyle]} />
              <PreferenceRow
                label="Workout Schedule"
                onPress={handleOpenWorkoutSchedule}
                showChevron
                colors={colors}
              />
              <View style={[styles.divider, dividerStyle]} />
              <PreferenceRow
                label="Reminder Time"
                value={reminderTimeLabel}
                onPress={handleOpenReminderTime}
                showChevron
                colors={colors}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BaseModal
        visible={measurementsOpen}
        onClose={() => setMeasurementsOpen(false)}
        title="Measurements"
      >
        <View style={styles.modalSection}>
          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Height</Text>
          {units === 'metric' ? (
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
              placeholder="cm"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              value={heightCmInput}
              onChangeText={setHeightCmInput}
            />
          ) : (
            <View style={styles.splitInputRow}>
              <TextInput
                style={[
                  styles.modalInput,
                  styles.splitInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  },
                ]}
                placeholder="ft"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                value={heightFeetInput}
                onChangeText={setHeightFeetInput}
              />
              <TextInput
                style={[
                  styles.modalInput,
                  styles.splitInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  },
                ]}
                placeholder="in"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                value={heightInchesInput}
                onChangeText={setHeightInchesInput}
              />
            </View>
          )}
        </View>

        <View style={styles.modalSection}>
          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Weight</Text>
          <TextInput
            style={[
              styles.modalInput,
              {
                color: colors.textPrimary,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              },
            ]}
            placeholder={units === 'metric' ? 'kg' : 'lb'}
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={weightInput}
            onChangeText={setWeightInput}
          />
        </View>

        <View style={modalStyles.actions}>
          <TouchableOpacity
            style={modalStyles.cancelButton}
            onPress={() => setMeasurementsOpen(false)}
            disabled={isSavingMeasurements}
          >
            <Text style={modalStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modalStyles.successButton}
            onPress={handleSaveMeasurements}
            disabled={isSavingMeasurements}
          >
            {isSavingMeasurements ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={modalStyles.successButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </BaseModal>

      <BaseModal
        visible={experienceOpen}
        onClose={() => setExperienceOpen(false)}
        title="Training Experience"
      >
        <View style={styles.optionList}>
          {EXPERIENCE_OPTIONS.map((option) => (
            <OnboardingOptionCard
              key={option.value}
              title={option.title}
              description={option.description}
              selected={profile?.lifting_experience === option.value}
              onSelect={() => handleSelectExperience(option.value)}
            />
          ))}
        </View>
        {isSavingExperience && (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Saving…</Text>
          </View>
        )}
      </BaseModal>

      <BaseModal
        visible={goalOpen}
        onClose={() => setGoalOpen(false)}
        title="Primary Goal"
      >
        <View style={styles.optionList}>
          {GOAL_OPTIONS.map((option) => (
            <OnboardingOptionCard
              key={option.value}
              title={option.title}
              description={option.description}
              selected={profile?.fitness_goal === option.value}
              onSelect={() => handleSelectGoal(option.value)}
            />
          ))}
        </View>
        {isSavingGoal && (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Saving…</Text>
          </View>
        )}
      </BaseModal>

      <BaseModal
        visible={trainingEnvironmentOpen}
        onClose={() => setTrainingEnvironmentOpen(false)}
        title="Training Environment"
        showCloseButton={false}
      >
        <View style={styles.optionList}>
          {TRAINING_ENVIRONMENT_OPTIONS.map((option) => (
            <OnboardingOptionCard
              key={option.value}
              title={option.title}
              description={option.description}
              selected={profile?.training_environment === option.value}
              onSelect={() => handleSelectTrainingEnvironment(option.value)}
            />
          ))}
        </View>
        {isSavingTrainingEnvironment && (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Saving…</Text>
          </View>
        )}
      </BaseModal>

      <WorkoutScheduleEditorModal
        visible={scheduleOpen}
        initialDays={scheduleDays}
        isSaving={isSavingSchedule}
        onClose={() => setScheduleOpen(false)}
        onSave={handleSaveSchedule}
      />

      <BaseModal
        visible={reminderTimeOpen}
        onClose={() => setReminderTimeOpen(false)}
        title="Reminder Time"
        width={reminderModalWidth}
      >
        <View style={[
          styles.reminderDialContent,
          isCompactReminderLayout && styles.reminderDialContentCompact,
        ]}>
          <Text allowFontScaling={false} style={[styles.reminderTimePreview, { color: colors.textPrimary }]}>
            {`${reminderHour}:${String(reminderMinute).padStart(2, '0')} ${reminderPeriod}`}
          </Text>

          <View style={[styles.dialModeToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            {(['hour', 'minute'] as const).map((mode) => {
              const selected = reminderDialMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.dialModeButton,
                    { backgroundColor: selected ? colors.accent : 'transparent' },
                  ]}
                  onPress={() => {
                    setReminderDialMode(mode);
                    Haptics.selectionAsync().catch(() => undefined);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.dialModeButtonText,
                      { color: selected ? colors.accentForegroundOnFill : colors.textSecondary },
                    ]}
                  >
                    {mode === 'hour' ? 'Hour' : 'Minute'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ReminderTimeDial
            mode={reminderDialMode}
            hour={reminderHour}
            minute={reminderMinute}
            size={reminderDialSize}
            isDark={isDark}
            colors={colors}
            onChangeHour={setReminderHour}
            onChangeMinute={setReminderMinute}
          />

          <View style={styles.periodToggle}>
            {(['AM', 'PM'] as const).map((period) => {
              const selected = reminderPeriod === period;
              return (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    {
                      flex: 1,
                      backgroundColor: selected ? colors.accent : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      borderColor: selected ? colors.accent : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                  onPress={() => {
                    setReminderPeriod(period);
                    Haptics.selectionAsync().catch(() => undefined);
                  }}
                  activeOpacity={0.75}
                >
                  <Text allowFontScaling={false} style={[styles.periodText, { color: selected ? colors.accentForegroundOnFill : colors.textPrimary }]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={modalStyles.actions}>
          <TouchableOpacity
            style={modalStyles.cancelButton}
            onPress={() => setReminderTimeOpen(false)}
            activeOpacity={0.75}
          >
            <Text style={modalStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modalStyles.successButton}
            onPress={handleSaveReminderTime}
            activeOpacity={0.75}
          >
            <Text style={modalStyles.successButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </BaseModal>

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
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  rowLabel: {
    ...Typography.body,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowValue: {
    ...Typography.caption,
  },
  rowChevron: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  modalSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalLabel: {
    ...Typography.caption,
  },
  modalInput: {
    fontSize: 16,
    letterSpacing: 0.6,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
    minHeight: 48,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  splitInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  splitInput: {
    flex: 1,
  },
  reminderDialContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  reminderDialContentCompact: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  reminderTimePreview: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 1.2,
  },
  dialModeToggle: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: BorderRadius.md,
    padding: 4,
    gap: 4,
  },
  dialModeButton: {
    flex: 1,
    height: 38,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialModeButtonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  dial: {
    position: 'relative',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm,
  },
  dialMark: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialMarkText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  dialMarkTextCompact: {
    fontSize: 10,
  },
  dialKnob: {
    position: 'absolute',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dialCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialValue: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 1,
  },
  dialModeLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
  },
  periodToggle: {
    flexDirection: 'row',
    gap: Spacing.xs,
    width: '100%',
  },
  periodButton: {
    height: 42,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  periodText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  optionList: {
    gap: Spacing.sm,
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  loadingText: {
    ...Typography.caption,
  },
});
