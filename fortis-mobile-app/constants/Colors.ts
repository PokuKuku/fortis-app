/**
 * Fortis Design System - Colors
 * Extracted from Figma prototypes
 * Dark theme optimized for mobile
 */

export const Colors = {
  // Base colors (dark theme)
  background: '#0a0a0a', // oklch(0.145 0 0) - Almost black
  foreground: '#fafafa', // oklch(0.985 0 0) - Almost white

  // UI Colors
  card: '#0a0a0a',
  cardForeground: '#fafafa',

  popover: '#0a0a0a',
  popoverForeground: '#fafafa',

  // Primary (main brand color)
  primary: '#fafafa', // White for dark theme
  primaryForeground: '#1a1a1a',

  // Secondary
  secondary: '#2a2a2a', // oklch(0.269 0 0) - Dark gray
  secondaryForeground: '#fafafa',

  // Muted
  muted: '#2a2a2a',
  mutedForeground: '#a3a3a3', // oklch(0.708 0 0) - Medium gray

  // Accent (highlights, focus states)
  accent: '#2a2a2a',
  accentForeground: '#fafafa',

  // Destructive (errors, delete actions)
  destructive: '#dc2626', // oklch(0.396 0.141 25.723) - Red
  destructiveForeground: '#fafafa',

  // Border & Input
  border: '#2a2a2a',
  input: '#2a2a2a',
  inputBackground: '#1a1a1a',
  ring: '#525252', // oklch(0.439 0 0) - Medium-dark gray

  // Chart colors (for analytics)
  chart1: '#6366f1', // oklch(0.488 0.243 264.376) - Indigo
  chart2: '#10b981', // oklch(0.696 0.17 162.48) - Emerald
  chart3: '#f59e0b', // oklch(0.769 0.188 70.08) - Amber
  chart4: '#8b5cf6', // oklch(0.627 0.265 303.9) - Violet
  chart5: '#ef4444', // oklch(0.645 0.246 16.439) - Red

  // Status colors
  success: '#22c55e', // Green-600 (matches main page)
  warning: '#f59e0b', // Amber
  error: '#dc2626', // Red
  info: '#0ea5e9', // Sky blue

  // Text hierarchy
  textPrimary: '#fafafa',
  textSecondary: '#a3a3a3',
  textTertiary: '#525252',
  textDisabled: '#3a3a3a',

  // Semantic colors for workout app
  rpe: {
    low: '#10b981', // RPE 1-3 (green)
    medium: '#f59e0b', // RPE 4-7 (amber)
    high: '#ef4444', // RPE 8-10 (red)
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

  // Special effects
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.7)',

  backdrop: 'rgba(10, 10, 10, 0.8)',

  // Transparent variants
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorName = keyof typeof Colors;
