import { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { scale } from '@/src/utils/responsive';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedSvgLinearGradient = Animated.createAnimatedComponent(SvgLinearGradient);
const LOGO_VIEWBOX_WIDTH = 320;
const LOGO_VIEWBOX_HEIGHT = 120;
const LOGO_WIDTH = scale(LOGO_VIEWBOX_WIDTH);
const LOGO_HEIGHT = scale(LOGO_VIEWBOX_HEIGHT);
const SHINE_RANGE = LOGO_VIEWBOX_WIDTH;
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const shineX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHINE_RANGE, SHINE_RANGE],
  });

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
    if (splashComplete && !isLoading) {
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
  }, [splashComplete, isLoading, isAuthenticated, needsOnboarding, router]);

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Single pass shine animation
    Animated.timing(shineAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Mark splash as complete after one full animation pass
    const timer = setTimeout(() => {
      setSplashComplete(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [fadeAnim, scaleAnim, shineAnim]);

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
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Svg height={LOGO_HEIGHT} width={LOGO_WIDTH} viewBox={`0 0 ${LOGO_VIEWBOX_WIDTH} ${LOGO_VIEWBOX_HEIGHT}`}>
          <Defs>
            <AnimatedSvgLinearGradient
              id="textGradient"
              x1={shineX}
              y1="0"
              x2={Animated.add(shineX, SHINE_RANGE)}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor={colors.accentLight} />
              <Stop offset="30%" stopColor={colors.accent} />
              <Stop offset="45%" stopColor={colors.accentLight} />
              <Stop offset="50%" stopColor="#ffffff" />
              <Stop offset="55%" stopColor={colors.accentLight} />
              <Stop offset="70%" stopColor={colors.accent} />
              <Stop offset="100%" stopColor={colors.accentLight} />
            </AnimatedSvgLinearGradient>
          </Defs>
          <SvgText
            fill="url(#textGradient)"
            fontSize={38}
            fontWeight="900"
            letterSpacing={12}
            x="160"
            y="70"
            textAnchor="middle"
            fontFamily="BankGothicBT-Medium, sans-serif"
          >
            FORTIS
          </SvgText>
        </Svg>
      </Animated.View>
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
