import { useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import { GlassButton } from '@/components/GlassButton';
import { BorderRadius, FontWeights, Spacing } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';

export type AnchorRect = { x: number; y: number; width: number; height: number };

export type TourOverlayMode = 'blocking' | 'spotlight' | 'non_blocking';

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
};

const SCREEN = Dimensions.get('window');
const TOOLTIP_MAX_WIDTH = scale(340);
const TOOLTIP_SIDE_MARGIN = scale(18);
const TOOLTIP_GAP = scale(12);
const HOLE_PADDING = scale(10);
const HIGHLIGHT_RADIUS = scale(16);
const HIGHLIGHT_BORDER = scale(2);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function TourOverlay({
  visible,
  mode,
  anchorRect,
  body,
  stepLabel,
  primaryAction,
  onSkip,
}: TourOverlayProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [tooltipHeight, setTooltipHeight] = useState<number | null>(null);

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

    if (!paddedRect || !tooltipHeight) {
      return {
        left: TOOLTIP_SIDE_MARGIN,
        top: clamp(safeBottom - (tooltipHeight ?? 0), safeTop, safeBottom),
      };
    }

    const centerX = paddedRect.x + paddedRect.width / 2;
    const left = clamp(centerX - tooltipWidth / 2, TOOLTIP_SIDE_MARGIN, SCREEN.width - TOOLTIP_SIDE_MARGIN - tooltipWidth);

    const aboveTop = paddedRect.y - TOOLTIP_GAP - tooltipHeight;
    const belowTop = paddedRect.y + paddedRect.height + TOOLTIP_GAP;
    const canFitAbove = aboveTop >= safeTop;

    const topCandidate = canFitAbove ? aboveTop : belowTop;
    const top = clamp(topCandidate, safeTop, safeBottom - tooltipHeight);

    return { left, top };
  }, [insets.bottom, insets.top, paddedRect, tooltipHeight, tooltipWidth]);

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
  };

  if (!visible) return null;

  const blockOutside = mode !== 'non_blocking';
  const allowHolePassthrough = mode === 'spotlight';

  const renderBlockingOverlay = () => {
    if (!blockOutside) return null;

    // When the anchor isn't available yet, block the whole screen to avoid accidental taps.
    if (!paddedRect) {
      return <View style={[StyleSheet.absoluteFill, themedStyles.overlay]} pointerEvents="auto" />;
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
      <View
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
        ]}
      />
    );
  };

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {renderBlockingOverlay()}
        {renderHighlight()}

        <View
          style={[
            styles.tooltip,
            themedStyles.tooltip,
            { width: tooltipWidth, left: tooltipPos.left, top: tooltipPos.top },
          ]}
          onLayout={(e) => {
            const nextHeight = e.nativeEvent.layout.height;
            if (tooltipHeight !== nextHeight) {
              setTooltipHeight(nextHeight);
            }
          }}
          pointerEvents="auto"
        >
          <View style={styles.tooltipHeader}>
            <Text style={[styles.stepText, themedStyles.stepText]}>{stepLabel ?? ''}</Text>
            {onSkip && (
              <Pressable onPress={onSkip} hitSlop={8}>
                <Text style={[styles.skipText, themedStyles.skipText]}>Skip</Text>
              </Pressable>
            )}
          </View>

          <Text style={[styles.bodyText, themedStyles.bodyText]}>{body}</Text>

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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayBlock: {
    position: 'absolute',
  },
  highlight: {
    position: 'absolute',
    borderRadius: HIGHLIGHT_RADIUS,
    borderWidth: HIGHLIGHT_BORDER,
  },
  tooltip: {
    position: 'absolute',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
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
});
