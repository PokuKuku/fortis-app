import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { processPendingQueue } from '@/src/services/workoutHistoryService';
import { useProgramsStore } from '@/src/store/programsStore';
import { processPendingStickyNotesQueue } from '@/src/services/stickyNotesService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useAIStore } from '@/src/store/aiStore';
import { useStartPresetStore } from '@/src/store/startPresetStore';
import { clearUserScopedStorage, migrateGuestStorageToUser } from '@/src/utils/scopedStorage';
import { invalidateCustomCache } from '@/src/services/exerciseService';
import { resetProgramServiceCache } from '@/src/services/programService';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

// Ensure web browser is dismissed after auth
WebBrowser.maybeCompleteAuthSession();

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_units: 'imperial' | 'metric';
  onboarding_completed: boolean;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
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
  uploadAvatar: (uri: string) => Promise<{ error: Error | null }>;
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

  const isAuthenticated = !!session;
  const needsOnboarding = isAuthenticated && profile?.onboarding_completed === false;

  // Fetch profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured()) return null;

    try {
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
              email: user?.email || '',
              preferred_units: 'imperial',
              onboarding_completed: false,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
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
  }, [user?.email]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user?.id, fetchProfile]);

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
        const profileData = await fetchProfile(initialSession.user.id);
        setProfile(profileData);
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
          const profileData = await fetchProfile(userId);
          setProfile(profileData);

          // Process any pending syncs when user signs in
          if (event === 'SIGNED_IN') {
            // Sync pending workout sessions
            processPendingQueue().catch(error => {
              console.warn('Failed to process pending workout sync queue:', error);
            });

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
          }
        })();
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
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
      let redirectTo = isExpoGo
        ? makeRedirectUri({
            path: 'auth/callback',
            useProxy: true,
          })
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
    const currentUserId = user?.id ?? null;

    // Dismiss any lingering OAuth browser session
    // Wrapped in try-catch because this throws if no browser is open
    // (e.g., when user signed in via email/password or Apple ID)
    try {
      await WebBrowser.dismissBrowser();
    } catch {
      // No browser to dismiss, that's fine
    }

    // Clear state immediately - UI updates right away
    setUser(null);
    setSession(null);
    setProfile(null);

    useWorkoutStore.getState().resetStore();
    useProgramsStore.getState().resetStore();
    useAIStore.getState().resetStore();
    useStartPresetStore.getState().resetStore();
    invalidateCustomCache();
    resetProgramServiceCache();

    try {
      if (currentUserId) {
        await clearUserScopedStorage(currentUserId);
      }
      await clearUserScopedStorage(null);
    } catch (error) {
      console.warn('Failed to clear local storage on sign out:', error);
    }

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
  const uploadAvatar = useCallback(async (uri: string) => {
    if (!user?.id) {
      return { error: new Error('Not authenticated') };
    }

    try {
      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate a unique filename
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: blob.type || 'image/jpeg',
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
