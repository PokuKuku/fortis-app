import React from 'react';
import { AIAnalyticsPage } from './Component';

// Configure Tailwind theme
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.tailwind = window.tailwind || {};
  // @ts-ignore
  window.tailwind.config = {
    ...window.tailwind.config,
    theme: {
      extend: {
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: '#4ade80',
            foreground: '#000000',
          },
          secondary: {
            DEFAULT: '#22c55e',
            foreground: '#ffffff',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        }
      }
    }
  };
}

export default function App() {
  return (
    <div className="w-full h-full bg-black text-white">
      <AIAnalyticsPage userName="Alex" />
    </div>
  );
}
