import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';

export default function BootScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isLoading, isAuthenticated, needsOnboarding } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && needsOnboarding) {
      router.replace('/onboarding/welcome');
      return;
    }

    if (isAuthenticated) {
      router.replace('/(tabs)');
      return;
    }

    router.replace('/onboarding/welcome');
  }, [isLoading, isAuthenticated, needsOnboarding, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <ActivityIndicator size="small" color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

