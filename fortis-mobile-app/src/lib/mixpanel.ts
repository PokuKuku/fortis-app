import { Mixpanel } from 'mixpanel-react-native';

const defaultMixpanelToken = '8aa3499e9f5ed4d8160f7d5f0f68b30e';
const mixpanelToken = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ?? defaultMixpanelToken;

const isMixpanelConfigured = () => Boolean(mixpanelToken);

let mixpanelInstance: Mixpanel | null = null;
let mixpanelInitPromise: Promise<Mixpanel | null> | null = null;

async function createMixpanelInstance(): Promise<Mixpanel | null> {
  if (!isMixpanelConfigured()) {
    return null;
  }

  const instance = new Mixpanel(mixpanelToken, true);
  await instance.init();
  mixpanelInstance = instance;
  return instance;
}

export async function initMixpanel(): Promise<Mixpanel | null> {
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

export function getMixpanelInstance(): Mixpanel | null {
  return mixpanelInstance;
}

export { mixpanelToken, isMixpanelConfigured };
