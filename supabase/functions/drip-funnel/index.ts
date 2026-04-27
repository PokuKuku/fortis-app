import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { errorResponse, handleCors, jsonResponse } from '../_shared/cors.ts';

const CAMPAIGN_KEY = 'drip_discount_25_v1';
const DISCOUNT_PLACEMENT = 'fortify_drip_discount_25';
const DISCOUNT_URL = 'fortis://paywall?offer=drip_discount_25';
const SCHEDULE_DELAY_HOURS = 2;
const DEFAULT_DISPATCH_LIMIT = 100;

type TrackAction =
  | 'register_push_token'
  | 'paywall_declined'
  | 'conversion'
  | 'dispatch_due';

type PushTokenBody = {
  action: 'register_push_token';
  expoPushToken?: string;
  platform?: string;
  deviceId?: string | null;
};

type PaywallBody = {
  action: 'paywall_declined' | 'conversion';
  placement?: string | null;
  paywallName?: string | null;
  resultType?: string | null;
  productId?: string | null;
  metadata?: Record<string, unknown> | null;
};

type DispatchBody = {
  action: 'dispatch_due';
  limit?: number;
};

type RequestBody = PushTokenBody | PaywallBody | DispatchBody;

type DueEvent = {
  id: string;
  user_id: string;
};

type PushToken = {
  id: string;
  user_id: string;
  expo_push_token: string;
};

type ExpoTicket = {
  status?: string;
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
};

const isValidExpoPushToken = (token: string) =>
  /^(ExponentPushToken|ExpoPushToken)\[[\w-]+\]$/.test(token);

const addHours = (date: Date, hours: number) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();

const getBearerToken = (req: Request) => {
  const header = req.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

const getAuthedUserId = async (req: Request, supabaseUrl: string, anonKey: string) => {
  const token = getBearerToken(req);
  if (!token) return null;

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
};

const isAuthorizedDispatch = (req: Request, serviceKey: string) => {
  const bearer = getBearerToken(req);
  const cronSecret = Deno.env.get('DRIP_FUNNEL_CRON_SECRET');
  const requestSecret = req.headers.get('x-drip-funnel-secret');

  return (
    bearer === serviceKey ||
    (!!cronSecret && requestSecret === cronSecret)
  );
};

const sendExpoPush = async (messages: Array<Record<string, unknown>>) => {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof payload?.errors?.[0]?.message === 'string'
        ? payload.errors[0].message
        : `Expo push request failed with ${response.status}`,
    );
  }

  const tickets = Array.isArray(payload?.data) ? payload.data : [];
  return tickets as ExpoTicket[];
};

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const origin = req.headers.get('origin');

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 'method_not_allowed', 405, false, undefined, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return errorResponse('Supabase service configuration missing', 'config_error', 500, false, undefined, origin);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 'invalid_json', 400, false, undefined, origin);
  }

  const action = (body as { action?: TrackAction }).action;
  if (!action) {
    return errorResponse('Missing action', 'missing_action', 400, false, undefined, origin);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    if (action === 'dispatch_due') {
      if (!isAuthorizedDispatch(req, serviceKey)) {
        return errorResponse('Unauthorized', 'unauthorized', 401, false, undefined, origin);
      }

      const limit = Math.min(
        Math.max(Number((body as DispatchBody).limit ?? DEFAULT_DISPATCH_LIMIT), 1),
        DEFAULT_DISPATCH_LIMIT,
      );

      const { data: dueEvents, error: dueError } = await admin
        .from('drip_funnel_events')
        .select('id, user_id')
        .eq('campaign_key', CAMPAIGN_KEY)
        .eq('status', 'scheduled')
        .lte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(limit);

      if (dueError) throw dueError;
      const events = (dueEvents ?? []) as DueEvent[];
      if (events.length === 0) {
        return jsonResponse({ dispatched: 0, noToken: 0, failed: 0 }, 200, origin);
      }

      const userIds = events.map((event) => event.user_id);
      const { data: tokens, error: tokenError } = await admin
        .from('user_push_tokens')
        .select('id, user_id, expo_push_token')
        .in('user_id', userIds)
        .eq('is_active', true)
        .order('last_seen_at', { ascending: false });

      if (tokenError) throw tokenError;

      const latestTokenByUser = new Map<string, PushToken>();
      ((tokens ?? []) as PushToken[]).forEach((token) => {
        if (!latestTokenByUser.has(token.user_id)) {
          latestTokenByUser.set(token.user_id, token);
        }
      });

      const sendable = events
        .map((event) => ({ event, token: latestTokenByUser.get(event.user_id) }))
        .filter((entry): entry is { event: DueEvent; token: PushToken } => !!entry.token);
      const noTokenEvents = events.filter((event) => !latestTokenByUser.has(event.user_id));

      if (noTokenEvents.length > 0) {
        await admin
          .from('drip_funnel_events')
          .update({
            status: 'no_token',
            last_error: 'No active Expo push token registered',
          })
          .in('id', noTokenEvents.map((event) => event.id));
      }

      if (sendable.length === 0) {
        return jsonResponse({ dispatched: 0, noToken: noTokenEvents.length, failed: 0 }, 200, origin);
      }

      const messages = sendable.map(({ token }) => ({
        to: token.expo_push_token,
        sound: 'default',
        title: "Here's a 25% discount for Fortify AI",
        body: 'Unlock the yearly plan now and save 25% forever.',
        data: {
          kind: 'drip-discount',
          campaignKey: CAMPAIGN_KEY,
          placement: DISCOUNT_PLACEMENT,
          offer: 'drip_discount_25',
          url: DISCOUNT_URL,
        },
      }));

      const tickets = await sendExpoPush(messages);
      const sentEventIds: string[] = [];
      const failedEventUpdates: Array<{ id: string; error: string }> = [];
      const invalidTokenIds: string[] = [];

      tickets.forEach((ticket, index) => {
        const entry = sendable[index];
        if (!entry) return;

        if (ticket.status === 'ok') {
          sentEventIds.push(entry.event.id);
          return;
        }

        const message = ticket.message || ticket.details?.error || 'Expo push failed';
        failedEventUpdates.push({ id: entry.event.id, error: message });
        if (ticket.details?.error === 'DeviceNotRegistered') {
          invalidTokenIds.push(entry.token.id);
        }
      });

      if (sentEventIds.length > 0) {
        await admin
          .from('drip_funnel_events')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            last_error: null,
          })
          .in('id', sentEventIds);
      }

      await Promise.all(
        failedEventUpdates.map((failure) =>
          admin
            .from('drip_funnel_events')
            .update({ status: 'failed', last_error: failure.error })
            .eq('id', failure.id),
        ),
      );

      if (invalidTokenIds.length > 0) {
        await admin
          .from('user_push_tokens')
          .update({ is_active: false })
          .in('id', invalidTokenIds);
      }

      return jsonResponse({
        dispatched: sentEventIds.length,
        noToken: noTokenEvents.length,
        failed: failedEventUpdates.length,
      }, 200, origin);
    }

    const userId = await getAuthedUserId(req, supabaseUrl, anonKey);
    if (!userId) {
      return errorResponse('Unauthorized', 'unauthorized', 401, false, undefined, origin);
    }

    if (action === 'register_push_token') {
      const { expoPushToken, platform, deviceId } = body as PushTokenBody;
      if (!expoPushToken || !isValidExpoPushToken(expoPushToken)) {
        return errorResponse('Invalid Expo push token', 'invalid_push_token', 400, false, undefined, origin);
      }
      if (platform !== 'ios' && platform !== 'android') {
        return errorResponse('Invalid platform', 'invalid_platform', 400, false, undefined, origin);
      }

      const { error } = await admin
        .from('user_push_tokens')
        .upsert({
          user_id: userId,
          expo_push_token: expoPushToken,
          platform,
          device_id: deviceId ?? null,
          is_active: true,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'expo_push_token' });

      if (error) throw error;
      return jsonResponse({ ok: true }, 200, origin);
    }

    if (action === 'conversion') {
      const { placement, paywallName, resultType, productId, metadata } = body as PaywallBody;
      const { error } = await admin
        .from('drip_funnel_events')
        .update({
          status: 'converted',
          converted_at: new Date().toISOString(),
          source_placement: placement ?? null,
          source_paywall_name: paywallName ?? null,
          source_result_type: resultType ?? null,
          metadata: {
            ...(metadata ?? {}),
            productId: productId ?? null,
          },
        })
        .eq('user_id', userId)
        .eq('campaign_key', CAMPAIGN_KEY)
        .in('status', ['scheduled', 'sent', 'failed', 'no_token']);

      if (error) throw error;
      return jsonResponse({ ok: true }, 200, origin);
    }

    if (action === 'paywall_declined') {
      const { placement, paywallName, resultType, productId, metadata } = body as PaywallBody;
      const now = new Date();
      const scheduledAt = addHours(now, SCHEDULE_DELAY_HOURS);

      const { data: existing, error: existingError } = await admin
        .from('drip_funnel_events')
        .select('id, status')
        .eq('user_id', userId)
        .eq('campaign_key', CAMPAIGN_KEY)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existing?.status && ['sent', 'converted', 'canceled'].includes(existing.status)) {
        return jsonResponse({ ok: true, scheduled: false, status: existing.status }, 200, origin);
      }

      const payload = {
        user_id: userId,
        campaign_key: CAMPAIGN_KEY,
        status: 'scheduled',
        source_placement: placement ?? null,
        source_paywall_name: paywallName ?? null,
        source_result_type: resultType ?? null,
        scheduled_at: scheduledAt,
        last_error: null,
        metadata: {
          ...(metadata ?? {}),
          productId: productId ?? null,
          discountPlacement: DISCOUNT_PLACEMENT,
        },
      };

      const { error } = await admin
        .from('drip_funnel_events')
        .upsert(payload, { onConflict: 'user_id,campaign_key' });

      if (error) throw error;
      return jsonResponse({ ok: true, scheduled: true, scheduledAt }, 200, origin);
    }

    return errorResponse('Unknown action', 'unknown_action', 400, false, undefined, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 'drip_funnel_failed', 500, true, 60, origin);
  }
});
