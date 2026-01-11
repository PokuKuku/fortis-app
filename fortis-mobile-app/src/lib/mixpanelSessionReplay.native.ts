import {
  MPSessionReplay,
  MPSessionReplayConfig,
  MPSessionReplayMask,
} from '@mixpanel/react-native-session-replay';
import { isMixpanelConfigured, mixpanelToken } from '@/src/lib/mixpanel';

let replayInitialized = false;
let replayDistinctId: string | null = null;

async function logReplayStatus(label: string) {
  if (!__DEV__) {
    return;
  }

  try {
    const [isRecording, replayId] = await Promise.all([
      MPSessionReplay.isRecording(),
      MPSessionReplay.getReplayId(),
    ]);
    console.log('[MixpanelReplay]', label, { isRecording, replayId });
  } catch (error) {
    console.warn('[MixpanelReplay] Status check failed:', error);
  }
}

export async function initMixpanelSessionReplay(distinctId?: string | null) {
  if (!isMixpanelConfigured()) {
    if (__DEV__) {
      console.log('[MixpanelReplay] Skipping init - missing token');
    }
    return;
  }

  if (!distinctId) {
    if (__DEV__) {
      console.log('[MixpanelReplay] Skipping init - missing distinctId');
    }
    return;
  }

  if (!replayInitialized) {
    const config = new MPSessionReplayConfig({
      wifiOnly: false,
      recordingSessionsPercent: 100,
      autoStartRecording: true,
      autoMaskedViews: [
        MPSessionReplayMask.Image,
        MPSessionReplayMask.Text,
        MPSessionReplayMask.Web,
        MPSessionReplayMask.Map,
      ],
      enableLogging: __DEV__,
    });

    try {
      await MPSessionReplay.initialize(mixpanelToken, distinctId, config);
      replayInitialized = true;
      replayDistinctId = distinctId;
      await MPSessionReplay.startRecording();
      await logReplayStatus('initialized');
    } catch (error) {
      console.warn('[MixpanelReplay] Failed to initialize:', error);
    }

    return;
  }

  if (replayDistinctId !== distinctId) {
    try {
      await MPSessionReplay.identify(distinctId);
      replayDistinctId = distinctId;
      await MPSessionReplay.startRecording();
      await logReplayStatus('identified');
    } catch (error) {
      console.warn('[MixpanelReplay] Failed to identify:', error);
    }
  }
}
