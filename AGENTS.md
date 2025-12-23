# Repository Guidelines

## Project Structure & Module Organization
Fortis is a monorepo for a mobile workout tracker, a web analytics dashboard, and supporting data/services.
- `fortis-mobile-app/`: Expo React Native app. Routes live in `app/`, core code in `src/`, shared UI in `components/`, and fonts/images in `assets/`.
- `fortis-dashboard-web/`: Next.js dashboard. Source lives in `src/`, static assets in `public/`.
- `supabase/`: Database schema, migrations, and edge functions (see `supabase/schema.sql` and `supabase/migrations/`).
- `free-exercise-db-main/`: Exercise data set and a small site.
- `fortis-mobile/fortis-mobile-design/` and `fortis-web/`: UI prototypes and design explorations.

## Build, Test, and Development Commands
- Mobile app (from `fortis-mobile-app/`): `npm start` (Expo dev server), `npm run ios`, `npm run android`, `npm start -- --clear` (reset cache).
- Mobile tests (from `fortis-mobile-app/`): `npm test`, `npm test:watch`, `npm test:coverage`, `npm test -- GlassButton` (run a specific test).
- Web dashboard (from `fortis-dashboard-web/`): `npm run dev`, `npm run build`, `npm run lint`.
- Supabase (requires Docker): `supabase start`, `supabase db reset`, `supabase functions deploy ai`.

## Coding Style & Naming Conventions
- Use TypeScript with 2-space indentation and standard ES module imports.
- Mobile app routing is file-based in `fortis-mobile-app/app/`; follow existing folder naming like `(tabs)` and `auth/`.
- Prefer the `@/` path alias for mobile imports (e.g., `@/src/components/ui/BaseModal`).
- Follow the mobile design system: use `constants/Colors.ts`, `constants/Sizes.ts`, and `constants/Typography.ts`, plus `GlassButton`, `GlassCard`, and `StainlessSteelPattern` for consistent UI.

## Testing Guidelines
- Tests use Jest + React Native Testing Library. Current tests live in `fortis-mobile-app/components/__tests__/` with `*.test.tsx` naming.
- Add focused unit tests for new UI components or business logic touched by a change.

## Commit & Pull Request Guidelines
- Commit messages in history use short, imperative verbs in sentence case (e.g., "Add workout history", "Fix missing SVG paths", "Refactor auth UI").
- PRs should include a brief summary, linked issues (if any), and test commands run. Provide screenshots or screen recordings for UI changes (mobile or web). If you touch `supabase/`, note migration or schema impacts in the PR description.

## Configuration & Secrets
- Mobile app env vars: copy `fortis-mobile-app/.env.example` to `.env.local` and keep secrets out of git.
