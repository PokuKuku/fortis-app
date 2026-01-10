import { useEffect, useMemo } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { analytics } from '@/src/services/analyticsService';

export function MixpanelScreenTracker() {
  const pathname = usePathname();
  const segments = useSegments();
  const segmentPath = useMemo(() => segments.join('/'), [segments]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    analytics.trackScreenViewed({
      route: pathname,
      segments: segmentPath,
    });
  }, [pathname, segmentPath]);

  return null;
}
