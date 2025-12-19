import { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
  Line,
  G,
  RadialGradient,
  Rect,
  Pattern,
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedSvgLinearGradient = Animated.createAnimatedComponent(SvgLinearGradient);

// Stainless Steel Diagonal Pattern
function StainlessSteelPattern() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Base gradient */}
      <LinearGradient
        colors={['#000000', '#0f0f10', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Defs>
          <Pattern id="slashPattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <Line
              x1="3"
              y1="9"
              x2="9"
              y2="3"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <Line
              x1="15"
              y1="15"
              x2="21"
              y2="21"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Pattern>

          {/* Vignette */}
          <RadialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
          </RadialGradient>
        </Defs>

        {/* Stainless diagonal slash overlay */}
        <Rect width="100%" height="100%" fill="url(#slashPattern)" opacity={0.18} />

        {/* Brushed metal texture - horizontal grain */}
        <G opacity={0.12}>
          {Array.from({ length: Math.ceil(height / 2) }).map((_, i) => (
            <Line
              key={`h-${i}`}
              x1={0}
              y1={i * 2}
              x2={width}
              y2={i * 2}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
          ))}
        </G>

        {/* Vignette overlay */}
        <Rect width={width} height={height} fill="url(#vignette)" />
      </Svg>

      {/* Subtle corner vignette */}
      <LinearGradient
        colors={["transparent", 'rgba(0,0,0,0.14)']}
        start={{ x: 0.2, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
    </View>
  );
}

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
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
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
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        transform: [{ translateY }],
        opacity,
      }}
    />
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const shineX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [320, -320],
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
        size: 1 + Math.random() * 3,
      })),
    []
  );

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

    const shineLoop = Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    shineLoop.start();

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => {
      clearTimeout(timer);
      shineLoop.stop();
    };
  }, [fadeAnim, scaleAnim, router, shineAnim]);

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
        <Svg height="120" width="320" viewBox="0 0 320 120">
          <Defs>
            <AnimatedSvgLinearGradient
              id="textGradient"
              x1={shineX}
              y1="0"
              x2={Animated.add(shineX, 320)}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor="#4ade80" />
              <Stop offset="30%" stopColor="#22c55e" />
              <Stop offset="45%" stopColor="#86efac" />
              <Stop offset="50%" stopColor="#ffffff" />
              <Stop offset="55%" stopColor="#86efac" />
              <Stop offset="70%" stopColor="#22c55e" />
              <Stop offset="100%" stopColor="#4ade80" />
            </AnimatedSvgLinearGradient>
          </Defs>
          <SvgText
            fill="url(#textGradient)"
            fontSize="38"
            fontWeight="900"
            letterSpacing="6"
            x="160"
            y="70"
            textAnchor="middle"
            fontFamily="BankGothicMediumBT, sans-serif"
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
    backgroundColor: '#000000',
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
