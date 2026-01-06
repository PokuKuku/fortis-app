import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

export function RouteChangeHaptics() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    if (lastPathRef.current && lastPathRef.current !== pathname) {
      Haptics.selectionAsync().catch(() => undefined);
    }

    lastPathRef.current = pathname;
  }, [pathname]);

  return null;
}
