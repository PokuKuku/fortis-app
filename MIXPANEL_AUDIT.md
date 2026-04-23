# Fortify Mixpanel Onboarding Audit

Date: 2026-04-23

## Current Tracking Model

- `fortify-mobile-app/app/_layout.tsx` mounts `MixpanelAuthSync` and `MixpanelRouteTracker`.
- `src/lib/mixpanel.ts` initializes `mixpanel-react-native` lazily on first track/identify call using `EXPO_PUBLIC_MIXPANEL_TOKEN`.
- `MixpanelRouteTracker` currently sends a generic `screen_view` event for every route and a generic `onboarding_screen_viewed` event for onboarding routes.
- Most onboarding screens also send `onboarding_step_completed` only after the user taps Continue. `complete.tsx` sends `onboarding_finished` only after finalization succeeds.
- The configured Mixpanel funnel expects exact event names on screen landing, so the current implementation does not match the dashboard funnel.

## Funnel Screen Audit

| Funnel Step Name | Route / Component File | Currently tracked event name | Status |
|---|---|---|---|
| `Welcome Screen` | `/onboarding/welcome` -> `fortify-mobile-app/app/onboarding/welcome.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: welcome` | WRONG_NAME |
| `Profile Name` | `/onboarding` -> `fortify-mobile-app/app/onboarding/index.tsx`; UI in `fortify-mobile-app/src/components/onboarding/OnboardingNameStep.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: profile_name`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Greeting` | `/onboarding/greeting` -> `fortify-mobile-app/app/onboarding/greeting.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: greeting` | WRONG_NAME |
| `Q2. What's your gender?` | `/onboarding/gender` -> `fortify-mobile-app/app/onboarding/gender.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: gender`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q3. Whats your birthdate?` | `/onboarding/birthdate` -> `fortify-mobile-app/app/onboarding/birthdate.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: birthdate`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q4. What's your height?` | `/onboarding/height` -> `fortify-mobile-app/app/onboarding/height.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: height`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q5. What's your weight?` | `/onboarding/weight` -> `fortify-mobile-app/app/onboarding/weight.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: weight`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q6. How did you hear about us?` | `/onboarding/source` -> `fortify-mobile-app/app/onboarding/source.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: source`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q7. Fitness Background` | `/onboarding/fitness-background` -> `fortify-mobile-app/app/onboarding/fitness-background.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: fitness_background`; `onboarding_step_completed` during auto-advance | WRONG_NAME / WRONG_TRIGGER |
| `Q8. Lifting Experience?` | `/onboarding/experience` -> `fortify-mobile-app/app/onboarding/experience.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: experience`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q9. How consistent are you` | `/onboarding/consistency` -> `fortify-mobile-app/app/onboarding/consistency.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: consistency`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q10. Other apps?` | `/onboarding/other-apps` -> `fortify-mobile-app/app/onboarding/other-apps.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: other_apps`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q11. Fortify Clarity` | `/onboarding/clarity` -> `fortify-mobile-app/app/onboarding/clarity.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: clarity`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q12. What is your fitness goal?` | `/onboarding/goal` -> `fortify-mobile-app/app/onboarding/goal.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: goal`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q13. What are you biggest challenge` | `/onboarding/challenge` -> `fortify-mobile-app/app/onboarding/challenge.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: challenge`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Q14. Fortify Provides Insights` | `/onboarding/insights` -> `fortify-mobile-app/app/onboarding/insights.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: insights`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Thank you page` | `/onboarding/thank-you` -> `fortify-mobile-app/app/onboarding/thank-you.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: thank_you`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Social Proof page` | `/onboarding/social-proof` -> `fortify-mobile-app/app/onboarding/social-proof.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: social_proof`; `onboarding_step_completed` on Continue | WRONG_NAME / WRONG_TRIGGER |
| `Ask for rating page` | `/onboarding/rating` -> `fortify-mobile-app/app/onboarding/rating.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: rating`; `onboarding_step_completed` only after the review request flow has already run | WRONG_NAME / WRONG_TRIGGER |
| `Ask for notifications page` | `/onboarding/notifications` -> `fortify-mobile-app/app/onboarding/notifications.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: notifications`; `onboarding_step_completed` on user action | WRONG_NAME / WRONG_TRIGGER |
| `Onboarding Complete Page` | `/onboarding/complete` -> `fortify-mobile-app/app/onboarding/complete.tsx` | `screen_view`; `onboarding_screen_viewed` with `screen_id: complete`; `onboarding_finished` after final profile save | WRONG_NAME / WRONG_TRIGGER |

## Additional Root Causes

- The funnel event names are never emitted by the current onboarding screen-view path. Mixpanel funnels are string-match sensitive, so `onboarding_screen_viewed` cannot satisfy a funnel step configured as `Profile Name`, `Q2. What's your gender?`, etc.
- Existing screen-specific analytics are completion-triggered, not landing-triggered. Users who land on a screen but do not tap Continue are invisible to the configured funnel.
- `MixpanelRouteTracker` has stale onboarding step ordering for `consistency`, `other-apps`, `challenge`, `insights`, and later screens. Even if the dashboard used the generic event, the metadata would be misleading.
- The standard flow currently goes from `/onboarding/height` directly to `/onboarding/source`, so `/onboarding/weight` is not reached in the normal path even though the dashboard expects `Q5. What's your weight?`.
- `src/lib/mixpanel.ts` silently returns when the token is missing. There is no clear warning to explain a disabled pipeline.
- Mixpanel is initialized lazily on first event/identify rather than explicitly at app startup. This can make startup failures look like dropped events.
- `trackMixpanelEvent` does not await a possibly async SDK `track` implementation and does not flush after funnel events, so Live View verification can lag.
- Anonymous onboarding events do not include the current Mixpanel `distinct_id`; authenticated events rely on super properties but do not explicitly attach `user_id` to each funnel event.
- `mixpanel-browser` is installed at the repository root even though React Native should use `mixpanel-react-native`.
