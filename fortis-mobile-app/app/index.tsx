import { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { scale } from '@/src/utils/responsive';

const { width, height } = Dimensions.get('window');
const PARTICLE_TRAVEL_Y = scale(120);

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
  const { isLoading, isAuthenticated, needsOnboarding } = useAuth();
  const [splashComplete, setSplashComplete] = useState(false);

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

  // Handle navigation when both splash is complete and auth is loaded
  // Flow: Auth → Onboarding (if needed) → Main App
  useEffect(() => {
    if (splashComplete) {
      if (!isAuthenticated) {
        // Not signed in - go to auth first
        router.replace('/auth');
      } else if (needsOnboarding) {
        // Signed in but hasn't completed onboarding
        router.replace('/onboarding');
      } else {
        // Signed in and onboarding complete - go to main app
        router.replace('/(tabs)');
      }
    }
  }, [splashComplete, isAuthenticated, needsOnboarding, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashComplete(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <View style={styles.container}>
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
        <AnimatedLogo size="large" centered shineDurationMs={1500} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
