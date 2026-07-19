const mockProfile = {
  new_user_checklist_state: null as Record<string, unknown> | null,
};
const mockProfileUpdates: Array<Record<string, unknown>> = [];

jest.mock('@/src/lib/supabase', () => {
  return {
    isSupabaseConfigured: () => true,
    supabase: {
      auth: {
        getSession: jest.fn(async () => ({
          data: { session: { user: { id: 'user-1' } } },
        })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(async () => ({ data: { ...mockProfile }, error: null })),
          })),
        })),
        update: jest.fn((values: Record<string, unknown>) => {
          mockProfileUpdates.push(values);
          Object.assign(mockProfile, values);
          return {
            eq: jest.fn(async () => ({ error: null })),
          };
        }),
      })),
    },
  };
});

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn(),
  setScopedItem: jest.fn(),
}));

import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import {
  getDefaultNewUserChecklistState,
  isNewUserChecklistResolved,
  loadNewUserChecklistState,
  markNewUserChecklistTaskStatus,
  persistNewUserChecklistState,
} from '@/src/utils/newUserChecklist';

const mockGetScopedItem = getScopedItem as jest.MockedFunction<typeof getScopedItem>;
const mockSetScopedItem = setScopedItem as jest.MockedFunction<typeof setScopedItem>;

describe('newUserChecklist cloud persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfile.new_user_checklist_state = null;
    mockProfileUpdates.length = 0;
    mockGetScopedItem.mockResolvedValue(null);
    mockSetScopedItem.mockResolvedValue(undefined);
  });

  it('restores a resolved challenge after local storage is removed', async () => {
    mockProfile.new_user_checklist_state = {
      finish_in_app_tour: 'complete',
      pick_app_theme: 'complete',
      ask_ai_for_workout: 'skipped',
      make_workout_template_from_text: 'skipped',
      ask_fortify_insight: 'skipped',
      log_twenty_minute_workout: 'skipped',
    };

    const restored = await loadNewUserChecklistState('user-1');

    expect(isNewUserChecklistResolved(restored)).toBe(true);
    expect(mockSetScopedItem).toHaveBeenCalledWith(
      'new_user_checklist_v1',
      JSON.stringify(restored),
      'user-1'
    );
  });

  it('merges newer local progress into older cloud state', async () => {
    const cloudState = getDefaultNewUserChecklistState();
    const localState = markNewUserChecklistTaskStatus(
      cloudState,
      'ask_ai_for_workout',
      'complete'
    );
    mockProfile.new_user_checklist_state = cloudState;
    mockGetScopedItem.mockResolvedValue(JSON.stringify(localState));

    const restored = await loadNewUserChecklistState('user-1');

    expect(restored.ask_ai_for_workout).toBe('complete');
    expect(mockProfileUpdates.at(-1)?.new_user_checklist_state).toEqual(restored);
  });

  it('writes challenge changes to local and account storage', async () => {
    const state = markNewUserChecklistTaskStatus(
      getDefaultNewUserChecklistState(),
      'ask_fortify_insight',
      'skipped'
    );

    await persistNewUserChecklistState(state, 'user-1');

    expect(mockSetScopedItem).toHaveBeenCalled();
    expect(mockProfileUpdates.at(-1)?.new_user_checklist_state).toEqual(state);
  });
});
