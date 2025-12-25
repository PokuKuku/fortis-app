import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

interface UserGoal {
  id: string;
  goal_name: string;
  description: string | null;
  priority: number;
  is_active: boolean;
  target_date: string | null;
}

interface BodyMetric {
  weight: number;
  unit: 'kg' | 'lb';
  recorded_at: string;
}

export default function GoalsScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [latestWeight, setLatestWeight] = useState<BodyMetric | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    name: '',
    description: '',
    priority: '1',
    isActive: true,
  });

  const unitLabel = profile?.preferred_units === 'metric' ? 'kg' : 'lb';

  const loadGoalsAndMetrics = async () => {
    if (!user || !isSupabaseConfigured()) return;
    setIsLoading(true);
    try {
      const { data: goalsData } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('is_active', { ascending: false })
        .order('priority', { ascending: true });

      const { data: weightData } = await supabase
        .from('user_body_metrics')
        .select('weight, unit, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1);

      setGoals((goalsData || []) as UserGoal[]);
      setLatestWeight((weightData?.[0] as BodyMetric) || null);
    } catch (error) {
      console.warn('Failed to load goals or metrics', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoalsAndMetrics();
  }, [user?.id]);

  const resetGoalForm = () => {
    setEditingGoalId(null);
    setGoalForm({
      name: '',
      description: '',
      priority: '1',
      isActive: true,
    });
  };

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

  const openEditGoal = (goal: UserGoal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      name: goal.goal_name,
      description: goal.description || '',
      priority: String(goal.priority ?? 1),
      isActive: goal.is_active,
    });
    setGoalModalVisible(true);
  };

  const handleSaveGoal = async () => {
    if (!user) return;
    if (!goalForm.name.trim()) {
      Alert.alert('Missing goal', 'Enter a goal name.');
      return;
    }

    const priority = parseInt(goalForm.priority, 10);
    const goalPayload = {
      user_id: user.id,
      goal_name: goalForm.name.trim(),
      description: goalForm.description.trim() || null,
      priority: Number.isNaN(priority) ? 1 : priority,
      is_active: goalForm.isActive,
    };

    setIsSavingGoal(true);
    try {
      if (editingGoalId) {
        const { error } = await supabase
          .from('user_goals')
          .update(goalPayload)
          .eq('id', editingGoalId)
          .eq('user_id', user.id);
        if (error) {
          Alert.alert('Update failed', error.message);
          return;
        }
      } else {
        const { error } = await supabase.from('user_goals').insert(goalPayload);
        if (error) {
          Alert.alert('Save failed', error.message);
          return;
        }
      }

      await loadGoalsAndMetrics();
      setGoalModalVisible(false);
      resetGoalForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleDeleteGoal = (goal: UserGoal) => {
    Alert.alert(
      'Delete Goal',
      `Delete "${goal.goal_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            const { error } = await supabase
              .from('user_goals')
              .delete()
              .eq('id', goal.id)
              .eq('user_id', user.id);
            if (error) {
              Alert.alert('Delete failed', error.message);
              return;
            }
            await loadGoalsAndMetrics();
          },
        },
      ]
    );
  };

  if (!isSupabaseConfigured()) {
    return (
      <View style={styles.container}>
        <StainlessSteelPattern />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeftIcon color={Colors.textPrimary} size={24} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Goals & Metrics</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Supabase not configured</Text>
            <Text style={styles.emptyText}>
              Connect Supabase to save goals and metrics.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeftIcon color={Colors.textPrimary} size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Goals & Metrics</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Body Weight</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>
                Latest: {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : 'No entry yet'}
              </Text>
              <View style={styles.inlineRow}>
                <TextInput
                  style={styles.weightInput}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder={`Weight (${unitLabel})`}
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSaveWeight}
                  disabled={isSavingWeight}
                >
                  {isSavingWeight ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                Used for AI personalization and progress analysis.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Goals</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  resetGoalForm();
                  setGoalModalVisible(true);
                }}
              >
                <PlusIcon color={Colors.success} size={16} strokeWidth={2} />
                <Text style={styles.addButtonText}>Add Goal</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={Colors.success} size="small" />
                <Text style={styles.loadingText}>Loading goals...</Text>
              </View>
            ) : goals.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.emptyText}>No goals yet. Add one to personalize the AI.</Text>
              </View>
            ) : (
              goals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalMeta}>
                      <Text style={styles.goalTitle}>{goal.goal_name}</Text>
                      <Text style={styles.goalSubtitle}>
                        Priority {goal.priority} • {goal.is_active ? 'Active' : 'Paused'}
                      </Text>
                    </View>
                    <View style={styles.goalActions}>
                      <TouchableOpacity onPress={() => openEditGoal(goal)}>
                        <PencilSquareIcon color={Colors.textSecondary} size={18} strokeWidth={2} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteGoal(goal)}>
                        <TrashIcon color={Colors.error} size={18} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {goal.description ? (
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Goal Modal */}
      <Modal transparent visible={goalModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              setGoalModalVisible(false);
              resetGoalForm();
            }}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingGoalId ? 'Edit Goal' : 'New Goal'}
            </Text>
            <Text style={styles.modalLabel}>Goal name</Text>
            <TextInput
              style={styles.modalInput}
              value={goalForm.name}
              onChangeText={(text) => setGoalForm((prev) => ({ ...prev, name: text }))}
              placeholder="e.g. Build strength baseline"
              placeholderTextColor={Colors.textTertiary}
            />
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              value={goalForm.description}
              onChangeText={(text) => setGoalForm((prev) => ({ ...prev, description: text }))}
              placeholder="Optional details or constraints"
              placeholderTextColor={Colors.textTertiary}
              multiline
            />
            <View style={styles.modalRow}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Priority</Text>
                <TextInput
                  style={styles.modalInput}
                  value={goalForm.priority}
                  onChangeText={(text) => setGoalForm((prev) => ({ ...prev, priority: text }))}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Active</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    goalForm.isActive ? styles.toggleOn : styles.toggleOff,
                  ]}
                  onPress={() =>
                    setGoalForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                  }
                >
                  <Text style={styles.toggleText}>
                    {goalForm.isActive ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setGoalModalVisible(false);
                  resetGoalForm();
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSaveGoal}
                disabled={isSavingGoal}
              >
                {isSavingGoal ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    color: Colors.textPrimary,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    ...Typography.label,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  weightInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addButtonText: {
    ...Typography.caption,
    color: Colors.success,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalMeta: {
    flex: 1,
    gap: Spacing.xs,
  },
  goalTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  goalSubtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  goalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  goalDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
    color: Colors.white,
  },
  secondaryButton: {
    minWidth: 80,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayHeavy,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  modalInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  modalTextarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalField: {
    flex: 1,
    gap: Spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  toggleButton: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
  },
  toggleOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  toggleText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
