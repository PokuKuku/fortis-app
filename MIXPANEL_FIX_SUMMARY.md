# Fortify Mixpanel Fix Summary

Date: 2026-04-23

## What Was Broken

- The dashboard funnel expects exact event names like `Welcome Screen` and `Q2. What's your gender?`, but the app emitted generic `onboarding_screen_viewed` events.
- Most screen-specific onboarding analytics fired on Continue, not when the user landed on the screen.
- The normal flow skipped `/onboarding/weight`, so the `Q5. What's your weight?` funnel step could not fire.
- Missing Mixpanel tokens failed silently, Mixpanel startup was lazy only, and funnel events were not manually flushed for Live View.
- The root package used `mixpanel-browser`, which is not the React Native SDK.

## What Changed

- `fortify-mobile-app/src/lib/mixpanel.ts`: initializes once, warns when `EXPO_PUBLIC_MIXPANEL_TOKEN` is missing, exposes `initializeMixpanel`, reads `distinct_id`, tracks authenticated `user_id`, awaits track calls, and flushes when requested.
- `fortify-mobile-app/src/lib/mixpanelOnboarding.ts`: added the canonical 21-step funnel mapping plus `useOnboardingFunnelScreen`.
- `fortify-mobile-app/src/services/onboardingAnalyticsService.ts`: re-exports the funnel helper and stops sending the old generic completion events as a parallel onboarding path.
- `fortify-mobile-app/src/components/analytics/MixpanelRouteTracker.tsx`: removed generic onboarding funnel tracking; it now only sends normal route `screen_view`.
- `fortify-mobile-app/app/_layout.tsx`: starts Mixpanel initialization at app startup.
- `fortify-mobile-app/app/onboarding/*.tsx` and `src/components/onboarding/OnboardingNameStep.tsx`: each screen now fires its exact funnel event on landing.
- `fortify-mobile-app/app/onboarding/height.tsx`: changed the flow from height -> source to height -> weight -> source, and made the height screen height-only.
- `package.json` / `package-lock.json`: removed `mixpanel-browser`; `fortify-mobile-app` already uses `mixpanel-react-native`.
- Analytics Jest tests were updated for the exact funnel mapping and route-tracker behavior.

## Native SDK Note

`mixpanel-react-native` is configured in JS mode with `new Mixpanel(token, false, false)`, which is the current Expo-friendly setup in this repo. No extra native config plugin is required for this mode. If the app later switches to native mode, rebuild the dev clients after changing that SDK mode.

## Verification

1. From `fortify-mobile-app`, run `npm start -- --clear` or `npx expo start --dev-client`.
2. Open the app in the dev client and start onboarding from `/onboarding/welcome`.
3. In Mixpanel Live View for project 3978222, filter by the current device/user.
4. Walk through every onboarding screen.
5. Confirm each event name below appears exactly, with `funnel_step`, `screen_name`, and either `user_id` or `distinct_id`.
6. Confirm the configured funnel fills in sequence.

## Funnel Checklist

| Step | Event | File |
|---:|---|---|
| 1 | `Welcome Screen` | `fortify-mobile-app/app/onboarding/welcome.tsx` |
| 2 | `Profile Name` | `fortify-mobile-app/src/components/onboarding/OnboardingNameStep.tsx` |
| 3 | `Greeting` | `fortify-mobile-app/app/onboarding/greeting.tsx` |
| 4 | `Q2. What's your gender?` | `fortify-mobile-app/app/onboarding/gender.tsx` |
| 5 | `Q3. Whats your birthdate?` | `fortify-mobile-app/app/onboarding/birthdate.tsx` |
| 6 | `Q4. What's your height?` | `fortify-mobile-app/app/onboarding/height.tsx` |
| 7 | `Q5. What's your weight?` | `fortify-mobile-app/app/onboarding/weight.tsx` |
| 8 | `Q6. How did you hear about us?` | `fortify-mobile-app/app/onboarding/source.tsx` |
| 9 | `Q7. Fitness Background` | `fortify-mobile-app/app/onboarding/fitness-background.tsx` |
| 10 | `Q8. Lifting Experience?` | `fortify-mobile-app/app/onboarding/experience.tsx` |
| 11 | `Q9. How consistent are you` | `fortify-mobile-app/app/onboarding/consistency.tsx` |
| 12 | `Q10. Other apps?` | `fortify-mobile-app/app/onboarding/other-apps.tsx` |
| 13 | `Q11. Fortify Clarity` | `fortify-mobile-app/app/onboarding/clarity.tsx` |
| 14 | `Q12. What is your fitness goal?` | `fortify-mobile-app/app/onboarding/goal.tsx` |
| 15 | `Q13. What are you biggest challenge` | `fortify-mobile-app/app/onboarding/challenge.tsx` |
| 16 | `Q14. Fortify Provides Insights` | `fortify-mobile-app/app/onboarding/insights.tsx` |
| 17 | `Thank you page` | `fortify-mobile-app/app/onboarding/thank-you.tsx` |
| 18 | `Social Proof page` | `fortify-mobile-app/app/onboarding/social-proof.tsx` |
| 19 | `Ask for rating page` | `fortify-mobile-app/app/onboarding/rating.tsx` |
| 20 | `Ask for notifications page` | `fortify-mobile-app/app/onboarding/notifications.tsx` |
| 21 | `Onboarding Complete Page` | `fortify-mobile-app/app/onboarding/complete.tsx` |

## Commands Run

- `npm uninstall mixpanel-browser` from repo root
- `npm install` from `fortify-mobile-app`
- `npm test -- --runInBand` from `fortify-mobile-app` -> passed, 39 suites / 117 tests
- `npx tsc --noEmit` from `fortify-mobile-app` -> failed on existing repo-wide type errors unrelated to Mixpanel; a follow-up grep confirmed no Mixpanel/analytics files in the TypeScript error output
- `npx expo start --dev-client --port 8082` from `fortify-mobile-app` -> reached `Waiting on http://localhost:8082`; stopped after startup smoke test

## Assumptions

- The Mixpanel dashboard funnel is already configured with the literal event names in the request, including typos.
- The dedicated weight screen should be part of the normal onboarding path because the funnel has a separate weight step.
- Existing visual progress totals remain product UI behavior; the analytics funnel uses the new 21-step mapping independently.
