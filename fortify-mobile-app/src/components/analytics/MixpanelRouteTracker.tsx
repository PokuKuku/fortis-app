import { useEffect, useRef } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { trackMixpanelEvent, trackMixpanelScreenView } from '@/src/lib/mixpanel';

interface OnboardingRouteMeta {
  screenId: string;
  screenIndex: number;
  stepId?: string;
}

const ONBOARDING_ROUTE_META: Record<string, OnboardingRouteMeta> = {
  welcome: { screenId: 'welcome', screenIndex: 1 },
  index: { screenId: 'profile_name', screenIndex: 2, stepId: 'profile_name' },
  greeting: { screenId: 'greeting', screenIndex: 3 },
  gender: { screenId: 'gender', screenIndex: 4, stepId: 'gender' },
  birthdate: { screenId: 'birthdate', screenIndex: 5, stepId: 'birthdate' },
  height: { screenId: 'height', screenIndex: 6, stepId: 'body_metrics' },
  weight: { screenId: 'weight', screenIndex: 7, stepId: 'body_metrics' },
  source: { screenId: 'source', screenIndex: 8, stepId: 'referral_source' },
  'fitness-background': {
    screenId: 'fitness_background',
    screenIndex: 9,
    stepId: 'fitness_background',
  },
  experience: {
    screenId: 'experience',
    screenIndex: 10,
    stepId: 'lifting_experience',
  },
  'other-apps': {
    screenId: 'other_apps',
    screenIndex: 11,
    stepId: 'tried_other_apps',
  },
  clarity: {
    screenId: 'clarity',
    screenIndex: 12,
    stepId: 'clarity_animation',
  },
  goal: { screenId: 'goal', screenIndex: 13, stepId: 'fitness_goals' },
  insights: {
    screenId: 'insights',
    screenIndex: 14,
    stepId: 'insights_preview',
  },
  'thank-you': {
    screenId: 'thank_you',
    screenIndex: 15,
    stepId: 'privacy_thank_you',
  },
  'social-proof': {
    screenId: 'social_proof',
    screenIndex: 16,
    stepId: 'social_proof',
  },
  rating: { screenId: 'rating', screenIndex: 17, stepId: 'app_rating' },
  notifications: {
    screenId: 'notifications',
    screenIndex: 18,
    stepId: 'notifications_prompt',
  },
  challenge: {
    screenId: 'challenge',
    screenIndex: 19,
    stepId: 'biggest_challenges',
  },
  consistency: {
    screenId: 'consistency',
    screenIndex: 20,
    stepId: 'workout_consistency',
  },
  complete: { screenId: 'complete', screenIndex: 21, stepId: 'complete' },
};

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

    if (topLevelSegment !== 'onboarding') {
      return;
    }

    const onboardingMeta = ONBOARDING_ROUTE_META[leafSegment];
    if (!onboardingMeta) {
      return;
    }

    void trackMixpanelEvent('onboarding_screen_viewed', {
      ...sharedRouteProperties,
      screen_id: onboardingMeta.screenId,
      screen_index: onboardingMeta.screenIndex,
      step_id: onboardingMeta.stepId,
      pathname: normalizedPathname,
    }).catch((error) => {
      console.warn(
        '[Mixpanel] Failed to track onboarding screen view:',
        normalizedPathname,
        error
      );
    });
  }, [pathname, segments]);

  return null;
}
