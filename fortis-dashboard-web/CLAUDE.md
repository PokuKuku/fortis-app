# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Code Rules

**Workflow:**
1. First think through the problem, read the codebase for relevant files, and write a plan to `tasks/todo.md`
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan
4. Then, begin working on the todo items, marking them as complete as you go
5. Every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change as simple as possible - avoid massive or complex changes

**Principles:**
- DO NOT BE LAZY. Find the root cause and fix it properly.
- MAKE ALL FIXES AS SIMPLE AS POSSIBLE. Impact as little code as necessary.
- **CRITICAL:** When debugging, trace through the ENTIRE code flow step by step.
- Before implementing ANY UI, run the design system checklist below.

## Project Overview

Fortis Web Dashboard - Analytics dashboard for the Fortis workout tracking mobile app. Built with Next.js 14+ App Router.

- **Framework**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (shared with mobile app)
- **Design**: Glassmorphism, dark theme, industrial aesthetic

## Development Commands

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build
npm run lint         # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home (redirects to dashboard)
│   ├── globals.css          # Global styles + Tailwind
│   ├── dashboard/
│   │   └── page.tsx         # Main analytics dashboard
│   └── login/
│       └── page.tsx         # Auth page
├── components/
│   ├── ui/                  # Base UI components
│   │   ├── glass-card.tsx
│   │   ├── stat-card.tsx
│   │   └── button.tsx
│   ├── charts/              # Chart components
│   │   ├── volume-chart.tsx
│   │   ├── muscle-heatmap.tsx
│   │   └── weekly-goal.tsx
│   └── layout/              # Layout components
│       ├── sidebar.tsx
│       └── stainless-steel-bg.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   └── server.ts        # Server client
│   └── utils.ts             # cn() and helpers
├── hooks/
│   └── use-user.ts          # Auth hook
└── types/
    └── database.ts          # Supabase types
```

## Tech Stack

- **Next.js 14+** - App Router, React Server Components
- **TypeScript** - Strict mode
- **Tailwind CSS** - Styling with custom design tokens
- **Supabase** - Auth & Database (SSR support via @supabase/ssr)
- **Framer Motion** - Animations
- **Recharts** - Chart library
- **@heroicons/react** - Icons (consistent with mobile app's react-native-heroicons)
- **Custom DumbbellIcon** - Located at `src/components/icons/DumbbellIcon.tsx`

**TypeScript Path Alias:** Use `@/` prefix for imports from `src/` (e.g., `@/components/ui/glass-card`)

## Design System (MANDATORY)

### Pre-Implementation Checklist

Before implementing ANY UI:
- [ ] Using design token colors (NO hardcoded hex values)
- [ ] Using glassmorphism card pattern for containers
- [ ] Background uses StainlessSteelPattern + ParticleBackground
- [ ] Checked design prototypes in `fortis-web/dashboard-design/`
- [ ] Using Framer Motion for animations

### Color Palette

```css
/* Primary (Green) */
--primary: #4ade80;          /* Main accent */
--primary-dark: #22c55e;     /* Darker shade */
--primary-light: #86efac;    /* Lighter shade */

/* Background */
--background: #0a0a0a;       /* zinc-950 */
--background-gradient: from-black via-zinc-900 to-black;

/* Text */
--text-primary: #fafafa;     /* zinc-50 */
--text-secondary: #a3a3a3;   /* zinc-400 */
--text-muted: #525252;       /* zinc-600 */

/* Glass Effects */
--glass-bg: from-white/8 to-white/3;
--glass-border: border-white/10;
--glass-border-hover: border-white/20 or border-primary/60;

/* Status */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

### Glass Card Pattern

```tsx
<div className="rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 p-8 backdrop-blur-2xl hover:border-white/20 transition-all duration-500">
  {/* Content */}
</div>
```

### Stat Card Pattern

```tsx
<div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-4 backdrop-blur-2xl group hover:border-primary/60 transition-all duration-500">
  {/* Glow effect on hover */}
  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />

  <div className="relative z-10">
    <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-white font-mono">{value}</h3>
  </div>
</div>
```

### Stainless Steel Background

Always include on full-page layouts:

```tsx
<StainlessSteelPattern />  {/* Base gradient + metal texture */}
<ParticleBackground />      {/* Floating shine particles */}
```

### Animation Patterns (Framer Motion)

**Entrance animations:**
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, delay: index * 0.05 }}
```

**Hover effects:**
```tsx
whileHover={{ scale: 1.05, y: -2 }}
whileTap={{ scale: 0.95 }}
```

**Progress/Chart animations:**
```tsx
initial={{ width: 0 }}
animate={{ width: `${percentage}%` }}
transition={{ duration: 1.2, type: 'spring' }}
```

### Typography

```tsx
// Headers
className="text-2xl md:text-4xl font-black tracking-tighter text-white"

// Stat values
className="text-3xl font-black font-mono tracking-tighter"

// Labels
className="text-xs font-semibold uppercase tracking-widest text-primary/70"

// Body
className="text-sm text-zinc-400 font-medium"
```

## Supabase Integration

### Analytics Views (Query These)

```sql
-- Overall stats
SELECT * FROM user_workout_stats WHERE user_id = $1;

-- Volume chart data (12 weeks)
SELECT * FROM weekly_workout_volume
WHERE user_id = $1
AND week_start >= NOW() - INTERVAL '12 weeks'
ORDER BY week_start;

-- Muscle group heatmap
SELECT * FROM muscle_group_frequency WHERE user_id = $1;

-- Personal records
SELECT * FROM exercise_personal_records WHERE user_id = $1;
```

### Client Setup

```tsx
// Browser client (src/lib/supabase/client.ts)
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Server client (src/lib/supabase/server.ts)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  );
};
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Design Reference Files

When implementing UI, reference these prototypes:
- `fortis-web/dashboard-design/src/Component.tsx` - Main dashboard layout
- `fortis-web/analytics-page-design/src/Component.tsx` - Charts and analytics
- `fortis-web/web-background-design/src/Component.tsx` - Background patterns

## Utility Functions

```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
