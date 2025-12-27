/**
 * Fortis Design System - Colors
 * Supports light and dark themes with glass morphism aesthetics
 *
 * Usage:
 * - For theme-aware components: import { useTheme } from '@/src/contexts/ThemeContext'
 *   const { colors } = useTheme();
 *
 * - For backward compatibility: import { Colors } from '@/constants/Colors'
 *   (defaults to dark theme)
 */

import { DarkTheme, LightTheme, BaseColors, type ThemeColors } from '@/src/contexts/ThemeContext';

// Re-export theme palettes for direct access
export { DarkTheme, LightTheme, BaseColors };
export type { ThemeColors };

/**
 * Default Colors export - backward compatible with existing code
 * Points to DarkTheme for compatibility during migration
 *
 * For theme-aware code, use:
 *   const { colors } = useTheme();
 */
export const Colors = {
  // Base colors (dark theme defaults for backward compatibility)
  background: DarkTheme.background,
  foreground: DarkTheme.foreground,

  // UI Colors
  card: DarkTheme.card,
  cardForeground: DarkTheme.cardForeground,
  popover: DarkTheme.popover,
  popoverForeground: DarkTheme.popoverForeground,

  // Primary
  primary: DarkTheme.primary,
  primaryForeground: DarkTheme.primaryForeground,

  // Secondary
  secondary: DarkTheme.secondary,
  secondaryForeground: DarkTheme.secondaryForeground,

  // Muted
  muted: DarkTheme.muted,
  mutedForeground: DarkTheme.mutedForeground,

  // Accent
  accent: DarkTheme.accent,
  accentForeground: DarkTheme.accentForeground,

  // Destructive
  destructive: DarkTheme.destructive,
  destructiveForeground: DarkTheme.destructiveForeground,

  // Border & Input
  border: DarkTheme.border,
  input: DarkTheme.input,
  inputBackground: DarkTheme.inputBackground,
  ring: DarkTheme.ring,

  // Chart colors
  chart1: BaseColors.chart1,
  chart2: BaseColors.chart2,
  chart3: BaseColors.chart3,
  chart4: BaseColors.chart4,
  chart5: BaseColors.chart5,

  // Status colors
  success: BaseColors.success,
  warning: BaseColors.warning,
  error: BaseColors.error,
  info: BaseColors.info,

  // Text hierarchy
  textPrimary: DarkTheme.textPrimary,
  textSecondary: DarkTheme.textSecondary,
  textTertiary: DarkTheme.textTertiary,
  textDisabled: DarkTheme.textDisabled,

  // Semantic colors for workout app
  rpe: BaseColors.rpe,
  muscle: BaseColors.muscle,

  // Special effects
  overlay: DarkTheme.overlay,
  overlayLight: DarkTheme.overlayLight,
  overlayHeavy: DarkTheme.overlayHeavy,
  backdrop: DarkTheme.backdrop,

  // Surface variations (glass effect)
  surfaceOverlay: DarkTheme.surfaceOverlay,
  surfaceElevated: DarkTheme.surfaceElevated,

  // Border variations
  borderLight: DarkTheme.borderLight,
  borderMedium: DarkTheme.borderMedium,

  // Success state overlays
  successOverlay: DarkTheme.successOverlay,
  successBorder: DarkTheme.successBorder,

  // Error state overlays
  errorOverlay: DarkTheme.errorOverlay,
  errorBorder: DarkTheme.errorBorder,

  // Set type overlays (industrial color coding)
  warmupOverlay: DarkTheme.warmupOverlay,
  dropsetOverlay: DarkTheme.dropsetOverlay,
  failureOverlay: DarkTheme.failureOverlay,

  // Transparent variants
  transparent: BaseColors.transparent,
  white: BaseColors.white,
  black: BaseColors.black,
} as const;

export type ColorName = keyof typeof Colors;
