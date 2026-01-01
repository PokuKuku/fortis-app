import { useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme, type ThemeMode, type AccentColorName } from '@/src/contexts/ThemeContext';
import { normalizeAccentColorName } from '@/src/utils/accentColors';

/**
 * Bridge component that syncs theme preferences between ThemeContext and Supabase.
 *
 * Must be rendered inside both AuthProvider and ThemeProvider.
 *
 * Behavior:
 * - On sign-in: Applies cloud preferences to local state (cloud wins)
 * - On theme change: Syncs to Supabase if authenticated
 * - On sign-out: Local cache is cleared via USER_SCOPED_STORAGE_KEYS
 */
export function ThemeAuthSync() {
  const { profile, isAuthenticated, updateProfile } = useAuth();
  const { mode, accentColor, setMode, setAccentColor, isLoading: isThemeLoading } = useTheme();

  // Track if we've applied cloud preferences for this profile
  const appliedProfileIdRef = useRef<string | null>(null);
  // Track if changes are from cloud sync (to avoid sync loops)
  const isApplyingCloudPrefsRef = useRef(false);
  // Track previous values to detect user-initiated changes
  const prevModeRef = useRef<ThemeMode>(mode);
  const prevAccentRef = useRef<AccentColorName>(accentColor);

  // Apply cloud preferences when profile loads
  useEffect(() => {
    // Wait for theme to finish loading from AsyncStorage
    if (isThemeLoading) return;

    // Skip if no profile or already applied for this profile
    if (!profile || appliedProfileIdRef.current === profile.id) return;

    // Mark that we're applying cloud prefs (prevents sync loop)
    isApplyingCloudPrefsRef.current = true;
    appliedProfileIdRef.current = profile.id;

    const applyCloudPrefs = async () => {
      const resolvedAccent = normalizeAccentColorName(profile.accent_color);

      try {
        // Apply cloud theme_mode if it exists and differs from local
        if (profile.theme_mode && profile.theme_mode !== mode) {
          await setMode(profile.theme_mode);
        }

        // Apply cloud accent_color if it exists and differs from local
        if (resolvedAccent && resolvedAccent !== accentColor) {
          await setAccentColor(resolvedAccent);
        }
      } finally {
        // Update refs to match cloud values (prevents immediate re-sync)
        prevModeRef.current = profile.theme_mode || mode;
        prevAccentRef.current = resolvedAccent || accentColor;
        isApplyingCloudPrefsRef.current = false;
      }
    };

    applyCloudPrefs();
  }, [profile, isThemeLoading, mode, accentColor, setMode, setAccentColor]);

  // Sync local changes to Supabase
  useEffect(() => {
    // Skip if not authenticated or applying cloud prefs
    if (!isAuthenticated || isApplyingCloudPrefsRef.current || isThemeLoading) return;

    // Check if mode changed (user-initiated)
    const modeChanged = mode !== prevModeRef.current;
    const accentChanged = accentColor !== prevAccentRef.current;

    // Update refs
    prevModeRef.current = mode;
    prevAccentRef.current = accentColor;

    // Sync to cloud if either changed
    if (modeChanged || accentChanged) {
      const syncToCloud = async () => {
        try {
          await updateProfile({
            theme_mode: mode,
            accent_color: accentColor,
          });
        } catch (error) {
          console.warn('Failed to sync theme preferences to cloud:', error);
        }
      };

      syncToCloud();
    }
  }, [mode, accentColor, isAuthenticated, updateProfile, isThemeLoading]);

  // Reset applied profile ID on sign-out
  useEffect(() => {
    if (!isAuthenticated) {
      appliedProfileIdRef.current = null;
    }
  }, [isAuthenticated]);

  // This component only syncs state, renders nothing
  return null;
}
