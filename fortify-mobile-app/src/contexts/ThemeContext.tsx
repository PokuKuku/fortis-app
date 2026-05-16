import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_MODE_KEY, ACCENT_COLOR_KEY } from '@/src/constants/storageKeys';
import {
  type AccentColorName,
  type AccentThemeColors,
  generateAccentThemeColors,
  normalizeAccentColorName,
  ACCENT_COLORS,
} from '@/src/utils/accentColors';

// Re-export for convenience
export type { AccentColorName } from '@/src/utils/accentColors';
export { ACCENT_COLORS, ACCENT_COLOR_LABELS } from '@/src/utils/accentColors';

// Theme mode: user preference (system follows device, or manual override)
export type ThemeMode = 'system' | 'light' | 'dark';

// Resolved theme: what's actually displayed
export type ResolvedTheme = 'light' | 'dark';

/**
 * Base semantic colors that remain consistent across themes
 */
export const BaseColors = {
  // Status colors (semantic - same in both themes)
  success: '#22c55e',
  successLight: '#4ade80',
  successDark: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#0ea5e9',

  // Chart colors (for analytics)
  chart1: '#6366f1',
  chart2: '#10b981',
  chart3: '#f59e0b',
  chart4: '#8b5cf6',
  chart5: '#ef4444',

  // RPE colors
  rpe: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  },

  // Muscle group colors
  muscle: {
    chest: '#ef4444',
    back: '#0ea5e9',
    shoulders: '#8b5cf6',
    arms: '#10b981',
    legs: '#f59e0b',
    core: '#ec4899',
  },

  // Constants
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

/**
 * Dark theme colors (current/original design)
 */
export const DarkTheme = {
  // Core
  background: '#24252A',
  foreground: '#fafafa',
  card: '#24252A',
  cardForeground: '#fafafa',
  popover: '#24252A',
  popoverForeground: '#fafafa',

  // Primary
  primary: '#fafafa',
  primaryForeground: '#1a1a1a',

  // Secondary
  secondary: '#2a2a2a',
  secondaryForeground: '#fafafa',

  // Muted
  muted: '#2a2a2a',
  mutedForeground: '#a3a3a3',

  // Accent
  accent: '#2a2a2a',
  accentForeground: '#fafafa',

  // Destructive
  destructive: '#dc2626',
  destructiveForeground: '#fafafa',

  // Border & Input
  border: '#2a2a2a',
  input: '#2a2a2a',
  inputBackground: '#1a1a1a',
  ring: '#525252',

  // Text hierarchy
  textPrimary: '#fafafa',
  textSecondary: '#c2c2c2',
  textTertiary: '#8a8a8a',
  textDisabled: '#3a3a3a',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(36, 37, 42, 0.8)',

  // Glass morphism (white glass on dark)
  glassBackground: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassFog: ['rgba(140,140,140,0.45)', 'rgba(100,100,100,0.38)', 'rgba(60,60,60,0.32)', 'rgba(20,20,20,0.25)'] as readonly string[],

  // Surface variations
  surfaceOverlay: 'rgba(255, 255, 255, 0.08)',
  surfaceElevated: 'rgba(255, 255, 255, 0.12)',

  // Border variations
  borderLight: 'rgba(255, 255, 255, 0.15)',
  borderMedium: 'rgba(255, 255, 255, 0.25)',

  // Status overlays
  successOverlay: 'rgba(34, 197, 94, 0.1)',
  successBorder: 'rgba(34, 197, 94, 0.3)',
  errorOverlay: 'rgba(239, 68, 68, 0.15)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',

  // Set type overlays
  warmupOverlay: 'rgba(234, 179, 8, 0.12)',
  dropsetOverlay: 'rgba(59, 130, 246, 0.12)',
  failureOverlay: 'rgba(239, 68, 68, 0.12)',
  warmupBorder: 'rgba(234, 179, 8, 0.3)',
  dropsetBorder: 'rgba(59, 130, 246, 0.3)',
  failureBorder: 'rgba(239, 68, 68, 0.3)',

  // Button gradients
  buttonGradient: ['#4ade80', '#22c55e'] as readonly string[],
  buttonFog: ['rgba(140,140,140,0.45)', 'rgba(100,100,100,0.38)', 'rgba(60,60,60,0.32)', 'rgba(20,20,20,0.25)'] as readonly string[],

  // Pattern (StainlessSteelPattern)
  patternBase: '#24252A',
  patternStroke: 'rgba(255, 255, 255, 0.03)',
  patternStrokeAccent: 'rgba(255, 255, 255, 0.05)',

  // Tab bar
  tabBarBackground: 'rgba(36, 37, 42, 0.92)',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',
  tabInactive: '#525252',
  tabActive: '#22c55e',

  // Include base colors
  ...BaseColors,
} as const;

/**
 * Light theme colors (Titanium Forge - warm industrial)
 */
export const LightTheme = {
  // Core (warm titanium, not clinical white)
  background: '#F7F6F3',
  foreground: '#1A1A1A',
  card: '#FFFFFF',
  cardForeground: '#1A1A1A',
  popover: '#FFFFFF',
  popoverForeground: '#1A1A1A',

  // Primary
  primary: '#1A1A1A',
  primaryForeground: '#fafafa',

  // Secondary
  secondary: '#F0F0F0',
  secondaryForeground: '#1A1A1A',

  // Muted
  muted: '#EFEDE8',
  mutedForeground: '#454545',

  // Accent
  accent: '#F0F0F0',
  accentForeground: '#1A1A1A',

  // Destructive
  destructive: '#dc2626',
  destructiveForeground: '#fafafa',

  // Border & Input
  border: '#E5E4E0',
  input: '#E5E4E0',
  inputBackground: '#FFFFFF',
  ring: '#a3a3a3',

  // Text hierarchy
  textPrimary: '#1A1A1A',
  textSecondary: '#454545',  // Darkened from #5C5C5C for better contrast
  textTertiary: '#6E6E6E',   // Darkened from #8A8A8A for better contrast
  textDisabled: '#BEBEBE',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  overlayHeavy: 'rgba(0, 0, 0, 0.6)',
  backdrop: 'rgba(0, 0, 0, 0.4)',

  // Glass morphism (dark glass on light - inverted)
  glassBackground: 'rgba(0, 0, 0, 0.04)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  glassFog: ['rgba(40,40,40,0.12)', 'rgba(60,60,60,0.08)', 'rgba(80,80,80,0.05)', 'rgba(120,120,120,0.02)'] as readonly string[],

  // Surface variations
  surfaceOverlay: 'rgba(0, 0, 0, 0.04)',
  surfaceElevated: 'rgba(255, 255, 255, 0.95)',

  // Border variations
  borderLight: 'rgba(0, 0, 0, 0.06)',
  borderMedium: 'rgba(0, 0, 0, 0.12)',

  // Status overlays
  successOverlay: 'rgba(34, 197, 94, 0.08)',
  successBorder: 'rgba(34, 197, 94, 0.25)',
  errorOverlay: 'rgba(239, 68, 68, 0.08)',
  errorBorder: 'rgba(239, 68, 68, 0.25)',

  // Set type overlays
  warmupOverlay: 'rgba(234, 179, 8, 0.10)',
  dropsetOverlay: 'rgba(59, 130, 246, 0.10)',
  failureOverlay: 'rgba(239, 68, 68, 0.10)',
  warmupBorder: 'rgba(234, 179, 8, 0.25)',
  dropsetBorder: 'rgba(59, 130, 246, 0.25)',
  failureBorder: 'rgba(239, 68, 68, 0.25)',

  // Button gradients (slightly darker for contrast on light)
  buttonGradient: ['#22c55e', '#16a34a'] as readonly string[],
  buttonFog: ['rgba(0,0,0,0.06)', 'rgba(0,0,0,0.03)', 'rgba(0,0,0,0.01)', 'transparent'] as readonly string[],

  // Pattern (StainlessSteelPattern - inverted)
  patternBase: '#F7F6F3',
  patternStroke: 'rgba(0, 0, 0, 0.03)',
  patternStrokeAccent: 'rgba(0, 0, 0, 0.05)',

  // Tab bar (frosted titanium)
  tabBarBackground: 'rgba(247, 246, 243, 0.92)',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
  tabInactive: '#8A8A8A',
  tabActive: '#22c55e',

  // Include base colors
  ...BaseColors,
} as const;

type WidenThemeValue<T> =
  T extends string ? string :
  T extends readonly string[] ? readonly string[] :
  T extends Record<string, string> ? Record<keyof T, string> :
  T;

/** Base theme colors without accent overrides */
type BaseThemeColors = {
  readonly [K in keyof typeof DarkTheme]: WidenThemeValue<(typeof DarkTheme)[K]>;
};

/** Full theme colors including accent-derived properties */
export type ThemeColors = BaseThemeColors & AccentThemeColors;

/**
 * Get theme colors based on resolved theme and accent color
 */
export const getThemeColors = (isDark: boolean, accentColor: AccentColorName = 'midnight'): ThemeColors => {
  const baseTheme = isDark ? DarkTheme : LightTheme;
  const accentColors = generateAccentThemeColors(accentColor, isDark);

  return {
    ...baseTheme,
    ...accentColors,
    // Override the legacy success* properties to match accent for components still using them
    // This provides backward compatibility while transitioning to accent* properties
    buttonGradient: accentColors.accentGradient,
    tabActive: accentColors.tabActive,
    successOverlay: accentColors.accentOverlay,
    successBorder: accentColors.accentBorder,
  };
};

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** User's theme preference (system, light, or dark) */
  mode: ThemeMode;
  /** The actual theme being displayed */
  resolvedTheme: ResolvedTheme;
  /** Active color palette (includes accent-derived colors) */
  colors: ThemeColors;
  /** Convenience boolean for dark mode checks */
  isDark: boolean;
  /** Whether theme is still loading from storage */
  isLoading: boolean;
  /** Update theme mode preference */
  setMode: (mode: ThemeMode) => Promise<void>;
  /** Current accent color name */
  accentColor: AccentColorName;
  /** Update accent color preference */
  setAccentColor: (color: AccentColorName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  forceTheme?: {
    resolvedTheme?: ResolvedTheme;
    accentColor?: AccentColorName;
  };
}

/**
 * Helper to resolve accent color from storage
 */
function resolveAccentColor(value: string | null): AccentColorName | null {
  return normalizeAccentColorName(value);
}

/**
 * Theme provider component
 */
export function ThemeProvider({ children, forceTheme }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [accentColor, setAccentColorState] = useState<AccentColorName>('midnight');
  const [isLoading, setIsLoading] = useState(true);

  // Resolve the actual theme based on mode and system preference
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (forceTheme?.resolvedTheme) {
      return forceTheme.resolvedTheme;
    }
    if (mode === 'system') {
      return systemColorScheme === 'light' ? 'light' : 'dark';
    }
    return mode;
  }, [forceTheme?.resolvedTheme, mode, systemColorScheme]);

  const effectiveAccentColor = forceTheme?.accentColor ?? accentColor;
  const isDark = resolvedTheme === 'dark';
  const effectiveMode = (forceTheme?.resolvedTheme ?? mode) as ThemeMode;

  // Compute colors with accent color applied
  const colors = useMemo(
    () => getThemeColors(isDark, effectiveAccentColor),
    [isDark, effectiveAccentColor]
  );

  // Load persisted theme preferences on mount
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const [storedMode, storedAccent] = await Promise.all([
          AsyncStorage.getItem(THEME_MODE_KEY),
          AsyncStorage.getItem(ACCENT_COLOR_KEY),
        ]);

        if (storedMode && (storedMode === 'system' || storedMode === 'light' || storedMode === 'dark')) {
          setModeState(storedMode as ThemeMode);
        }

        const resolvedAccent = resolveAccentColor(storedAccent);
        if (resolvedAccent) {
          setAccentColorState(resolvedAccent);
        }

      } catch (error) {
        console.warn('Failed to load theme preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreferences();
  }, []);

  // Update theme mode and persist
  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, newMode);
    } catch (error) {
      console.warn('Failed to save theme mode:', error);
    }
  }, []);

  // Update accent color and persist
  const setAccentColor = useCallback(async (newColor: AccentColorName) => {
    setAccentColorState(newColor);
    try {
      await AsyncStorage.setItem(ACCENT_COLOR_KEY, newColor);
    } catch (error) {
      console.warn('Failed to save accent color:', error);
    }
  }, []);

  const value: ThemeContextValue = useMemo(
    () => ({
      mode: effectiveMode,
      resolvedTheme,
      colors,
      isDark,
      isLoading,
      setMode,
      accentColor: effectiveAccentColor,
      setAccentColor,
    }),
    [
      effectiveMode,
      resolvedTheme,
      colors,
      isDark,
      isLoading,
      setMode,
      effectiveAccentColor,
      setAccentColor,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
