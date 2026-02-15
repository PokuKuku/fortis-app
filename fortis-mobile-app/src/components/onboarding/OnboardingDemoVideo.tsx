import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, AppState, type AppStateStatus } from 'react-native';
import type { ComponentType } from 'react';
import { useIsFocused } from '@react-navigation/native';

interface OnboardingDemoVideoProps {
  sourceModule: number;
  height: number;
}

export function OnboardingDemoVideo({ sourceModule, height }: OnboardingDemoVideoProps) {
  const [player, setPlayer] = useState<any>(null);
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  const expoVideo = useMemo(() => {
    try {
      // Avoid importing `expo-video` unless the native module is present, otherwise it throws:
      // "Cannot find native module 'ExpoVideo'".
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const modulesCore = require('expo-modules-core') as {
        requireOptionalNativeModule?: (name: string) => unknown;
      };

      const nativeModule = modulesCore.requireOptionalNativeModule?.('ExpoVideo');
      if (!nativeModule) return null;

      // `expo-video` requires a native module which may not exist until the dev client is rebuilt.
      // Require it lazily to avoid crashing the route module on import.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('expo-video') as {
        VideoView: ComponentType<any>;
        createVideoPlayer: (source: number | { assetId: number }) => any;
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!expoVideo) return;
    let isActive = true;
    const nextPlayer = expoVideo.createVideoPlayer(sourceModule);
    nextPlayer.loop = true;
    nextPlayer.muted = true;
    nextPlayer.play();
    if (isActive) setPlayer(nextPlayer);

    return () => {
      isActive = false;
      try {
        nextPlayer.pause?.();
        nextPlayer.release?.();
      } catch {
        // no-op
      }
    };
  }, [expoVideo, sourceModule]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!player) {
      return;
    }

    const shouldPlay = isFocused && appState === 'active';
    try {
      if (shouldPlay) {
        player.play?.();
      } else {
        player.pause?.();
      }
    } catch {
      // no-op
    }
  }, [appState, isFocused, player]);

  if (!expoVideo || !player) {
    return <View style={[styles.container, { height }]} />;
  }

  const { VideoView } = expoVideo;

  return (
    <View style={[styles.container, { height }]}>
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="contain"
        style={{ width: '100%', height }}
      />
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
