# Strength Analytics Dashboard

A high-performance, visually striking analytics dashboard designed for strength training and fitness tracking. Featuring a dark industrial aesthetic with neon accents.

## Features

- **Real-time Stats Cards**: Track Volume, Workouts, 1RM estimates, and Recovery scores.
- **Interactive Volume Chart**: Visual breakdown of training volume over time.
- **Muscle Group Heatmap**: Analysis of training split balance.
- **Activity Feed**: Recent workouts with PR tracking.
- **Goal Tracking**: Weekly progress visualization.
- **Responsive Design**: Fully optimized for desktop and mobile.

## Usage

```tsx
import { StrengthAnalyticsDashboard } from '@/sd-components/82281035-a0d6-44b8-931f-0d265e420b0d';

function App() {
  return (
    <StrengthAnalyticsDashboard 
      userName="Athlete" 
      theme="dark" 
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userName` | `string` | "Athlete" | The name of the user displayed in the header |
| `theme` | `'dark' \| 'midnight'` | "dark" | The color theme of the dashboard |

## Dependencies

- `lucide-react`: Iconography
- `framer-motion`: Animations
- `date-fns`: Date formatting
- `clsx` & `tailwind-merge`: Class management
