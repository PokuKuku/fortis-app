/**
 * components/WorkoutSessionSheet.tsx
 * 
 * This component renders the active workout session interface.
 * It wraps the complex `CompleteWorkoutLoggingUi` in a bottom sheet,
 * providing the full-screen experience for logging sets and reps.
 */
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import CompleteWorkoutLoggingUi from "../imports/CompleteWorkoutLoggingUi";

interface WorkoutSessionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  workout: any;
  onSave?: (workout: any) => void;
}

export function WorkoutSessionSheet({ isOpen, onClose, workout, onSave }: WorkoutSessionSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="bottom" 
        className="h-[100dvh] w-full p-0 border-none bg-[#1c1c1c] [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Edit Workout</SheetTitle>
          <SheetDescription>Edit your workout details</SheetDescription>
        </SheetHeader>
        
        {/* Container for the Figma import */}
        <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto bg-[#222222]">
          {/* 
             The imported design has a fixed resolution of 393x852.
             We center it and scale it slightly to fit on smaller screens.
          */}
          <div className="relative w-full h-full max-w-md mx-auto bg-[#222222]">
            <CompleteWorkoutLoggingUi onClose={onClose} onSave={onSave} workout={workout} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
