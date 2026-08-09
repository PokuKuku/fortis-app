import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getAccentPalette } from '@/src/utils/accentColors';

type FrostSnowflakeIconProps = {
  size?: number;
};

export function FrostSnowflakeIcon({ size = 40 }: FrostSnowflakeIconProps) {
  const { isDark } = useTheme();
  const frost = getAccentPalette('slate', isDark);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <LinearGradient id="frostSnowflakeGradient" x1="10" y1="7" x2="38" y2="41">
          <Stop offset="0" stopColor={frost.light} />
          <Stop offset="0.55" stopColor={frost.base} />
          <Stop offset="1" stopColor={frost.dark} />
        </LinearGradient>
      </Defs>
      <G
        stroke="url(#frostSnowflakeGradient)"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M24 5v38M7.5 14.5l33 19M40.5 14.5l-33 19" />
        <Path d="m19 9 5 5 5-5M19 39l5-5 5 5" />
        <Path d="m9.7 21.5 6.8-1.8-1.8-6.7M38.3 26.5l-6.8 1.8 1.8 6.7" />
        <Path d="m33.3 13-1.8 6.7 6.8 1.8M14.7 35l1.8-6.7-6.8-1.8" />
      </G>
    </Svg>
  );
}
