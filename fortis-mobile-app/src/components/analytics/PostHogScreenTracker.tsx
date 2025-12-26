import { useEffect, useMemo } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

export function PostHogScreenTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const segments = useSegments();
  const segmentPath = useMemo(() => segments.join('/'), [segments]);

  useEffect(() => {
    if (!posthog || !pathname) {
      return;
    }

    posthog.capture('$screen', {
      route: pathname,
      segments: segmentPath,
    });
  }, [posthog, pathname, segmentPath]);

  return null;
}
