import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

export const DRIP_FUNNEL_CAMPAIGN_KEY = 'drip_discount_25_v1';
export const DRIP_FUNNEL_DISCOUNT_PLACEMENT = 'fortify_drip_discount_25';
export const DRIP_FUNNEL_DISCOUNT_OFFER = 'drip_discount_25';
export const DRIP_FUNNEL_INITIAL_PLACEMENTS = new Set(['fortis_first']);
export const DRIP_FUNNEL_NOTIFICATION_KIND = 'drip-discount';

type PaywallTrackPayload = {
  placement?: string | null;
  paywallName?: string | null;
  resultType?: string | null;
  productId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type DripFunnelNotificationData = {
  kind?: unknown;
  campaignKey?: unknown;
  placement?: unknown;
  offer?: unknown;
  url?: unknown;
};

const getExpoProjectId = () => {
  const constants = Constants as typeof Constants & {
    easConfig?: { projectId?: string };
  };

  const projectId =
    constants.easConfig?.projectId ??
    constants.expoConfig?.extra?.eas?.projectId ??
    null;

  return typeof projectId === 'string' && projectId !== 'your-project-id-here'
    ? projectId
    : null;
};

const getDeviceId = () => {
  const constants = Constants as typeof Constants & {
    installationId?: string;
    sessionId?: string;
  };

  return constants.installationId ?? constants.sessionId ?? null;
};

const invokeDripFunnel = async (body: Record<string, unknown>) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase.functions.invoke('drip-funnel', { body });
  if (error) {
    if (__DEV__) {
      console.warn('[DripFunnel] Edge function call failed:', error);
    }
    return false;
  }

  return true;
};

export const isDripFunnelInitialPlacement = (placement?: string | null) =>
  !!placement && DRIP_FUNNEL_INITIAL_PLACEMENTS.has(placement);

export const isDripFunnelNotification = (data?: DripFunnelNotificationData | null) =>
  data?.kind === DRIP_FUNNEL_NOTIFICATION_KIND ||
  data?.campaignKey === DRIP_FUNNEL_CAMPAIGN_KEY ||
  data?.offer === DRIP_FUNNEL_DISCOUNT_OFFER;

export const getDiscountPlacementFromNotification = (
  data?: DripFunnelNotificationData | null,
) => {
  if (!isDripFunnelNotification(data)) return null;
  return typeof data?.placement === 'string' && data.placement.trim().length > 0
    ? data.placement
    : DRIP_FUNNEL_DISCOUNT_PLACEMENT;
};

export const registerDripFunnelPushToken = async () => {
  if (!isSupabaseConfigured()) return false;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;

  let permissions: Notifications.NotificationPermissionsStatus;
  try {
    permissions = await Notifications.getPermissionsAsync();
  } catch {
    return false;
  }

  if (!permissions.granted && permissions.status !== 'granted') {
    return false;
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    if (__DEV__) {
      console.warn('[DripFunnel] Missing Expo EAS projectId; push token registration skipped.');
    }
    return false;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    if (!token.data) return false;

    return await invokeDripFunnel({
      action: 'register_push_token',
      expoPushToken: token.data,
      platform: Platform.OS,
      deviceId: getDeviceId(),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[DripFunnel] Push token registration failed:', error);
    }
    return false;
  }
};

export const trackDripFunnelPaywallDeclined = async (payload: PaywallTrackPayload) => {
  if (!isDripFunnelInitialPlacement(payload.placement)) return false;

  return await invokeDripFunnel({
    action: 'paywall_declined',
    ...payload,
  });
};

export const trackDripFunnelPaywallPresented = async (payload: PaywallTrackPayload) => {
  if (!isDripFunnelInitialPlacement(payload.placement)) return false;

  return await invokeDripFunnel({
    action: 'paywall_presented',
    ...payload,
  });
};

export const trackDripFunnelConversion = async (payload: PaywallTrackPayload = {}) => {
  return await invokeDripFunnel({
    action: 'conversion',
    ...payload,
  });
};
