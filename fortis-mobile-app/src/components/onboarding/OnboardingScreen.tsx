import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Sizes';
import { moderateScale, responsiveValue, scale } from '@/src/utils/responsive';
import { OnboardingProgressBar } from '@/src/components/onboarding/OnboardingProgressBar';

interface OnboardingScreenProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  hideTitle?: boolean;
  bodyAlign?: 'top' | 'center';
  contentGap?: number;
  titlePlacement?: 'top' | 'bottom';
  titleTopOffset?: number;
  titleAlign?: 'left' | 'center';
  subtitleAlign?: 'left' | 'center';
  titleFontSize?: number;
  titleNumberOfLines?: number;
  titleAdjustsFontSizeToFit?: boolean;
  titleMinimumFontScale?: number;
  headerAccessory?: React.ReactNode;
  sectionLabel?: string;
  onBack?: () => void;
  scrollEnabled?: boolean;
  useScrollView?: boolean;
  showProgress?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function OnboardingScreen({
  step,
  totalSteps,
  title,
  subtitle,
  hideTitle = false,
  bodyAlign = 'top',
  contentGap = Spacing['2xl'],
  titlePlacement = 'top',
  titleTopOffset = 0,
  titleAlign = 'left',
  subtitleAlign = 'left',
  titleFontSize,
  titleNumberOfLines,
  titleAdjustsFontSizeToFit,
  titleMinimumFontScale,
  headerAccessory,
  sectionLabel,
  onBack,
  scrollEnabled = true,
  useScrollView = true,
  showProgress = true,
  children,
  footer,
}: OnboardingScreenProps) {
  const { colors } = useTheme();
  const maxWidth = responsiveValue(360, 420, 480);
  const horizontalPadding = scale(Spacing['2xl']);
  const resolvedGap = scale(contentGap);
  const resolvedTitleOffset = titleTopOffset ? scale(titleTopOffset) : 0;
  const resolvedTitleFontSize = typeof titleFontSize === 'number'
    ? moderateScale(titleFontSize)
    : undefined;

  const themedStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.textPrimary, textAlign: titleAlign },
    subtitle: { color: colors.textSecondary, textAlign: subtitleAlign },
    sectionLabel: { color: colors.textTertiary },
    backButton: {
      backgroundColor: colors.glassBackground,
      borderColor: colors.glassBorder,
    },
    safeArea: {
      width: '100%',
      maxWidth,
      alignSelf: 'center',
      paddingHorizontal: horizontalPadding,
    },
  };

  const titleBlock = hideTitle ? null : (
    <View style={[styles.titleBlock, resolvedTitleOffset ? { marginTop: resolvedTitleOffset } : null]}>
      <Text
        style={[
          styles.title,
          themedStyles.title,
          resolvedTitleFontSize !== undefined ? { fontSize: resolvedTitleFontSize } : null,
        ]}
        numberOfLines={titleNumberOfLines}
        adjustsFontSizeToFit={titleAdjustsFontSizeToFit}
        minimumFontScale={titleMinimumFontScale}
      >
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, themedStyles.subtitle]}>{subtitle}</Text>
      )}
    </View>
  );

  const bodyStyle = bodyAlign === 'center'
    ? [styles.bodySection, styles.bodySectionCentered]
    : styles.bodySection;

  const contentBlockStyle = bodyAlign === 'center'
    ? [styles.contentBlock, styles.contentBlockFill, { gap: resolvedGap }]
    : [styles.contentBlock, { gap: resolvedGap }];

  const footerBlock = footer || (titlePlacement === 'bottom' && !hideTitle)
    ? (
        <View style={styles.footer}>
          <View style={styles.footerStack}>
            {titlePlacement === 'bottom' ? titleBlock : null}
            {footer}
          </View>
        </View>
      )
    : null;

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={[styles.safeArea, themedStyles.safeArea]} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.backButton, themedStyles.backButton, !onBack && styles.backButtonHidden]}
            onPress={() => {
              if (!onBack) return;
              Haptics.selectionAsync();
              onBack();
            }}
            disabled={!onBack}
            hitSlop={8}
          >
            <ChevronLeftIcon size={18} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          {showProgress ? (
            <View style={styles.progressWrapper}>
              <OnboardingProgressBar step={step} totalSteps={totalSteps} />
            </View>
          ) : (
            <View style={styles.progressSpacer} />
          )}
          <View style={styles.headerSpacer} />
        </View>

        {useScrollView ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            keyboardShouldPersistTaps="handled"
          >
            <View style={contentBlockStyle}>
              <View style={styles.topSection}>
                {headerAccessory ? (
                  <View style={styles.headerAccessory}>{headerAccessory}</View>
                ) : null}
                {sectionLabel && (
                  <Text style={[styles.sectionLabel, themedStyles.sectionLabel]}>
                    {sectionLabel}
                  </Text>
                )}
                {titlePlacement === 'top' ? titleBlock : null}
              </View>

              <View style={bodyStyle}>{children}</View>
            </View>

            {footerBlock}
          </ScrollView>
        ) : (
          <View style={styles.staticContent}>
          <View style={contentBlockStyle}>
            <View style={styles.topSection}>
              {headerAccessory ? (
                <View style={styles.headerAccessory}>{headerAccessory}</View>
              ) : null}
              {sectionLabel && (
                <Text style={[styles.sectionLabel, themedStyles.sectionLabel]}>
                  {sectionLabel}
                </Text>
              )}
              {titlePlacement === 'top' ? titleBlock : null}
              </View>

              <View style={bodyStyle}>{children}</View>
            </View>

            {footerBlock}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  progressWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  progressSpacer: {
    flex: 1,
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonHidden: {
    opacity: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['3xl'],
    justifyContent: 'space-between',
  },
  staticContent: {
    flex: 1,
    paddingBottom: Spacing['3xl'],
    justifyContent: 'space-between',
  },
  contentBlock: {
  },
  contentBlockFill: {
    flex: 1,
  },
  topSection: {
    gap: Spacing.sm,
  },
  titleBlock: {
    gap: Spacing.xs,
  },
  headerAccessory: {
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...Typography.bodyLarge,
  },
  bodySection: {
    gap: Spacing.md,
  },
  bodySectionCentered: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingTop: Spacing.lg,
  },
  footerStack: {
    gap: Spacing.lg,
  },
});
