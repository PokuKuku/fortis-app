/**
 * Accent Color Utilities
 *
 * Provides a curated palette of accent colors and utility functions
 * for generating color variants (overlays, borders, gradients).
 */

export type AccentColorName = 'green' | 'midnight' | 'purple' | 'teal' | 'orange' | 'pink' | 'amber' | 'copper' | 'indigo' | 'red' | 'slate' | 'cyan';

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
  midnight: {
    base: '#1e293b',
    light: '#334155',
    dark: '#0f172a',
    rgb: [30, 41, 59],
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
  copper: {
    base: '#b87333',
    light: '#d08c4e',
    dark: '#8a4e1f',
    rgb: [184, 115, 51],
  },
  indigo: {
    base: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    rgb: [99, 102, 241],
  },
  red: {
    base: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    rgb: [239, 68, 68],
  },
  slate: {
    base: '#cbd5e1',
    light: '#e2e8f0',
    dark: '#94a3b8',
    rgb: [203, 213, 225],
  },
  cyan: {
    base: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
    rgb: [14, 165, 233],
  },
};

/**
 * Display labels for the color picker UI
 */
export const ACCENT_COLOR_LABELS: Record<AccentColorName, string> = {
  green: 'Green',
  midnight: 'Midnight',
  purple: 'Purple',
  teal: 'Teal',
  orange: 'Orange',
  pink: 'Pink',
  amber: 'Amber',
  copper: 'Copper',
  indigo: 'Indigo',
  red: 'Red',
  slate: 'Frost',
  cyan: 'Cyan',
};

const ACCENT_COLOR_ALIASES: Record<string, AccentColorName> = {
  lime: 'midnight',
  rose: 'copper',
  blue: 'indigo',
};

export function normalizeAccentColorName(value: string | null | undefined): AccentColorName | null {
  if (!value) return null;
  const normalizedValue = value.toLowerCase();
  if (normalizedValue in ACCENT_COLORS) {
    return normalizedValue as AccentColorName;
  }
  return ACCENT_COLOR_ALIASES[normalizedValue] ?? null;
}

/**
 * Contrast color mapping - visually distinct from the primary accent.
 * Used for "active/set" states on buttons to differentiate from the default accent.
 */
export const ACCENT_CONTRAST_MAP: Record<AccentColorName, AccentColorName> = {
  green: 'copper',
  midnight: 'amber',
  purple: 'amber',
  teal: 'copper',
  orange: 'cyan',
  pink: 'teal',
  amber: 'purple',
  copper: 'teal',
  indigo: 'orange',
  red: 'teal',
  slate: 'amber',
  cyan: 'orange',
};

/**
 * Get the contrasting accent color for a given accent.
 */
export function getContrastAccent(colorName: AccentColorName): AccentColorName {
  return ACCENT_CONTRAST_MAP[colorName];
}

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
  const contrastColorName = ACCENT_CONTRAST_MAP[colorName];

  return {
    // Primary accent colors
    accent: palette.base,
    accentLight: palette.light,
    accentDark: palette.dark,

    // Button gradient
    accentGradient: getAccentGradient(colorName, isDark),

    // Contrast gradient for "active/set" states (e.g., Start button when configured)
    contrastGradient: getAccentGradient(contrastColorName, isDark),

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
