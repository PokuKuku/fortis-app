import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
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
import { WeeklyRecapModal } from '@/src/components/retention/WeeklyRecapModal';
import { useWorkoutSchedule } from '@/src/hooks/useWorkoutSchedule';
import { useWorkoutRetentionPreferences } from '@/src/hooks/useWorkoutRetentionPreferences';
import { WEEKDAY_LABELS } from '@/src/utils/workoutSchedule';
import { formatReminderTime, normalizeReminderTime, type WeeklyRecap } from '@/src/utils/workoutRetention';

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

export default function SettingsPreferencesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, profile, updateProfile } = useAuth();
  const {
    scheduleDays,
    isSaving: isSavingSchedule,
    saveScheduleDays,
  } = useWorkoutSchedule();
  const {
    reminderTime,
    setReminderTime,
  } = useWorkoutRetentionPreferences();
  const bodyType = useWorkoutStore((s) => s.bodyType);
  const setBodyType = useWorkoutStore((s) => s.setBodyType);
  const modalStyles = useModalStyles();

  const units = profile?.preferred_units === 'metric' ? 'metric' : 'imperial';
  const weightLabel = formatWeight(profile?.weight_kg, units);
  const heightLabel = formatHeight(profile?.height_cm, units);
  const experienceLabel = profile?.lifting_experience
    ? EXPERIENCE_LABELS[profile.lifting_experience as TrainingExperience]
    : '—';
  const goalLabel = profile?.fitness_goal
    ? GOAL_LABELS[profile.fitness_goal as FitnessGoal]
    : '—';
  const bodyTypeLabel = bodyType === 'male' ? 'Male' : 'Female';
  const scheduleLabel = scheduleDays.length > 0
    ? scheduleDays.map((day) => WEEKDAY_LABELS[day]).join(', ')
    : '—';
  const reminderTimeLabel = formatReminderTime(reminderTime);

  const [measurementsOpen, setMeasurementsOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reminderTimeOpen, setReminderTimeOpen] = useState(false);
  const [weeklyRecapPreviewOpen, setWeeklyRecapPreviewOpen] = useState(false);
  const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSavingExperience, setIsSavingExperience] = useState(false);

  const [heightCmInput, setHeightCmInput] = useState('');
  const [heightFeetInput, setHeightFeetInput] = useState('');
  const [heightInchesInput, setHeightInchesInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [reminderHourInput, setReminderHourInput] = useState('');
  const [reminderMinuteInput, setReminderMinuteInput] = useState('');
  const [reminderPeriod, setReminderPeriod] = useState<'AM' | 'PM'>('AM');
  const previewWeeklyRecap = useMemo<WeeklyRecap>(() => {
    const weekStart = new Date(2026, 4, 10);
    const weekEnd = new Date(2026, 4, 16, 23, 59, 59, 999);
    return {
      weekKey: '2026-05-10',
      weekStart,
      weekEnd,
      workoutsCompleted: 4,
      scheduledDays: 5,
      scheduledDaysHit: 4,
      scheduledDaysMissed: 1,
      streak: 4,
      totalSets: 72,
      totalVolume: 48250,
      volumeUnit: 'lbs',
      totalDurationSeconds: 15300,
      prCount: 3,
      prHighlights: [
        {
          exerciseName: 'Barbell Bench Press',
          reps: 8,
          weight: 225,
          weightUnit: 'lbs',
          date: new Date(2026, 4, 12),
          sessionName: 'Push Hypertrophy',
        },
        {
          exerciseName: 'Cable Crunch',
          reps: 15,
          weight: 80,
          weightUnit: 'lbs',
          date: new Date(2026, 4, 14),
          sessionName: 'Core S Tier',
        },
        {
          exerciseName: 'Romanian Deadlift',
          reps: 6,
          weight: 315,
          weightUnit: 'lbs',
          date: new Date(2026, 4, 15),
          sessionName: 'Lower Strength',
        },
      ],
      muscleScores: [
        { label: 'Chest', score: 18 },
        { label: 'Back', score: 13 },
        { label: 'Abs', score: 9 },
        { label: 'Quads', score: 6 },
        { label: 'Biceps', score: 3 },
      ],
      topMuscles: [
        { label: 'Chest', score: 18 },
        { label: 'Back', score: 13 },
        { label: 'Abs', score: 9 },
        { label: 'Quads', score: 6 },
      ],
      notableExercises: [
        { name: 'Barbell Bench Press', sets: 12, volume: 14600 },
        { name: 'Cable Crunch', sets: 10, volume: 6800 },
        { name: 'Romanian Deadlift', sets: 9, volume: 12400 },
      ],
    };
  }, []);

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
    setReminderHourInput(String(twelveHour));
    setReminderMinuteInput(String(reminderTime.minute).padStart(2, '0'));
    setReminderPeriod(isPm ? 'PM' : 'AM');
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

  const handleSaveSchedule = async (days: number[]) => {
    const { error } = await saveScheduleDays(days);
    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }
    setScheduleOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  const handleSaveReminderTime = async () => {
    const rawHour = Number(reminderHourInput);
    const rawMinute = Number(reminderMinuteInput);
    if (!Number.isFinite(rawHour) || rawHour < 1 || rawHour > 12) {
      Alert.alert('Invalid time', 'Enter an hour from 1 to 12.');
      return;
    }
    if (!Number.isFinite(rawMinute) || rawMinute < 0 || rawMinute > 59) {
      Alert.alert('Invalid time', 'Enter minutes from 0 to 59.');
      return;
    }
    const hour24 = reminderPeriod === 'PM'
      ? (rawHour % 12) + 12
      : rawHour % 12;
    await setReminderTime(normalizeReminderTime({ hour: hour24, minute: rawMinute }));
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
                label="Workout Schedule"
                value={scheduleLabel}
                onPress={() => setScheduleOpen(true)}
                showChevron
                colors={colors}
              />
              <View style={[styles.divider, dividerStyle]} />
              <PreferenceRow
                label="Reminder Time"
                value={reminderTimeLabel}
                onPress={() => setReminderTimeOpen(true)}
                showChevron
                colors={colors}
              />
              {__DEV__ ? (
                <>
                  <View style={[styles.divider, dividerStyle]} />
                  <PreferenceRow
                    label="Preview Weekly Recap"
                    value="Dev"
                    onPress={() => setWeeklyRecapPreviewOpen(true)}
                    showChevron
                    colors={colors}
                  />
                </>
              ) : null}
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
      >
        <View style={styles.timeInputRow}>
          <TextInput
            style={[
              styles.timeInput,
              {
                color: colors.textPrimary,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                borderWidth: 1,
              },
            ]}
            value={reminderHourInput}
            onChangeText={setReminderHourInput}
            keyboardType="number-pad"
            placeholder="8"
            placeholderTextColor={colors.textTertiary}
            maxLength={2}
            textAlign="center"
            textAlignVertical="center"
          />
          <Text style={[styles.timeSeparator, { color: colors.textPrimary }]}>:</Text>
          <TextInput
            style={[
              styles.timeInput,
              {
                color: colors.textPrimary,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                borderWidth: 1,
              },
            ]}
            value={reminderMinuteInput}
            onChangeText={setReminderMinuteInput}
            keyboardType="number-pad"
            placeholder="00"
            placeholderTextColor={colors.textTertiary}
            maxLength={2}
            textAlign="center"
            textAlignVertical="center"
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
                      backgroundColor: selected ? colors.accent : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      borderColor: selected ? colors.accent : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                  onPress={() => setReminderPeriod(period)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.periodText, { color: selected ? colors.white : colors.textPrimary }]}>
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

      {__DEV__ ? (
        <WeeklyRecapModal
          visible={weeklyRecapPreviewOpen}
          recap={previewWeeklyRecap}
          userName={profile?.full_name}
          onClose={() => setWeeklyRecapPreviewOpen(false)}
        />
      ) : null}
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
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  timeInput: {
    width: 68,
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 1,
  },
  timeSeparator: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 22,
    lineHeight: 26,
  },
  periodToggle: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  periodButton: {
    minWidth: 44,
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
