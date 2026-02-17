import { Mixpanel } from 'mixpanel-react-native';

const mixpanelToken = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;

let mixpanelInstance: Mixpanel | null = null;
let mixpanelInitPromise: Promise<Mixpanel | null> | null = null;
let mixpanelDisabled = false;

const isMixpanelConfigured = () => Boolean(mixpanelToken);

async function createMixpanelInstance(): Promise<Mixpanel | null> {
  if (!isMixpanelConfigured() || mixpanelDisabled) {
    return null;
  }

  try {
    // Run in JavaScript mode to avoid native TurboModule instability in onboarding-critical flows.
    const instance = new Mixpanel(mixpanelToken as string, false, false);
    await instance.init();
    mixpanelInstance = instance;
    return instance;
  } catch (error) {
    mixpanelDisabled = true;
    console.warn('[Mixpanel] Disabled after initialization failure:', error);
    return null;
  }
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
  if (!eventName.trim() || mixpanelDisabled) {
    return;
  }

  const mixpanel = await getMixpanelInstance();
  if (!mixpanel) {
    return;
  }

  try {
    if (typeof (mixpanel as { track?: unknown }).track !== 'function') {
      mixpanelDisabled = true;
      console.warn('[Mixpanel] Disabled because track method is unavailable.');
      return;
    }

    mixpanel.track(eventName, properties);
  } catch (error) {
    mixpanelDisabled = true;
    console.warn('[Mixpanel] Track failed:', eventName, error);
  }
}
