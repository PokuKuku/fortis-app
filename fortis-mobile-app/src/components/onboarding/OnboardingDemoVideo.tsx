import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, AppState, type AppStateStatus } from 'react-native';
import type { ComponentType } from 'react';
import { useIsFocused } from '@react-navigation/native';

interface OnboardingDemoVideoProps {
  sourceModule: number;
  height: number | string;
  scale?: number;
  offsetY?: number;
}

const PLAYBACK_WATCHDOG_MS = 1_200;
const FREEZE_DETECTION_TICKS = 3;
const FREEZE_TIME_EPSILON = 0.01;

const shouldKeepPlaying = (isFocused: boolean, appState: AppStateStatus) =>
  isFocused && (appState === 'active' || appState === 'unknown');

const safePlay = (videoPlayer: any) => {
  try {
    videoPlayer.loop = true;
    videoPlayer.play?.();
  } catch {
    // no-op
  }
};

const safePause = (videoPlayer: any) => {
  try {
    videoPlayer.pause?.();
  } catch {
    // no-op
  }
};

export function OnboardingDemoVideo({
  sourceModule,
  height,
  scale = 1.18,
  offsetY = 0,
}: OnboardingDemoVideoProps) {
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
    safePlay(nextPlayer);
    if (isActive) setPlayer(nextPlayer);

    return () => {
      isActive = false;
      try {
        safePause(nextPlayer);
        nextPlayer.release?.();
      } catch {
        // no-op
      }
    };
  }, [expoVideo, sourceModule]);

  useEffect(() => {
    if (isFocused) {
      setAppState(AppState.currentState);
    }
  }, [isFocused]);

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

    const shouldPlay = shouldKeepPlaying(isFocused, appState);
    if (!shouldPlay) {
      safePause(player);
      return;
    }

    safePlay(player);

    let lastTime = -1;
    let stalledTicks = 0;

    const watchdog = setInterval(() => {
      try {
        if (!player.playing) {
          safePlay(player);
          return;
        }

        const currentTime =
          typeof player.currentTime === 'number' ? player.currentTime : null;
        const isReady = player.status === 'readyToPlay';

        if (currentTime === null || !isReady) {
          stalledTicks = 0;
          return;
        }

        if (lastTime >= 0 && Math.abs(currentTime - lastTime) <= FREEZE_TIME_EPSILON) {
          stalledTicks += 1;
        } else {
          stalledTicks = 0;
        }
        lastTime = currentTime;

        if (stalledTicks >= FREEZE_DETECTION_TICKS) {
          safePlay(player);
          stalledTicks = 0;
        }
      } catch {
        safePlay(player);
      }
    }, PLAYBACK_WATCHDOG_MS);

    return () => {
      clearInterval(watchdog);
    };
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
        style={[styles.video, { transform: [{ scale }, { translateY: offsetY }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
