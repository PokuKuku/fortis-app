import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { identifyMixpanelUser, resetMixpanelUser } from '@/src/lib/mixpanel';

export function MixpanelAuthSync() {
  const { isAuthenticated, user, profile } = useAuth();
  const lastSyncedSignatureRef = useRef<string | null>(null);
  const hadAuthenticatedUserRef = useRef(false);

  const identitySignature = useMemo(() => {
    if (!isAuthenticated || !user?.id) {
      return null;
    }

    return JSON.stringify({
      distinctId: user.id,
      email: user.email ?? profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      preferredUnits: profile?.preferred_units ?? null,
      onboardingCompleted: profile?.onboarding_completed ?? null,
      themeMode: profile?.theme_mode ?? null,
      accentColor: profile?.accent_color ?? null,
    });
  }, [
    isAuthenticated,
    profile?.accent_color,
    profile?.email,
    profile?.full_name,
    profile?.onboarding_completed,
    profile?.preferred_units,
    profile?.theme_mode,
    user?.email,
    user?.id,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (!hadAuthenticatedUserRef.current) {
        return;
      }

      hadAuthenticatedUserRef.current = false;
      lastSyncedSignatureRef.current = null;
      void resetMixpanelUser().catch((error) => {
        console.warn('[Mixpanel] Failed to clear authenticated user state:', error);
      });
      return;
    }

    hadAuthenticatedUserRef.current = true;

    if (!identitySignature || lastSyncedSignatureRef.current === identitySignature) {
      return;
    }

    lastSyncedSignatureRef.current = identitySignature;
    void identifyMixpanelUser({
      distinctId: user.id,
      email: user.email ?? profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      preferredUnits: profile?.preferred_units ?? null,
      onboardingCompleted: profile?.onboarding_completed ?? null,
      themeMode: profile?.theme_mode ?? null,
      accentColor: profile?.accent_color ?? null,
    }).catch((error) => {
      console.warn('[Mixpanel] Failed to sync authenticated user context:', error);
    });
  }, [
    identitySignature,
    isAuthenticated,
    profile?.accent_color,
    profile?.email,
    profile?.full_name,
    profile?.onboarding_completed,
    profile?.preferred_units,
    profile?.theme_mode,
    user?.email,
    user?.id,
  ]);

  return null;
}
