# Security Audit Report: Authentication & Authorization
**Audit Date:** 2025-12-23
**Auditor:** Security Engineering Review
**Scope:** React Native Expo app with Supabase backend authentication

---

## Executive Summary

This audit examined the authentication implementation in the Fortis workout tracking application. The application demonstrates **strong security fundamentals** with proper use of Supabase Auth, Row-Level Security (RLS), and secure token management. However, **several critical vulnerabilities** were identified that could allow authentication bypass, token exposure, and unauthorized data access.

**Overall Risk Level:** 🟡 **MEDIUM-HIGH**

---

## Critical Findings

### 1. OAuth Token Exposure in URL Fragment (Google Sign-In)
**File:** `/fortis-mobile-app/src/contexts/AuthContext.tsx:242-250`
**Severity:** 🔴 **HIGH**
**Confidence:** 10/10

#### Vulnerability
```typescript
const url = result.url;
// Extract tokens from URL and set session
const params = new URLSearchParams(url.split('#')[1]);
const accessToken = params.get('access_token');
const refreshToken = params.get('refresh_token');

if (accessToken && refreshToken) {
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}
```

OAuth tokens are extracted from URL fragments and parsed manually. This introduces several attack vectors:

**Attack Scenarios:**
1. **URL Interception:** If the OAuth callback URL is logged (analytics, crash reporting, browser history), tokens are exposed in plaintext
2. **Deep Link Hijacking:** Malicious apps could register the same `fortis://auth/callback` URL scheme and intercept the OAuth response
3. **Referer Leakage:** If the app navigates after OAuth, the fragment may be leaked via HTTP Referer headers
4. **XSS (if webview used):** Any XSS in the OAuth flow could extract tokens from `window.location.hash`

**Exploitation:**
```bash
# Attacker registers malicious app with same URL scheme
# Victim initiates Google OAuth
# Malicious app intercepts:
fortis://auth/callback#access_token=eyJhbG...&refresh_token=v1.MRj...

# Attacker now has full account access
```

**Recommendation:**
- Use PKCE (Proof Key for Code Exchange) flow instead of implicit flow
- Never parse tokens from URL fragments manually
- Use Supabase's built-in OAuth handling with `skipBrowserRedirect: false`
- Implement URL scheme verification to prevent deep link hijacking

---

### 2. Insecure Token Storage (AsyncStorage)
**File:** `/fortis-mobile-app/src/lib/supabase.ts:9-22`
**Severity:** 🔴 **HIGH**
**Confidence:** 9/10

#### Vulnerability
```typescript
// Note: We use AsyncStorage instead of SecureStore because JWT tokens
// can exceed SecureStore's 2048 byte limit. AsyncStorage has no size limit
// and is still secure due to iOS/Android app sandboxing.
const ExpoStorageAdapter = {
  getItem: async (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  // ...
};
```

**Issues:**
1. **AsyncStorage is NOT encrypted** - tokens are stored in plaintext on device
2. **Device backup exposure** - tokens can leak via iTunes/iCloud backups (iOS) or ADB backups (Android)
3. **Root/jailbreak access** - on compromised devices, any app can read AsyncStorage
4. **No token rotation** - if tokens are stolen, they remain valid until expiration

**Comment Misleading:** The comment claims "AsyncStorage is still secure due to app sandboxing" - this is **FALSE**:
- Sandboxing only prevents OTHER apps from reading data
- Does NOT protect against device backups, root access, or physical device extraction
- SecureStore uses hardware-backed keystore (iOS Keychain, Android Keystore)

**Attack Scenarios:**
1. **Physical device access:** Attacker with physical access extracts AsyncStorage database
2. **Malware on rooted device:** Malware bypasses sandboxing and reads tokens
3. **iCloud/iTunes backup extraction:** Attacker with backup access retrieves tokens
4. **ADB backup extraction (Android):** Developer mode + ADB can extract AsyncStorage without root

**Exploitation:**
```bash
# Android - Extract AsyncStorage via ADB backup
adb backup -f backup.ab -noapk com.fortis.app
dd if=backup.ab bs=24 skip=1 | openssl zlib -d > backup.tar
tar -xvf backup.tar
cat apps/com.fortis.app/sp/RCTAsyncLocalStorage_V1/default

# Tokens now exposed in plaintext
```

**Recommendation:**
- **CRITICAL:** Split token storage:
  - Refresh token → SecureStore (always <2KB)
  - Access token → In-memory only (regenerate from refresh token on app restart)
- Enable `autoRefreshToken: true` in Supabase client (already done)
- Implement token rotation on each refresh
- Add backup exclusion flags for token storage paths

---

### 3. No Route Protection / Authentication Bypass
**File:** `/fortis-mobile-app/app/(tabs)/_layout.tsx:36-40`
**Severity:** 🟠 **MEDIUM-HIGH**
**Confidence:** 8/10

#### Vulnerability
```typescript
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.replace('/auth');
  }
}, [isLoading, isAuthenticated, router]);
```

**Issues:**
1. **Race condition:** Routes render BEFORE auth check completes
2. **Client-side only protection:** Easy to bypass by disabling JavaScript or manipulating state
3. **No server-side validation:** Protected routes accessible if RLS fails
4. **Redirect timing:** Brief window where unauthenticated users can see protected content

**Attack Scenarios:**
1. **Timing attack:** Navigate to protected route before `useEffect` fires
2. **State manipulation:** Modify Zustand store to set `isAuthenticated: true`
3. **AsyncStorage injection:** Write fake session to AsyncStorage before app loads

**Exploitation:**
```javascript
// In Chrome DevTools or React Native Debugger
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inject fake session
await AsyncStorage.setItem(
  'supabase.auth.token',
  JSON.stringify({
    currentSession: {
      access_token: 'fake-token',
      user: { id: 'attacker-id' }
    }
  })
);

// App loads, thinks user is authenticated
// Client shows protected UI (though API calls will fail)
```

**Recommendation:**
- Implement navigation guards at router level, not in individual components
- Use Expo Router's middleware/guards feature
- Show loading screen until auth state is confirmed
- Add server-side validation on ALL protected endpoints (RLS already does this, good!)

---

### 4. Missing CSRF Protection on State-Changing Operations
**File:** `/fortis-mobile-app/src/contexts/AuthContext.tsx` (entire file)
**Severity:** 🟠 **MEDIUM**
**Confidence:** 7/10

#### Vulnerability
The application does not implement CSRF tokens for authentication state changes (login, signup, OAuth callbacks).

**Attack Scenarios:**
1. **OAuth CSRF:** Attacker initiates OAuth flow, victim completes it, attacker's account linked to victim's OAuth
2. **Session fixation:** Attacker forces victim to log in with attacker's session ID

**Exploitation:**
```html
<!-- Attacker's malicious website -->
<iframe src="fortis://auth/callback#access_token=ATTACKER_TOKEN&refresh_token=ATTACKER_REFRESH"></iframe>

<!-- Victim clicks, app auto-sets attacker's session -->
```

**Recommendation:**
- Implement `state` parameter in OAuth flows (random nonce verified on callback)
- Use PKCE for OAuth (prevents authorization code interception)
- Verify OAuth `state` matches stored value before setting session

---

### 5. Apple Sign-In Nonce Handling
**File:** `/fortis-mobile-app/src/contexts/AuthContext.tsx:273-294`
**Severity:** 🟡 **MEDIUM**
**Confidence:** 8/10

#### Vulnerability
```typescript
const nonce = Crypto.randomUUID();
const hashedNonce = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  nonce
);
```

**Issues:**
1. **No nonce persistence:** Nonce is generated but never stored for verification
2. **No replay attack protection:** Same nonce could theoretically be reused
3. **UUID as nonce:** While random, UUIDs are not cryptographically secure random

**Good Practice Present:**
✅ Nonce IS hashed before sending to Apple
✅ Original nonce sent to Supabase for verification

**Recommendation:**
- Use `Crypto.getRandomBytes()` instead of `randomUUID()` for cryptographic nonce
- Store nonce in SecureStore with timestamp, verify on callback
- Implement nonce expiration (5-10 minutes)

---

### 6. Error Message Information Disclosure
**File:** `/fortis-mobile-app/src/contexts/AuthContext.tsx:194,207`
**Severity:** 🟢 **LOW**
**Confidence:** 9/10

#### Vulnerability
```typescript
return { error: error ? new Error(error.message) : null };
```

Error messages from Supabase are returned directly to the UI. This can leak:
- Valid email addresses ("User already exists")
- Account status ("Account disabled")
- System details ("Database connection failed")

**Attack Scenarios:**
1. **Email enumeration:** Attacker tests if emails exist in system
2. **Account status disclosure:** Attacker learns if accounts are banned/disabled

**Recommendation:**
- Sanitize error messages before showing to users
- Use generic messages: "Authentication failed. Please try again."
- Log detailed errors server-side only

---

### 7. No Session Timeout / Idle Logout
**File:** `/fortis-mobile-app/src/contexts/AuthContext.tsx` (entire file)
**Severity:** 🟡 **MEDIUM**
**Confidence:** 10/10

#### Vulnerability
The application does not implement automatic session timeout or idle user detection.

**Attack Scenarios:**
1. User leaves app open on shared device
2. Token stolen but user doesn't realize for days/weeks
3. Lost/stolen device with active session

**Recommendation:**
- Implement idle timeout (e.g., 15 minutes of inactivity)
- Add "remember me" vs. "session only" option
- Implement device fingerprinting for session validation
- Add "active sessions" UI where users can revoke sessions

---

## Medium Priority Findings

### 8. Weak Password Policy
**File:** `/fortis-mobile-app/app/auth/email.tsx:31`
**Severity:** 🟡 **MEDIUM**
**Confidence:** 10/10

```typescript
password: z.string().min(6, 'Password must be at least 6 characters'),
```

**Issues:**
- 6 characters is below NIST/OWASP recommendations (min 8)
- No complexity requirements (uppercase, numbers, symbols)
- No password strength meter shown to users

**Recommendation:**
- Increase minimum to 8 characters
- Implement zxcvbn or similar password strength checker
- Show real-time password strength feedback

---

### 9. No Multi-Factor Authentication (MFA)
**File:** N/A
**Severity:** 🟡 **MEDIUM**
**Confidence:** 10/10

The application does not implement MFA/2FA.

**Recommendation:**
- Implement TOTP (Time-based One-Time Password) support
- Supabase supports MFA - add UI for enrollment/verification
- Make MFA mandatory for high-value accounts

---

### 10. Profile Auto-Creation Security
**File:** `/fortis-mobile-app/src/contexts/AuthContext.tsx:88-98`
**Severity:** 🟢 **LOW-MEDIUM**
**Confidence:** 7/10

```typescript
if (error.code === 'PGRST116') {
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: user?.email || '',
      preferred_units: 'imperial',
      onboarding_completed: false,
    })
```

**Issues:**
1. **Race condition:** Multiple simultaneous logins could create duplicate profiles
2. **Email could be empty:** `user?.email || ''` allows empty email in profile

**Recommendation:**
- Use database trigger for profile creation (atomic operation)
- Add `NOT NULL` constraint on email in profiles table
- Handle race condition with `ON CONFLICT DO NOTHING`

---

## Positive Security Findings ✅

### Excellent Practices Observed:

1. **✅ Row-Level Security (RLS) Properly Implemented**
   - All tables have `FORCE ROW LEVEL SECURITY`
   - Policies verify `auth.uid() = user_id` on all operations
   - Custom exercises scoped to owner only

2. **✅ Secure Database Functions**
   - All `SECURITY DEFINER` functions pin `search_path` (prevents search_path attacks)
   - AI mutation logger validates ownership before logging
   - Rate limiting implemented for AI endpoint

3. **✅ Input Validation**
   - Zod schemas for form validation
   - SQL injection prevented via Supabase client (parameterized queries)
   - AI endpoint validates all input (message length, image size, MIME types)

4. **✅ OAuth Implementation (mostly secure)**
   - Apple Sign-In uses nonce correctly
   - Google OAuth uses proper redirect URIs
   - No client secrets in mobile app (correct for native apps)

5. **✅ Token Auto-Refresh Enabled**
   - `autoRefreshToken: true` in Supabase config
   - Reduces window for token theft exploitation

6. **✅ Proper Session Cleanup on Logout**
   - Clears all stores (Zustand)
   - Invalidates caches
   - Signs out globally (`scope: 'global'`)

---

## Compliance & Best Practices

### OWASP Mobile Top 10 (2024)

| Risk | Status | Notes |
|------|--------|-------|
| M1: Improper Credential Usage | 🔴 **FAIL** | AsyncStorage for tokens (should use SecureStore) |
| M2: Inadequate Supply Chain Security | ✅ **PASS** | Dependencies appear legitimate |
| M3: Insecure Authentication/Authorization | 🟡 **PARTIAL** | RLS good, but client-side route protection weak |
| M4: Insufficient Input/Output Validation | ✅ **PASS** | Zod validation, RLS prevents SQL injection |
| M5: Insecure Communication | ✅ **PASS** | HTTPS via Supabase |
| M6: Inadequate Privacy Controls | 🟡 **PARTIAL** | User data scoped properly, but no GDPR export/delete UI |
| M7: Insufficient Binary Protection | ⚠️ **N/A** | Not audited (requires binary analysis) |
| M8: Security Misconfiguration | 🟡 **PARTIAL** | Weak password policy, no MFA |
| M9: Insecure Data Storage | 🔴 **FAIL** | Tokens in AsyncStorage unencrypted |
| M10: Insufficient Cryptography | ✅ **PASS** | Proper use of SHA256, UUIDs |

---

## Recommended Immediate Actions

### Priority 1 (Critical - Fix Within 7 Days)
1. **Migrate refresh tokens to SecureStore**
2. **Implement PKCE for Google OAuth**
3. **Add deep link verification for OAuth callbacks**
4. **Exclude token storage from device backups**

### Priority 2 (High - Fix Within 30 Days)
1. **Implement navigation guards at router level**
2. **Add CSRF protection (state parameter) to OAuth flows**
3. **Increase password minimum to 8 characters**
4. **Add session timeout (idle logout)**

### Priority 3 (Medium - Fix Within 90 Days)
1. **Implement MFA/2FA**
2. **Add password strength meter**
3. **Sanitize authentication error messages**
4. **Implement device fingerprinting**

---

## Code Remediation Examples

### 1. Secure Token Storage (Priority 1)

```typescript
// src/lib/supabase.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SecureStorageAdapter = {
  getItem: async (key: string) => {
    // Refresh tokens → SecureStore (encrypted, hardware-backed)
    if (key.includes('refresh')) {
      return await SecureStore.getItemAsync(key);
    }
    // Access tokens → AsyncStorage (regenerated on restart)
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (key.includes('refresh')) {
      // Exclude from backups
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (key.includes('refresh')) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 2. PKCE for Google OAuth (Priority 1)

```typescript
// src/contexts/AuthContext.tsx
import * as Crypto from 'expo-crypto';

const signInWithGoogle = useCallback(async () => {
  try {
    // Generate PKCE verifier and challenge
    const codeVerifier = Crypto.randomUUID() + Crypto.randomUUID();
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier
    );

    const redirectTo = makeRedirectUri({
      scheme: 'fortis',
      path: 'auth/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false, // Let Supabase handle token exchange
        queryParams: {
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          prompt: 'select_account',
        },
      },
    });

    // Supabase will automatically handle token exchange using PKCE
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}, []);
```

### 3. Navigation Guards (Priority 2)

```typescript
// app/_layout.tsx
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inProtectedGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inProtectedGroup) {
      // Redirect to auth if accessing protected routes while unauthenticated
      router.replace('/auth');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to app if authenticated and on auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading screen during auth check
  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Stack>...</Stack>;
}
```

---

## Conclusion

The Fortis application demonstrates **strong foundational security** with proper use of Supabase Auth, Row-Level Security, and input validation. However, **critical vulnerabilities in token storage and OAuth handling** pose significant risk.

**Most Critical Issues:**
1. Unencrypted token storage in AsyncStorage
2. Manual OAuth token parsing from URL fragments
3. Lack of client-side route protection

These issues are **exploitable by attackers with physical device access, malicious apps, or network access**, and should be addressed immediately.

**Estimated Remediation Time:**
- Priority 1 fixes: 16-24 hours of development
- Priority 2 fixes: 40-60 hours of development
- Priority 3 fixes: 80-120 hours of development

**Next Steps:**
1. Review this report with the development team
2. Create GitHub issues for each finding
3. Prioritize fixes based on risk and impact
4. Implement fixes with code review
5. Re-audit after remediation

---

**Report Classification:** CONFIDENTIAL
**Distribution:** Development Team, Security Team, Product Owner
