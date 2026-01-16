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
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Sizes';
import { OnboardingProgressBar } from '@/src/components/onboarding/OnboardingProgressBar';

interface OnboardingScreenProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  sectionLabel?: string;
  onBack?: () => void;
  scrollEnabled?: boolean;
  useScrollView?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function OnboardingScreen({
  step,
  totalSteps,
  title,
  subtitle,
  sectionLabel,
  onBack,
  scrollEnabled = true,
  useScrollView = true,
  children,
  footer,
}: OnboardingScreenProps) {
  const { colors } = useTheme();

  const themedStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    sectionLabel: { color: colors.textTertiary },
    backButton: {
      backgroundColor: colors.glassBackground,
      borderColor: colors.glassBorder,
    },
  };

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.backButton, themedStyles.backButton, !onBack && styles.backButtonHidden]}
            onPress={onBack}
            disabled={!onBack}
            hitSlop={8}
          >
            <ChevronLeftIcon size={18} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <OnboardingProgressBar step={step} totalSteps={totalSteps} />
        </View>

        {useScrollView ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentBlock}>
              <View style={styles.topSection}>
                {sectionLabel && (
                  <Text style={[styles.sectionLabel, themedStyles.sectionLabel]}>
                    {sectionLabel}
                  </Text>
                )}
                <Text style={[styles.title, themedStyles.title]}>{title}</Text>
                {subtitle && (
                  <Text style={[styles.subtitle, themedStyles.subtitle]}>{subtitle}</Text>
                )}
              </View>

              <View style={styles.bodySection}>{children}</View>
            </View>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </ScrollView>
        ) : (
          <View style={styles.staticContent}>
            <View style={styles.contentBlock}>
              <View style={styles.topSection}>
                {sectionLabel && (
                  <Text style={[styles.sectionLabel, themedStyles.sectionLabel]}>
                    {sectionLabel}
                  </Text>
                )}
                <Text style={[styles.title, themedStyles.title]}>{title}</Text>
                {subtitle && (
                  <Text style={[styles.subtitle, themedStyles.subtitle]}>{subtitle}</Text>
                )}
              </View>

              <View style={styles.bodySection}>{children}</View>
            </View>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
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
    gap: Spacing['2xl'],
  },
  topSection: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...Typography.body,
  },
  bodySection: {
    gap: Spacing.md,
  },
  footer: {
    paddingTop: Spacing.lg,
  },
});
