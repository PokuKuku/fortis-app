import { useEffect, useRef } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { trackMixpanelScreenView } from '@/src/lib/mixpanel';

export function MixpanelRouteTracker() {
  const pathname = usePathname();
  const segments = useSegments();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const normalizedPathname = pathname
      ? pathname !== '/' && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname
      : null;

    if (!normalizedPathname || lastTrackedPathRef.current === normalizedPathname) {
      return;
    }

    lastTrackedPathRef.current = normalizedPathname;

    const topLevelSegment = segments[0] ?? 'root';
    const leafSegment =
      topLevelSegment === 'onboarding'
        ? segments[1] ?? 'index'
        : segments[segments.length - 1] ?? 'root';

    const sharedRouteProperties = {
      top_level_segment: topLevelSegment,
      leaf_segment: leafSegment,
      segment_count: segments.length,
    };

    void trackMixpanelScreenView(normalizedPathname, sharedRouteProperties).catch((error) => {
      console.warn('[Mixpanel] Failed to track screen view:', normalizedPathname, error);
    });
  }, [pathname, segments]);

  return null;
}
