import { useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import type { ComponentType } from 'react';

interface OnboardingDemoVideoProps {
  sourceModule: number;
  height: number;
}

export function OnboardingDemoVideo({ sourceModule, height }: OnboardingDemoVideoProps) {
  const [width, setWidth] = useState(0);
  const expoAv = useMemo(() => {
    try {
      // `expo-av` requires native module `ExponentAV` which may not exist until the dev client is rebuilt.
      // We require it lazily to avoid crashing the route module on import.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('expo-av') as {
        Video: ComponentType<any>;
        ResizeMode: { CONTAIN: string };
      };
    } catch {
      return null;
    }
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.max(0, Math.floor(event.nativeEvent.layout.width));
    if (nextWidth !== width) setWidth(nextWidth);
  };

  if (!expoAv) {
    return <View style={[styles.container, { height }]} onLayout={onLayout} />;
  }

  const { Video, ResizeMode } = expoAv;

  return (
    <View style={[styles.container, { height }]} onLayout={onLayout}>
      {width > 0 ? (
        <Video
          source={sourceModule}
          shouldPlay
          isLooping
          isMuted
          resizeMode={ResizeMode.CONTAIN}
          style={{ width, height }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
