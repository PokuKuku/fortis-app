import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { scale } from '@/src/utils/responsive';

const SHOW_APP_HEADER_BRAND = false;

type AppHeaderBrandProps = {
  style?: StyleProp<ViewStyle>;
};

export function AppHeaderBrand({ style }: AppHeaderBrandProps) {
  if (!SHOW_APP_HEADER_BRAND) {
    return <View pointerEvents="none" style={[style, styles.hiddenSpacer]} />;
  }

  return (
    <View style={style}>
      <AnimatedLogo />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenSpacer: {
    marginBottom: scale(8),
  },
});
