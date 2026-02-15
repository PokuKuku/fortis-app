import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { shouldSuppressRouteChangeHaptic } from '@/src/components/haptics/navigationHaptics';

export function RouteChangeHaptics() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    if (
      lastPathRef.current &&
      lastPathRef.current !== pathname &&
      !shouldSuppressRouteChangeHaptic()
    ) {
      Haptics.selectionAsync().catch(() => undefined);
    }

    lastPathRef.current = pathname;
  }, [pathname]);

  return null;
}
