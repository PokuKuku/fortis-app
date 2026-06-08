import { useEffect, useRef } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

export function PostHogRouteTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const segments = useSegments();
  const previousPathnameRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const normalizedPathname = pathname
      ? pathname !== '/' && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname
      : null;

    if (!normalizedPathname || previousPathnameRef.current === normalizedPathname) return;

    posthog.screen(normalizedPathname, {
      previous_screen: previousPathnameRef.current ?? null,
      top_level_segment: segments[0] ?? 'root',
      segment_count: segments.length,
    });

    previousPathnameRef.current = normalizedPathname;
  }, [pathname, posthog, segments]);

  return null;
}
