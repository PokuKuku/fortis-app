/**
 * Responsive Utilities
 *
 * Provides screen-aware scaling for consistent layouts across device sizes.
 *
 * Device Width Reference:
 * - iPhone SE/mini: ~375pt (small)
 * - iPhone 12/13/14: ~390pt (medium - baseline)
 * - iPhone Plus/Pro Max: ~430pt (large)
 *
 * Usage:
 * ```tsx
 * import { SCREEN_WIDTH, scale, responsiveValue } from '@/src/utils/responsive';
 *
 * // Scale a value proportionally to screen width
 * const iconSize = scale(24); // 24 on baseline, smaller on small screens
 *
 * // Choose different values for different screen sizes
 * const columns = responsiveValue(1, 2, 3); // 1 col on small, 2 on medium, 3 on large
 *
 * // Get explicit width for percentage-based children
 * const gridWidth = getContentWidth(24); // Screen width minus 24px padding on each side
 * ```
 */

import { Dimensions } from 'react-native';

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline width (iPhone 14 / iPhone 12 Pro)
const BASE_WIDTH = 390;

// Screen size breakpoints
const SMALL_SCREEN_MAX = 380;  // iPhone SE, mini
const LARGE_SCREEN_MIN = 420;  // iPhone Plus, Pro Max

/**
 * Check if device is a small screen (iPhone SE, mini)
 */
export const isSmallScreen = SCREEN_WIDTH < SMALL_SCREEN_MAX;

/**
 * Check if device is a large screen (iPhone Plus, Pro Max)
 */
export const isLargeScreen = SCREEN_WIDTH >= LARGE_SCREEN_MIN;

/**
 * Scale a pixel value proportionally to screen width.
 * Useful for sizing elements that should scale with screen size.
 *
 * @param size - Base size in pixels (designed for 390pt width)
 * @param minScale - Minimum scale factor (default 0.85)
 * @param maxScale - Maximum scale factor (default 1.15)
 * @returns Scaled size
 *
 * @example
 * const iconSize = scale(24); // ~22 on small screens, ~24 on medium, ~26 on large
 */
export function scale(size: number, minScale = 0.85, maxScale = 1.15): number {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  const clampedScale = Math.min(Math.max(scaleFactor, minScale), maxScale);
  return Math.round(size * clampedScale);
}

/**
 * Moderately scale a value - less aggressive than scale().
 * Good for text sizes and spacing that shouldn't vary too much.
 *
 * @param size - Base size in pixels
 * @returns Moderately scaled size
 */
export function moderateScale(size: number, factor = 0.5): number {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size + (size * (scaleFactor - 1) * factor));
}

/**
 * Choose a value based on screen size category.
 *
 * @param small - Value for small screens (< 380pt)
 * @param medium - Value for medium screens (380-420pt)
 * @param large - Value for large screens (>= 420pt)
 * @returns The appropriate value for current screen size
 *
 * @example
 * const gridColumns = responsiveValue(1, 2, 2);
 * const cardHeight = responsiveValue(64, 72, 80);
 */
export function responsiveValue<T>(small: T, medium: T, large: T): T {
  if (SCREEN_WIDTH < SMALL_SCREEN_MAX) return small;
  if (SCREEN_WIDTH < LARGE_SCREEN_MIN) return medium;
  return large;
}

/**
 * Get available content width with padding.
 * Use this for grids that need explicit numeric width for percentage children.
 *
 * @param horizontalPadding - Padding on each side (default 24)
 * @param maxWidth - Maximum width cap (optional)
 * @returns Available width in pixels
 *
 * @example
 * const gridWidth = getContentWidth(24, 400); // Full width minus padding, max 400
 */
export function getContentWidth(horizontalPadding = 24, maxWidth?: number): number {
  const availableWidth = SCREEN_WIDTH - (horizontalPadding * 2);
  return maxWidth ? Math.min(availableWidth, maxWidth) : availableWidth;
}

/**
 * Get responsive modal width that ensures proper margins.
 *
 * @param preferredWidth - Preferred modal width
 * @param minMargin - Minimum margin on each side (default 24)
 * @returns Safe modal width
 */
export function getModalWidth(preferredWidth = 320, minMargin = 24): number {
  return Math.min(SCREEN_WIDTH - (minMargin * 2), preferredWidth);
}

// Export screen dimensions for direct use
export { SCREEN_WIDTH, SCREEN_HEIGHT };
