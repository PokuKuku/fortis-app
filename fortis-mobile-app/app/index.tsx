import { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { scale } from '@/src/utils/responsive';

const PARTICLE_TRAVEL_Y = scale(120);
type StartupRoute = '/onboarding/welcome' | '/onboarding' | '/paywall-gate';

const resolveStartupRoute = ({
  isAuthenticated,
  needsOnboarding,
  hasProfile,
}: {
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  hasProfile: boolean;
}): StartupRoute => {
  if (!isAuthenticated) {
    return '/onboarding/welcome';
  }

  if (!hasProfile || needsOnboarding) {
    return '/onboarding';
  }

  return '/paywall-gate';
};

// Floating Particle
function FloatingParticle({
  delay,
  duration,
  left,
  top,
  size,
}: {
  delay: number;
  duration: number;
  left: number;
  top: number;
  size: number;
}) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -PARTICLE_TRAVEL_Y,
          duration: duration * 1000,
          delay: delay * 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: (duration * 1000) / 2,
            delay: delay * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: (duration * 1000) / 2,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, [delay, duration, translateY, opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        borderRadius: 100,
        backgroundColor: colors.accentOverlay,
        transform: [{ translateY }],
        opacity,
      }}
    />
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthResolved, isAuthenticated, needsOnboarding, profile, profileResolved } = useAuth();
  const splashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasNavigatedRef = useRef(false);
  const [minDelayPassed, setMinDelayPassed] = useState(false);

  // Generate 15 particles
  const particles = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 5,
        size: scale(1 + Math.random() * 3),
      })),
    []
  );

  useEffect(() => {
    splashTimeoutRef.current = setTimeout(() => {
      setMinDelayPassed(true);
    }, 1300);

    return () => {
      if (splashTimeoutRef.current) {
        clearTimeout(splashTimeoutRef.current);
        splashTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const profileStateReady = !isAuthenticated || profileResolved;
    if (!minDelayPassed || !isAuthResolved || !profileStateReady || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;
    const nextRoute = resolveStartupRoute({
      isAuthenticated,
      needsOnboarding,
      hasProfile: Boolean(profile),
    });
    router.replace(nextRoute);
  }, [minDelayPassed, isAuthResolved, isAuthenticated, needsOnboarding, profile, profileResolved, router]);

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stainless Steel Background */}
      <StainlessSteelPattern />

      {/* Particles */}
      <View style={styles.particleContainer}>
        {particles.map((p) => (
          <FloatingParticle
            key={p.id}
            delay={p.delay}
            duration={p.duration}
            left={p.left}
            top={p.top}
            size={p.size}
          />
        ))}
      </View>

      {/* FORTIS Text */}
      <View style={styles.logoContainer}>
        <AnimatedLogo size="large" centered shineDurationMs={1300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  logoContainer: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
