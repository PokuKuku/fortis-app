/**
 * Fortis Design System - Typography
 * System fonts optimized for iOS and Android
 */

import { Platform, TextStyle } from 'react-native';
import { FontSizes, FontWeights, LineHeights } from './Sizes';
import { Colors } from './Colors';

// System font stack
export const FontFamily = {
  // iOS uses SF Pro, Android uses Roboto
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

// Typography styles matching the prototype
export const Typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['4xl'] * LineHeights.tight,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['3xl'] * LineHeights.tight,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes['2xl'] * LineHeights.normal,
    color: Colors.textPrimary,
  },
  h4: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.xl * LineHeights.normal,
    color: Colors.textPrimary,
  },
  h5: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.lg * LineHeights.normal,
    color: Colors.textPrimary,
  },
  h6: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.base * LineHeights.normal,
    color: Colors.textPrimary,
  },

  // Body text
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.base * LineHeights.normal,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.lg * LineHeights.normal,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.sm * LineHeights.normal,
    color: Colors.textSecondary,
  },

  // Labels
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.base * LineHeights.normal,
    color: Colors.textPrimary,
  },
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.sm * LineHeights.normal,
    color: Colors.textSecondary,
  },

  // Caption
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.xs * LineHeights.normal,
    color: Colors.textSecondary,
  },

  // Button text
  button: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.base * LineHeights.normal,
    color: Colors.primary,
  },
  buttonSmall: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.sm * LineHeights.normal,
    color: Colors.primary,
  },
  buttonLarge: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.lg * LineHeights.normal,
    color: Colors.primary,
  },

  // Numbers (for workout stats)
  number: {
    fontFamily: FontFamily.bold,
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['3xl'] * LineHeights.tight,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  numberLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSizes['5xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['5xl'] * LineHeights.tight,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },

  // Monospace (for times, codes)
  mono: {
    fontFamily: FontFamily.mono,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.sm * LineHeights.normal,
    color: Colors.textPrimary,
  },

  // Link
  link: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.base * LineHeights.normal,
    color: Colors.info,
    textDecorationLine: 'underline',
  },
} as const;

export type TypographyVariant = keyof typeof Typography;
