import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from 'react-native';

type ActionProgressLabelProps = {
  label: string;
  color: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export function ActionProgressLabel({
  label,
  color,
  style,
  accessibilityLabel = label,
}: ActionProgressLabelProps) {
  const opacity = useRef(new Animated.Value(0.58)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 560, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.58, duration: 560, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.Text
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
      style={[styles.label, style, { color, opacity }]}
    >
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
  },
});
