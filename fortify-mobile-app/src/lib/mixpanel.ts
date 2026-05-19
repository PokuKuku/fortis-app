import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import { Mixpanel } from 'mixpanel-react-native';

export type MixpanelProperties = Record<string, unknown>;

export interface MixpanelUserContext {
  distinctId: string;
  email?: string | null;
  fullName?: string | null;
  preferredUnits?: string | null;
  onboardingCompleted?: boolean | null;
  themeMode?: string | null;
  accentColor?: string | null;
}

const mixpanelServerUrl = process.env.EXPO_PUBLIC_MIXPANEL_SERVER_URL?.trim();
const appEnvironment = process.env.EXPO_PUBLIC_APP_ENV?.trim() || 'unknown';

let mixpanelInstance: Mixpanel | null = null;
let mixpanelInitPromise: Promise<Mixpanel | null> | null = null;
let mixpanelDisabled = false;
let hasWarnedMissingToken = false;
let currentIdentifiedUserId: string | null = null;
let sessionReplayDisabled = false;
let sessionReplayInitialized = false;
let sessionReplayInitPromise: Promise<boolean> | null = null;
let hasWarnedInvalidReplaySampleRate = false;
let hasWarnedUnlinkedSessionReplay = false;

type MixpanelSessionReplaySdk = typeof import('@mixpanel/react-native-session-replay');

interface TrackOptions {
  flush?: boolean;
}

interface DirectMixpanelEvent {
  event: string;
  properties: MixpanelProperties;
}

function getMixpanelToken(): string {
  return process.env.EXPO_PUBLIC_MIXPANEL_TOKEN?.trim() ?? '';
}

function getSessionReplaySampleRate(): number {
  const rawValue = process.env.EXPO_PUBLIC_MIXPANEL_REPLAY_SAMPLE_RATE?.trim();
  if (!rawValue) {
    return 100;
  }

  const sampleRate = Number(rawValue);
  if (Number.isFinite(sampleRate) && sampleRate >= 0 && sampleRate <= 100) {
    return sampleRate;
  }

  if (!hasWarnedInvalidReplaySampleRate) {
    hasWarnedInvalidReplaySampleRate = true;
    console.warn(
      '[Mixpanel] Invalid EXPO_PUBLIC_MIXPANEL_REPLAY_SAMPLE_RATE; using 100.'
    );
  }

  return 100;
}

function isMixpanelSessionReplayNativeModuleLinked(): boolean {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }

  if (NativeModules.MixpanelReactNativeSessionReplay) {
    return true;
  }

  if (!(globalThis as { __turboModuleProxy?: unknown }).__turboModuleProxy) {
    return false;
  }

  try {
    return Boolean(TurboModuleRegistry.get('MixpanelReactNativeSessionReplay'));
  } catch {
    return false;
  }
}

function sanitizeProperties(properties: MixpanelProperties = {}): MixpanelProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
}

function createInsertId(eventName: string, eventTime: number): string {
  const randomValue = Math.random().toString(36).slice(2);
  return `${eventName}:${eventTime}:${randomValue}`;
}

function getMixpanelEventTimeSeconds(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value > 9_999_999_999 ? value / 1000 : value);
  }

  return Math.floor(Date.now() / 1000);
}

function getDirectMixpanelResponseStatus(responseBody: string): number | null {
  const trimmedBody = responseBody.trim();
  if (trimmedBody === '1') {
    return 1;
  }
  if (trimmedBody === '0') {
    return 0;
  }

  try {
    const parsed = JSON.parse(trimmedBody) as { status?: unknown };
    return typeof parsed.status === 'number' ? parsed.status : null;
  } catch {
    return null;
  }
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
  return Boolean(getMixpanelToken());
}

function warnMissingMixpanelToken(): void {
  if (hasWarnedMissingToken) {
    return;
  }

  hasWarnedMissingToken = true;
  console.warn('[Mixpanel] Missing EXPO_PUBLIC_MIXPANEL_TOKEN; analytics are disabled.');
}

async function createMixpanelInstance(): Promise<Mixpanel | null> {
  const token = getMixpanelToken();

  if (!token) {
    warnMissingMixpanelToken();
    return null;
  }

  if (mixpanelDisabled) {
    return null;
  }

  try {
    // JS mode is more stable in Expo-managed flows than the native bridge path.
    const instance = new Mixpanel(token, false, false);
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

  if (!isMixpanelConfigured()) {
    warnMissingMixpanelToken();
    mixpanelInitPromise = null;
    return null;
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

async function loadMixpanelSessionReplaySdk(): Promise<MixpanelSessionReplaySdk | null> {
  if (!isMixpanelSessionReplayNativeModuleLinked()) {
    if (!hasWarnedUnlinkedSessionReplay && (Platform.OS === 'ios' || Platform.OS === 'android')) {
      hasWarnedUnlinkedSessionReplay = true;
      console.warn(
        '[Mixpanel] Session Replay native module is not linked; rebuild the native app to enable replay.'
      );
    }
    return null;
  }

  try {
    return require('@mixpanel/react-native-session-replay') as MixpanelSessionReplaySdk;
  } catch (error) {
    sessionReplayDisabled = true;
    console.warn('[Mixpanel] Session Replay unavailable:', error);
    return null;
  }
}

async function initializeMixpanelSessionReplay(distinctId: string): Promise<boolean> {
  if (sessionReplayDisabled || sessionReplayInitialized) {
    return sessionReplayInitialized;
  }

  const token = getMixpanelToken();
  if (!token || !distinctId.trim()) {
    return false;
  }

  if (!sessionReplayInitPromise) {
    sessionReplayInitPromise = (async () => {
      const sdk = await loadMixpanelSessionReplaySdk();
      if (!sdk) {
        return false;
      }

      try {
        const config = new sdk.MPSessionReplayConfig({
          autoStartRecording: true,
          autoMaskedViews: [
            sdk.MPSessionReplayMask.Text,
            sdk.MPSessionReplayMask.Image,
            sdk.MPSessionReplayMask.Web,
            sdk.MPSessionReplayMask.Map,
          ],
          enableLogging: __DEV__,
          recordingSessionsPercent: getSessionReplaySampleRate(),
          remoteSettingsMode: sdk.MPSessionReplayRemoteSettingsMode.Disabled,
          wifiOnly: true,
        });

        await sdk.MPSessionReplay.initialize(token, distinctId, config);
        sessionReplayInitialized = true;
        return true;
      } catch (error) {
        sessionReplayDisabled = true;
        console.warn('[Mixpanel] Session Replay initialization failed:', error);
        return false;
      } finally {
        sessionReplayInitPromise = null;
      }
    })();
  }

  return sessionReplayInitPromise;
}

async function identifyMixpanelSessionReplay(distinctId: string): Promise<void> {
  if (sessionReplayDisabled || !distinctId.trim()) {
    return;
  }

  if (!sessionReplayInitialized) {
    await initializeMixpanelSessionReplay(distinctId);
    return;
  }

  const sdk = await loadMixpanelSessionReplaySdk();
  if (!sdk) {
    return;
  }

  try {
    await sdk.MPSessionReplay.identify(distinctId);
  } catch (error) {
    console.warn('[Mixpanel] Failed to sync Session Replay identity:', error);
  }
}

export async function initializeMixpanel(): Promise<boolean> {
  const mixpanel = await getMixpanelInstance();
  if (!mixpanel) {
    return false;
  }

  const distinctId = await getMixpanelDistinctId();
  if (distinctId) {
    await initializeMixpanelSessionReplay(distinctId);
  }

  return true;
}

export async function getMixpanelDistinctId(): Promise<string | null> {
  const mixpanel = await getMixpanelInstance();
  if (!mixpanel) {
    return null;
  }

  try {
    if (typeof (mixpanel as { getDistinctId?: unknown }).getDistinctId !== 'function') {
      return null;
    }

    return await mixpanel.getDistinctId();
  } catch (error) {
    console.warn('[Mixpanel] Failed to read distinct id:', error);
    return null;
  }
}

export async function getMixpanelIdentityProperties(): Promise<MixpanelProperties> {
  if (currentIdentifiedUserId) {
    return { user_id: currentIdentifiedUserId };
  }

  const distinctId = await getMixpanelDistinctId();
  return distinctId ? { distinct_id: distinctId } : {};
}

export async function flushMixpanel(): Promise<void> {
  if (mixpanelDisabled) {
    return;
  }

  const mixpanel = await getMixpanelInstance();
  if (!mixpanel) {
    return;
  }

  try {
    if (typeof (mixpanel as { flush?: unknown }).flush !== 'function') {
      return;
    }

    await Promise.resolve(mixpanel.flush());
  } catch (error) {
    console.warn('[Mixpanel] Flush failed:', error);
  }
}

async function sendDirectMixpanelEvent(event: DirectMixpanelEvent): Promise<void> {
  const token = getMixpanelToken();
  if (!__DEV__ || !token || process.env.NODE_ENV === 'test' || typeof fetch !== 'function') {
    return;
  }

  const directProperties = sanitizeProperties({
    ...getBaseSuperProperties(),
    auth_state: currentIdentifiedUserId ? 'authenticated' : 'anonymous',
    token,
    ...event.properties,
    user_id: event.properties.user_id ?? currentIdentifiedUserId ?? undefined,
  });

  const body = `data=${encodeURIComponent(
    JSON.stringify([
      {
        event: event.event,
        properties: directProperties,
      },
    ])
  )}`;

  try {
    const response = await fetch(
      `${mixpanelServerUrl || 'https://api.mixpanel.com'}/track/?ip=1&verbose=1`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      }
    );

    const responseBody = await response.text();
    const responseStatus = getDirectMixpanelResponseStatus(responseBody);
    console.log('[Mixpanel] Direct flush response:', event.event, response.status, responseBody);
    if (!response.ok || responseStatus !== 1) {
      console.warn('[Mixpanel] Direct flush failed:', event.event, response.status, responseBody);
    } else {
      console.log('[Mixpanel] Direct flush accepted:', event.event);
    }
  } catch (error) {
    console.warn('[Mixpanel] Direct flush failed:', event.event, error);
  }
}

export async function trackMixpanelEvent(
  eventName: string,
  properties: MixpanelProperties = {},
  options: TrackOptions = {}
): Promise<void> {
  if (!eventName.trim()) {
    return;
  }

  const eventTime = getMixpanelEventTimeSeconds(properties.time);
  const eventProperties = sanitizeProperties({
    ...properties,
    time: eventTime,
    ...(options.flush
      ? {
          $insert_id: properties.$insert_id ?? createInsertId(eventName, eventTime),
        }
      : {}),
  });

  if (mixpanelDisabled) {
    if (options.flush) {
      await sendDirectMixpanelEvent({
        event: eventName,
        properties: eventProperties,
      });
    }
    return;
  }

  const mixpanel = await getMixpanelInstance();
  if (!mixpanel) {
    if (options.flush) {
      await sendDirectMixpanelEvent({
        event: eventName,
        properties: eventProperties,
      });
    }
    return;
  }

  try {
    if (typeof (mixpanel as { track?: unknown }).track !== 'function') {
      console.warn('[Mixpanel] Disabled because track method is unavailable.');
      if (options.flush) {
        await sendDirectMixpanelEvent({
          event: eventName,
          properties: eventProperties,
        });
      }
      mixpanelDisabled = true;
      return;
    }

    await Promise.resolve(mixpanel.track(eventName, eventProperties));
    if (options.flush) {
      await flushMixpanel();
      await sendDirectMixpanelEvent({
        event: eventName,
        properties: eventProperties,
      });
    }
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
    currentIdentifiedUserId = userContext.distinctId;
    mixpanel.clearSuperProperties();
    mixpanel.registerSuperProperties(getAuthenticatedSuperProperties(userContext));
    await Promise.resolve(mixpanel.getPeople().set(getPeopleProperties(userContext)));
    await identifyMixpanelSessionReplay(userContext.distinctId);
  } catch (error) {
    console.warn('[Mixpanel] Failed to identify user:', error);
  }
}

export async function resetMixpanelUser(): Promise<void> {
  currentIdentifiedUserId = null;

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
    const anonymousDistinctId = await getMixpanelDistinctId();
    if (anonymousDistinctId) {
      await identifyMixpanelSessionReplay(anonymousDistinctId);
    }
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
