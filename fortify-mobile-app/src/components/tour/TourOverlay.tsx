import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SpeakerWaveIcon } from 'react-native-heroicons/outline';
import Svg, { Path } from 'react-native-svg';
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
export type TourArrowDirection = 'top' | 'right' | 'bottom' | 'left';

type Action = {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
};

type AnchorAction = Omit<Action, 'onPress'> & {
  onPress?: () => void;
};

type TourOverlayProps = {
  visible: boolean;
  mode: TourOverlayMode;
  anchorRect: AnchorRect | null;
  secondaryAnchorRect?: AnchorRect | null;
  arrowTargetRect?: AnchorRect | null;
  body: string;
  stepLabel?: string | null;
  transitionIndex?: number;
  primaryAction?: Action | null;
  secondaryAction?: Action | null;
  auxiliaryAction?: Action | null;
  showArrow?: boolean;
  arrowDirections?: readonly TourArrowDirection[];
  arrowColor?: string;
  boldPhrases?: readonly string[];
  centerTooltip?: boolean;
  showHighlight?: boolean;
  hideTooltip?: boolean;
  tooltipOffsetY?: number;
  pinTooltipToTop?: boolean;
  tooltipTopOffset?: number;
  placement?: TourOverlayPlacement;
  holePadding?: number;
  holePaddingHorizontal?: number;
  holePaddingTop?: number;
  holePaddingBottom?: number;
  holeOffsetY?: number;
  reserveArrowSpace?: boolean;
  allowAnchorInteraction?: boolean;
  allowOnlyArrowTargetInteraction?: boolean;
  anchorAction?: AnchorAction | null;
  anchorActionRect?: AnchorRect | null;
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
const TOOLTIP_ENTER_DURATION_MS = 150;
const TOOLTIP_EXIT_DURATION_MS = 120;
const TOOLTIP_POSITION_DURATION_MS = 150;
const TOOLTIP_POSITION_JITTER_PX = 2;
const TOUR_DIM_BACKGROUND = 'rgba(15, 23, 42, 0.55)';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const roundedRectPath = (rect: AnchorRect): string => {
  const radius = Math.min(HIGHLIGHT_RADIUS, rect.width / 2, rect.height / 2);
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  return [
    `M ${rect.x + radius} ${rect.y}`,
    `H ${right - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right} ${rect.y + radius}`,
    `V ${bottom - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
    `H ${rect.x + radius}`,
    `A ${radius} ${radius} 0 0 1 ${rect.x} ${bottom - radius}`,
    `V ${rect.y + radius}`,
    `A ${radius} ${radius} 0 0 1 ${rect.x + radius} ${rect.y}`,
    'Z',
  ].join(' ');
};

export const getTourSlideDirection = (transitionIndex: number): -1 | 1 =>
  transitionIndex % 2 === 0 ? -1 : 1;

export const TourOverlay = memo(function TourOverlay({
  visible,
  mode,
  anchorRect,
  secondaryAnchorRect = null,
  arrowTargetRect = null,
  body,
  transitionIndex = 0,
  primaryAction,
  secondaryAction,
  auxiliaryAction,
  showArrow = false,
  arrowDirections,
  arrowColor,
  boldPhrases = [],
  centerTooltip = false,
  showHighlight = true,
  hideTooltip = false,
  tooltipOffsetY = 0,
  pinTooltipToTop = false,
  tooltipTopOffset = 0,
  placement = 'auto',
  holePadding = HOLE_PADDING,
  holePaddingHorizontal = holePadding,
  holePaddingTop = holePadding,
  holePaddingBottom = holePadding,
  holeOffsetY = 0,
  reserveArrowSpace = false,
  allowAnchorInteraction = false,
  allowOnlyArrowTargetInteraction = false,
  anchorAction = null,
  anchorActionRect = null,
  onTooltipHideComplete = null,
}: TourOverlayProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [tooltipHeight, setTooltipHeight] = useState<number | null>(null);
  const arrowAnim = useSharedValue(0);
  const tooltipOpacity = useSharedValue(0);
  const tooltipContentTranslateX = useSharedValue(screenWidth);
  const tooltipLeft = useSharedValue(0);
  const tooltipTop = useSharedValue(0);
  const lastTooltipPosRef = useRef<{ left: number; top: number } | null>(null);
  const wasTooltipShownRef = useRef(false);
  const onTooltipHideCompleteRef = useRef(onTooltipHideComplete);
  const slideDirection = getTourSlideDirection(transitionIndex);

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
    const x = Math.max(0, anchorRect.x - holePaddingHorizontal);
    const y = Math.max(0, anchorRect.y - holePaddingTop + holeOffsetY);
    const width = Math.min(screenWidth, anchorRect.width + holePaddingHorizontal * 2);
    const height = Math.min(screenHeight, anchorRect.height + holePaddingTop + holePaddingBottom);
    return { x, y, width, height };
  }, [anchorRect, holeOffsetY, holePaddingBottom, holePaddingHorizontal, holePaddingTop, screenHeight, screenWidth]);

  const paddedSecondaryRect = useMemo(() => {
    if (!secondaryAnchorRect) return null;
    const x = Math.max(0, secondaryAnchorRect.x - holePaddingHorizontal);
    const y = Math.max(0, secondaryAnchorRect.y - holePaddingTop + holeOffsetY);
    const width = Math.min(screenWidth, secondaryAnchorRect.width + holePaddingHorizontal * 2);
    const height = Math.min(screenHeight, secondaryAnchorRect.height + holePaddingTop + holePaddingBottom);
    return { x, y, width, height };
  }, [holeOffsetY, holePaddingBottom, holePaddingHorizontal, holePaddingTop, screenHeight, screenWidth, secondaryAnchorRect]);

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
    secondaryText: { color: colors.textSecondary },
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
      lastTooltipPosRef.current = { left: nextLeft, top: nextTop };
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
      cancelAnimation(tooltipContentTranslateX);
      tooltipOpacity.value = 0;
      tooltipContentTranslateX.value = screenWidth;
      wasTooltipShownRef.current = false;
      if (wasShown) {
        notifyTooltipHideComplete();
      }
      return;
    }

    cancelAnimation(tooltipOpacity);
    cancelAnimation(tooltipContentTranslateX);

    if (shouldShowTooltip) {
      if (!wasTooltipShownRef.current) {
        tooltipOpacity.value = 0;
        tooltipContentTranslateX.value = screenWidth * slideDirection;
      }

      tooltipOpacity.value = withTiming(1, {
        duration: TOOLTIP_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      tooltipContentTranslateX.value = withTiming(0, {
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
    });
    tooltipContentTranslateX.value = withTiming(screenWidth * slideDirection, {
      duration: TOOLTIP_EXIT_DURATION_MS,
      easing: Easing.in(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(finalizeTooltipExit)();
      }
    });
  }, [finalizeTooltipExit, notifyTooltipHideComplete, screenWidth, shouldShowTooltip, slideDirection, tooltipContentTranslateX, tooltipOpacity, visible]);

  const highlightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateY: arrowAnim.value * ARROW_BOB_DISTANCE * (arrowPointsUp ? -1 : 1) }],
  }));

  const arrowTopAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateY: arrowAnim.value * ARROW_BOB_DISTANCE }],
  }));

  const arrowBottomAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateY: -arrowAnim.value * ARROW_BOB_DISTANCE }],
  }));

  const arrowLeftAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateX: arrowAnim.value * ARROW_BOB_DISTANCE }],
  }));

  const arrowRightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateX: -arrowAnim.value * ARROW_BOB_DISTANCE }],
  }));

  const tooltipPositionAnimatedStyle = useAnimatedStyle(() => ({
    left: tooltipLeft.value,
    top: tooltipTop.value,
  }));

  const tooltipContentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tooltipContentTranslateX.value }],
  }));

  const handlePrimaryPressIn = useCallback(() => {
    if (!primaryAction || primaryAction.disabled) return;
    primaryAction.onPressIn?.();
  }, [primaryAction]);

  const handlePrimaryPress = useCallback(() => {
    if (!primaryAction || primaryAction.disabled) return;
    primaryAction.onPress();
  }, [primaryAction]);

  const handlePrimaryPressOut = useCallback(() => {
    if (!primaryAction || primaryAction.disabled) return;
    primaryAction.onPressOut?.();
  }, [primaryAction]);

  const blockOutside = mode !== 'non_blocking';
  const shouldRestrictInteraction = allowAnchorInteraction
    && allowOnlyArrowTargetInteraction
    && Boolean(paddedArrowTargetRect);
  const allowHolePassthrough = allowAnchorInteraction && !shouldRestrictInteraction;
  const restrictedInteractionRect = shouldRestrictInteraction
    ? paddedArrowTargetRect
    : null;

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
          <View
            style={[
              styles.overlayBlock,
              { top: rect.y, left: 0, width: rect.x, height: rect.height },
            ]}
          />
          <View
            style={[
              styles.overlayBlock,
              {
                top: rect.y,
                left: rightLeft,
                width: Math.max(0, screenWidth - rightLeft),
                height: rect.height,
              },
            ]}
          />
        </>
      );
    };

    const renderHoleTouchBlockers = (rect: AnchorRect, index: number) => {
      const interactionRect = rect === paddedRect ? restrictedInteractionRect : null;
      if (!interactionRect) {
        return (
          <View
            key={`tour-hole-${index}`}
            testID={`tour-hole-blocker-${index}`}
            pointerEvents="auto"
            style={[
              styles.overlayBlock,
              { left: rect.x, top: rect.y, width: rect.width, height: rect.height },
            ]}
          />
        );
      }

      const interactionLeft = clamp(interactionRect.x, rect.x, rect.x + rect.width);
      const interactionTop = clamp(interactionRect.y, rect.y, rect.y + rect.height);
      const interactionRight = clamp(
        interactionRect.x + interactionRect.width,
        interactionLeft,
        rect.x + rect.width
      );
      const interactionBottom = clamp(
        interactionRect.y + interactionRect.height,
        interactionTop,
        rect.y + rect.height
      );
      const blockers = [
        {
          id: 'top',
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: interactionTop - rect.y,
        },
        {
          id: 'bottom',
          left: rect.x,
          top: interactionBottom,
          width: rect.width,
          height: rect.y + rect.height - interactionBottom,
        },
        {
          id: 'left',
          left: rect.x,
          top: interactionTop,
          width: interactionLeft - rect.x,
          height: interactionBottom - interactionTop,
        },
        {
          id: 'right',
          left: interactionRight,
          top: interactionTop,
          width: rect.x + rect.width - interactionRight,
          height: interactionBottom - interactionTop,
        },
      ].filter((blocker) => blocker.width > 0 && blocker.height > 0);

      return blockers.map((blocker) => (
        <Pressable
          key={`tour-hole-${index}-${blocker.id}`}
          testID={`tour-hole-blocker-${blocker.id}`}
          pointerEvents="auto"
          onPress={() => undefined}
          style={[
            styles.overlayBlock,
            {
              left: blocker.left,
              top: blocker.top,
              width: blocker.width,
              height: blocker.height,
            },
          ]}
        />
      ));
    };

    const firstHole = holes[0];
    const secondHole = holes[1];
    const firstBottom = firstHole.y + firstHole.height;
    const secondBottom = secondHole ? secondHole.y + secondHole.height : firstBottom;
    const spotlightPath = [
      `M 0 0 H ${screenWidth} V ${screenHeight} H 0 Z`,
      ...holes.map(roundedRectPath),
    ].join(' ');

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Svg
          testID="tour-spotlight-dim"
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.spotlightDim]}
          width={screenWidth}
          height={screenHeight}
        >
          <Path
            testID="tour-spotlight-path"
            d={spotlightPath}
            fill={TOUR_DIM_BACKGROUND}
            fillRule="evenodd"
          />
        </Svg>
        <View
          style={[
            styles.overlayBlock,
            { top: 0, left: 0, right: 0, height: firstHole.y },
          ]}
        />
        {renderSideBlocks(firstHole)}
        {secondHole ? (
          <>
            <View
              style={[
                styles.overlayBlock,
                {
                  top: firstBottom,
                  left: 0,
                  right: 0,
                  height: Math.max(0, secondHole.y - firstBottom),
                },
              ]}
            />
            {renderSideBlocks(secondHole)}
          </>
        ) : null}
        <View
          style={[
            styles.overlayBlock,
            {
              top: secondBottom,
              left: 0,
              right: 0,
              height: Math.max(0, screenHeight - secondBottom),
            },
          ]}
        />

        {holes.map((rect, index) => (
          <View
            key={`tour-spotlight-hole-${index}`}
            testID={`tour-spotlight-hole-${index}`}
            pointerEvents="none"
            style={[
              styles.spotlightGeometry,
              {
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
              },
            ]}
          />
        ))}

        {/* In blocking mode we still render the "hole", but we swallow touches over it. */}
        {!allowHolePassthrough && holes.map(renderHoleTouchBlockers)}
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

  const renderSingleDirectionalArrow = (direction: TourArrowDirection) => {
    if (!arrowRect) return null;
    const safeTop = insets.top + TOOLTIP_SIDE_MARGIN;
    const safeBottom = screenHeight - insets.bottom;
    const centerX = arrowRect.x + arrowRect.width / 2;
    const centerY = arrowRect.y + arrowRect.height / 2;

    if (direction === 'left' || direction === 'right') {
      const pointsRight = direction === 'left';
      const leftCandidate = pointsRight
        ? arrowRect.x - ARROW_GAP - ARROW_HEIGHT
        : arrowRect.x + arrowRect.width + ARROW_GAP;
      const left = clamp(leftCandidate, TOOLTIP_SIDE_MARGIN, screenWidth - TOOLTIP_SIDE_MARGIN - ARROW_HEIGHT);
      const top = clamp(centerY - ARROW_WIDTH / 2, safeTop, safeBottom - ARROW_WIDTH);
      const animatedStyle = pointsRight ? arrowLeftAnimatedStyle : arrowRightAnimatedStyle;

      return (
        <Animated.View
          key={direction}
          testID={`tour-arrow-${direction}`}
          style={[styles.arrowHorizontal, { left, top }, animatedStyle]}
          pointerEvents="none"
        >
          {pointsRight ? (
            <>
              <View style={[styles.arrowLineHorizontal, themedStyles.arrowLine]} />
              <View style={[styles.arrowHeadRight, { borderLeftColor: arrowColor ?? '#FFFFFF' }]} />
            </>
          ) : (
            <>
              <View style={[styles.arrowHeadLeft, { borderRightColor: arrowColor ?? '#FFFFFF' }]} />
              <View style={[styles.arrowLineHorizontal, themedStyles.arrowLine]} />
            </>
          )}
        </Animated.View>
      );
    }

    const pointsDown = direction === 'top';
    const left = clamp(centerX - ARROW_WIDTH / 2, TOOLTIP_SIDE_MARGIN, screenWidth - TOOLTIP_SIDE_MARGIN - ARROW_WIDTH);
    const topCandidate = pointsDown
      ? arrowRect.y - ARROW_GAP - ARROW_HEIGHT
      : arrowRect.y + arrowRect.height + ARROW_GAP;
    const top = clamp(topCandidate, safeTop, safeBottom - ARROW_HEIGHT);
    const animatedStyle = pointsDown ? arrowTopAnimatedStyle : arrowBottomAnimatedStyle;

    return (
      <Animated.View
        key={direction}
        testID={`tour-arrow-${direction}`}
        style={[styles.arrow, { left, top }, animatedStyle]}
        pointerEvents="none"
      >
        {pointsDown ? (
          <>
            <View style={[styles.arrowLine, themedStyles.arrowLine]} />
            <View style={[styles.arrowHead, themedStyles.arrow]} />
          </>
        ) : (
          <>
            <View style={[styles.arrowHeadUp, themedStyles.arrowUp]} />
            <View style={[styles.arrowLine, themedStyles.arrowLine]} />
          </>
        )}
      </Animated.View>
    );
  };

  const renderArrow = () => {
    if (!showArrow || !arrowRect) return null;
    if (arrowDirections?.length) {
      return arrowDirections.map(renderSingleDirectionalArrow);
    }
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
      {anchorAction && paddedRect ? (
        <Pressable
          testID="tour-anchor-action"
          accessibilityRole="button"
          accessibilityLabel={anchorAction.label}
          disabled={anchorAction.disabled}
          onPress={anchorAction.onPress}
          onLongPress={anchorAction.onLongPress}
          delayLongPress={anchorAction.delayLongPress}
          onPressIn={anchorAction.onPressIn}
          onPressOut={anchorAction.onPressOut}
          style={[
            styles.anchorAction,
            {
              left: anchorActionRect?.x ?? paddedRect.x,
              top: anchorActionRect?.y ?? paddedRect.y,
              width: anchorActionRect?.width ?? paddedRect.width,
              height: anchorActionRect?.height ?? paddedRect.height,
            },
          ]}
        />
      ) : null}
      {showHighlight ? renderHighlight(paddedRect) : null}
      {showHighlight ? renderHighlight(paddedSecondaryRect) : null}
      {renderArrow()}

      <Animated.View
        testID="tour-tooltip-shell"
        style={[
          styles.tooltipPosition,
          { width: tooltipWidth },
          tooltipPositionAnimatedStyle,
        ]}
        pointerEvents={shouldShowTooltip ? 'box-none' : 'none'}
        accessibilityElementsHidden={!shouldShowTooltip}
        importantForAccessibility={shouldShowTooltip ? 'auto' : 'no-hide-descendants'}
      >
        <View
          style={[styles.tooltip, themedStyles.tooltip]}
          pointerEvents="auto"
          accessibilityRole="alert"
          onLayout={(e) => {
            const nextHeight = e.nativeEvent.layout.height;
            if (tooltipHeight !== nextHeight) {
              setTooltipHeight(nextHeight);
            }
          }}
        >
          <Animated.View testID="tour-tooltip-content" style={tooltipContentAnimatedStyle}>
            <Text style={[styles.bodyText, themedStyles.bodyText]}>
              {boldPhrases.length === 0
                ? body
                : body.split(new RegExp(`(${boldPhrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi'))
                  .filter(Boolean)
                  .map((segment, index) => {
                    const shouldBold = boldPhrases.some((phrase) => phrase.toLowerCase() === segment.toLowerCase());
                    return (
                      <Text key={`${segment}-${index}`} style={shouldBold ? styles.bodyTextBold : undefined}>
                        {segment}
                      </Text>
                    );
                  })}
            </Text>

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
                onPress={handlePrimaryPress}
                onPressIn={handlePrimaryPressIn}
                onPressOut={handlePrimaryPressOut}
                disabled={primaryAction.disabled}
                hapticFeedback="selection"
                glow={false}
              >
                <Text style={[styles.primaryText, themedStyles.primaryText]}>{primaryAction.label}</Text>
              </GlassButton>
            ) : null}

            {secondaryAction ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={secondaryAction.label}
                disabled={secondaryAction.disabled}
                onPress={secondaryAction.onPress}
                style={[
                  styles.secondaryButton,
                  secondaryAction.disabled && styles.secondaryButtonDisabled,
                ]}
              >
                <Text style={[styles.secondaryText, themedStyles.secondaryText]}>
                  {secondaryAction.label}
                </Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );

  return overlayContent;
});

const styles = StyleSheet.create({
  spotlightDim: {
    zIndex: 0,
  },
  overlayBlock: {
    position: 'absolute',
    zIndex: 1,
  },
  spotlightGeometry: {
    position: 'absolute',
    borderRadius: HIGHLIGHT_RADIUS,
    zIndex: 2,
  },
  highlight: {
    position: 'absolute',
    borderRadius: HIGHLIGHT_RADIUS,
    borderWidth: HIGHLIGHT_BORDER,
    zIndex: 2,
  },
  anchorAction: {
    position: 'absolute',
    zIndex: 6,
  },
  tooltip: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
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
  bodyTextBold: {
    fontWeight: FontWeights.bold,
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
  secondaryButton: {
    alignSelf: 'center',
    minHeight: scale(40),
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryText: {
    fontSize: moderateScale(13),
    fontWeight: FontWeights.semibold,
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
  arrowHorizontal: {
    position: 'absolute',
    width: ARROW_HEIGHT,
    height: ARROW_WIDTH,
    flexDirection: 'row',
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
  arrowLineHorizontal: {
    width: ARROW_LINE_HEIGHT,
    height: scale(2),
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
  arrowHeadRight: {
    marginLeft: scale(2),
    width: 0,
    height: 0,
    borderTopWidth: ARROW_WIDTH / 2,
    borderBottomWidth: ARROW_WIDTH / 2,
    borderLeftWidth: ARROW_WIDTH * 0.6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  arrowHeadLeft: {
    marginRight: scale(2),
    width: 0,
    height: 0,
    borderTopWidth: ARROW_WIDTH / 2,
    borderBottomWidth: ARROW_WIDTH / 2,
    borderRightWidth: ARROW_WIDTH * 0.6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
