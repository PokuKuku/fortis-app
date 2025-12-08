/**
 * App.tsx
 * 
 * The main entry point of the application.
 * Sets up the global layout, theme, and renders the WorkoutLogger.
 */
import { WorkoutLogger } from "./components/WorkoutLogger";
import { StainlessSteelPattern } from "./components/StainlessSteelPattern";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#222222] text-white pb-24">
      {/* Fixed overlay layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <StainlessSteelPattern />
      </div>
      <div className="relative z-10">
        <WorkoutLogger programName="Push Pull Legs" workoutName="Push Day A" />
      </div>
    </div>
  );
}