import { useEffect, useRef } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { trackMixpanelEvent, trackMixpanelScreenView } from '@/src/lib/mixpanel';

interface OnboardingRouteMeta {
  screenId: string;
  screenIndex: number;
  stepId?: string;
}

const ONBOARDING_ROUTE_META: Record<string, OnboardingRouteMeta> = {
  '/onboarding/welcome': { screenId: 'welcome', screenIndex: 1, stepId: 'profile_name' },
  '/onboarding/greeting': { screenId: 'greeting', screenIndex: 2 },
  '/onboarding/gender': { screenId: 'gender', screenIndex: 3, stepId: 'gender' },
  '/onboarding/birthdate': { screenId: 'birthdate', screenIndex: 4, stepId: 'birthdate' },
  '/onboarding/height': { screenId: 'height', screenIndex: 5, stepId: 'body_metrics' },
  '/onboarding/weight': { screenId: 'weight', screenIndex: 6, stepId: 'body_metrics' },
  '/onboarding/source': { screenId: 'source', screenIndex: 7, stepId: 'referral_source' },
  '/onboarding/fitness-background': {
    screenId: 'fitness_background',
    screenIndex: 8,
    stepId: 'fitness_background',
  },
  '/onboarding/experience': {
    screenId: 'experience',
    screenIndex: 9,
    stepId: 'lifting_experience',
  },
  '/onboarding/other-apps': {
    screenId: 'other_apps',
    screenIndex: 10,
    stepId: 'tried_other_apps',
  },
  '/onboarding/clarity': {
    screenId: 'clarity',
    screenIndex: 11,
    stepId: 'clarity_animation',
  },
  '/onboarding/goal': { screenId: 'goal', screenIndex: 12, stepId: 'fitness_goals' },
  '/onboarding/insights': {
    screenId: 'insights',
    screenIndex: 13,
    stepId: 'insights_preview',
  },
  '/onboarding/thank-you': {
    screenId: 'thank_you',
    screenIndex: 14,
    stepId: 'privacy_thank_you',
  },
  '/onboarding/social-proof': {
    screenId: 'social_proof',
    screenIndex: 15,
    stepId: 'social_proof',
  },
  '/onboarding/rating': { screenId: 'rating', screenIndex: 16, stepId: 'app_rating' },
  '/onboarding/notifications': {
    screenId: 'notifications',
    screenIndex: 17,
    stepId: 'notifications_prompt',
  },
  '/onboarding/challenge': {
    screenId: 'challenge',
    screenIndex: 18,
    stepId: 'biggest_challenges',
  },
  '/onboarding/consistency': {
    screenId: 'consistency',
    screenIndex: 19,
    stepId: 'workout_consistency',
  },
  '/onboarding/complete': { screenId: 'complete', screenIndex: 20, stepId: 'complete' },
};

export function MixpanelRouteTracker() {
  const pathname = usePathname();
  const segments = useSegments();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTrackedPathRef.current === pathname) {
      return;
    }

    lastTrackedPathRef.current = pathname;

    const sharedRouteProperties = {
      top_level_segment: segments[0] ?? 'root',
      leaf_segment: segments[segments.length - 1] ?? 'root',
      segment_count: segments.length,
    };

    void trackMixpanelScreenView(pathname, sharedRouteProperties).catch((error) => {
      console.warn('[Mixpanel] Failed to track screen view:', pathname, error);
    });

    const onboardingMeta = ONBOARDING_ROUTE_META[pathname];
    if (!onboardingMeta) {
      return;
    }

    void trackMixpanelEvent('onboarding_screen_viewed', {
      ...sharedRouteProperties,
      screen_id: onboardingMeta.screenId,
      screen_index: onboardingMeta.screenIndex,
      step_id: onboardingMeta.stepId,
      pathname,
    }).catch((error) => {
      console.warn('[Mixpanel] Failed to track onboarding screen view:', pathname, error);
    });
  }, [pathname, segments]);

  return null;
}
