import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, AppState, InteractionManager, type AppStateStatus } from 'react-native';
import type { ComponentType } from 'react';
import { useIsFocused } from '@react-navigation/native';

interface OnboardingDemoVideoProps {
  sourceModule: number;
  height: number | string;
  scale?: number;
  offsetY?: number;
  active?: boolean;
  deferMountUntilInteractions?: boolean;
  enablePlaybackWatchdog?: boolean;
}

const PLAYBACK_WATCHDOG_MS = 1_200;
const FREEZE_DETECTION_TICKS = 3;
const FREEZE_TIME_EPSILON = 0.01;

type ExpoVideoModule = {
  VideoView: ComponentType<any>;
  createVideoPlayer: (source: number | { assetId: number }) => any;
};

let sharedExpoVideoModule: ExpoVideoModule | null = null;
let sharedPlayer: any | null = null;
let sharedPlayerSourceModule: number | null = null;
let sharedPlayerConsumerCount = 0;

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

const getExpoVideoModule = (): ExpoVideoModule | null => {
  if (sharedExpoVideoModule) {
    return sharedExpoVideoModule;
  }

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
    sharedExpoVideoModule = require('expo-video') as ExpoVideoModule;
    return sharedExpoVideoModule;
  } catch {
    return null;
  }
};

const getOrCreateSharedPlayer = (
  expoVideo: ExpoVideoModule,
  sourceModule: number
): any => {
  if (sharedPlayer && sharedPlayerSourceModule === sourceModule) {
    return sharedPlayer;
  }

  if (sharedPlayer && sharedPlayerSourceModule !== sourceModule) {
    try {
      safePause(sharedPlayer);
      sharedPlayer.release?.();
    } catch {
      // no-op
    }
    sharedPlayer = null;
    sharedPlayerSourceModule = null;
  }

  const nextPlayer = expoVideo.createVideoPlayer(sourceModule);
  nextPlayer.loop = true;
  nextPlayer.muted = true;
  safePlay(nextPlayer);
  sharedPlayer = nextPlayer;
  sharedPlayerSourceModule = sourceModule;
  return nextPlayer;
};

export function OnboardingDemoVideo({
  sourceModule,
  height,
  scale = 1.18,
  offsetY = 0,
  active = true,
  deferMountUntilInteractions = false,
  enablePlaybackWatchdog = true,
}: OnboardingDemoVideoProps) {
  const [player, setPlayer] = useState<any>(null);
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isMountReady, setIsMountReady] = useState(!deferMountUntilInteractions);

  useEffect(() => {
    if (!deferMountUntilInteractions) {
      return;
    }
    let isActive = true;
    const task = InteractionManager.runAfterInteractions(() => {
      if (!isActive) return;
      setIsMountReady(true);
    });
    return () => {
      isActive = false;
      task.cancel();
    };
  }, [deferMountUntilInteractions]);

  const expoVideo = useMemo(() => {
    if (!isMountReady) {
      return null;
    }
    return getExpoVideoModule();
  }, [isMountReady]);

  useEffect(() => {
    if (!expoVideo || !isMountReady) return;
    sharedPlayerConsumerCount += 1;

    const nextPlayer = getOrCreateSharedPlayer(expoVideo, sourceModule);
    setPlayer(nextPlayer);

    return () => {
      sharedPlayerConsumerCount = Math.max(0, sharedPlayerConsumerCount - 1);
      if (sharedPlayerConsumerCount === 0 && sharedPlayer) {
        safePause(sharedPlayer);
      }
    };
  }, [expoVideo, isMountReady, sourceModule]);

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

    const shouldPlay = active && shouldKeepPlaying(isFocused, appState);
    if (!shouldPlay) {
      safePause(player);
      return;
    }

    safePlay(player);
    if (!enablePlaybackWatchdog) {
      return;
    }

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
  }, [active, appState, isFocused, player, enablePlaybackWatchdog]);

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
