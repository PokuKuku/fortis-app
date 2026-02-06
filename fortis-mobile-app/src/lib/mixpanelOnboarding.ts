import { Mixpanel } from 'mixpanel-react-native';

const mixpanelToken = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;

let mixpanelInstance: Mixpanel | null = null;
let mixpanelInitPromise: Promise<Mixpanel | null> | null = null;

const isMixpanelConfigured = () => Boolean(mixpanelToken);

async function createMixpanelInstance(): Promise<Mixpanel | null> {
  if (!isMixpanelConfigured()) {
    return null;
  }

  // Keep tracking strictly explicit to onboarding-only events.
  const instance = new Mixpanel(mixpanelToken as string, false);
  await instance.init();
  mixpanelInstance = instance;
  return instance;
}

async function getMixpanelInstance(): Promise<Mixpanel | null> {
  if (mixpanelInstance) {
    return mixpanelInstance;
  }

  if (!mixpanelInitPromise) {
    mixpanelInitPromise = createMixpanelInstance().catch((error) => {
      console.warn('[Mixpanel] Failed to initialize:', error);
      mixpanelInitPromise = null;
      mixpanelInstance = null;
      return null;
    });
  }

  return mixpanelInitPromise;
}

export async function trackAnonymousMixpanelEvent(
  eventName: string,
  properties: Record<string, unknown>
): Promise<void> {
  const mixpanel = await getMixpanelInstance();
  if (!mixpanel) {
    return;
  }

  try {
    mixpanel.track(eventName, properties);
  } catch (error) {
    console.warn('[Mixpanel] Track failed:', eventName, error);
  }
}
