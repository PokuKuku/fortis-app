import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { processPendingQueue, getPendingSyncCount, getPendingSyncSessions, fetchWorkoutHistory } from '@/src/services/workoutHistoryService';
import { useProgramsStore } from '@/src/store/programsStore';
import { processPendingStickyNotesQueue } from '@/src/services/stickyNotesService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useAIStore } from '@/src/store/aiStore';
import { useProgramProgressStore } from '@/src/store/programProgressStore';
import { useStartPresetStore } from '@/src/store/startPresetStore';
import { migrateGuestStorageToUser, clearUserScopedStorage } from '@/src/utils/scopedStorage';
import { invalidateCustomCache } from '@/src/services/exerciseService';
import { type AccentColorName } from '@/src/utils/accentColors';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import NetInfo from '@react-native-community/netinfo';

// Ensure web browser is dismissed after auth
WebBrowser.maybeCompleteAuthSession();

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_units: 'imperial' | 'metric';
  onboarding_completed: boolean;
  // Theme preferences (synced to cloud)
  theme_mode: 'system' | 'light' | 'dark';
  accent_color: AccentColorName | 'lime' | 'rose' | 'blue';
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isHydrating: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;

  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;

  // Profile methods
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  uploadAvatar: (
    uri: string,
    options?: { base64?: string | null; mimeType?: string | null }
  ) => Promise<{ error: Error | null }>;
  completeOnboarding: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrating, setIsHydrating] = useState(false);
  const hydrateRunRef = useRef(0);

  const isAuthenticated = !!session;
  const needsOnboarding = isAuthenticated && profile?.onboarding_completed === false;

  const hydrateUserData = useCallback(async () => {
    const runId = ++hydrateRunRef.current;
    setIsHydrating(true);

    try {
      const workoutStore = useWorkoutStore.getState();
      const aiStore = useAIStore.getState();
      const programProgressStore = useProgramProgressStore.getState();

      await Promise.all([
        workoutStore.loadActiveSession(),
        workoutStore.loadCompletedSessions(),
        workoutStore.loadRestTimerSettings(),
        workoutStore.loadStickyNotes(),
        workoutStore.loadWeightUnits(),
        workoutStore.loadBodyType(),
        programProgressStore.loadProgress(),
        aiStore.loadConversation(),
        aiStore.loadMutationPlan(),
      ]);
    } finally {
      if (runId === hydrateRunRef.current) {
        setIsHydrating(false);
      }
    }
  }, []);

  // Fetch profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.id !== userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: session.user.email || '',
              preferred_units: 'imperial',
              onboarding_completed: false,
            })
            .select()
            .single();

          if (createError) {
            if (createError.code === '23505') {
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
              if (existingProfile) {
                return existingProfile as Profile;
              }
            }
            console.warn('Error creating profile:', createError);
            return null;
          }
          return newProfile as Profile;
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user?.id, fetchProfile]);

  const appStateRef = useRef(AppState.currentState);

  const syncPendingWorkouts = useCallback(async () => {
    let pendingIds: string[] = [];
    try {
      const pendingCount = await getPendingSyncCount();
      if (pendingCount === 0) return;

      const pendingSessions = await getPendingSyncSessions();
      pendingIds = pendingSessions.map((session) => session.localId);
      if (pendingIds.length > 0) {
        useWorkoutStore.getState().markSessionsSyncing(pendingIds);
      }

      const result = await processPendingQueue();
      if (result.syncedLocalIds.length > 0) {
        useWorkoutStore.getState().markSessionsSynced(result.syncedLocalIds).catch(error => {
          console.warn('Failed to update synced workout sessions:', error);
        });
      }

    } catch (error) {
      console.warn('Failed to process pending workout sync queue:', error);
    } finally {
      if (pendingIds.length > 0) {
        useWorkoutStore.getState().clearSessionsSyncing(pendingIds);
      }
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        await migrateGuestStorageToUser(initialSession.user.id);
        await hydrateUserData();
        const profileData = await fetchProfile(initialSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    // Listen for auth changes
    // Avoid async callbacks here to prevent Supabase auth lock deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const userId = newSession.user.id;
        void (async () => {
          await migrateGuestStorageToUser(userId);
          if (event === 'SIGNED_IN') {
            await hydrateUserData();
          }
          const profileData = await fetchProfile(userId);
          setProfile(profileData);

          // Process any pending syncs when user signs in
          if (event === 'SIGNED_IN') {
            // Sync pending workout sessions
            syncPendingWorkouts();

            // Sync pending programs/templates
            useProgramsStore.getState().syncPendingPrograms().catch(error => {
              console.warn('Failed to process pending program sync queue:', error);
            });

            // Sync pending sticky notes
            processPendingStickyNotesQueue().catch(error => {
              console.warn('Failed to process pending sticky notes sync queue:', error);
            });

            // Refresh programs after sign-in to ensure server data is loaded.
            useProgramsStore.getState().fetchPrograms({ force: true }).catch(error => {
              console.warn('Failed to refresh programs after sign-in:', error);
            });

            // Restore ALL workout history from cloud to local cache
            // Users need full history for strength tracking/progress
            // Using high limit (10000) covers even 10+ years of daily workouts
            fetchWorkoutHistory(10000)
              .then(({ sessions }) => {
                if (sessions.length > 0) {
                  useWorkoutStore.getState().importCompletedSessions(sessions).catch(error => {
                    console.warn('Failed to import remote workout history:', error);
                  });
                }
              })
              .catch(error => {
                console.warn('Failed to fetch workout history on sign-in:', error);
              });
          }
        })();
      } else {
        setProfile(null);
        hydrateRunRef.current += 1;
        setIsHydrating(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, hydrateUserData, syncPendingWorkouts]);

  useEffect(() => {
    const handleAppStateChange = (nextState: string) => {
      appStateRef.current = nextState;
      if (nextState !== 'active' || !user) return;
      syncPendingWorkouts();
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [syncPendingWorkouts, user]);

  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      if (appStateRef.current !== 'active') return;
      syncPendingWorkouts();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [syncPendingWorkouts, user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected || !state.isInternetReachable) return;
      if (appStateRef.current !== 'active') return;
      syncPendingWorkouts();
    });

    return () => {
      unsubscribe();
    };
  }, [syncPendingWorkouts, user]);

  // Email sign in
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  // Email sign up
  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const isExpoGo = Constants.appOwnership === 'expo';
      let redirectTo = isExpoGo
        ? Linking.createURL('auth/callback')
        : makeRedirectUri({
            scheme: 'fortis',
            path: 'auth/callback',
          });

      if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(redirectTo)) {
        redirectTo = Linking.createURL('auth/callback');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  // Google sign in (Supabase handles OAuth state/CSRF internally)
  const signInWithGoogle = useCallback(async () => {
    try {
      const isExpoGo = Constants.appOwnership === 'expo';
      // For Expo Go, use Linking.createURL directly (useProxy was deprecated in SDK 50+)
      // For production builds, use the custom scheme
      let redirectTo = isExpoGo
        ? Linking.createURL('auth/callback')
        : makeRedirectUri({
            scheme: 'fortis',
            path: 'auth/callback',
          });

      if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(redirectTo)) {
        // Fallback for dev cases where localhost leaks into the redirect URI.
        redirectTo = Linking.createURL('auth/callback');
      }
      console.log('[Auth] OAuth redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account', // Force account selection on re-auth
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type === 'success') {
          const url = result.url;

          // Supabase validates OAuth state server-side.
          const fragmentParams = new URLSearchParams(url.split('#')[1] || '');

          // Extract tokens from URL and set session
          const accessToken = fragmentParams.get('access_token');
          const refreshToken = fragmentParams.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        } else {
          // User cancelled or error
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  // Apple sign in
  const signInWithApple = useCallback(async () => {
    try {
      if (Platform.OS !== 'ios') {
        return { error: new Error('Apple Sign-In is only available on iOS') };
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return { error: new Error('Apple Sign-In is not available on this device') };
      }

      const nonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        return { error: new Error('Missing identity token from Apple Sign-In') };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled, not an error
        return { error: null };
      }
      return { error: err as Error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    hydrateRunRef.current += 1;
    setIsHydrating(false);

    // Capture user ID before clearing state (needed for scoped storage cleanup)
    const currentUserId = user?.id;

    // Dismiss any lingering OAuth browser session
    // Wrapped in try-catch because this throws if no browser is open
    // (e.g., when user signed in via email/password or Apple ID)
    try {
      await WebBrowser.dismissBrowser();
    } catch {
      // No browser to dismiss, that's fine
    }

    // Try to sync any pending workouts before clearing local data
    // This is best-effort - if offline, pending data will be lost
    try {
      const pendingCount = await getPendingSyncCount();
      if (pendingCount > 0) {
        await processPendingQueue();
      }
    } catch (err) {
      console.warn('Failed to sync pending workouts before sign-out:', err);
    }

    // Clear user-scoped local storage to prevent data leakage between users
    if (currentUserId) {
      try {
        await clearUserScopedStorage(currentUserId);
      } catch (err) {
        console.warn('Failed to clear user-scoped storage:', err);
      }
    }

    // Reset all Zustand stores to clear in-memory user data
    // This prevents data leakage if another user signs in
    useWorkoutStore.getState().resetStore();
    useProgramsStore.getState().resetStore();
    useAIStore.getState().resetStore();
    useProgramProgressStore.getState().resetStore();
    useStartPresetStore.getState().resetStore();

    // Clear state immediately - UI updates right away
    setUser(null);
    setSession(null);
    setProfile(null);

    invalidateCustomCache();

    // Sign out from Supabase with global scope to clear all sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  }, [user?.id]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refresh profile after update
      await refreshProfile();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user?.id, refreshProfile]);

  // Upload avatar
  const uploadAvatar = useCallback(async (
    uri: string,
    options?: { base64?: string | null; mimeType?: string | null }
  ) => {
    if (!user?.id) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const resolveFileExtension = () => {
        const mimeType = options?.mimeType?.toLowerCase() || null;
        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'jpg';
        if (mimeType === 'image/png') return 'png';
        if (mimeType === 'image/webp') return 'webp';
        if (mimeType === 'image/heic') return 'heic';
        if (mimeType === 'image/heif') return 'heif';

        const uriMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
        if (uriMatch?.[1]) {
          return uriMatch[1].toLowerCase();
        }

        return 'jpg';
      };

      const resolveContentType = (fileExt: string) => {
        if (options?.mimeType) return options.mimeType;
        const lowerExt = fileExt.toLowerCase();
        if (lowerExt === 'png') return 'image/png';
        if (lowerExt === 'webp') return 'image/webp';
        if (lowerExt === 'heic') return 'image/heic';
        if (lowerExt === 'heif') return 'image/heif';
        return 'image/jpeg';
      };

      const fileExt = resolveFileExtension();
      const contentType = resolveContentType(fileExt);
      let uploadBody: Blob | Uint8Array;

      if (options?.base64) {
        uploadBody = Buffer.from(options.base64, 'base64');
      } else {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          uploadBody = blob;
        } catch {
          const fileBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          uploadBody = Buffer.from(fileBase64, 'base64');
        }
      }

      // Generate a unique filename
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, uploadBody, {
          cacheControl: '3600',
          upsert: true,
          contentType,
        });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        return { error: new Error(uploadError.message) };
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL (add cache buster)
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      return updateProfile({ avatar_url: avatarUrl });
    } catch (err) {
      console.error('Avatar upload error:', err);
      return { error: err as Error };
    }
  }, [user?.id, updateProfile]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    return updateProfile({ onboarding_completed: true });
  }, [updateProfile]);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    isLoading,
    isHydrating,
    isAuthenticated,
    needsOnboarding,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateProfile,
    uploadAvatar,
    completeOnboarding,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
