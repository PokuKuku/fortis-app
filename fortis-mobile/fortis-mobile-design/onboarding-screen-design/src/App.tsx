import { AuthScreen } from "./components/fortis/AuthScreen";

export default function App() {
  return (
    <div className="font-sans text-foreground bg-background min-h-screen">
      <AuthScreen onAuthenticated={() => {}} />
    </div>
  );
}
