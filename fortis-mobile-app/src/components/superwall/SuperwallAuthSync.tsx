import { useEffect } from 'react';
import { useSuperwall, useUser } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';

export function SuperwallAuthSync() {
  const { user } = useAuth();
  const { identify, signOut, refresh, getEntitlements, setSubscriptionStatus } = useUser();
  const { isLoaded, hasError } = useSuperwall((state) => ({
    isLoaded: !state.isLoading && state.isConfigured,
    hasError: state.configurationError !== null,
  }));

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        // Superwall can take a moment to configure; avoid doing a one-time sync too early.
        if (!isLoaded || hasError) {
          return;
        }

        if (user?.id) {
          await identify(user.id);
          await refresh();
          try {
            const entitlements = await getEntitlements();
            if (entitlements.active.length > 0) {
              await setSubscriptionStatus({
                status: 'ACTIVE',
                entitlements: entitlements.active,
              });
            } else {
              await setSubscriptionStatus({ status: 'INACTIVE' });
            }
          } catch (error) {
            console.warn('[Superwall] Failed to refresh entitlements:', error);
          }
          return;
        }

        await signOut();
      } catch (error) {
        if (isMounted) {
          console.warn('[Superwall] Failed to sync user:', error);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [hasError, identify, isLoaded, refresh, signOut, user?.id]);

  return null;
}
