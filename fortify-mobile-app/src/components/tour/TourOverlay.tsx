import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SpeakerWaveIcon } from 'react-native-heroicons/outline';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
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
  secondaryAnchorRect?: AnchorRect | null;
  arrowTargetRect?: AnchorRect | null;
  body: string;
  stepLabel?: string | null;
  primaryAction?: Action | null;
  secondaryAction?: Action | null;
  auxiliaryAction?: Action | null;
  showArrow?: boolean;
  arrowColor?: string;
  centerTooltip?: boolean;
  showHighlight?: boolean;
  hideTooltip?: boolean;
  tooltipOffsetY?: number;
  pinTooltipToTop?: boolean;
  tooltipTopOffset?: number;
  placement?: TourOverlayPlacement;
  holePadding?: number;
  holePaddingBottom?: number;
  holeOffsetY?: number;
  reserveArrowSpace?: boolean;
  allowAnchorInteraction?: boolean;
  onTooltipHideComplete?: (() => void) | null;
};

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
const TOUR_DIM_BACKGROUND = 'rgba(15, 23, 42, 0.55)';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function TourOverlay({
  visible,
  mode,
  anchorRect,
  secondaryAnchorRect = null,
  arrowTargetRect = null,
  body,
  primaryAction,
  auxiliaryAction,
  showArrow = false,
  arrowColor,
  centerTooltip = false,
  showHighlight = true,
  hideTooltip = false,
  tooltipOffsetY = 0,
  pinTooltipToTop = false,
  tooltipTopOffset = 0,
  placement = 'auto',
  holePadding = HOLE_PADDING,
  holePaddingBottom = holePadding,
  holeOffsetY = 0,
  reserveArrowSpace = false,
  allowAnchorInteraction = mode === 'spotlight',
  onTooltipHideComplete = null,
}: TourOverlayProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
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

  const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, screenWidth - TOOLTIP_SIDE_MARGIN * 2);

  const paddedRect = useMemo(() => {
    if (!anchorRect) return null;
    const x = Math.max(0, anchorRect.x - holePadding);
    const y = Math.max(0, anchorRect.y - holePadding + holeOffsetY);
    const width = Math.min(screenWidth, anchorRect.width + holePadding * 2);
    const height = Math.min(screenHeight, anchorRect.height + holePadding + holePaddingBottom);
    return { x, y, width, height };
  }, [anchorRect, holeOffsetY, holePadding, holePaddingBottom, screenHeight, screenWidth]);

  const paddedSecondaryRect = useMemo(() => {
    if (!secondaryAnchorRect) return null;
    const x = Math.max(0, secondaryAnchorRect.x - holePadding);
    const y = Math.max(0, secondaryAnchorRect.y - holePadding + holeOffsetY);
    const width = Math.min(screenWidth, secondaryAnchorRect.width + holePadding * 2);
    const height = Math.min(screenHeight, secondaryAnchorRect.height + holePadding + holePaddingBottom);
    return { x, y, width, height };
  }, [holeOffsetY, holePadding, holePaddingBottom, screenHeight, screenWidth, secondaryAnchorRect]);

  const paddedArrowTargetRect = useMemo(() => {
    if (!arrowTargetRect) return null;
    const x = Math.max(0, arrowTargetRect.x - holePadding);
    const y = Math.max(0, arrowTargetRect.y - holePadding + holeOffsetY);
    const width = Math.min(screenWidth, arrowTargetRect.width + holePadding * 2);
    const height = Math.min(screenHeight, arrowTargetRect.height + holePadding + holePaddingBottom);
    return { x, y, width, height };
  }, [arrowTargetRect, holeOffsetY, holePadding, holePaddingBottom, screenHeight, screenWidth]);

  const tooltipPos = useMemo(() => {
    const safeTop = insets.top + TOOLTIP_SIDE_MARGIN;
    const safeBottom = screenHeight - insets.bottom - TOOLTIP_SIDE_MARGIN;
    const tooltipMaxTop = Math.max(safeTop, safeBottom - (tooltipHeight ?? 0));

    if (centerTooltip) {
      return {
        left: (screenWidth - tooltipWidth) / 2,
        top: clamp((screenHeight - (tooltipHeight ?? 0)) / 2 + tooltipOffsetY, safeTop, tooltipMaxTop),
      };
    }

    if (pinTooltipToTop) {
      return {
        left: (screenWidth - tooltipWidth) / 2,
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
      const left = clamp(centerX - tooltipWidth / 2, TOOLTIP_SIDE_MARGIN, screenWidth - TOOLTIP_SIDE_MARGIN - tooltipWidth);
      const arrowOffset = showArrow || reserveArrowSpace ? ARROW_HEIGHT + ARROW_GAP : 0;
      const topCandidate = placement === 'below'
        ? paddedRect.y + paddedRect.height + TOOLTIP_GAP + arrowOffset
        : paddedRect.y - TOOLTIP_GAP - arrowOffset;

      return {
        left,
        top: clamp(topCandidate + tooltipOffsetY, safeTop, tooltipMaxTop),
      };
    }

    const centerX = paddedRect.x + paddedRect.width / 2;
    const left = clamp(centerX - tooltipWidth / 2, TOOLTIP_SIDE_MARGIN, screenWidth - TOOLTIP_SIDE_MARGIN - tooltipWidth);

    const arrowOffset = showArrow || reserveArrowSpace ? ARROW_HEIGHT + ARROW_GAP : 0;
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
    reserveArrowSpace,
    screenHeight,
    screenWidth,
  ]);
  const shouldShowTooltip = visible && !hideTooltip;
  const arrowRect = paddedArrowTargetRect ?? paddedRect;
  const arrowPointsUp = Boolean(
    arrowRect
    && (placement === 'below' || (placement === 'auto' && tooltipPos.top >= arrowRect.y + arrowRect.height))
  );

  const themedStyles = {
    overlay: { backgroundColor: TOUR_DIM_BACKGROUND },
    tooltip: {
      backgroundColor: isDark ? 'rgba(20, 20, 20, 0.92)' : 'rgba(255, 255, 255, 0.92)',
      borderColor: colors.glassBorder,
    },
    bodyText: { color: colors.textPrimary },
    auxiliaryText: { color: colors.textSecondary },
    highlightBorder: { borderColor: colors.accent },
    primaryText: { color: colors.accentForegroundOnFill },
    arrow: { borderTopColor: arrowColor ?? '#FFFFFF' },
    arrowUp: { borderBottomColor: arrowColor ?? '#FFFFFF' },
    arrowLine: { backgroundColor: arrowColor ?? '#FFFFFF' },
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
    transform: [{ translateY: arrowAnim.value * ARROW_BOB_DISTANCE * (arrowPointsUp ? -1 : 1) }],
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
  const allowHolePassthrough = allowAnchorInteraction;

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

    const holes = [paddedRect, paddedSecondaryRect]
      .filter((rect): rect is AnchorRect => Boolean(rect))
      .sort((a, b) => a.y - b.y);

    const renderSideBlocks = (rect: AnchorRect) => {
      const rightLeft = rect.x + rect.width;
      return (
        <>
          <View style={[styles.overlayBlock, { top: rect.y, left: 0, width: rect.x, height: rect.height }]} />
          <View style={[styles.overlayBlock, { top: rect.y, left: rightLeft, width: Math.max(0, screenWidth - rightLeft), height: rect.height }]} />
        </>
      );
    };

    const firstHole = holes[0];
    const secondHole = holes[1];
    const firstBottom = firstHole.y + firstHole.height;
    const secondBottom = secondHole ? secondHole.y + secondHole.height : firstBottom;

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg style={StyleSheet.absoluteFill} width={screenWidth} height={screenHeight}>
            <Defs>
              <Mask
                id="tour-spotlight-mask"
                x={0}
                y={0}
                width={screenWidth}
                height={screenHeight}
                maskUnits="userSpaceOnUse"
              >
                <Rect x={0} y={0} width={screenWidth} height={screenHeight} fill="#FFFFFF" />
                {holes.map((rect, index) => (
                  <Rect
                    key={`tour-spotlight-hole-${index}`}
                    testID={`tour-spotlight-hole-${index}`}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    rx={HIGHLIGHT_RADIUS}
                    ry={HIGHLIGHT_RADIUS}
                    fill="#000000"
                  />
                ))}
              </Mask>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={screenWidth}
              height={screenHeight}
              fill={TOUR_DIM_BACKGROUND}
              mask="url(#tour-spotlight-mask)"
            />
          </Svg>
        </View>
        <View style={[styles.overlayBlock, { top: 0, left: 0, right: 0, height: firstHole.y }]} />
        {renderSideBlocks(firstHole)}
        {secondHole ? (
          <>
            <View style={[styles.overlayBlock, { top: firstBottom, left: 0, right: 0, height: Math.max(0, secondHole.y - firstBottom) }]} />
            {renderSideBlocks(secondHole)}
          </>
        ) : null}
        <View style={[styles.overlayBlock, { top: secondBottom, left: 0, right: 0, height: Math.max(0, screenHeight - secondBottom) }]} />

        {/* In blocking mode we still render the "hole", but we swallow touches over it. */}
        {!allowHolePassthrough && holes.map((rect, index) => (
          <View
            key={`tour-hole-${index}`}
            pointerEvents="auto"
            style={{ position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
          />
        ))}
      </View>
    );
  };

  const renderHighlight = (rect: AnchorRect | null) => {
    if (!rect) return null;
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.highlight,
          themedStyles.highlightBorder,
          {
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
          },
          highlightAnimatedStyle,
        ]}
      />
    );
  };

  const renderArrow = () => {
    if (!showArrow || !arrowRect) return null;
    const safeTop = insets.top + TOOLTIP_SIDE_MARGIN;
    const centerX = arrowRect.x + arrowRect.width / 2;
    const left = clamp(centerX - ARROW_WIDTH / 2, TOOLTIP_SIDE_MARGIN, screenWidth - TOOLTIP_SIDE_MARGIN - ARROW_WIDTH);
    const topCandidate = arrowPointsUp
      ? arrowRect.y + arrowRect.height + ARROW_GAP
      : arrowRect.y - ARROW_GAP - ARROW_HEIGHT;
    const top = clamp(topCandidate, safeTop, screenHeight - insets.bottom - ARROW_HEIGHT);

    return (
      <Animated.View
        testID={arrowPointsUp ? 'tour-arrow-up' : 'tour-arrow-down'}
        style={[styles.arrow, { left, top }, arrowAnimatedStyle]}
        pointerEvents="none"
      >
        {arrowPointsUp ? (
          <>
            <View style={[styles.arrowHeadUp, themedStyles.arrowUp]} />
            <View style={[styles.arrowLine, themedStyles.arrowLine]} />
          </>
        ) : (
          <>
            <View style={[styles.arrowLine, themedStyles.arrowLine]} />
            <View style={[styles.arrowHead, themedStyles.arrow]} />
          </>
        )}
      </Animated.View>
    );
  };

  if (!visible) return null;

  const overlayContent = (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {renderBlockingOverlay()}
      {showHighlight ? renderHighlight(paddedRect) : null}
      {showHighlight ? renderHighlight(paddedSecondaryRect) : null}
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
            <Text style={[styles.bodyText, themedStyles.bodyText]}>{body}</Text>

            {auxiliaryAction ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={auxiliaryAction.label}
                disabled={auxiliaryAction.disabled}
                onPress={auxiliaryAction.onPress}
                style={[styles.auxiliaryButton, auxiliaryAction.disabled && styles.auxiliaryButtonDisabled]}
              >
                <SpeakerWaveIcon color={colors.textSecondary} size={scale(18)} />
                <Text style={[styles.auxiliaryText, themedStyles.auxiliaryText]}>{auxiliaryAction.label}</Text>
              </TouchableOpacity>
            ) : null}

            {primaryAction ? (
              <GlassButton
                style={styles.primaryButton}
                onPress={primaryAction.onPress}
                disabled={primaryAction.disabled}
                hapticFeedback="selection"
                glow={false}
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
  bodyText: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    fontWeight: FontWeights.medium,
    textAlign: 'center',
  },
  auxiliaryButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: scale(40),
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  auxiliaryButtonDisabled: {
    opacity: 0.6,
  },
  auxiliaryText: {
    fontSize: moderateScale(14),
    fontWeight: FontWeights.semibold,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.35,
    shadowRadius: scale(4),
    elevation: 8,
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
  arrowHeadUp: {
    marginBottom: scale(2),
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_WIDTH / 2,
    borderRightWidth: ARROW_WIDTH / 2,
    borderBottomWidth: ARROW_WIDTH * 0.6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
