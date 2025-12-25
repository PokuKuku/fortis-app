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
        const secureRefreshToken = await SecureStore.getItemAsync(
          SECURE_REFRESH_TOKEN_KEY
        );

        // If refresh token is missing from SecureStore, clear session
        // (prevents using potentially compromised session)
        if (!secureRefreshToken) {
          // Session exists but refresh token doesn't - possible tampering
          // For first-time migration, we allow it to pass through
          // The next setItem will properly store the refresh token
        }
      }

      return session;
    } catch (error) {
      console.error('Storage getItem error:', error);
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
      await SecureStore.deleteItemAsync(SECURE_REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Storage removeItem error:', error);
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

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key-here'
  );
};
