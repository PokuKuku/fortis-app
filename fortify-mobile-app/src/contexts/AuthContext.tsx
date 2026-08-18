import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, clearSupabaseAuthStorage } from '@/src/lib/supabase';
import { processPendingQueue, getPendingSyncCount, getPendingSyncSessions, fetchWorkoutHistory } from '@/src/services/workoutHistoryService';
import { clearCachedWorkoutHistory, setCachedWorkoutHistory } from '@/src/services/workoutHistoryCache';
import {
  flushProgramsPersistence,
  primeDefaultProgramPersistence,
  useProgramsStore,
} from '@/src/store/programsStore';
import { processPendingStickyNotesQueue } from '@/src/services/stickyNotesService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { mergeWorkoutSessions } from '@/src/utils/workoutHistory';
import { useAIStore } from '@/src/store/aiStore';
import { useProgramProgressStore } from '@/src/store/programProgressStore';
import { useStartPresetStore } from '@/src/store/startPresetStore';
import {
  migrateGuestStorageToUser,
  clearUserScopedStorage,
  getScopedItem,
  setScopedItem,
  setActiveScopedStorageUser,
} from '@/src/utils/scopedStorage';
import { invalidateCustomCache } from '@/src/services/exerciseService';
import { type AccentColorName } from '@/src/utils/accentColors';
import { AUTH_PROFILE_CACHE_KEY, SIGN_OUT_PRESERVED_STORAGE_KEYS } from '@/src/constants/storageKeys';
import type { WorkoutScheduleHistoryEntry } from '@/src/utils/workoutSchedule';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { isInvalidRefreshTokenError } from '@/src/utils/authErrors';

// Ensure web browser is dismissed after auth
WebBrowser.maybeCompleteAuthSession();

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  birth_date?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  lifting_experience?: 'none' | 'beginner' | 'intermediate' | 'advanced' | null;
  workouts_per_week?: number | null;
  workout_schedule_days?: number[] | null;
  workout_schedule_history?: WorkoutScheduleHistoryEntry[] | null;
  streak_pause_state?: Record<string, unknown> | null;
  training_environment?: 'gym' | 'home' | 'hybrid' | null;
  tried_other_apps?: 'consistent' | 'occasionally' | 'stopped' | 'never' | null;
  fitness_goal?: 'build_muscle' | 'general_health' | 'lose_fat' | 'improve_strength' | 'stay_consistent' | null;
  biggest_challenge?: 'consistency' | 'plateaus' | 'starting_out' | 'time' | null;
  workout_consistency?: 'none' | 'daily' | 'few_times_week' | 'once_or_less' | 'starting' | null;
  preferred_units: 'imperial' | 'metric';
  onboarding_completed: boolean;
  starter_content_initialized?: boolean | null;
  deleted_default_program_ids?: string[] | null;
  new_user_checklist_state?: Record<string, unknown> | null;
  default_start_type?: string | null;
  default_start_template_id?: string | null;
  default_start_program_id?: string | null;
  created_at?: string;
  has_seen_in_app_tour?: boolean | null;
  in_app_tour_completed_at?: string | null;
  in_app_tour_version?: number | null;
  // Theme preferences (synced to cloud)
  theme_mode: 'system' | 'light' | 'dark';
  accent_color: AccentColorName | 'lime' | 'rose' | 'blue';
}

const readCachedProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const rawProfile = await getScopedItem(AUTH_PROFILE_CACHE_KEY, userId);
    if (!rawProfile) return null;

    const cachedProfile = JSON.parse(rawProfile) as Profile;
    return cachedProfile?.id === userId ? cachedProfile : null;
  } catch {
    return null;
  }
};

const cacheProfile = async (profile: Profile): Promise<void> => {
  try {
    await setScopedItem(AUTH_PROFILE_CACHE_KEY, JSON.stringify(profile), profile.id);
  } catch (error) {
    console.warn('Failed to cache profile:', error);
  }
};

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  profileResolved: boolean;
  isLoading: boolean;
  isAuthResolved: boolean;
  isHydrating: boolean;
  isDeferredHydrationComplete: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  setAllowProfileCreation: (allow: boolean) => void;
  hydrateDeferredUserData: () => Promise<void>;
  syncPendingUserData: () => Promise<void>;

  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;

  // Profile methods
  updateProfile: (
    updates: Partial<Profile>,
    options?: { refresh?: boolean }
  ) => Promise<{ error: Error | null }>;
  uploadAvatar: (
    uri: string,
    options?: { base64?: string | null; mimeType?: string | null }
  ) => Promise<{ error: Error | null }>;
  completeOnboarding: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const isMissingWorkoutScheduleHistoryColumnError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { code?: string; message?: string };
  const message = maybeError.message ?? '';
  if (!message.includes('workout_schedule_history')) return false;
  return (
    maybeError.code === '42703' ||
    maybeError.code === 'PGRST204' ||
    message.toLowerCase().includes('schema cache') ||
    message.toLowerCase().includes('column')
  );
};

const omitWorkoutScheduleHistory = (updates: Partial<Profile>): Partial<Profile> => {
  const { workout_schedule_history: _workoutScheduleHistory, ...fallbackUpdates } = updates;
  return fallbackUpdates;
};

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
  const FORCE_DEV_SIGN_OUT_ON_LAUNCH = false;
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileResolved, setProfileResolved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isDeferredHydrationComplete, setIsDeferredHydrationComplete] = useState(false);
  const hydrateRunRef = useRef(0);
  const deferredHydrationPromiseRef = useRef<Promise<void> | null>(null);
  const [allowProfileCreation, setAllowProfileCreation] = useState(false);

  const isAuthenticated = !!session;
  const needsOnboarding = isAuthenticated && profile?.onboarding_completed === false;

  useEffect(() => {
    hydrateRunRef.current += 1;
    deferredHydrationPromiseRef.current = null;
    setIsHydrating(false);
    setIsDeferredHydrationComplete(false);
  }, [user?.id]);

  const loadLocalUserData = useCallback(async () => {
    const workoutStore = useWorkoutStore.getState();
    const aiStore = useAIStore.getState();

    await Promise.all([
      workoutStore.loadActiveSession(),
      workoutStore.loadCompletedSessions(),
      workoutStore.loadRestTimerSettings(),
      workoutStore.loadStickyNotes(),
      workoutStore.loadWeightUnits(),
      workoutStore.loadBodyType(),
      workoutStore.loadStreakPauseState(),
      aiStore.loadConversation(),
    ]);
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
        // Profile doesn't exist
        if (error.code === 'PGRST116') {
          if (!allowProfileCreation) {
            return null;
          }

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: session.user.email || '',
              preferred_units: 'imperial',
              accent_color: 'midnight',
              theme_mode: 'light',
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
  }, [allowProfileCreation]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setProfileResolved(true);
      if (profileData) {
        void cacheProfile(profileData);
      }
    }
  }, [user?.id, fetchProfile]);

  const workoutSyncInFlightRef = useRef<Promise<void> | null>(null);
  const programSyncInFlightRef = useRef<Promise<void> | null>(null);

  const syncPendingWorkouts = useCallback(async () => {
    if (workoutSyncInFlightRef.current) {
      return workoutSyncInFlightRef.current;
    }

    const run = async () => {
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
    };

    const request = run().finally(() => {
      workoutSyncInFlightRef.current = null;
    });
    workoutSyncInFlightRef.current = request;
    return request;
  }, []);

  const syncPendingPrograms = useCallback(async () => {
    if (programSyncInFlightRef.current) {
      return programSyncInFlightRef.current;
    }

    const request = useProgramsStore.getState().syncPendingPrograms()
      .catch((error) => {
        console.warn('Failed to process pending program sync queue:', error);
      })
      .finally(() => {
        programSyncInFlightRef.current = null;
      });
    programSyncInFlightRef.current = request;
    return request;
  }, []);

  const syncPendingUserData = useCallback(async () => {
    await Promise.allSettled([
      syncPendingWorkouts(),
      syncPendingPrograms(),
    ]);
  }, [syncPendingPrograms, syncPendingWorkouts]);

  const hydrateDeferredUserData = useCallback(async () => {
    if (!user?.id || !profileResolved) return;
    if (isDeferredHydrationComplete) return;
    if (deferredHydrationPromiseRef.current) {
      return deferredHydrationPromiseRef.current;
    }

    const expectedUserId = user.id;
    const runId = ++hydrateRunRef.current;
    setIsHydrating(true);

    const hydration = (async () => {
      await migrateGuestStorageToUser(expectedUserId);
      await Promise.allSettled([
        loadLocalUserData(),
        useProgramsStore.getState().loadLocalPrograms(),
        useStartPresetStore.getState().loadPreset(profile),
      ]);

      await Promise.allSettled([
        syncPendingUserData(),
        processPendingStickyNotesQueue(),
      ]);

      await Promise.allSettled([
        useProgramsStore.getState().fetchPrograms({ force: true }),
        fetchWorkoutHistory(10000).then(async ({ sessions, error }) => {
          if (error) return;
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.user || currentSession.user.id !== expectedUserId) return;

          const localSessions = useWorkoutStore.getState().completedSessions;
          const mergedSessions = mergeWorkoutSessions(sessions, localSessions);
          setCachedWorkoutHistory(expectedUserId, mergedSessions);
          if (sessions.length > 0) {
            await useWorkoutStore.getState().replaceCompletedSessions(mergedSessions);
          }
        }),
      ]);
    })()
      .catch((error) => {
        console.warn('Failed to hydrate deferred app data:', error);
      })
      .finally(() => {
        if (runId === hydrateRunRef.current) {
          setIsHydrating(false);
          setIsDeferredHydrationComplete(true);
        }
        if (deferredHydrationPromiseRef.current === hydration) {
          deferredHydrationPromiseRef.current = null;
        }
      });

    deferredHydrationPromiseRef.current = hydration;
    return hydration;
  }, [
    isDeferredHydrationComplete,
    loadLocalUserData,
    profile,
    profileResolved,
    syncPendingUserData,
    user?.id,
  ]);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      setIsAuthResolved(true);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      let sessionToUse = initialSession;

      // In dev builds we want a clean start so onboarding/auth flows always run.
      if (FORCE_DEV_SIGN_OUT_ON_LAUNCH && initialSession?.user) {
        console.log('[Auth] Dev: clearing persisted session on launch.');

        try {
          await clearUserScopedStorage(initialSession.user.id);
        } catch (error) {
          console.warn('[Auth] Dev: failed to clear user-scoped storage:', error);
        }

        useWorkoutStore.getState().resetStore();
        useProgramsStore.getState().resetStore();
        useAIStore.getState().resetStore?.();
        useProgramProgressStore.getState().resetStore();
        useStartPresetStore.getState().resetStore();
        invalidateCustomCache();

        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (error) {
          console.warn('[Auth] Dev: failed to sign out persisted session:', error);
        }

        sessionToUse = null;
      }

      setSession(sessionToUse);
      setUser(sessionToUse?.user ?? null);
      setActiveScopedStorageUser(sessionToUse?.user?.id ?? null);
      setIsAuthResolved(true);

      if (sessionToUse?.user) {
        const userId = sessionToUse.user.id;
        const cachedProfilePromise = readCachedProfile(userId);
        const freshProfilePromise = fetchProfile(userId);

        const cachedProfile = await cachedProfilePromise;
        if (cachedProfile) {
          setProfile(cachedProfile);
          setProfileResolved(true);
          setIsLoading(false);
          primeDefaultProgramPersistence(userId, cachedProfile);
        }

        const profileData = await freshProfilePromise;
        primeDefaultProgramPersistence(userId, profileData ?? cachedProfile);
        setProfile(profileData ?? cachedProfile);
        setProfileResolved(true);
        if (profileData) {
          void cacheProfile(profileData);
        }
        setIsLoading(false);
      } else {
        setProfile(null);
        setProfileResolved(false);
      }

      setIsLoading(false);
    }).catch((error) => {
      if (isInvalidRefreshTokenError(error)) {
        clearSupabaseAuthStorage().catch(() => undefined);
      }
      setActiveScopedStorageUser(null);
      primeDefaultProgramPersistence(null);
      setIsLoading(false);
      setIsAuthResolved(true);
    });

    // Listen for auth changes
    // Avoid async callbacks here to prevent Supabase auth lock deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setActiveScopedStorageUser(newSession?.user?.id ?? null);

      if (newSession?.user) {
        const userId = newSession.user.id;
        void (async () => {
          const profileData = await fetchProfile(userId);
          primeDefaultProgramPersistence(userId, profileData);
          setProfile(profileData);
          setProfileResolved(true);
          if (profileData) {
            void cacheProfile(profileData);
          }
        })();
      } else {
        const lastUserId = user?.id;
        setProfile(null);
        setProfileResolved(false);
        if (lastUserId) {
          clearCachedWorkoutHistory(lastUserId);
        }
        hydrateRunRef.current += 1;
        deferredHydrationPromiseRef.current = null;
        setIsHydrating(false);
        setIsDeferredHydrationComplete(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [FORCE_DEV_SIGN_OUT_ON_LAUNCH, fetchProfile]);

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
    console.log('[Auth] signOut invoked');
    if (user?.id) {
      clearCachedWorkoutHistory(user.id);
    }
    hydrateRunRef.current += 1;
    setIsHydrating(false);
    await flushProgramsPersistence();

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
        // Preserve account-scoped state that must survive signing out and back in.
        await clearUserScopedStorage(currentUserId, SIGN_OUT_PRESERVED_STORAGE_KEYS);
      } catch (err) {
        console.warn('Failed to clear user-scoped storage:', err);
      }
    }
    try {
      await clearUserScopedStorage(null);
    } catch (err) {
      console.warn('Failed to clear guest-scoped storage:', err);
    }

    // Reset all Zustand stores to clear in-memory user data
    // This prevents data leakage if another user signs in
    useWorkoutStore.getState().resetStore();
    useProgramsStore.getState().resetStore();
    const aiStore = useAIStore.getState();
    if (typeof aiStore.resetStore === 'function') {
      aiStore.resetStore();
    } else {
      aiStore.clearConversation?.();
      useAIStore.setState({
        conversation: null,
        isSendingMessage: false,
        error: null,
        lastFailedMessage: null,
        rateLimitStatus: null,
      });
    }
    useProgramProgressStore.getState().resetStore();
    useStartPresetStore.getState().resetStore();

    // Clear state immediately - UI updates right away
    setUser(null);
    setSession(null);
    setActiveScopedStorageUser(null);
    primeDefaultProgramPersistence(null);
    setProfile(null);
    setProfileResolved(false);

    invalidateCustomCache();

    // Sign out from Supabase with global scope to clear all sessions
    try {
      await supabase.auth.signOut({ scope: 'global' });
      const { data: { session: postSignOutSession } } = await supabase.auth.getSession();
      if (postSignOutSession) {
        console.warn('[Auth] Sign-out did not clear local session; retrying with local scope.');
        await supabase.auth.signOut({ scope: 'local' });
      } else {
        console.log('[Auth] Sign-out cleared local session.');
      }
      await clearSupabaseAuthStorage();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  }, [user?.id]);

  // Update profile
  const updateProfile = useCallback(async (
    updates: Partial<Profile>,
    options?: { refresh?: boolean }
  ) => {
    if (!user?.id) {
      return { error: new Error('Not authenticated') };
    }

    try {
      let attemptedHistoryFallback = false;
      let updatesToSave = updates;
      let { data, error } = await supabase
        .from('profiles')
        .update(updatesToSave)
        .eq('id', user.id)
        .select('id')
        .maybeSingle();

      if (error && isMissingWorkoutScheduleHistoryColumnError(error)) {
        attemptedHistoryFallback = true;
        updatesToSave = omitWorkoutScheduleHistory(updates);
        const retry = await supabase
          .from('profiles')
          .update(updatesToSave)
          .eq('id', user.id)
          .select('id')
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        return { error: new Error(error.message) };
      }

      if (!data) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email ?? '',
            ...updatesToSave,
            preferred_units: updatesToSave.preferred_units ?? 'imperial',
            accent_color: updatesToSave.accent_color ?? 'midnight',
          }, { onConflict: 'id' });

        if (upsertError && isMissingWorkoutScheduleHistoryColumnError(upsertError) && !attemptedHistoryFallback) {
          const fallbackUpdates = omitWorkoutScheduleHistory(updatesToSave);
          const { error: retryUpsertError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email ?? '',
              ...fallbackUpdates,
              preferred_units: fallbackUpdates.preferred_units ?? 'imperial',
              accent_color: fallbackUpdates.accent_color ?? 'midnight',
            }, { onConflict: 'id' });

          if (retryUpsertError) {
            return { error: new Error(retryUpsertError.message) };
          }
        } else if (upsertError) {
          return { error: new Error(upsertError.message) };
        }
      }

      if (options?.refresh === false) {
        // Latency-sensitive background writes can update the local profile
        // optimistically instead of paying for a second network round trip.
        setProfile((current) => {
          if (!current) return current;
          const next = { ...current, ...updatesToSave };
          void cacheProfile(next);
          return next;
        });
      } else {
        await refreshProfile();
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [refreshProfile, user?.email, user?.id]);

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
            encoding: 'base64',
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
    profileResolved,
    isLoading,
    isAuthResolved,
    isHydrating,
    isDeferredHydrationComplete,
    isAuthenticated,
    needsOnboarding,
    setAllowProfileCreation,
    hydrateDeferredUserData,
    syncPendingUserData,
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
