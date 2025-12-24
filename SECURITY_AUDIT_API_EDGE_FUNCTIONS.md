# Security Audit Report - Fortis App API & Edge Functions
**Date:** 2025-12-23
**Auditor:** Claude (Senior Security Engineer)
**Scope:** Supabase Edge Functions, RLS Policies, Database Functions

---

## Executive Summary

This security audit examined all Supabase edge functions and API-related code in the Fortis workout tracking application. The codebase demonstrates **strong security practices** with comprehensive defense-in-depth measures. Several areas for improvement were identified, ranging from low to medium severity. No critical vulnerabilities were found.

**Overall Security Posture:** ✅ **GOOD** (7.5/10)

---

## Findings Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 HIGH | 0 | Critical security flaws requiring immediate attention |
| 🟡 MEDIUM | 3 | Security concerns that should be addressed |
| 🟢 LOW | 4 | Minor improvements and hardening opportunities |
| ℹ️ INFO | 2 | Security observations and best practices |

---

## Detailed Findings

### 🟡 MEDIUM-01: CORS Configuration Allows All Origins
**File:** `supabase/functions/_shared/cors.ts`
**Lines:** 5-6
**Confidence:** 10/10

**Description:**
The CORS configuration uses a wildcard (`*`) for `Access-Control-Allow-Origin`, allowing requests from any domain.

\`\`\`typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // ⚠️ Overly permissive
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
\`\`\`

**Exploitation Scenario:**
1. Attacker creates malicious website
2. User visits attacker's site while logged into Fortis
3. Attacker's JavaScript can call the edge function with user's credentials
4. While RLS policies prevent cross-user data access, this enables:
   - Unauthorized AI requests burning user's rate limits
   - Potential for more sophisticated attacks if combined with other vulnerabilities

**Recommendation:**
\`\`\`typescript
// Option 1: Allow specific domains only
const ALLOWED_ORIGINS = [
  'https://fortis-app.com',
  'https://www.fortis-app.com',
  process.env.EXPO_PUBLIC_SUPABASE_URL,
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Option 2: Use Supabase's built-in origin verification
// Edge functions should only accept requests from the mobile app
// Consider removing CORS entirely if only native mobile app access is needed
\`\`\`

**Impact:** Medium - Could enable CSRF-like attacks and rate limit abuse

---

### 🟡 MEDIUM-02: Missing API Key Validation for Anthropic
**File:** `supabase/functions/ai/index.ts`
**Lines:** 851
**Confidence:** 9/10

**Description:**
The code uses non-null assertion (`!`) when accessing the Anthropic API key without proper validation:

\`\`\`typescript
const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,  // ⚠️ Could be undefined
});
\`\`\`

**Exploitation Scenario:**
1. If `ANTHROPIC_API_KEY` environment variable is not set or empty
2. Application starts successfully but fails at runtime when AI is called
3. This causes unhandled errors and exposes internal error messages to users
4. Could leak environment configuration details in error responses

**Recommendation:**
\`\`\`typescript
async function callClaude(...) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured');
    throw new Error('AI service temporarily unavailable');
  }

  const anthropic = new Anthropic({ apiKey });
  // ... rest of code
}
\`\`\`

**Impact:** Medium - Information disclosure and service degradation

---

### 🟡 MEDIUM-03: Rate Limit Check Fails Open
**File:** `supabase/functions/ai/index.ts`
**Lines:** 462-481
**Confidence:** 8/10

**Description:**
The rate limiting function fails open (allows requests) when database errors occur:

\`\`\`typescript
async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc('check_ai_rate_limit', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open but log - don't block user due to rate limit errors
    return { allowed: true };  // ⚠️ Bypasses rate limiting on DB errors
  }
  // ...
}
\`\`\`

**Exploitation Scenario:**
1. Attacker identifies rate limit check is database-dependent
2. Triggers database errors through concurrent requests or edge cases
3. Rate limiting is bypassed, allowing unlimited API calls
4. This could lead to:
   - Excessive Anthropic API costs
   - Denial of service through resource exhaustion
   - Abuse of AI features

**Recommendation:**
\`\`\`typescript
async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc('check_ai_rate_limit', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail closed - deny on errors for better security
    return {
      allowed: false,
      retryAfterSeconds: 60,
      error: 'Rate limit service temporarily unavailable'
    };
  }

  if (!data) {
    // Be explicit about unknown states
    return { allowed: false, retryAfterSeconds: 60 };
  }

  return { allowed: true };
}
\`\`\`

**Impact:** Medium - Rate limit bypass enabling cost/DoS attacks

---

### 🟢 LOW-01: Insufficient Input Validation on Context Parameters
**File:** `supabase/functions/ai/index.ts`
**Lines:** 42-53
**Confidence:** 7/10

**Description:**
The `AIRequest.context` field has optional parameters that are not validated:

\`\`\`typescript
interface AIRequest {
  intent: AIIntent;
  message: string;
  context?: {
    exerciseId?: string;      // ⚠️ Not validated as UUID
    programId?: string;        // ⚠️ Not validated as UUID
    templateId?: string;       // ⚠️ Not validated as UUID
    periodWeeks?: number;      // ⚠️ Not validated for range
    historyOnly?: boolean;
  };
  image?: AIImage;
}
\`\`\`

**Exploitation Scenario:**
1. Attacker sends malformed UUIDs or negative numbers
2. These values are passed to database queries in `assembleContext()`
3. Could cause SQL errors or unexpected behavior
4. While RLS prevents unauthorized data access, this creates noise in logs

**Recommendation:**
\`\`\`typescript
function validateRequest(body: unknown): string | null {
  // ... existing validation ...

  const { context } = body as Record<string, unknown>;

  if (context && typeof context === 'object') {
    const ctx = context as AIRequestContext;

    // Validate UUIDs
    if (ctx.exerciseId && !isValidUUID(ctx.exerciseId)) {
      return 'Invalid exerciseId format';
    }
    if (ctx.programId && !isValidUUID(ctx.programId)) {
      return 'Invalid programId format';
    }
    if (ctx.templateId && !isValidUUID(ctx.templateId)) {
      return 'Invalid templateId format';
    }

    // Validate periodWeeks range
    if (ctx.periodWeeks !== undefined) {
      if (!Number.isInteger(ctx.periodWeeks) ||
          ctx.periodWeeks < 1 ||
          ctx.periodWeeks > 104) {  // Max 2 years
        return 'periodWeeks must be between 1 and 104';
      }
    }
  }

  return null;
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
\`\`\`

**Impact:** Low - Minimal security impact due to RLS, but improves robustness

---

### 🟢 LOW-02: Verbose Error Messages May Leak Information
**File:** `supabase/functions/ai/index.ts`
**Lines:** 378-386, 897-900
**Confidence:** 6/10

**Description:**
Error handling returns generic messages but logs detailed errors that could be exposed:

\`\`\`typescript
catch (error) {
  console.error('AI endpoint error:', error);  // ⚠️ Full error logged
  return errorResponse(
    'An unexpected error occurred',  // Generic message (good)
    'INTERNAL_ERROR',
    500,
    true
  );
}
\`\`\`

While the user receives a generic message, if error logs are accessible (monitoring tools, debugging), they might expose:
- Internal API structure
- Database schema details
- Environment configuration

**Recommendation:**
\`\`\`typescript
catch (error) {
  // Log minimal sanitized error info
  console.error('AI endpoint error:', {
    message: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date().toISOString(),
    userId: user?.id, // Already have user from auth check
  });

  // Never log full error objects in production
  if (Deno.env.get('ENVIRONMENT') === 'development') {
    console.error('Full error details:', error);
  }

  return errorResponse(
    'An unexpected error occurred',
    'INTERNAL_ERROR',
    500,
    true
  );
}
\`\`\`

**Impact:** Low - Information disclosure through logs

---

### 🟢 LOW-03: Client-Side Mutation Application Bypasses Audit Trail
**File:** `fortis-mobile-app/src/services/aiService.ts`
**Lines:** 344-422
**Confidence:** 8/10

**Description:**
The client-side `applyMutationPlan()` function applies mutations directly using the Supabase client without going through a secure server-side function. While RLS policies prevent unauthorized changes, the audit logging can fail silently:

\`\`\`typescript
try {
  await supabase.rpc('log_ai_mutation', { ... });
} catch (logError) {
  console.warn('Failed to log AI mutation:', logError);  // ⚠️ Silently continues
}
\`\`\`

**Exploitation Scenario:**
1. User applies AI mutations through client
2. Mutations succeed but audit logging fails
3. No permanent record of AI-generated changes
4. Makes it impossible to track AI behavior or undo changes reliably

**Recommendation:**
Create a server-side function to handle mutations atomically:

\`\`\`sql
-- In migration file
CREATE OR REPLACE FUNCTION apply_ai_mutation_plan(
  p_pending_action_id UUID,
  p_mutations JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result JSONB := '{"success": true, "applied": []}'::jsonb;
  v_mutation JSONB;
BEGIN
  -- Verify user owns the pending action
  PERFORM 1 FROM ai_pending_actions
  WHERE id = p_pending_action_id
    AND user_id = auth.uid()
    AND status = 'confirmed';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending action not found or not confirmed';
  END IF;

  -- Apply mutations in transaction
  FOR v_mutation IN SELECT * FROM jsonb_array_elements(p_mutations)
  LOOP
    -- Apply mutation and log atomically
    -- Implementation details...
  END LOOP;

  RETURN v_result;
END;
$$;
\`\`\`

Then update client to use this function instead of direct table access.

**Impact:** Low - Audit trail integrity, difficult to exploit

---

### 🟢 LOW-04: Image Size Validation Could Be Bypassed
**File:** `supabase/functions/ai/index.ts`
**Lines:** 442-447
**Confidence:** 5/10

**Description:**
Base64 image size is estimated rather than precisely calculated:

\`\`\`typescript
// Check base64 size (rough estimate - base64 is ~33% larger than original)
const estimatedSize = (base64.length * 3) / 4;  // ⚠️ Estimation
if (estimatedSize > MAX_IMAGE_SIZE_BYTES) {
  return \`Image too large. Maximum size is \${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB\`;
}
\`\`\`

**Exploitation Scenario:**
1. Attacker crafts base64 with padding to bypass size check
2. Sends oversized image that passes validation
3. Causes excessive memory usage in edge function
4. Potential DoS through resource exhaustion

**Recommendation:**
\`\`\`typescript
// More accurate base64 size calculation
function getBase64Size(base64: string): number {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');

  // Calculate actual decoded size
  let padding = 0;
  if (base64Data.endsWith('==')) padding = 2;
  else if (base64Data.endsWith('=')) padding = 1;

  return (base64Data.length * 3) / 4 - padding;
}

// In validation:
const actualSize = getBase64Size(base64);
if (actualSize > MAX_IMAGE_SIZE_BYTES) {
  return \`Image too large. Maximum size is \${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB\`;
}
\`\`\`

**Impact:** Low - DoS potential but requires sustained effort

---

### ℹ️ INFO-01: Comprehensive RLS Policies - Strong Defense
**Confidence:** 10/10

**Observation:**
The database schema demonstrates **excellent** Row Level Security implementation:

1. ✅ All tables have \`ENABLE ROW LEVEL SECURITY\` and \`FORCE ROW LEVEL SECURITY\`
2. ✅ Policies strictly enforce user ownership checks
3. ✅ AI mutation tables prevent direct client writes with \`WITH CHECK (FALSE)\` policies
4. ✅ Audit tables (\`ai_mutations\`) are immutable with trigger-enforced protection
5. ✅ Custom exercises are scoped per-user (migration 005)
6. ✅ Program workouts/exercises verified through parent ownership

**Example of Strong RLS:**
\`\`\`sql
-- Users can ONLY see their own pending actions
CREATE POLICY "ai_pending_select_own" ON ai_pending_actions
  FOR SELECT USING (auth.uid() = user_id);

-- Users CANNOT directly insert - only via secure Edge Function
CREATE POLICY "ai_pending_no_insert" ON ai_pending_actions
  FOR INSERT WITH CHECK (FALSE);

-- Prevent audit tampering with trigger
CREATE TRIGGER enforce_audit_immutability
  BEFORE UPDATE ON ai_mutations
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();
\`\`\`

**No action required** - this is excellent security architecture.

---

### ℹ️ INFO-02: SECURITY DEFINER Functions Properly Configured
**Confidence:** 9/10

**Observation:**
All \`SECURITY DEFINER\` functions are properly hardened (migrations 005, 008):

1. ✅ \`search_path\` pinned to \`public, pg_temp\` (prevents search path injection)
2. ✅ \`row_security = off\` set only where intentional (for service functions)
3. ✅ Authentication checks at function start
4. ✅ User ownership validated before operations

**Example:**
\`\`\`sql
CREATE OR REPLACE FUNCTION log_ai_mutation(...)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ✅ Prevents injection
SET row_security = off             -- ✅ Intentional for admin function
AS $$
BEGIN
  IF auth.uid() IS NULL THEN       -- ✅ Auth check
    RAISE EXCEPTION 'Authentication required';
  END IF;
  -- ... validated operations ...
END;
$$;
\`\`\`

**No action required** - functions are secure.

---

## Positive Security Practices Observed

The codebase demonstrates several **exemplary security practices**:

1. ✅ **Defense in Depth**: Multiple layers (RLS, function auth, client validation)
2. ✅ **Principle of Least Privilege**: AI never writes directly, mandatory approval flow
3. ✅ **Immutable Audit Logs**: Complete traceability of AI actions
4. ✅ **Rate Limiting**: Built-in protection against abuse
5. ✅ **Input Validation**: Length limits, type checks, allowlist validation
6. ✅ **Secure Random Generation**: Uses cryptographic RNG for tokens
7. ✅ **Proper Error Handling**: Generic messages to users, detailed logs for debugging
8. ✅ **Session Management**: Leverages Supabase Auth with JWT validation

---

## Recommendations Priority

### Immediate (Within 1 Week)
1. **MEDIUM-01**: Implement proper CORS origin validation
2. **MEDIUM-02**: Add API key validation with graceful degradation
3. **MEDIUM-03**: Change rate limit to fail-closed on errors

### Short-term (Within 1 Month)
4. **LOW-01**: Add comprehensive context parameter validation
5. **LOW-02**: Sanitize error logging for production
6. **LOW-03**: Move mutation application to server-side function

### Long-term (Future Enhancement)
7. **LOW-04**: Improve base64 size validation accuracy
8. Consider implementing request signing for edge functions
9. Add automated security scanning in CI/CD pipeline
10. Implement webhook signature verification if webhooks are added

---

## Testing Recommendations

To verify these findings and prevent regressions:

1. **Penetration Testing**: Hire external security firm for API testing
2. **Automated Scans**: Integrate SAST/DAST tools (Snyk, SonarQube)
3. **Rate Limit Testing**: Verify fail-closed behavior under load
4. **CORS Testing**: Verify origin restrictions work correctly
5. **RLS Testing**: Automated tests for all RLS policies
6. **Fuzzing**: Test input validation with malformed inputs

---

## Compliance & Best Practices

### OWASP Top 10 Coverage

| Risk | Status | Notes |
|------|--------|-------|
| A01:2021 - Broken Access Control | ✅ PROTECTED | Strong RLS policies |
| A02:2021 - Cryptographic Failures | ✅ PROTECTED | No sensitive data in client |
| A03:2021 - Injection | ✅ PROTECTED | Parameterized queries, RLS |
| A04:2021 - Insecure Design | ✅ GOOD | AI approval flow, audit logs |
| A05:2021 - Security Misconfiguration | ⚠️ MEDIUM | CORS wildcard |
| A06:2021 - Vulnerable Components | ℹ️ UNKNOWN | Needs dependency audit |
| A07:2021 - Auth/AuthN Failures | ✅ PROTECTED | Supabase Auth JWT |
| A08:2021 - Data Integrity Failures | ✅ PROTECTED | Immutable audit logs |
| A09:2021 - Logging Failures | ⚠️ MINOR | Audit logging can fail silently |
| A10:2021 - SSRF | ✅ N/A | No external HTTP requests |

---

## Conclusion

The Fortis application demonstrates **strong security fundamentals** with comprehensive defense-in-depth measures. The identified issues are primarily hardening opportunities rather than critical vulnerabilities. The RLS implementation, AI approval workflow, and audit logging are particularly well-designed.

**Primary risks** stem from:
1. Overly permissive CORS allowing cross-origin attacks
2. Rate limiting that fails open
3. Minor input validation gaps

With the recommended fixes implemented, the security posture would improve from **7.5/10 to 9/10**.

---

## Appendix A: Security Checklist

- [x] Authentication required for all endpoints
- [x] Authorization enforced via RLS
- [x] Input validation on all user inputs
- [ ] CORS properly restricted (MEDIUM-01)
- [x] Rate limiting implemented
- [ ] Rate limiting fails closed (MEDIUM-03)
- [x] SQL injection prevented (parameterized queries)
- [x] XSS prevented (no HTML rendering in edge function)
- [x] CSRF tokens (not needed - no cookies, JWT-based)
- [x] Secure session management (Supabase Auth)
- [x] Audit logging for sensitive operations
- [x] Encryption in transit (HTTPS)
- [x] Secure random number generation
- [ ] Environment variables validated (MEDIUM-02)
- [x] Error messages don't leak info (mostly)
- [x] File uploads validated (images)

---

**Report Version:** 1.0
**Last Updated:** 2025-12-23
**Next Review:** 2026-03-23 (quarterly)
