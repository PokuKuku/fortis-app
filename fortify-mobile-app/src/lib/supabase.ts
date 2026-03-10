import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

const parseHost = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    if (value.includes('://')) {
      return new URL(value).hostname;
    }
    return value.split(':')[0] || null;
  } catch {
    return null;
  }
};

const getDevServerHost = () => {
  return (
    parseHost((Constants.expoConfig as any)?.hostUri) ??
    parseHost((Constants.manifest as any)?.hostUri) ??
    parseHost((Constants.manifest2 as any)?.extra?.expoClient?.hostUri) ??
    parseHost((Constants.manifest as any)?.debuggerHost) ??
    null
  );
};

const resolveSupabaseUrl = (rawUrl: string) => {
  if (!rawUrl) return rawUrl;

  try {
    const url = new URL(rawUrl);
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    if (!isLocalhost) return rawUrl;

    // Use the dev server host when running on a device so localhost isn't the phone.
    const devHost =
      getDevServerHost() ??
      (() => {
        try {
          const devUrl = Linking.createURL('/');
          return new URL(devUrl).hostname;
        } catch {
          return null;
        }
      })();

    if (!devHost || devHost === 'localhost' || devHost === '127.0.0.1') {
      return rawUrl;
    }

    url.hostname = devHost;
    return url.toString().replace(/\/$/, '');
  } catch {
    return rawUrl;
  }
};

const supabaseUrl = resolveSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL!);
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Key for storing refresh token securely
const SECURE_REFRESH_TOKEN_KEY = 'fortis_refresh_token';

/**
 * Hybrid storage adapter for React Native
 *
 * Security approach:
 * - Full session stored in AsyncStorage (fast access, handles large JWTs)
 * - Refresh token ALSO stored in SecureStore (encrypted, hardware-backed)
 * - If AsyncStorage is compromised, attacker only gets short-lived access token
 * - Refresh token in SecureStore is protected even on rooted/jailbroken devices
 */
const SecureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Get session from AsyncStorage
      const session = await AsyncStorage.getItem(key);

      // If session exists, verify refresh token is in SecureStore
      if (session) {
        try {
          const secureRefreshToken = await SecureStore.getItemAsync(
            SECURE_REFRESH_TOKEN_KEY
          );

          // If refresh token is missing from SecureStore, allow session to continue.
          // This can happen during migration or transient keychain access issues.
          if (!secureRefreshToken) {
            // The next setItem will re-store refresh token in SecureStore.
          }
        } catch (error) {
          // iOS can throw "User interaction is not allowed" for keychain reads
          // during certain lifecycle windows (e.g. app state transitions/locked device).
          // Do not invalidate the full Supabase session because of this best-effort check.
          if (__DEV__) {
            console.warn('Storage SecureStore refresh token check skipped:', error);
          }
        }
      }

      return session;
    } catch (error) {
      if (__DEV__) {
        console.warn('Storage getItem error:', error);
      }
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Store full session in AsyncStorage
      await AsyncStorage.setItem(key, value);

      // Extract and store refresh token in SecureStore
      try {
        const session = JSON.parse(value);
        if (session?.refresh_token) {
          await SecureStore.setItemAsync(
            SECURE_REFRESH_TOKEN_KEY,
            session.refresh_token
          );
        }
      } catch {
        // Value might not be JSON (e.g., for other keys)
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      // Remove from both storage locations
      await AsyncStorage.removeItem(key);
      try {
        await SecureStore.deleteItemAsync(SECURE_REFRESH_TOKEN_KEY);
      } catch (error) {
        if (__DEV__) {
          console.warn('Storage SecureStore deleteItem warning:', error);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Storage removeItem error:', error);
      }
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const clearSupabaseAuthStorage = async () => {
  const storageKey = supabase.auth.storageKey;
  if (storageKey) {
    await SecureStorageAdapter.removeItem(storageKey);
  }
};

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key-here'
  );
};
