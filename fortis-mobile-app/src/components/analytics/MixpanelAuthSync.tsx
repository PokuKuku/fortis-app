import { useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { initMixpanel } from '@/src/lib/mixpanel';

export function MixpanelAuthSync() {
  const { user, profile } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const syncMixpanel = async () => {
      const mixpanel = await initMixpanel();
      if (!mixpanel || !isMounted) {
        return;
      }

      if (user?.id) {
        mixpanel.identify(user.id);
        mixpanel.getPeople().set({
          $email: user.email ?? undefined,
          $name: profile?.full_name ?? undefined,
          preferred_units: profile?.preferred_units ?? undefined,
          onboarding_completed: profile?.onboarding_completed ?? undefined,
        });
      } else {
        mixpanel.reset();
      }
    };

    void syncMixpanel();

    return () => {
      isMounted = false;
    };
  }, [
    user?.id,
    user?.email,
    profile?.full_name,
    profile?.preferred_units,
    profile?.onboarding_completed,
  ]);

  return null;
}
