import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { usePostHog } from 'posthog-react-native';
import { GlassButton } from '@/components/GlassButton';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { scale, moderateScale } from '@/src/utils/responsive';
import { requestAIDataSharingConsent } from '@/src/services/aiConsentService';

const HORIZONTAL_PADDING = scale(24);
const PLACEHOLDER_TEXT_SIZE = moderateScale(16);

export default function StartScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { colors, isDark } = useTheme();

  const handleOpenAIChat = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const allowed = await requestAIDataSharingConsent();
    if (!allowed) return;
    posthog.capture('ai_chat_opened', { entry_point: 'start_tab' });
    router.push('/ai/chat');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>AI Coach</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ask Fortify Analyst about your recent training and get actionable next-step guidance.
          </Text>
          <GlassButton
            style={{
              ...styles.button,
              borderColor: isDark ? 'rgba(36, 36, 36, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            }}
            gradientColors={colors.contrastGradient as unknown as string[]}
            onPress={handleOpenAIChat}
            shadow={false}
          >
            <Text style={[styles.buttonText, { color: colors.accentForegroundOnFill }]}>Open AI Chat</Text>
          </GlassButton>
        </View>
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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: scale(16),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: PLACEHOLDER_TEXT_SIZE,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    maxWidth: scale(320),
  },
  button: {
    minWidth: scale(180),
  },
  buttonText: {
    fontWeight: '700',
    fontSize: moderateScale(15),
  },
});
