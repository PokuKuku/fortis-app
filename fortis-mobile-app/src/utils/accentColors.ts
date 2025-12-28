/**
 * Accent Color Utilities
 *
 * Provides a curated palette of accent colors and utility functions
 * for generating color variants (overlays, borders, gradients).
 */

export type AccentColorName = 'green' | 'blue' | 'purple' | 'teal' | 'orange' | 'pink' | 'amber' | 'rose';

export interface AccentColorPalette {
  /** Primary accent color */
  base: string;
  /** Lighter variant (for dark mode gradients) */
  light: string;
  /** Darker variant (for light mode gradients) */
  dark: string;
  /** RGB values for computing RGBA variants */
  rgb: [number, number, number];
}

/**
 * Curated accent color palettes that work well with both dark and light themes.
 * Each color is chosen to maintain good contrast and visual harmony.
 */
export const ACCENT_COLORS: Record<AccentColorName, AccentColorPalette> = {
  green: {
    base: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
    rgb: [34, 197, 94],
  },
  blue: {
    base: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    rgb: [59, 130, 246],
  },
  purple: {
    base: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
    rgb: [139, 92, 246],
  },
  teal: {
    base: '#14b8a6',
    light: '#2dd4bf',
    dark: '#0d9488',
    rgb: [20, 184, 166],
  },
  orange: {
    base: '#f97316',
    light: '#fb923c',
    dark: '#ea580c',
    rgb: [249, 115, 22],
  },
  pink: {
    base: '#ec4899',
    light: '#f472b6',
    dark: '#db2777',
    rgb: [236, 72, 153],
  },
  amber: {
    base: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    rgb: [245, 158, 11],
  },
  rose: {
    base: '#f43f5e',
    light: '#fb7185',
    dark: '#e11d48',
    rgb: [244, 63, 94],
  },
};

/**
 * Display labels for the color picker UI
 */
export const ACCENT_COLOR_LABELS: Record<AccentColorName, string> = {
  green: 'Green',
  blue: 'Blue',
  purple: 'Purple',
  teal: 'Teal',
  orange: 'Orange',
  pink: 'Pink',
  amber: 'Amber',
  rose: 'Rose',
};

/**
 * Get RGBA string for an accent color at a given opacity.
 * Used for overlays, backgrounds, and borders.
 */
export function getAccentRgba(colorName: AccentColorName, opacity: number): string {
  const { rgb } = ACCENT_COLORS[colorName];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
}

/**
 * Get button gradient colors for an accent color.
 * Dark mode: light → base (bright to slightly darker)
 * Light mode: base → dark (for better contrast on light backgrounds)
 */
export function getAccentGradient(colorName: AccentColorName, isDark: boolean): readonly [string, string] {
  const palette = ACCENT_COLORS[colorName];
  if (isDark) {
    return [palette.light, palette.base] as const;
  }
  return [palette.base, palette.dark] as const;
}

/**
 * Generate all accent-derived theme colors for a given accent color.
 * These values replace the hardcoded green values in the theme.
 */
export function generateAccentThemeColors(colorName: AccentColorName, isDark: boolean) {
  const palette = ACCENT_COLORS[colorName];

  return {
    // Primary accent colors
    accent: palette.base,
    accentLight: palette.light,
    accentDark: palette.dark,

    // Button gradient
    accentGradient: getAccentGradient(colorName, isDark),

    // Overlay variants (for backgrounds)
    accentOverlay: getAccentRgba(colorName, isDark ? 0.1 : 0.08),
    accentOverlayMedium: getAccentRgba(colorName, isDark ? 0.15 : 0.12),
    accentOverlayHeavy: getAccentRgba(colorName, isDark ? 0.2 : 0.15),

    // Border variants
    accentBorder: getAccentRgba(colorName, isDark ? 0.3 : 0.25),
    accentBorderLight: getAccentRgba(colorName, isDark ? 0.2 : 0.15),

    // Shadow (for buttons)
    accentShadow: getAccentRgba(colorName, 0.4),

    // Tab bar active
    tabActive: palette.base,
  } as const;
}

export type AccentThemeColors = ReturnType<typeof generateAccentThemeColors>;
