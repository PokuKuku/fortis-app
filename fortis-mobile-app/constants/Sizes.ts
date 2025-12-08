/**
 * Fortis Design System - Sizes & Spacing
 * Based on 4px base unit (0.25rem = 4px)
 */

export const Spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 12,   // 0.75rem
  lg: 16,   // 1rem
  xl: 20,   // 1.25rem
  '2xl': 24,   // 1.5rem
  '3xl': 32,   // 2rem
  '4xl': 40,   // 2.5rem
  '5xl': 48,   // 3rem
  '6xl': 64,   // 4rem
} as const;

export const BorderRadius = {
  none: 0,
  sm: 6,    // 0.375rem
  md: 8,    // 0.5rem
  lg: 10,   // 0.625rem (--radius from prototype)
  xl: 14,   // 0.875rem
  '2xl': 16,   // 1rem
  '3xl': 24,   // 1.5rem
  full: 9999, // Fully rounded
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16, // --font-size from prototype
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

export const ButtonHeights = {
  sm: 32,   // h-8
  md: 36,   // h-9
  lg: 40,   // h-10
  xl: 48,   // h-12
} as const;

export const InputHeights = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

export const ContainerWidths = {
  sm: 384,  // 24rem
  md: 448,  // 28rem
  lg: 512,  // 32rem
  xl: 640,  // 40rem
  '2xl': 768,  // 48rem
  full: '100%' as const,
} as const;

// Common component sizes
export const Sizes = {
  // Tab bar
  tabBarHeight: {
    ios: 88,
    android: 64,
  },

  // Header
  headerHeight: 56,

  // Bottom sheets
  bottomSheetMinHeight: 200,
  bottomSheetMaxHeight: '90%',

  // Cards
  cardMinHeight: 120,

  // Touch targets (minimum for accessibility)
  minTouchTarget: 44,

  // Avatar sizes
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
} as const;

// Shadows (elevation)
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
} as const;

// Z-Index
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
