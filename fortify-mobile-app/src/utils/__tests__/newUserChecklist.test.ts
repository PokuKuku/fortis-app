import {
  NEW_USER_CHECKLIST_TASKS,
  NEW_USER_CHECKLIST_EVENT,
  completeNewUserChecklistTask,
  getDefaultNewUserChecklistState,
  getNewUserChecklistCompletedCount,
  isNewUserChecklistResolved,
  loadNewUserChecklistState,
  markNewUserChecklistTaskStatus,
  normalizeNewUserChecklistState,
  persistNewUserChecklistState,
} from '@/src/utils/newUserChecklist';
import { NEW_USER_CHECKLIST_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { DeviceEventEmitter } from 'react-native';

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn(),
  setScopedItem: jest.fn(),
}));

const mockGetScopedItem = getScopedItem as jest.MockedFunction<typeof getScopedItem>;
const mockSetScopedItem = setScopedItem as jest.MockedFunction<typeof setScopedItem>;

describe('newUserChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetScopedItem.mockResolvedValue(undefined);
  });

  it('defaults the first two tasks to complete', () => {
    const state = getDefaultNewUserChecklistState();

    expect(NEW_USER_CHECKLIST_TASKS).toHaveLength(6);
    expect(state.finish_in_app_tour).toBe('complete');
    expect(state.pick_app_theme).toBe('complete');
    expect(getNewUserChecklistCompletedCount(state)).toBe(2);
    expect(isNewUserChecklistResolved(state)).toBe(false);
  });

  it('normalizes missing and invalid task values', () => {
    const state = normalizeNewUserChecklistState({
      finish_in_app_tour: 'skipped',
      pick_app_theme: 'bad-status',
      ask_ai_for_workout: 'complete',
    });

    expect(state.finish_in_app_tour).toBe('skipped');
    expect(state.pick_app_theme).toBe('complete');
    expect(state.ask_ai_for_workout).toBe('complete');
    expect(state.make_workout_template_from_text).toBe('incomplete');
    expect(state.ask_fortify_insight).toBe('incomplete');
    expect(state.log_twenty_minute_workout).toBe('incomplete');
  });

  it('keeps skipped tasks out of the completed count but resolves visibility', () => {
    let state = getDefaultNewUserChecklistState();
    state = markNewUserChecklistTaskStatus(state, 'ask_ai_for_workout', 'skipped');
    state = markNewUserChecklistTaskStatus(state, 'make_workout_template_from_text', 'complete');
    state = markNewUserChecklistTaskStatus(state, 'ask_fortify_insight', 'skipped');
    state = markNewUserChecklistTaskStatus(state, 'log_twenty_minute_workout', 'skipped');

    expect(getNewUserChecklistCompletedCount(state)).toBe(3);
    expect(isNewUserChecklistResolved(state)).toBe(true);
  });

  it('loads persisted checklist state from scoped storage', async () => {
    mockGetScopedItem.mockResolvedValue(JSON.stringify({
      ask_ai_for_workout: 'complete',
    }));

    const state = await loadNewUserChecklistState('user-1');

    expect(mockGetScopedItem).toHaveBeenCalledWith(NEW_USER_CHECKLIST_KEY, 'user-1');
    expect(state.finish_in_app_tour).toBe('complete');
    expect(state.pick_app_theme).toBe('complete');
    expect(state.ask_ai_for_workout).toBe('complete');
  });

  it('persists normalized checklist state to scoped storage', async () => {
    const state = markNewUserChecklistTaskStatus(
      getDefaultNewUserChecklistState(),
      'ask_fortify_insight',
      'skipped'
    );

    await persistNewUserChecklistState(state, 'user-1');

    expect(mockSetScopedItem).toHaveBeenCalledWith(
      NEW_USER_CHECKLIST_KEY,
      JSON.stringify(state),
      'user-1'
    );
  });

  it('persists and emits completed tasks from feature screens', async () => {
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);
    mockGetScopedItem.mockResolvedValue(JSON.stringify({
      make_workout_template_from_text: 'incomplete',
    }));

    await completeNewUserChecklistTask('make_workout_template_from_text', 'user-1');

    const persistedState = JSON.parse(mockSetScopedItem.mock.calls[0][1]);
    expect(persistedState.make_workout_template_from_text).toBe('complete');
    expect(mockSetScopedItem.mock.calls[0][2]).toBe('user-1');
    expect(emitSpy).toHaveBeenCalledWith(
      NEW_USER_CHECKLIST_EVENT,
      'make_workout_template_from_text'
    );
  });
});
