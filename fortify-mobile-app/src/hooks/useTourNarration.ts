import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, type AVPlaybackSource } from 'expo-av';

type NarrationSound = Audio.Sound;

type UseTourNarrationOptions = {
  enabled: boolean;
  source: AVPlaybackSource;
  autoPlay?: boolean;
};

const TOUR_NARRATION_AUDIO_MODE = {
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
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

export function useTourNarration({ enabled, source, autoPlay = true }: UseTourNarrationOptions) {
  const soundRef = useRef<NarrationSound | null>(null);
  const playbackRequestRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

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
      // The tour narration must use the speaker even when the device is muted
      // or Voice Coach previously configured a recording audio session.
      await Audio.setAudioModeAsync(TOUR_NARRATION_AUDIO_MODE);

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
      setHasPlayed(true);
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
      setHasPlayed(false);
      return;
    }

    if (autoPlay) {
      void play();
    }
    return () => {
      void stop();
    };
  }, [autoPlay, enabled, play, stop]);

  return {
    isPlaying,
    hasPlayed,
    replay: play,
    stop,
  };
}
