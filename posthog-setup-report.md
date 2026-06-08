<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Fortify mobile app. The `posthog-react-native` SDK is now installed alongside the existing Mixpanel setup. A `PostHogProvider` wraps the app in `app/_layout.tsx`, a `PostHogAuthSync` component identifies users on login/logout (following the same pattern as `MixpanelAuthSync`), and a `PostHogRouteTracker` component sends screen-view events on every route change. Eight business-critical events are captured across five screens. User identification is called both on email sign-in (inline) and on session restore (via `PostHogAuthSync`). PostHog configuration is loaded exclusively from environment variables via `app.config.js` extras — no tokens are hardcoded.

| Event | Description | File |
|-------|-------------|------|
| `user_signed_in` | User successfully signed in with email/password | `app/auth/email.tsx` |
| `user_signed_up` | User successfully created a new account | `app/auth/email.tsx` |
| `onboarding_completed` | User finished onboarding and had their programme created | `app/onboarding/complete.tsx` |
| `workout_started` | User started an active workout session | `app/workout/active.tsx` |
| `workout_completed` | User finished and saved a workout session | `app/workout/active.tsx` |
| `workout_cancelled` | User cancelled an active workout without saving | `app/workout/active.tsx` |
| `ai_chat_opened` | User opened the AI chat / Fortify Analyst screen | `app/(tabs)/start.tsx` |
| `ai_message_sent` | User sent a message to the AI assistant | `app/ai/chat.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behaviour, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/274379/dashboard/1683979)
- [Daily workouts completed](https://us.posthog.com/project/274379/insights/N3vYD4oB)
- [New sign-ups per day](https://us.posthog.com/project/274379/insights/SDydupVl)
- [Workout started vs completed vs cancelled](https://us.posthog.com/project/274379/insights/d7se3A2a)
- [Onboarding → first workout funnel](https://us.posthog.com/project/274379/insights/DzdHnMLW)
- [AI coach engagement](https://us.posthog.com/project/274379/insights/E5dpVxtj)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
