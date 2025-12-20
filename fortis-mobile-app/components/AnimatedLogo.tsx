/**
 * AnimatedLogo.tsx
 * 
 * FORTIS logo with animated metallic shine effect.
 * Uses SVG LinearGradient animation to create a continuous sweeping shine.
 */
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

const AnimatedSvgLinearGradient = Animated.createAnimatedComponent(SvgLinearGradient);

export function AnimatedLogo() {
  const shineAnim = useRef(new Animated.Value(0)).current;
  
  const shineX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-160, 160],
  });

  useEffect(() => {
    const shineLoop = Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      })
    );
    shineLoop.start();

    return () => {
      shineLoop.stop();
    };
  }, [shineAnim]);

  return (
    <View style={styles.container}>
      <Svg height="32" width="160" viewBox="0 0 160 32">
        <Defs>
          <AnimatedSvgLinearGradient
            id="textGradient"
            x1={shineX}
            y1="0"
            x2={Animated.add(shineX, 160)}
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
          fontSize="20"
          fontWeight="900"
          letterSpacing="6"
          x="0"
          y="24"
          textAnchor="start"
          fontFamily="BankGothicBT-Medium"
        >
          FORTIS
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
});
