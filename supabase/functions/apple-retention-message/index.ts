import { Buffer } from 'node:buffer';
import {
  Environment,
  SignedDataVerifier,
  type DecodedRealtimeRequestBody,
  type RealtimeResponseBody,
} from 'npm:@apple/app-store-server-library@3.1.0';

type RetentionConfig = {
  appAppleId?: number;
  allowedProductIds: Set<string> | null;
  bundleId: string;
  defaultMessageIdentifier: string;
  enableOnlineChecks: boolean;
  environments: Set<Environment>;
  messageIdentifiersByProduct: Record<string, string>;
  rootCertificates: Buffer[];
};

const verifierCache = new Map<string, SignedDataVerifier>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function emptyResponse(status = 204): Response {
  return new Response(null, { status });
}

function normalizeEnvironment(value: string | undefined | null): Environment | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'sandbox') return Environment.SANDBOX;
  if (normalized === 'production') return Environment.PRODUCTION;
  return null;
}

function parseEnvironmentList(value: string | undefined): Set<Environment> {
  const values = (value ?? 'Sandbox,Production')
    .split(',')
    .map((item) => normalizeEnvironment(item))
    .filter((item): item is Environment => item !== null);

  return new Set(values.length > 0 ? values : [Environment.SANDBOX, Environment.PRODUCTION]);
}

function parseCsvSet(value: string | undefined): Set<string> | null {
  const entries = (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return entries.length > 0 ? new Set(entries) : null;
}

function parseProductMessageMap(value: string | undefined): Record<string, string> {
  if (!value?.trim()) return {};

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('APPLE_RETENTION_MESSAGE_IDS_BY_PRODUCT must be a JSON object');
  }

  return Object.fromEntries(
    Object.entries(parsed)
      .map(([productId, messageIdentifier]) => [
        productId.trim(),
        typeof messageIdentifier === 'string' ? messageIdentifier.trim() : '',
      ])
      .filter(([productId, messageIdentifier]) => productId && messageIdentifier)
  );
}

function cleanBase64Certificate(value: string): string {
  return value
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s/g, '');
}

function parseRootCertificates(value: string | undefined): Buffer[] {
  if (!value?.trim()) return [];

  let entries: string[];
  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error('APPLE_ROOT_CERTIFICATES_BASE64 must be a JSON array or comma-separated list');
    }
    entries = parsed.map((item) => String(item));
  } else {
    entries = trimmed.split(',');
  }

  return entries
    .map((entry) => cleanBase64Certificate(entry))
    .filter(Boolean)
    .map((entry) => Buffer.from(entry, 'base64'));
}

function loadConfig(): RetentionConfig {
  const bundleId = Deno.env.get('APPLE_BUNDLE_ID')?.trim();
  if (!bundleId) {
    throw new Error('APPLE_BUNDLE_ID is required');
  }

  const defaultMessageIdentifier = Deno.env.get('APPLE_RETENTION_MESSAGE_IDENTIFIER')?.trim();
  if (!defaultMessageIdentifier) {
    throw new Error('APPLE_RETENTION_MESSAGE_IDENTIFIER is required');
  }

  const rootCertificates = parseRootCertificates(Deno.env.get('APPLE_ROOT_CERTIFICATES_BASE64'));
  if (rootCertificates.length === 0) {
    throw new Error('APPLE_ROOT_CERTIFICATES_BASE64 is required');
  }

  const appAppleIdValue = Deno.env.get('APPLE_APP_APPLE_ID')?.trim();
  const appAppleId = appAppleIdValue ? Number(appAppleIdValue) : undefined;
  if (appAppleIdValue && (!Number.isInteger(appAppleId) || appAppleId <= 0)) {
    throw new Error('APPLE_APP_APPLE_ID must be a positive integer');
  }

  return {
    appAppleId,
    allowedProductIds: parseCsvSet(Deno.env.get('APPLE_RETENTION_ALLOWED_PRODUCT_IDS')),
    bundleId,
    defaultMessageIdentifier,
    enableOnlineChecks: Deno.env.get('APPLE_RETENTION_ENABLE_ONLINE_CHECKS') === 'true',
    environments: parseEnvironmentList(Deno.env.get('APPLE_RETENTION_ENVIRONMENTS')),
    messageIdentifiersByProduct: parseProductMessageMap(
      Deno.env.get('APPLE_RETENTION_MESSAGE_IDS_BY_PRODUCT')
    ),
    rootCertificates,
  };
}

function base64UrlDecodeJson(segment: string): Record<string, unknown> {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
  return JSON.parse(atob(padded)) as Record<string, unknown>;
}

function getUnverifiedPayloadEnvironment(signedPayload: string): Environment | null {
  const [, payloadSegment] = signedPayload.split('.');
  if (!payloadSegment) return null;

  try {
    const payload = base64UrlDecodeJson(payloadSegment);
    return normalizeEnvironment(typeof payload.environment === 'string' ? payload.environment : null);
  } catch {
    return null;
  }
}

function getVerifier(config: RetentionConfig, environment: Environment): SignedDataVerifier {
  const cacheKey = `${environment}:${config.bundleId}:${config.appAppleId ?? 'none'}:${config.enableOnlineChecks}`;
  const cached = verifierCache.get(cacheKey);
  if (cached) return cached;

  if (environment === Environment.PRODUCTION && !config.appAppleId) {
    throw new Error('APPLE_APP_APPLE_ID is required for production verification');
  }

  const verifier = new SignedDataVerifier(
    config.rootCertificates,
    config.enableOnlineChecks,
    environment,
    config.bundleId,
    config.appAppleId
  );
  verifierCache.set(cacheKey, verifier);
  return verifier;
}

async function verifyRealtimeRequest(
  signedPayload: string,
  config: RetentionConfig
): Promise<DecodedRealtimeRequestBody> {
  const hintedEnvironment = getUnverifiedPayloadEnvironment(signedPayload);
  const candidateEnvironments = hintedEnvironment
    ? [hintedEnvironment]
    : [Environment.SANDBOX, Environment.PRODUCTION];

  let lastError: unknown = null;
  for (const environment of candidateEnvironments) {
    if (!config.environments.has(environment)) continue;
    try {
      return await getVerifier(config, environment).verifyAndDecodeRealtimeRequest(signedPayload);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error('Unable to verify retention request');
}

function selectMessageIdentifier(
  requestBody: DecodedRealtimeRequestBody,
  config: RetentionConfig
): string {
  if (
    config.allowedProductIds &&
    !config.allowedProductIds.has(requestBody.productId)
  ) {
    throw new Error(`Unexpected productId: ${requestBody.productId}`);
  }

  if (
    config.appAppleId &&
    requestBody.appAppleId !== config.appAppleId
  ) {
    throw new Error(`Unexpected appAppleId: ${requestBody.appAppleId}`);
  }

  return config.messageIdentifiersByProduct[requestBody.productId] ?? config.defaultMessageIdentifier;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let config: RetentionConfig;
  try {
    config = loadConfig();
  } catch (error) {
    console.error('[AppleRetentionMessage] Missing or invalid configuration', error);
    return emptyResponse(500);
  }

  try {
    const body = await req.json() as { signedPayload?: unknown };
    if (typeof body.signedPayload !== 'string' || body.signedPayload.length === 0) {
      return emptyResponse(400);
    }

    const decodedRequest = await verifyRealtimeRequest(body.signedPayload, config);
    const messageIdentifier = selectMessageIdentifier(decodedRequest, config);
    const responseBody: RealtimeResponseBody = {
      message: {
        messageIdentifier,
      },
    };

    return jsonResponse(responseBody);
  } catch (error) {
    console.error('[AppleRetentionMessage] Failed to handle request', error);
    return emptyResponse(400);
  }
});
