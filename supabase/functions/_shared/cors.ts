/**
 * CORS Headers for Edge Functions
 *
 * Security: Uses origin allowlist instead of wildcard to prevent CSRF attacks
 */

// Allowed origins for CORS
// Add production domain when ready (e.g., 'https://fortis-app.com')
const ALLOWED_ORIGINS = [
  'http://localhost:3000', // web dashboard dev
  'http://localhost:8081', // metro bundler
  'http://localhost:19006', // expo web
];

/**
 * Check if origin is allowed
 * Allows: exact matches, Expo dev URLs (exp://), and localhost variants
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // Allow Expo development URLs
  if (origin.startsWith('exp://')) return true;

  // Allow exact matches from allowlist
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  // Allow any localhost port for development
  if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) return true;

  return false;
}

/**
 * Get CORS headers with validated origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isAllowedOrigin(origin)
    ? origin!
    : ALLOWED_ORIGINS[0] || 'null';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}

/**
 * Handle CORS preflight request with origin validation
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    return new Response('ok', { headers: getCorsHeaders(origin) });
  }
  return null;
}

/**
 * Create JSON response with CORS headers
 *
 * @param data - Response body data
 * @param status - HTTP status code (default: 200)
 * @param origin - Origin header from request (for CORS validation)
 *                 Pass this for web requests; mobile apps can omit (uses wildcard)
 */
export function jsonResponse(
  data: unknown,
  status = 200,
  origin?: string | null
): Response {
  const headers = getCorsHeaders(origin ?? null);

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create error response with CORS headers
 *
 * @param message - Error message
 * @param code - Error code
 * @param status - HTTP status code (default: 400)
 * @param retryable - Whether the operation can be retried
 * @param retryAfterSeconds - Seconds to wait before retry
 * @param origin - Origin header from request (for CORS validation)
 */
export function errorResponse(
  message: string,
  code: string,
  status = 400,
  retryable = false,
  retryAfterSeconds?: number,
  origin?: string | null
): Response {
  return jsonResponse(
    {
      type: 'error',
      error: {
        code,
        message,
        retryable,
        ...(retryAfterSeconds && { retryAfterSeconds }),
      },
    },
    status,
    origin
  );
}
