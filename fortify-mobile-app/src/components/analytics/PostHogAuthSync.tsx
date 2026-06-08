import { useEffect, useMemo, useRef } from 'react';
import { usePostHog } from 'posthog-react-native';
import { useAuth } from '@/src/contexts/AuthContext';

export function PostHogAuthSync() {
  const posthog = usePostHog();
  const { isAuthenticated, user, profile } = useAuth();
  const lastSyncedSignatureRef = useRef<string | null>(null);
  const hadAuthenticatedUserRef = useRef(false);

  const identitySignature = useMemo(() => {
    if (!isAuthenticated || !user?.id) return null;

    return JSON.stringify({
      distinctId: user.id,
      email: user.email ?? profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      preferredUnits: profile?.preferred_units ?? null,
      onboardingCompleted: profile?.onboarding_completed ?? null,
    });
  }, [
    isAuthenticated,
    profile?.email,
    profile?.full_name,
    profile?.onboarding_completed,
    profile?.preferred_units,
    user?.email,
    user?.id,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (!hadAuthenticatedUserRef.current) return;
      hadAuthenticatedUserRef.current = false;
      lastSyncedSignatureRef.current = null;
      posthog.reset();
      return;
    }

    hadAuthenticatedUserRef.current = true;
    if (!identitySignature || lastSyncedSignatureRef.current === identitySignature) return;

    lastSyncedSignatureRef.current = identitySignature;

    const props: Record<string, string | boolean> = {};
    const email = user?.email ?? profile?.email;
    if (email) props['email'] = email;
    if (profile?.full_name) props['name'] = profile.full_name;
    if (profile?.preferred_units) props['preferred_units'] = profile.preferred_units;
    if (profile?.onboarding_completed !== undefined) {
      props['onboarding_completed'] = profile.onboarding_completed;
    }

    posthog.identify(user.id, props);
  }, [
    identitySignature,
    isAuthenticated,
    posthog,
    profile?.email,
    profile?.full_name,
    profile?.onboarding_completed,
    profile?.preferred_units,
    user?.email,
    user?.id,
  ]);

  return null;
}
