import { useEffect, useState, type ComponentType } from 'react';
import { View, Text, StyleSheet, Image, type ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { UserGroupIcon } from 'react-native-heroicons/solid';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { moderateScale, scale } from '@/src/utils/responsive';
import {
  trackOnboardingStepCompleted,
  useOnboardingFunnelScreen,
} from '@/src/services/onboardingAnalyticsService';

type ReferralSource =
  | 'tiktok'
  | 'app_store'
  | 'instagram'
  | 'youtube'
  | 'friend_family'
  | 'reddit'
  | 'google'
  | 'x'
  | 'facebook'
  | 'other';

const ICONS: Record<
Exclude<ReferralSource, 'friend_family'>,
ImageSourcePropType
> = {
  tiktok: require('../../assets/icons/social/tiktok.png'),
  app_store: require('../../assets/icons/social/apple.png'),
  instagram: require('../../assets/icons/social/instagram.png'),
  youtube: require('../../assets/icons/social/youtube.png'),
  reddit: require('../../assets/icons/social/reddit.png'),
  google: require('../../assets/icons/social/google.png'),
  x: require('../../assets/icons/social/x.png'),
  facebook: require('../../assets/icons/social/facebook.png'),
  other: require('../../assets/icons/social/other.png'),
};

type OptionIcon = ComponentType<{ color?: string; size?: number }>;

const OPTIONS: Array<{
  value: ReferralSource;
  label: string;
  icon?: ImageSourcePropType;
  IconComponent?: OptionIcon;
}> = [
  { value: 'tiktok', label: 'TikTok', icon: ICONS.tiktok },
  { value: 'app_store', label: 'App Store', icon: ICONS.app_store },
  { value: 'instagram', label: 'Instagram', icon: ICONS.instagram },
  { value: 'youtube', label: 'YouTube', icon: ICONS.youtube },
  { value: 'reddit', label: 'Reddit', icon: ICONS.reddit },
  { value: 'friend_family', label: 'Friend or family', IconComponent: UserGroupIcon },
  { value: 'google', label: 'Google', icon: ICONS.google },
  { value: 'x', label: 'X', icon: ICONS.x },
  { value: 'facebook', label: 'Facebook', icon: ICONS.facebook },
  { value: 'other', label: 'Other', icon: ICONS.other },
];

const VALID_REFERRAL_SOURCES = new Set<ReferralSource>(OPTIONS.map((option) => option.value));

function SourceOptionCard({
  label,
  icon,
  IconComponent,
  selected,
  onSelect,
}: {
  label: string;
  icon?: ImageSourcePropType;
  IconComponent?: OptionIcon;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();
  const iconWrapSize = scale(34);
  const iconSize = scale(22);
  const cardPadding = scale(Spacing.md);

  const cardStyle = {
    borderColor: selected ? colors.accent : colors.glassBorder,
    backgroundColor: colors.surfaceElevated,
  };

  const iconWrapStyle = {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  };

  const radioStyle = {
    borderColor: selected ? colors.accent : colors.textTertiary,
    backgroundColor: selected ? colors.accent : 'transparent',
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onSelect();
  };

  return (
    <GlassCard
      onPress={handlePress}
      padding={cardPadding}
      style={StyleSheet.flatten([styles.optionCard, cardStyle])}
      shellShadow={false}
    >
      <View style={styles.optionRow}>
        <View style={[styles.iconWrap, iconWrapStyle, { width: iconWrapSize, height: iconWrapSize }]}>
          {IconComponent ? (
            <IconComponent color={selected ? colors.accent : colors.textSecondary} size={iconSize} />
          ) : icon ? (
            <Image
              source={icon}
              style={{ width: iconSize, height: iconSize, borderRadius: Math.round(iconSize * 0.2) }}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <Text
          style={[styles.optionLabel, { color: colors.textPrimary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {label}
        </Text>
        <View style={[styles.radio, radioStyle]} />
      </View>
    </GlassCard>
  );
}

export default function OnboardingSourceScreen() {
  useOnboardingFunnelScreen('Q6. How did you hear about us?');

  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<ReferralSource | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.heard_about) return;
      if (VALID_REFERRAL_SOURCES.has(state.heard_about as ReferralSource)) {
        setSelected(state.heard_about as ReferralSource);
      }
    };

    loadState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelect = (value: ReferralSource) => {
    setSelected(value);
    void updateOnboardingState({ heard_about: value });
  };

  const handleContinue = () => {
    if (!selected) return;
    trackOnboardingStepCompleted('referral_source', {
      heard_about: selected,
    });
    router.push('/onboarding/thank-you');
  };

  return (
    <OnboardingScreen
      step={23}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Where did you hear about Fortify?"
      subtitle={undefined}
      onBack={() => router.back()}
      contentGap={Spacing.lg}
      floatingFooter={
        selected ? (
          <GlassButton
            style={styles.floatingButton}
            onPress={handleContinue}
            hapticFeedback="impactMedium"
          >
            <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Continue</Text>
          </GlassButton>
        ) : null
      }
    >
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <SourceOptionCard
            key={option.value}
            label={option.label}
            icon={option.icon}
            IconComponent={option.IconComponent}
            selected={selected === option.value}
            onSelect={() => handleSelect(option.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: Spacing.sm,
  },
  optionCard: {
    width: '100%',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 0,
  },
  optionLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: moderateScale(16),
    letterSpacing: moderateScale(0.6),
  },
  radio: {
    width: scale(18),
    height: scale(18),
    borderRadius: BorderRadius.full,
    borderWidth: Math.max(1, scale(2)),
  },
  floatingButton: {
    height: 54,
    borderRadius: BorderRadius.xl,
    width: '100%',
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
