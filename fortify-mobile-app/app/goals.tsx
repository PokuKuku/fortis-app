import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Sizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { OnboardingOptionCard } from '@/src/components/onboarding/OnboardingOptionCard';
import { SectionSkeleton } from '@/src/components/ui/TabPageSkeleton';
import { ActionProgressLabel } from '@/src/components/ui/ActionProgressLabel';

type FitnessGoal = 'build_muscle' | 'general_health' | 'improve_strength' | 'stay_consistent';

type GoalOption = {
  value: FitnessGoal;
  title: string;
  description: string;
};

const GOAL_OPTIONS: GoalOption[] = [
  { value: 'build_muscle', title: 'Build muscle', description: 'Prioritize hypertrophy and consistent volume.' },
  { value: 'general_health', title: 'General health', description: 'Balance strength, mobility, and consistency.' },
  { value: 'improve_strength', title: 'Improve strength', description: 'Focus on progressive overload and heavy sets.' },
  { value: 'stay_consistent', title: 'Stay consistent', description: 'Build routines that are easy to sustain.' },
];

interface BodyMetric {
  weight: number;
  unit: 'kg' | 'lb';
  recorded_at: string;
}

export default function GoalsScreen() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const [latestWeight, setLatestWeight] = useState<BodyMetric | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [isLoadingWeight, setIsLoadingWeight] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  const unitLabel = profile?.preferred_units === 'metric' ? 'kg' : 'lb';

  useEffect(() => {
    setSelectedGoal((profile?.fitness_goal as FitnessGoal) ?? null);
  }, [profile?.fitness_goal]);

  const loadMetrics = async () => {
    if (!user || !isSupabaseConfigured()) return;
    setIsLoadingWeight(true);
    try {
      const { data: weightData } = await supabase
        .from('user_body_metrics')
        .select('weight, unit, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1);

      setLatestWeight((weightData?.[0] as BodyMetric) || null);
    } catch (error) {
      console.warn('Failed to load body metrics', error);
    } finally {
      setIsLoadingWeight(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [user?.id]);

  const handleSaveWeight = async () => {
    if (!user) return;
    const weight = parseFloat(weightInput);
    if (Number.isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid weight', 'Enter a valid weight value.');
      return;
    }

    setIsSavingWeight(true);
    try {
      const { error } = await supabase.from('user_body_metrics').insert({
        user_id: user.id,
        weight,
        unit: unitLabel,
      });

      if (error) {
        Alert.alert('Save failed', error.message);
        return;
      }

      setLatestWeight({ weight, unit: unitLabel, recorded_at: new Date().toISOString() });
      setWeightInput('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } finally {
      setIsSavingWeight(false);
    }
  };

  const handleSelectGoal = async (goal: FitnessGoal) => {
    if (!user) return;
    setSelectedGoal(goal);
    setIsSavingGoal(true);
    const { error } = await updateProfile({ fitness_goal: goal });
    setIsSavingGoal(false);
    if (error) {
      Alert.alert('Update failed', error.message);
      setSelectedGoal((profile?.fitness_goal as FitnessGoal) ?? null);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    headerBorder: { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
    headerTitle: { color: colors.textPrimary },
    sectionHeader: { color: colors.textSecondary },
    card: {
      backgroundColor: colors.glassBackground,
      borderColor: colors.glassBorder,
    },
    cardLabel: { color: colors.textPrimary },
    weightInput: {
      color: colors.textPrimary,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    helperText: { color: colors.textTertiary },
    emptyText: { color: colors.textSecondary },
    loadingText: { color: colors.textSecondary },
    primaryButton: { backgroundColor: colors.accent },
    goalHint: { color: colors.textTertiary },
  };

  if (!isSupabaseConfigured()) {
    return (
      <View style={[styles.container, themedStyles.container]}>
        <StainlessSteelPattern />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={[styles.header, themedStyles.headerBorder]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeftIcon color={colors.textPrimary} size={24} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, themedStyles.headerTitle]}>Goals & Metrics</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Supabase not configured</Text>
            <Text style={[styles.emptyText, themedStyles.emptyText]}>
              Connect Supabase to save goals and metrics.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, themedStyles.headerBorder]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeftIcon color={colors.textPrimary} size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themedStyles.headerTitle]}>Goals & Metrics</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, themedStyles.sectionHeader]}>Body Weight</Text>
            <View style={[styles.card, themedStyles.card]}>
              <Text style={[styles.cardLabel, themedStyles.cardLabel]}>
                Latest: {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : 'No entry yet'}
              </Text>
              <View style={styles.inlineRow}>
                <TextInput
                  style={[styles.weightInput, themedStyles.weightInput]}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder={`Weight (${unitLabel})`}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={[styles.primaryButton, themedStyles.primaryButton]}
                  onPress={handleSaveWeight}
                  disabled={isSavingWeight}
                >
                  {isSavingWeight ? (
                    <ActionProgressLabel
                      label="Saving…"
                      color={colors.accentForegroundOnFill}
                      style={styles.primaryButtonText}
                    />
                  ) : (
                    <Text style={[styles.primaryButtonText, { color: colors.accentForegroundOnFill }]}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
              {isLoadingWeight && (
                <SectionSkeleton height={92} rows={2} />
              )}
              <Text style={[styles.helperText, themedStyles.helperText]}>
                Used for AI personalization and progress analysis.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionHeader, themedStyles.sectionHeader]}>Primary Goal</Text>
            <View style={styles.goalOptions}>
              {GOAL_OPTIONS.map((option) => (
                <OnboardingOptionCard
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  selected={selectedGoal === option.value}
                  onSelect={() => handleSelectGoal(option.value)}
                />
              ))}
            </View>
            {isSavingGoal ? (
              <View style={styles.loadingState}>
                <ActionProgressLabel
                  label="Saving goal…"
                  color={colors.accent}
                  style={styles.loadingText}
                />
              </View>
            ) : (
              <Text style={[styles.goalHint, themedStyles.goalHint]}>
                {selectedGoal
                  ? 'This goal personalizes your AI recommendations.'
                  : 'Pick a goal to personalize the AI.'}
              </Text>
            )}
          </View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h4,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    ...Typography.label,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardLabel: {
    ...Typography.body,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  weightInput: {
    flex: 1,
    fontSize: 15,
    letterSpacing: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  helperText: {
    ...Typography.caption,
  },
  goalOptions: {
    gap: Spacing.sm,
  },
  goalHint: {
    ...Typography.caption,
  },
  primaryButton: {
    minWidth: 80,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...Typography.button,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h4,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
  },
});
