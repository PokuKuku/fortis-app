import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, handleCors } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const origin = req.headers.get('origin');

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 'method_not_allowed', 405, false, undefined, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return errorResponse('Supabase service configuration missing', 'config_error', 500, false, undefined, origin);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    const [{ count, error: countError }, { data: meta, error: metaError }] =
      await Promise.all([
        supabase
          .from('exercises')
          .select('id', { count: 'exact', head: true })
          .eq('is_custom', false),
        supabase
          .from('exercise_library_meta')
          .select('version, updated_at')
          .eq('id', 1)
          .single(),
      ]);

    if (countError) {
      throw new Error(countError.message);
    }
    if (metaError) {
      throw new Error(metaError.message);
    }

    return jsonResponse({
      status: 'ok',
      exerciseLibrary: {
        canonicalSource: 'mobile-bundled-360',
        supabaseRole: 'fallback-and-custom-sync',
        count: count ?? 0,
        version: meta?.version ?? null,
        updatedAt: meta?.updated_at ?? null,
      },
      timestamp: new Date().toISOString(),
    }, 200, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 'health_check_failed', 500, false, undefined, origin);
  }
});
