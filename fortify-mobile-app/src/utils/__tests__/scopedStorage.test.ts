import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NEW_USER_CHECKLIST_KEY,
  PROGRAMS_KEY,
  SIGN_OUT_PRESERVED_STORAGE_KEYS,
} from '@/src/constants/storageKeys';
import { clearUserScopedStorage } from '@/src/utils/scopedStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/src/lib/supabase', () => ({
  isSupabaseConfigured: jest.fn(() => false),
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

const mockMultiRemove = AsyncStorage.multiRemove as jest.MockedFunction<
  typeof AsyncStorage.multiRemove
>;

describe('clearUserScopedStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preserves excluded account-scoped state while clearing other user data', async () => {
    expect(SIGN_OUT_PRESERVED_STORAGE_KEYS).toContain(NEW_USER_CHECKLIST_KEY);

    await clearUserScopedStorage('user-1', SIGN_OUT_PRESERVED_STORAGE_KEYS);

    const removedKeys = mockMultiRemove.mock.calls[0][0];
    expect(removedKeys).not.toContain(`${NEW_USER_CHECKLIST_KEY}:user-1`);
    expect(removedKeys).not.toContain(NEW_USER_CHECKLIST_KEY);
    expect(removedKeys).toContain(`${PROGRAMS_KEY}:user-1`);
    expect(removedKeys).toContain(PROGRAMS_KEY);
  });
});
