import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/src/lib/supabase';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Sizes';

const extractAuthParam = (url: string, key: string) => {
  try {
    const parsedUrl = new URL(url);
    const fragmentParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(parsedUrl.search);
    return fragmentParams.get(key) ?? queryParams.get(key);
  } catch {
    return null;
  }
};

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const handledRef = useRef(false);

  const themedStyles = {
    container: { backgroundColor: colors.background },
    card: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.7)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    title: { color: colors.textPrimary },
    message: { color: colors.textSecondary },
    error: { color: colors.error },
    buttonText: { color: colors.textPrimary },
  };

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url || handledRef.current) return;
      handledRef.current = true;

      setIsProcessing(true);
      const errorMessage =
        extractAuthParam(url, 'error_description') || extractAuthParam(url, 'error');
      if (errorMessage) {
        setError(decodeURIComponent(errorMessage));
        setIsProcessing(false);
        return;
      }

      const accessToken = extractAuthParam(url, 'access_token');
      const refreshToken = extractAuthParam(url, 'refresh_token');

      if (!accessToken || !refreshToken) {
        setError('Missing sign-in tokens. Please try again.');
        setIsProcessing(false);
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        setError(sessionError.message);
        setIsProcessing(false);
        return;
      }

      router.replace('/');
    };

    const init = async () => {
      const initialUrl = await Linking.getInitialURL();
      await handleUrl(initialUrl);
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    init();

    return () => {
      subscription.remove();
    };
  }, [router]);

  const handleBackToAuth = () => {
    router.replace('/auth');
  };

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={[styles.card, themedStyles.card]}>
            <Text style={[styles.title, themedStyles.title]}>
              {error ? 'Sign-in failed' : 'Finishing sign-in'}
            </Text>
            <Text style={[styles.message, error ? themedStyles.error : themedStyles.message]}>
              {error ?? 'Hang tight while we verify your email.'}
            </Text>
            {isProcessing && !error && (
              <ActivityIndicator color={colors.textPrimary} />
            )}
            {error && (
              <GlassButton style={styles.button} onPress={handleBackToAuth}>
                <Text style={[styles.buttonText, themedStyles.buttonText]}>
                  Back to sign in
                </Text>
              </GlassButton>
            )}
          </View>
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
    paddingHorizontal: Spacing['2xl'],
  },
  card: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing['2xl'],
    gap: Spacing.md,
  },
  title: {
    ...Typography.h2,
  },
  message: {
    ...Typography.body,
  },
  button: {
    marginTop: Spacing.md,
    height: 44,
    borderRadius: 22,
  },
  buttonText: {
    ...Typography.button,
  },
});
