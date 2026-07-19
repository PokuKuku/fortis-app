import { DeviceEventEmitter } from 'react-native';
import { NEW_USER_CHECKLIST_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

export const NEW_USER_CHECKLIST_EVENT = 'new-user-checklist-task-completed' as const;

export const NEW_USER_CHECKLIST_EXAMPLE_WORKOUT_TEXT = [
  'Bench Press - 3 sets x 8 reps @ 135 lb, 90 sec rest',
  'Lat Pulldown - 3 sets x 10 reps @ 100 lb, 90 sec rest',
  'Dumbbell Shoulder Press - 2 sets x 12 reps @ 35 lb, 60 sec rest',
].join('\n');

export const NEW_USER_CHECKLIST_TASKS = [
  {
    id: 'finish_in_app_tour',
    title: 'Finish in-app tour',
    defaultStatus: 'complete',
    description: '',
    detail:
      'This is checked by default because new users reach this checklist after the starter tour path.',
  },
  {
    id: 'pick_app_theme',
    title: 'Pick your app theme',
    defaultStatus: 'complete',
    description: 'Choose the app appearance that feels best for your training.',
    detail:
      'This is checked by default because theme selection is handled during the first app setup.',
  },
  {
    id: 'ask_ai_for_workout',
    title: 'Ask AI for a workout',
    defaultStatus: 'incomplete',
    description: 'Use AI Voice or Chat to generate a workout.',
    detail:
      'Open the AI coach and ask for a workout using voice or chat. Example: "Make me a push workout." This checks off when the AI returns a workout card.',
  },
  {
    id: 'make_workout_template_from_text',
    title: 'Make a workout template from text',
    defaultStatus: 'incomplete',
    description: 'Paste workout notes and turn them into a saved template.',
    detail:
      `Copy this example workout. Then open the workout creation modal, choose Add Exercises by Text, and paste it in to import the workout template:\n\n${NEW_USER_CHECKLIST_EXAMPLE_WORKOUT_TEXT}\n\nSave the result as a workout template to complete this task.`,
  },
  {
    id: 'ask_fortify_insight',
    title: 'Get an insight from Ask Fortify',
    defaultStatus: 'incomplete',
    description: 'Use Ask Fortify button from a training insight.',
    detail:
      'Open a training insight and tap the Ask Fortify button to get an explanation and next steps.',
  },
  {
    id: 'log_twenty_minute_workout',
    title: 'Log a 20 minute workout',
    defaultStatus: 'incomplete',
    description: 'Complete and save a workout lasting at least 20 minutes.',
    detail:
      'Start a workout, train for at least 20 minutes, and finish the workout to complete this task.',
  },
] as const;

export type NewUserChecklistTask = typeof NEW_USER_CHECKLIST_TASKS[number];
export type NewUserChecklistTaskId = NewUserChecklistTask['id'];
export type NewUserChecklistTaskStatus = 'complete' | 'incomplete' | 'skipped';
export type NewUserChecklistState = Record<NewUserChecklistTaskId, NewUserChecklistTaskStatus>;

const TASK_IDS = new Set<string>(NEW_USER_CHECKLIST_TASKS.map((task) => task.id));

export const isNewUserChecklistTaskId = (value: unknown): value is NewUserChecklistTaskId => {
  return typeof value === 'string' && TASK_IDS.has(value);
};

export const getDefaultNewUserChecklistState = (): NewUserChecklistState => {
  return NEW_USER_CHECKLIST_TASKS.reduce((state, task) => {
    state[task.id] = task.defaultStatus;
    return state;
  }, {} as NewUserChecklistState);
};

export const normalizeNewUserChecklistState = (value: unknown): NewUserChecklistState => {
  const defaults = getDefaultNewUserChecklistState();
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaults;
  }

  const input = value as Partial<Record<NewUserChecklistTaskId, unknown>>;
  return NEW_USER_CHECKLIST_TASKS.reduce((state, task) => {
    const status = input[task.id];
    state[task.id] =
      status === 'complete' || status === 'incomplete' || status === 'skipped'
        ? status
        : defaults[task.id];
    return state;
  }, {} as NewUserChecklistState);
};

const CHECKLIST_STATUS_PRIORITY: Record<NewUserChecklistTaskStatus, number> = {
  incomplete: 0,
  skipped: 1,
  complete: 2,
};

const mergeNewUserChecklistStates = (
  localState: NewUserChecklistState,
  cloudState: NewUserChecklistState
): NewUserChecklistState => NEW_USER_CHECKLIST_TASKS.reduce((state, task) => {
  const localStatus = localState[task.id];
  const cloudStatus = cloudState[task.id];
  state[task.id] = CHECKLIST_STATUS_PRIORITY[localStatus] >= CHECKLIST_STATUS_PRIORITY[cloudStatus]
    ? localStatus
    : cloudStatus;
  return state;
}, {} as NewUserChecklistState);

export const loadNewUserChecklistState = async (
  userId?: string | null
): Promise<NewUserChecklistState> => {
  const raw = await getScopedItem(NEW_USER_CHECKLIST_KEY, userId);
  let localState: NewUserChecklistState | null = null;

  if (raw) {
    try {
      localState = normalizeNewUserChecklistState(JSON.parse(raw));
    } catch {
      localState = null;
    }
  }

  const accountUserId = await resolveChecklistUserId(userId);
  if (accountUserId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('new_user_checklist_state')
        .eq('id', accountUserId)
        .maybeSingle();

      if (error) throw error;

      if (data?.new_user_checklist_state) {
        const cloudState = normalizeNewUserChecklistState(data.new_user_checklist_state);
        const mergedState = localState
          ? mergeNewUserChecklistStates(localState, cloudState)
          : cloudState;
        await setScopedItem(NEW_USER_CHECKLIST_KEY, JSON.stringify(mergedState), accountUserId);
        if (JSON.stringify(mergedState) !== JSON.stringify(cloudState)) {
          await persistChecklistStateToCloud(mergedState, accountUserId);
        }
        return mergedState;
      }

      if (localState) {
        await persistChecklistStateToCloud(localState, accountUserId);
      }
    } catch (error) {
      console.warn('Failed to load cloud Fortify Challenge state:', error);
    }
  }

  return localState ?? getDefaultNewUserChecklistState();
};

export const persistNewUserChecklistState = async (
  state: NewUserChecklistState,
  userId?: string | null
): Promise<void> => {
  const normalizedState = normalizeNewUserChecklistState(state);
  await setScopedItem(NEW_USER_CHECKLIST_KEY, JSON.stringify(normalizedState), userId);

  const accountUserId = await resolveChecklistUserId(userId);
  if (accountUserId) {
    await persistChecklistStateToCloud(normalizedState, accountUserId);
  }
};

const resolveChecklistUserId = async (userId?: string | null): Promise<string | null> => {
  if (userId !== undefined) return userId;
  if (!isSupabaseConfigured()) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
};

const persistChecklistStateToCloud = async (
  state: NewUserChecklistState,
  userId: string
): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from('profiles')
    .update({ new_user_checklist_state: state })
    .eq('id', userId);

  if (error) throw error;
};

export const markNewUserChecklistTaskStatus = (
  state: NewUserChecklistState,
  taskId: NewUserChecklistTaskId,
  status: NewUserChecklistTaskStatus
): NewUserChecklistState => ({
  ...state,
  [taskId]: status,
});

export const getNewUserChecklistCompletedCount = (state: NewUserChecklistState): number => {
  return NEW_USER_CHECKLIST_TASKS.filter((task) => state[task.id] === 'complete').length;
};

export const isNewUserChecklistResolved = (state: NewUserChecklistState): boolean => {
  return NEW_USER_CHECKLIST_TASKS.every((task) => state[task.id] !== 'incomplete');
};

export const emitNewUserChecklistTaskCompleted = (taskId: NewUserChecklistTaskId): void => {
  DeviceEventEmitter.emit(NEW_USER_CHECKLIST_EVENT, taskId);
};

export const completeNewUserChecklistTask = async (
  taskId: NewUserChecklistTaskId,
  userId?: string | null
): Promise<void> => {
  const currentState = await loadNewUserChecklistState(userId);
  if (currentState[taskId] !== 'complete') {
    try {
      await persistNewUserChecklistState(
        markNewUserChecklistTaskStatus(currentState, taskId, 'complete'),
        userId
      );
    } catch (error) {
      // Local persistence has already completed. Keep the UI responsive and
      // merge this progress into cloud state on the next successful load.
      console.warn('Failed to sync completed Fortify Challenge task:', error);
    }
  }
  emitNewUserChecklistTaskCompleted(taskId);
};
