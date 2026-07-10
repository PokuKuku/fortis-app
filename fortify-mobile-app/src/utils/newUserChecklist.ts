import { DeviceEventEmitter } from 'react-native';
import { NEW_USER_CHECKLIST_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

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

export const loadNewUserChecklistState = async (
  userId?: string | null
): Promise<NewUserChecklistState> => {
  const raw = await getScopedItem(NEW_USER_CHECKLIST_KEY, userId);
  if (!raw) {
    return getDefaultNewUserChecklistState();
  }

  try {
    return normalizeNewUserChecklistState(JSON.parse(raw));
  } catch {
    return getDefaultNewUserChecklistState();
  }
};

export const persistNewUserChecklistState = async (
  state: NewUserChecklistState,
  userId?: string | null
): Promise<void> => {
  await setScopedItem(NEW_USER_CHECKLIST_KEY, JSON.stringify(normalizeNewUserChecklistState(state)), userId);
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
    await persistNewUserChecklistState(
      markNewUserChecklistTaskStatus(currentState, taskId, 'complete'),
      userId
    );
  }
  emitNewUserChecklistTaskCompleted(taskId);
};
