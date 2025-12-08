/**
 * App.tsx
 * 
 * This is the main entry point of the application.
 * It sets up the global providers (like Toaster) and renders the main WorkoutPage component.
 */
import { Toaster } from "sonner@2.0.3";
import { WorkoutPage } from "./components/WorkoutPage";

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <WorkoutPage />
    </>
  );
}
