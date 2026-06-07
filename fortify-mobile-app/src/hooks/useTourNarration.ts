import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, type AVPlaybackSource } from 'expo-av';

type NarrationSound = Audio.Sound;

type UseTourNarrationOptions = {
  enabled: boolean;
  source: AVPlaybackSource;
};

const stopAndUnload = async (sound: NarrationSound | null): Promise<void> => {
  if (!sound) return;

  try {
    await sound.stopAsync();
  } catch {
    // Playback may already be stopped.
  }

  try {
    await sound.unloadAsync();
  } catch {
    // Cleanup is best-effort.
  }
};

export function useTourNarration({ enabled, source }: UseTourNarrationOptions) {
  const soundRef = useRef<NarrationSound | null>(null);
  const playbackRequestRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const stop = useCallback(async () => {
    playbackRequestRef.current += 1;
    const sound = soundRef.current;
    soundRef.current = null;
    setIsPlaying(false);
    await stopAndUnload(sound);
  }, []);

  const play = useCallback(async (): Promise<boolean> => {
    const requestId = playbackRequestRef.current + 1;
    playbackRequestRef.current = requestId;
    const previousSound = soundRef.current;
    soundRef.current = null;
    setIsPlaying(true);
    await stopAndUnload(previousSound);

    try {
      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded || !status.didJustFinish) return;
          if (soundRef.current === sound) {
            soundRef.current = null;
            setIsPlaying(false);
            void stopAndUnload(sound);
          }
        }
      );

      if (playbackRequestRef.current !== requestId) {
        await stopAndUnload(sound);
        return false;
      }

      soundRef.current = sound;
      return true;
    } catch {
      if (playbackRequestRef.current === requestId) {
        setIsPlaying(false);
      }
      return false;
    }
  }, [source]);

  useEffect(() => {
    if (!enabled) {
      void stop();
      return;
    }

    void play();
    return () => {
      void stop();
    };
  }, [enabled, play, stop]);

  return {
    isPlaying,
    replay: play,
    stop,
  };
}
