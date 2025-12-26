import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { USER_SCOPED_STORAGE_KEYS } from '@/src/constants/storageKeys';

const GUEST_USER_KEY = 'guest';

export const getUserScopedKeySync = (baseKey: string, userId?: string | null): string => {
  return `${baseKey}:${userId ?? GUEST_USER_KEY}`;
};

export const getUserScopedKey = async (baseKey: string): Promise<string> => {
  if (!isSupabaseConfigured()) {
    return getUserScopedKeySync(baseKey, null);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return getUserScopedKeySync(baseKey, user?.id ?? null);
  } catch {
    return getUserScopedKeySync(baseKey, null);
  }
};

export const getScopedItem = async (baseKey: string): Promise<string | null> => {
  const scopedKey = await getUserScopedKey(baseKey);
  const entries = await AsyncStorage.multiGet([scopedKey, baseKey]);
  const scopedValue = entries[0]?.[1] ?? null;
  const legacyValue = entries[1]?.[1] ?? null;

  if (!scopedValue && legacyValue) {
    await AsyncStorage.setItem(scopedKey, legacyValue);
  }

  if (legacyValue) {
    await AsyncStorage.removeItem(baseKey);
  }

  return scopedValue ?? legacyValue;
};

export const setScopedItem = async (baseKey: string, value: string): Promise<void> => {
  const scopedKey = await getUserScopedKey(baseKey);
  await AsyncStorage.setItem(scopedKey, value);
};

export const removeScopedItem = async (baseKey: string): Promise<void> => {
  const scopedKey = await getUserScopedKey(baseKey);
  await AsyncStorage.multiRemove([scopedKey, baseKey]);
};

export const clearUserScopedStorage = async (
  userId?: string | null,
  excludeKeys: readonly string[] = []
): Promise<void> => {
  const excluded = new Set(excludeKeys);
  const keysToClear = USER_SCOPED_STORAGE_KEYS.filter((key) => !excluded.has(key));
  const scopedKeys = keysToClear.map((key) =>
    getUserScopedKeySync(key, userId ?? null)
  );
  await AsyncStorage.multiRemove([...scopedKeys, ...keysToClear]);
};

export const migrateGuestStorageToUser = async (userId: string): Promise<void> => {
  const guestKeys = USER_SCOPED_STORAGE_KEYS.map((key) =>
    getUserScopedKeySync(key, null)
  );
  const userKeys = USER_SCOPED_STORAGE_KEYS.map((key) =>
    getUserScopedKeySync(key, userId)
  );

  const guestEntries = await AsyncStorage.multiGet(guestKeys);
  const userEntries = await AsyncStorage.multiGet(userKeys);
  const userMap = new Map(userEntries);
  const updates: [string, string][] = [];

  guestEntries.forEach(([guestKey, guestValue], index) => {
    if (!guestValue) {
      return;
    }
    const userKey = userKeys[index];
    const existingValue = userMap.get(userKey);
    if (!existingValue) {
      updates.push([userKey, guestValue]);
    }
  });

  if (updates.length > 0) {
    await AsyncStorage.multiSet(updates);
  }

  await AsyncStorage.multiRemove(guestKeys);
};
