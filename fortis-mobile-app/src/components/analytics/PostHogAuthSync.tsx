import { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';
import { useAuth } from '@/src/contexts/AuthContext';

export function PostHogAuthSync() {
  const posthog = usePostHog();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!posthog) {
      return;
    }

    if (user?.id) {
      posthog.identify(user.id, {
        email: user.email ?? undefined,
        full_name: profile?.full_name ?? undefined,
        preferred_units: profile?.preferred_units ?? undefined,
        onboarding_completed: profile?.onboarding_completed ?? undefined,
      });
    } else {
      posthog.reset();
    }
  }, [
    posthog,
    user?.id,
    user?.email,
    profile?.full_name,
    profile?.preferred_units,
    profile?.onboarding_completed,
  ]);

  return null;
}
