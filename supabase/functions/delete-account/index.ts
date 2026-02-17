import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, handleCors } from '../_shared/cors.ts';

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

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid authorization', 'unauthorized', 401, false, undefined, origin);
  }
  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    return errorResponse('Missing or invalid authorization', 'unauthorized', 401, false, undefined, origin);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error: userError } = await authClient.auth.getUser(accessToken);
  if (userError || !user) {
    return errorResponse('Unauthorized', 'unauthorized', 401, false, undefined, origin);
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return errorResponse(deleteError.message, 'delete_failed', 500, false, undefined, origin);
  }

  return jsonResponse({ status: 'ok' }, 200, origin);
});
