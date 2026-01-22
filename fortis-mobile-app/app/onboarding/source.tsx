import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, type ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { TOTAL_ONBOARDING_STEPS } from '@/src/constants/onboarding';
import { getOnboardingState, updateOnboardingState } from '@/src/utils/onboardingState';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { moderateScale, scale } from '@/src/utils/responsive';

type ReferralSource =
  | 'tiktok'
  | 'app_store'
  | 'instagram'
  | 'youtube'
  | 'friend_family'
  | 'google'
  | 'x'
  | 'tv'
  | 'facebook'
  | 'other';

const ICONS: Record<
ReferralSource,
ImageSourcePropType
> = {
  tiktok: require('../../assets/icons/social/tiktok.png'),
  app_store: require('../../assets/icons/social/apple.png'),
  instagram: require('../../assets/icons/social/instagram.png'),
  youtube: require('../../assets/icons/social/youtube.png'),
  friend_family: require('../../assets/icons/social/messenger.png'),
  google: require('../../assets/icons/social/google.png'),
  x: require('../../assets/icons/social/x.png'),
  tv: require('../../assets/icons/social/twitch.png'),
  facebook: require('../../assets/icons/social/facebook.png'),
  other: require('../../assets/icons/social/figma.png'),
};

const OPTIONS: Array<{ value: ReferralSource; label: string; icon: ImageSourcePropType }> = [
  { value: 'tiktok', label: 'TikTok', icon: ICONS.tiktok },
  { value: 'app_store', label: 'App Store', icon: ICONS.app_store },
  { value: 'instagram', label: 'Instagram', icon: ICONS.instagram },
  { value: 'youtube', label: 'YouTube', icon: ICONS.youtube },
  { value: 'friend_family', label: 'Friend or family', icon: ICONS.friend_family },
  { value: 'google', label: 'Google', icon: ICONS.google },
  { value: 'x', label: 'X', icon: ICONS.x },
  { value: 'tv', label: 'TV', icon: ICONS.tv },
  { value: 'facebook', label: 'Facebook', icon: ICONS.facebook },
  { value: 'other', label: 'Other', icon: ICONS.other },
];

function SourceOptionCard({
  label,
  icon,
  selected,
  onSelect,
}: {
  label: string;
  icon: ImageSourcePropType;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors, isDark } = useTheme();
  const iconSize = scale(18);
  const iconWrapSize = scale(38);
  const cardPadding = scale(Spacing.md);

  const cardStyle = {
    borderColor: selected ? colors.accent : colors.glassBorder,
    backgroundColor: colors.surfaceElevated,
  };

  const iconWrapStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.04)',
    borderColor: selected ? colors.accentBorder : colors.glassBorder,
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
    <GlassCard onPress={handlePress} padding={cardPadding} style={[styles.optionCard, cardStyle]}>
      <View style={styles.optionRow}>
        <View style={[styles.iconWrap, iconWrapStyle, { width: iconWrapSize, height: iconWrapSize }]}>
          <Image source={icon} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
        </View>
        <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>{label}</Text>
        <View style={[styles.radio, radioStyle]} />
      </View>
    </GlassCard>
  );
}

export default function OnboardingSourceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<ReferralSource | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await getOnboardingState();
      if (!isActive || !state?.heard_about) return;
      setSelected(state.heard_about);
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
    router.push('/onboarding/fitness-background');
  };

  return (
    <OnboardingScreen
      step={5}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Where did you hear about Fortis?"
      subtitle={undefined}
      onBack={() => router.back()}
      contentGap={Spacing.lg}
      footer={
        <GlassButton
          style={styles.button}
          onPress={handleContinue}
          disabled={!selected}
          hapticFeedback="impactMedium"
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>Continue</Text>
        </GlassButton>
      }
    >
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <SourceOptionCard
            key={option.value}
            label={option.label}
            icon={option.icon}
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
    borderWidth: 1,
  },
  optionLabel: {
    flex: 1,
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
  button: {
    height: 54,
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 17,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
