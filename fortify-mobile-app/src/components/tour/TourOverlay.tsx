import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/src/contexts/ThemeContext';
import { GlassButton } from '@/components/GlassButton';
import { BorderRadius, FontWeights, Spacing } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';

export type AnchorRect = { x: number; y: number; width: number; height: number };

export type TourOverlayMode = 'blocking' | 'spotlight' | 'non_blocking';
export type TourOverlayPlacement = 'auto' | 'above' | 'below';

type Action = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type TourOverlayProps = {
  visible: boolean;
  mode: TourOverlayMode;
  anchorRect: AnchorRect | null;
  body: string;
  stepLabel?: string;
  primaryAction?: Action | null;
  onSkip?: (() => void) | null;
  showArrow?: boolean;
  centerTooltip?: boolean;
  showHighlight?: boolean;
  hideTooltip?: boolean;
  tooltipOffsetY?: number;
  pinTooltipToTop?: boolean;
  tooltipTopOffset?: number;
  placement?: TourOverlayPlacement;
  onTooltipHideComplete?: (() => void) | null;
};

const SCREEN = Dimensions.get('window');
const TOOLTIP_MAX_WIDTH = scale(340);
const TOOLTIP_SIDE_MARGIN = scale(18);
const TOOLTIP_GAP = scale(12);
const ARROW_GAP = scale(8);
const ARROW_HEIGHT = scale(28);
const ARROW_WIDTH = scale(18);
const ARROW_LINE_HEIGHT = scale(16);
const ARROW_BOB_DISTANCE = scale(6);
const HOLE_PADDING = scale(10);
const HIGHLIGHT_RADIUS = scale(16);
const HIGHLIGHT_BORDER = scale(2);
const TOOLTIP_TRANSITION_Y = scale(6);
const TOOLTIP_ENTER_DURATION_MS = 240;
const TOOLTIP_EXIT_DURATION_MS = 140;
const TOOLTIP_POSITION_DURATION_MS = 180;
const TOOLTIP_POSITION_JITTER_PX = 2;
const TOOLTIP_POSITION_DIRECT_SET_THRESHOLD_PX = 40;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function TourOverlay({
  visible,
  mode,
  anchorRect,
  body,
  stepLabel,
  primaryAction,
  onSkip,
  showArrow = false,
  centerTooltip = false,
  showHighlight = true,
  hideTooltip = false,
  tooltipOffsetY = 0,
  pinTooltipToTop = false,
  tooltipTopOffset = 0,
  placement = 'auto',
  onTooltipHideComplete = null,
}: TourOverlayProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [tooltipHeight, setTooltipHeight] = useState<number | null>(null);
  const arrowAnim = useSharedValue(0);
  const tooltipOpacity = useSharedValue(0);
  const tooltipTranslate = useSharedValue(TOOLTIP_TRANSITION_Y);
  const tooltipLeft = useSharedValue(0);
  const tooltipTop = useSharedValue(0);
  const lastTooltipPosRef = useRef<{ left: number; top: number } | null>(null);
  const wasTooltipShownRef = useRef(false);
  const onTooltipHideCompleteRef = useRef(onTooltipHideComplete);

  useEffect(() => {
    onTooltipHideCompleteRef.current = onTooltipHideComplete;
  }, [onTooltipHideComplete]);

  const notifyTooltipHideComplete = useCallback(() => {
    onTooltipHideCompleteRef.current?.();
  }, []);

  const finalizeTooltipExit = useCallback(() => {
    wasTooltipShownRef.current = false;
    notifyTooltipHideComplete();
  }, [notifyTooltipHideComplete]);

  const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, SCREEN.width - TOOLTIP_SIDE_MARGIN * 2);

  const paddedRect = useMemo(() => {
    if (!anchorRect) return null;
    const x = Math.max(0, anchorRect.x - HOLE_PADDING);
    const y = Math.max(0, anchorRect.y - HOLE_PADDING);
    const width = Math.min(SCREEN.width, anchorRect.width + HOLE_PADDING * 2);
    const height = Math.min(SCREEN.height, anchorRect.height + HOLE_PADDING * 2);
    return { x, y, width, height };
  }, [anchorRect]);

  const tooltipPos = useMemo(() => {
    const safeTop = insets.top + TOOLTIP_SIDE_MARGIN;
    const safeBottom = SCREEN.height - insets.bottom - TOOLTIP_SIDE_MARGIN;
    const tooltipMaxTop = Math.max(safeTop, safeBottom - (tooltipHeight ?? 0));

    if (centerTooltip) {
      return {
        left: (SCREEN.width - tooltipWidth) / 2,
        top: clamp((SCREEN.height - (tooltipHeight ?? 0)) / 2 + tooltipOffsetY, safeTop, tooltipMaxTop),
      };
    }

    if (pinTooltipToTop) {
      return {
        left: (SCREEN.width - tooltipWidth) / 2,
        top: clamp(safeTop + tooltipTopOffset, safeTop, tooltipMaxTop),
      };
    }

    if (!paddedRect || !tooltipHeight) {
      if (!paddedRect) {
        return {
          left: TOOLTIP_SIDE_MARGIN,
          top: clamp(safeBottom - (tooltipHeight ?? 0), safeTop, tooltipMaxTop),
        };
      }

      const centerX = paddedRect.x + paddedRect.width / 2;
      const left = clamp(centerX - tooltipWidth / 2, TOOLTIP_SIDE_MARGIN, SCREEN.width - TOOLTIP_SIDE_MARGIN - tooltipWidth);
      const arrowOffset = showArrow ? ARROW_HEIGHT + ARROW_GAP : 0;
      const topCandidate = placement === 'below'
        ? paddedRect.y + paddedRect.height + TOOLTIP_GAP + arrowOffset
        : paddedRect.y - TOOLTIP_GAP - arrowOffset;

      return {
        left,
        top: clamp(topCandidate + tooltipOffsetY, safeTop, tooltipMaxTop),
      };
    }

    const centerX = paddedRect.x + paddedRect.width / 2;
    const left = clamp(centerX - tooltipWidth / 2, TOOLTIP_SIDE_MARGIN, SCREEN.width - TOOLTIP_SIDE_MARGIN - tooltipWidth);

    const arrowOffset = showArrow ? ARROW_HEIGHT + ARROW_GAP : 0;
    const aboveTop = paddedRect.y - TOOLTIP_GAP - arrowOffset - tooltipHeight;
    const belowTop = paddedRect.y + paddedRect.height + TOOLTIP_GAP + arrowOffset;
    const canFitAbove = aboveTop >= safeTop;

    const shouldPlaceAbove = placement === 'above'
      ? true
      : placement === 'below'
        ? false
        : canFitAbove;
    const topCandidate = (shouldPlaceAbove ? aboveTop : belowTop) + tooltipOffsetY;
    const top = clamp(topCandidate, safeTop, tooltipMaxTop);

    return { left, top };
  }, [
    centerTooltip,
    insets.bottom,
    insets.top,
    paddedRect,
    pinTooltipToTop,
    placement,
    tooltipHeight,
    tooltipOffsetY,
    tooltipTopOffset,
    tooltipWidth,
    showArrow,
  ]);
  const shouldShowTooltip = visible && !hideTooltip;

  const themedStyles = {
    overlay: { backgroundColor: colors.overlayHeavy },
    tooltip: {
      backgroundColor: isDark ? 'rgba(20, 20, 20, 0.92)' : 'rgba(255, 255, 255, 0.92)',
      borderColor: colors.glassBorder,
    },
    bodyText: { color: colors.textPrimary },
    stepText: { color: colors.textSecondary },
    skipText: { color: colors.textSecondary },
    highlightBorder: { borderColor: colors.accent },
    primaryText: { color: colors.white },
    arrow: { borderTopColor: colors.accent },
    arrowLine: { backgroundColor: colors.accent },
  };

  useEffect(() => {
    if (!visible) {
      lastTooltipPosRef.current = null;
      return;
    }

    const nextLeft = tooltipPos.left;
    const nextTop = tooltipPos.top;

    if (!shouldShowTooltip) {
      tooltipLeft.value = nextLeft;
      tooltipTop.value = nextTop;
      lastTooltipPosRef.current = null;
      return;
    }

    const last = lastTooltipPosRef.current;
    if (!last) {
      tooltipLeft.value = nextLeft;
      tooltipTop.value = nextTop;
      lastTooltipPosRef.current = { left: nextLeft, top: nextTop };
      return;
    }

    const deltaLeft = Math.abs(last.left - nextLeft);
    const deltaTop = Math.abs(last.top - nextTop);
    if (deltaLeft <= TOOLTIP_POSITION_JITTER_PX && deltaTop <= TOOLTIP_POSITION_JITTER_PX) return;

    cancelAnimation(tooltipLeft);
    cancelAnimation(tooltipTop);

    const totalDelta = deltaLeft + deltaTop;
    if (totalDelta >= TOOLTIP_POSITION_DIRECT_SET_THRESHOLD_PX) {
      tooltipLeft.value = nextLeft;
      tooltipTop.value = nextTop;
      lastTooltipPosRef.current = { left: nextLeft, top: nextTop };
      return;
    }

    tooltipLeft.value = withTiming(nextLeft, {
      duration: TOOLTIP_POSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    tooltipTop.value = withTiming(nextTop, {
      duration: TOOLTIP_POSITION_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });

    lastTooltipPosRef.current = { left: nextLeft, top: nextTop };
  }, [shouldShowTooltip, tooltipLeft, tooltipPos.left, tooltipPos.top, tooltipTop, visible]);

  useEffect(() => {
    if (!visible || !showArrow || !shouldShowTooltip) {
      cancelAnimation(arrowAnim);
      arrowAnim.value = 0;
      return;
    }

    arrowAnim.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(0, {
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
        })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(arrowAnim);
    };
  }, [arrowAnim, shouldShowTooltip, showArrow, visible]);

  useEffect(() => {
    if (!visible) {
      const wasShown = wasTooltipShownRef.current;
      cancelAnimation(tooltipOpacity);
      cancelAnimation(tooltipTranslate);
      tooltipOpacity.value = 0;
      tooltipTranslate.value = TOOLTIP_TRANSITION_Y;
      wasTooltipShownRef.current = false;
      if (wasShown) {
        notifyTooltipHideComplete();
      }
      return;
    }

    cancelAnimation(tooltipOpacity);
    cancelAnimation(tooltipTranslate);

    if (shouldShowTooltip) {
      if (!wasTooltipShownRef.current) {
        tooltipOpacity.value = 0;
        tooltipTranslate.value = TOOLTIP_TRANSITION_Y;
      }

      tooltipOpacity.value = withTiming(1, {
        duration: TOOLTIP_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      tooltipTranslate.value = withTiming(0, {
        duration: TOOLTIP_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });

      wasTooltipShownRef.current = true;
      return;
    }

    if (!wasTooltipShownRef.current) {
      notifyTooltipHideComplete();
      return;
    }

    tooltipOpacity.value = withTiming(0, {
      duration: TOOLTIP_EXIT_DURATION_MS,
      easing: Easing.in(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(finalizeTooltipExit)();
      }
    });
    tooltipTranslate.value = withTiming(TOOLTIP_TRANSITION_Y, {
      duration: TOOLTIP_EXIT_DURATION_MS,
      easing: Easing.in(Easing.cubic),
    });
  }, [finalizeTooltipExit, notifyTooltipHideComplete, shouldShowTooltip, tooltipOpacity, tooltipTranslate, visible]);

  const highlightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateY: arrowAnim.value * ARROW_BOB_DISTANCE }],
  }));

  const tooltipPositionAnimatedStyle = useAnimatedStyle(() => ({
    left: tooltipLeft.value,
    top: tooltipTop.value,
  }));

  const tooltipContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateY: tooltipTranslate.value }],
  }));

  const blockOutside = mode !== 'non_blocking';
  const allowHolePassthrough = mode === 'spotlight';

  const renderBlockingOverlay = () => {
    if (!blockOutside) return null;

    // When the anchor isn't available yet, block the whole screen to avoid accidental taps.
    if (!paddedRect) {
      return (
        <View style={StyleSheet.absoluteFill} pointerEvents="auto">
          <View style={[StyleSheet.absoluteFill, themedStyles.overlay]} pointerEvents="none" />
        </View>
      );
    }

    const topHeight = paddedRect.y;
    const bottomTop = paddedRect.y + paddedRect.height;
    const bottomHeight = Math.max(0, SCREEN.height - bottomTop);
    const leftWidth = paddedRect.x;
    const rightLeft = paddedRect.x + paddedRect.width;
    const rightWidth = Math.max(0, SCREEN.width - rightLeft);

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={[styles.overlayBlock, themedStyles.overlay, { top: 0, left: 0, right: 0, height: topHeight }]} />
        <View style={[styles.overlayBlock, themedStyles.overlay, { top: bottomTop, left: 0, right: 0, height: bottomHeight }]} />
        <View style={[styles.overlayBlock, themedStyles.overlay, { top: paddedRect.y, left: 0, width: leftWidth, height: paddedRect.height }]} />
        <View style={[styles.overlayBlock, themedStyles.overlay, { top: paddedRect.y, left: rightLeft, width: rightWidth, height: paddedRect.height }]} />

        {/* In blocking mode we still render the "hole", but we swallow touches over it. */}
        {!allowHolePassthrough && (
          <View
            pointerEvents="auto"
            style={{
              position: 'absolute',
              left: paddedRect.x,
              top: paddedRect.y,
              width: paddedRect.width,
              height: paddedRect.height,
            }}
          />
        )}
      </View>
    );
  };

  const renderHighlight = () => {
    if (!paddedRect) return null;
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.highlight,
          themedStyles.highlightBorder,
          {
            left: paddedRect.x,
            top: paddedRect.y,
            width: paddedRect.width,
            height: paddedRect.height,
          },
          highlightAnimatedStyle,
        ]}
      />
    );
  };

  const renderArrow = () => {
    if (!showArrow || !paddedRect) return null;
    const safeTop = insets.top + TOOLTIP_SIDE_MARGIN;
    const centerX = paddedRect.x + paddedRect.width / 2;
    const left = clamp(centerX - ARROW_WIDTH / 2, TOOLTIP_SIDE_MARGIN, SCREEN.width - TOOLTIP_SIDE_MARGIN - ARROW_WIDTH);
    const topCandidate = paddedRect.y - ARROW_GAP - ARROW_HEIGHT;
    const top = clamp(topCandidate, safeTop, SCREEN.height - insets.bottom - ARROW_HEIGHT);

    return (
      <Animated.View style={[styles.arrow, { left, top }, arrowAnimatedStyle]} pointerEvents="none">
        <View style={[styles.arrowLine, themedStyles.arrowLine]} />
        <View style={[styles.arrowHead, themedStyles.arrow]} />
      </Animated.View>
    );
  };

  if (!visible) return null;

  const overlayContent = (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {renderBlockingOverlay()}
      {showHighlight ? renderHighlight() : null}
      {renderArrow()}

      {!hideTooltip ? (
        <Animated.View
          style={[
            styles.tooltipPosition,
            { width: tooltipWidth },
            tooltipPositionAnimatedStyle,
          ]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.tooltip,
              themedStyles.tooltip,
              tooltipContentAnimatedStyle,
            ]}
            pointerEvents="auto"
            accessibilityRole="alert"
            onLayout={(e) => {
              const nextHeight = e.nativeEvent.layout.height;
              if (tooltipHeight !== nextHeight) {
                setTooltipHeight(nextHeight);
              }
            }}
          >
            <View style={styles.tooltipHeader}>
              <Text style={[styles.stepText, themedStyles.stepText]}>{stepLabel ?? ''}</Text>
              {onSkip && (
                <Pressable onPress={onSkip} hitSlop={8}>
                  <Text style={[styles.skipText, themedStyles.skipText]}>Skip</Text>
                </Pressable>
              )}
            </View>

            <Text style={[styles.bodyText, themedStyles.bodyText, centerTooltip && styles.bodyTextCentered]}>{body}</Text>

            {primaryAction ? (
              <GlassButton
                style={styles.primaryButton}
                onPress={primaryAction.onPress}
                disabled={primaryAction.disabled}
                hapticFeedback="selection"
              >
                <Text style={[styles.primaryText, themedStyles.primaryText]}>{primaryAction.label}</Text>
              </GlassButton>
            ) : null}
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );

  return overlayContent;
}

const styles = StyleSheet.create({
  overlayBlock: {
    position: 'absolute',
    zIndex: 1,
  },
  highlight: {
    position: 'absolute',
    borderRadius: HIGHLIGHT_RADIUS,
    borderWidth: HIGHLIGHT_BORDER,
    zIndex: 2,
  },
  tooltip: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  tooltipPosition: {
    position: 'absolute',
    zIndex: 10,
    elevation: 10,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  stepText: {
    fontSize: moderateScale(12),
    fontWeight: FontWeights.bold,
  },
  skipText: {
    fontSize: moderateScale(12),
    fontWeight: FontWeights.semibold,
  },
  bodyText: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    fontWeight: FontWeights.medium,
  },
  bodyTextCentered: {
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: Spacing.lg,
    height: scale(44),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: moderateScale(14),
    fontWeight: FontWeights.bold,
  },
  arrow: {
    position: 'absolute',
    width: ARROW_WIDTH,
    height: ARROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 5,
  },
  arrowLine: {
    width: scale(2),
    height: ARROW_LINE_HEIGHT,
    borderRadius: scale(1),
  },
  arrowHead: {
    marginTop: scale(2),
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_WIDTH / 2,
    borderRightWidth: ARROW_WIDTH / 2,
    borderTopWidth: ARROW_WIDTH * 0.6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
