import { Platform } from 'react-native';
import { Mixpanel } from 'mixpanel-react-native';

type MixpanelProperties = Record<string, unknown>;

export interface MixpanelUserContext {
  distinctId: string;
  email?: string | null;
  fullName?: string | null;
  preferredUnits?: string | null;
  onboardingCompleted?: boolean | null;
  themeMode?: string | null;
  accentColor?: string | null;
}

const mixpanelToken = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN?.trim();
const mixpanelServerUrl = process.env.EXPO_PUBLIC_MIXPANEL_SERVER_URL?.trim();
const appEnvironment = process.env.EXPO_PUBLIC_APP_ENV?.trim() || 'unknown';

let mixpanelInstance: Mixpanel | null = null;
let mixpanelInitPromise: Promise<Mixpanel | null> | null = null;
let mixpanelDisabled = false;

function sanitizeProperties(properties: MixpanelProperties = {}): MixpanelProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
}

function getBaseSuperProperties(): MixpanelProperties {
  return {
    app_environment: appEnvironment,
    app_platform: Platform.OS,
  };
}

function getAnonymousSuperProperties(): MixpanelProperties {
  return {
    ...getBaseSuperProperties(),
    auth_state: 'anonymous',
  };
}

function getAuthenticatedSuperProperties(
  userContext: MixpanelUserContext
): MixpanelProperties {
  return sanitizeProperties({
    ...getBaseSuperProperties(),
    auth_state: 'authenticated',
    user_id: userContext.distinctId,
    email: userContext.email ?? undefined,
    preferred_units: userContext.preferredUnits ?? undefined,
    onboarding_completed: userContext.onboardingCompleted ?? undefined,
    theme_mode: userContext.themeMode ?? undefined,
    accent_color: userContext.accentColor ?? undefined,
  });
}

function getPeopleProperties(userContext: MixpanelUserContext): MixpanelProperties {
  return sanitizeProperties({
    $email: userContext.email ?? undefined,
    $name: userContext.fullName ?? undefined,
    preferred_units: userContext.preferredUnits ?? undefined,
    onboarding_completed: userContext.onboardingCompleted ?? undefined,
    theme_mode: userContext.themeMode ?? undefined,
    accent_color: userContext.accentColor ?? undefined,
  });
}

export function isMixpanelConfigured(): boolean {
  return Boolean(mixpanelToken);
}

async function createMixpanelInstance(): Promise<Mixpanel | null> {
  if (!isMixpanelConfigured() || mixpanelDisabled) {
    return null;
  }

  try {
    // JS mode is more stable in Expo-managed flows than the native bridge path.
    const instance = new Mixpanel(mixpanelToken as string, false, false);
    await instance.init(false, getAnonymousSuperProperties(), mixpanelServerUrl || undefined);
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
      mixpanelDisabled = true;
      mixpanelInitPromise = null;
      mixpanelInstance = null;
      return null;
    });
  }

  return mixpanelInitPromise;
}

export async function trackMixpanelEvent(
  eventName: string,
  properties: MixpanelProperties = {}
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

    mixpanel.track(eventName, sanitizeProperties(properties));
  } catch (error) {
    mixpanelDisabled = true;
    console.warn('[Mixpanel] Track failed:', eventName, error);
  }
}

export async function identifyMixpanelUser(userContext: MixpanelUserContext): Promise<void> {
  if (mixpanelDisabled) {
    return;
  }

  const mixpanel = await getMixpanelInstance();
  if (!mixpanel) {
    return;
  }

  try {
    await mixpanel.identify(userContext.distinctId);
    mixpanel.clearSuperProperties();
    mixpanel.registerSuperProperties(getAuthenticatedSuperProperties(userContext));
    mixpanel.getPeople().set(getPeopleProperties(userContext));
  } catch (error) {
    console.warn('[Mixpanel] Failed to identify user:', error);
  }
}

export async function resetMixpanelUser(): Promise<void> {
  if (mixpanelDisabled) {
    return;
  }

  const mixpanel = await getMixpanelInstance();
  if (!mixpanel) {
    return;
  }

  try {
    mixpanel.reset();
    mixpanel.clearSuperProperties();
    mixpanel.registerSuperProperties(getAnonymousSuperProperties());
  } catch (error) {
    console.warn('[Mixpanel] Failed to reset user state:', error);
  }
}

export async function trackMixpanelScreenView(
  pathname: string,
  properties: MixpanelProperties = {}
): Promise<void> {
  const normalizedPathname = pathname.trim() || '/';

  await trackMixpanelEvent('screen_view', {
    screen_name: normalizedPathname,
    pathname: normalizedPathname,
    ...sanitizeProperties(properties),
  });
}
