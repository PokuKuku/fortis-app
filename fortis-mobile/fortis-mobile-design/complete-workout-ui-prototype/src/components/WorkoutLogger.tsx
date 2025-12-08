/**
 * WorkoutLogger.tsx
 * 
 * The main container for the active workout session. 
 * Handles global state for the workout including:
 * - List of exercises and sets
 * - Global rest timer logic
 * - Navigation between workout states (active, cancelled, complete)
 * - Coordination of all sub-modals
 */
import { useState, useEffect } from "react";
import { PlusIcon, XMarkIcon, CheckIcon, ClockIcon, CalendarIcon, EllipsisVerticalIcon, ArrowPathIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Dumbbell } from "lucide-react";
import { ExerciseCard } from "./ExerciseCard";
import { AddExerciseModal } from "./AddExerciseModal";
import { RestTimerModal } from "./RestTimerModal";
import { RestTimerControls } from "./RestTimerControls";
import { TimeUpModal } from "./TimeUpModal";
import { CancelWorkoutModal } from "./CancelWorkoutModal";
import { IncompleteSetsModal } from "./IncompleteSetsModal";
import { WorkoutCompleteModal } from "./WorkoutCompleteModal";
import { SetType } from "./SetTypeModal";
import { StainlessSteelPattern } from "./StainlessSteelPattern";

interface Set {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
  completed: boolean;
  type: SetType;
  previousWeight?: string;
  previousReps?: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes?: string;
}

const SAMPLE_EXERCISES = [
  { name: "Bench Press", category: "Chest" },
  { name: "Squat", category: "Legs" },
  { name: "Deadlift", category: "Back" },
  { name: "Overhead Press", category: "Shoulders" },
  { name: "Barbell Row", category: "Back" },
  { name: "Pull-ups", category: "Back" },
  { name: "Dips", category: "Chest" },
  { name: "Leg Press", category: "Legs" },
  { name: "Romanian Deadlift", category: "Legs" },
  { name: "Lat Pulldown", category: "Back" },
  { name: "Ab Wheel", category: "Abs" },
];

interface WorkoutLoggerProps {
  programName?: string;
  workoutName?: string;
}

export function WorkoutLogger({ programName, workoutName }: WorkoutLoggerProps = {}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [restDuration, setRestDuration] = useState(120); // Active timer duration
  const [normalRestDuration, setNormalRestDuration] = useState(120);
  const [warmupRestDuration, setWarmupRestDuration] = useState(120);
  const [dropRestDuration, setDropRestDuration] = useState(60);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [showRestTimerControls, setShowRestTimerControls] = useState(false);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);
  const [showWorkoutCompleteModal, setShowWorkoutCompleteModal] = useState(false);
  const [showIncompleteSetsModal, setShowIncompleteSetsModal] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  // Update rest timer countdown
  useEffect(() => {
    if (!isRestTimerActive || restTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRestTimerActive(false);
          setShowTimeUpModal(true);
          // Trigger haptic vibration
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]); // Vibrate pattern: 200ms on, 100ms off, 200ms on
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRestTimerActive, restTimeRemaining]);

  // Handle exercise deletion animation
  useEffect(() => {
    if (deletingExerciseId) {
      // Wait for animation to complete, then remove the exercise
      const timer = setTimeout(() => {
        setExercises(exercises.filter((ex) => ex.id !== deletingExerciseId));
        setDeletingExerciseId(null);
      }, 400); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [deletingExerciseId, exercises]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return now.toLocaleDateString('en-US', options);
  };

  const addExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString() + Math.random().toString(),
      name: exerciseName,
      sets: [
        { id: "1", weight: "", reps: "", rpe: "", completed: false, type: "normal" },
      ],
    };
    setExercises((prev) => [...prev, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const updateExercise = (exerciseId: string, updatedExercise: Exercise) => {
    setExercises(
      exercises.map((ex) => (ex.id === exerciseId ? updatedExercise : ex))
    );
  };

  const finishWorkout = () => {
    // Check if any exercises exist
    if (exercises.length === 0) {
      setShowCancelModal(true);
      return;
    }

    const completedSets = exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.completed).length,
      0
    );

    if (completedSets === 0) {
      setShowCancelModal(true);
      return;
    }

    // Check for incomplete sets
    const hasIncompleteSets = exercises.some(ex => 
      ex.sets.some(s => !s.completed)
    );

    if (hasIncompleteSets) {
      setShowIncompleteSetsModal(true);
      return;
    }

    setShowWorkoutCompleteModal(true);
  };

  const handleCompleteRest = () => {
    setExercises(prev => prev.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({ ...s, completed: true }))
    })));
    setShowIncompleteSetsModal(false);
    setShowWorkoutCompleteModal(true);
  };

  const handleDiscardUnfinished = () => {
    setExercises([]);
    setWorkoutStartTime(Date.now());
    setElapsedTime(0);
    setShowIncompleteSetsModal(false);
  };

  const handleWorkoutComplete = () => {
    // Reset the workout
    setExercises([]);
    setWorkoutStartTime(Date.now());
    setElapsedTime(0);
    setShowWorkoutCompleteModal(false);
  };

  const cancelWorkout = () => {
    setExercises([]);
    setWorkoutStartTime(Date.now());
    setElapsedTime(0);
    setShowCancelModal(false);
  };

  const startRestTimer = (type: SetType = "normal") => {
    let duration = normalRestDuration;
    if (type === "warmup") duration = warmupRestDuration;
    else if (type === "drop") duration = dropRestDuration;
    
    if (duration === 0) return;
    setRestDuration(duration);
    setRestTimeRemaining(duration);
    setIsRestTimerActive(true);
  };

  const stopRestTimer = () => {
    setIsRestTimerActive(false);
    setRestTimeRemaining(0);
  };

  const toggleRestTimer = () => {
    setIsRestTimerActive(!isRestTimerActive);
  };

  const skipRestTimer = () => {
    setIsRestTimerActive(false);
    setRestTimeRemaining(0);
    setShowRestTimerControls(false);
  };

  const resetRestTimer = () => {
    setRestTimeRemaining(restDuration);
    setIsRestTimerActive(true);
  };

  const add15s = () => {
    setRestTimeRemaining(prev => prev + 15);
  };

  const subtract15s = () => {
    setRestTimeRemaining(prev => Math.max(0, prev - 15));
  };

  const getRestTimerColor = () => {
    if (!isRestTimerActive || restTimeRemaining === 0) {
      return '#b9bec7'; // Gray when inactive
    }
    
    const percentRemaining = restTimeRemaining / restDuration;
    
    // Interpolate from green -> yellow -> red
    if (percentRemaining > 0.5) {
      // Green to Yellow (first half)
      const t = (1 - percentRemaining) * 2; // 0 to 1 as we go from 100% to 50%
      const r = Math.round(0 + (234 - 0) * t);
      const g = Math.round(188 + (179 - 188) * t);
      const b = Math.round(91 + (8 - 91) * t);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow to Red (second half)
      const t = (0.5 - percentRemaining) * 2; // 0 to 1 as we go from 50% to 0%
      const r = Math.round(234 + (239 - 234) * t);
      const g = Math.round(179 + (68 - 179) * t);
      const b = Math.round(8 + (68 - 8) * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getRestTimerBackgroundColor = () => {
    if (!isRestTimerActive || restTimeRemaining === 0) {
      return 'rgba(156, 163, 175, 0.2)'; // Gray when inactive
    }
    
    const percentRemaining = restTimeRemaining / restDuration;
    
    // Interpolate from green -> yellow -> red (with 20% opacity)
    if (percentRemaining > 0.5) {
      // Green to Yellow (first half)
      const t = (1 - percentRemaining) * 2;
      const r = Math.round(0 + (234 - 0) * t);
      const g = Math.round(188 + (179 - 188) * t);
      const b = Math.round(91 + (8 - 91) * t);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    } else {
      // Yellow to Red (second half)
      const t = (0.5 - percentRemaining) * 2;
      const r = Math.round(234 + (239 - 234) * t);
      const g = Math.round(179 + (68 - 179) * t);
      const b = Math.round(8 + (68 - 8) * t);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen text-white pb-6">
      {/* Top Bar */}
      <div className="relative sticky top-0 z-10 px-4 pt-12 pb-2 overflow-hidden bg-[#222222]">
        <StainlessSteelPattern />
        {/* Clock Button - Top Left */}
        <div className="absolute top-8 left-6 z-20">
          <button
            onClick={() => setShowRestTimerModal(true)}
            className="bg-[#b9bec7]/20 p-2 rounded-lg hover:bg-[#b9bec7]/30 transition-colors"
          >
            <ClockIcon className="size-5 text-[#b9bec7]" strokeWidth={2.5} />
          </button>
        </div>

        {/* X Button - Top Right */}
        <div className="absolute top-8 right-6 z-20">
          <button
            onClick={() => setShowCancelModal(true)}
            className="bg-red-500/20 p-2 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <XMarkIcon className="size-5 text-red-500" strokeWidth={2.5} />
          </button>
        </div>

        {/* Clock/Date and Program/Workout Names */}
        <div className="relative z-10 flex items-start justify-between pt-12">
          <div className="flex flex-col gap-1">
            <div className="flex items-center">
              {/* Workout Clock */}
              <div className="flex items-center gap-2 text-white">
                <span className={`inline-block tabular-nums ${elapsedTime >= 3600 ? "text-[14px]" : "text-[16px]"} min-w-[45px]`}>{formatTime(elapsedTime)}</span>
              </div>
              
              {/* Separator */}
              <span className="text-[#4a4a4a] -ml-1 pl-0.5 pr-1.5">|</span>
              
              {/* Rest Timer Display */}
              <button 
                onClick={() => setShowRestTimerControls(true)}
                className="px-2 py-0.5 rounded-lg transition-colors flex items-center justify-center hover:opacity-80 active:scale-95 transform duration-100"
                style={{ backgroundColor: getRestTimerBackgroundColor() }}
              >
                <span 
                  className="text-[16px] inline-block w-[40px] text-center font-bold"
                  style={{ color: getRestTimerColor() }}
                >
                  {formatTime(restTimeRemaining)}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[#b9bec7]">
              <CalendarIcon className="size-4" />
              <span className="text-[12px]">{formatDate()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-end">
            {programName && (
              <span 
                className="text-[17px] font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#4ade80] to-[#22c55e]"
              >
                {programName}
              </span>
            )}
            {workoutName && (
              <span 
                className="text-[17px] font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#4ade80] to-[#22c55e]"
              >
                {workoutName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="px-4 pt-3 space-y-6 min-h-[300px]">{exercises.length === 0 ? (
          <div className="text-center py-12 text-[#b9bec7]">
            <div className="flex justify-center mb-4">
              <Dumbbell className="text-[#818692]" size={64} strokeWidth={1.5} fill="currentColor" />
            </div>
            <p className="mb-2">No exercises added yet</p>
            <p className="text-[14px]">Tap the button below to get started</p>
          </div>
        ) : (
          exercises.map((exercise, index) => (
            <div 
              key={exercise.id} 
              className={`overflow-hidden ${deletingExerciseId === exercise.id ? "animate-fade-scale-out" : "animate-fade-scale-in"}`}
            >
              <ExerciseCard
                exercise={exercise}
                exerciseNumber={index + 1}
                onUpdate={(updated) => updateExercise(exercise.id, updated)}
                onRemove={() => setDeletingExerciseId(exercise.id)}
                onStartRestTimer={startRestTimer}
              />
            </div>
          ))
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="px-4 mt-8 space-y-3 transition-all duration-300">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-transparent border-2 border-[#22c55e]/30 text-[#22c55e] py-2 rounded-2xl hover:bg-[#22c55e]/10 transition-colors font-semibold"
        >
          + Add Exercise
        </button>
        
        <button
          onClick={finishWorkout}
          className="w-full bg-gradient-to-b from-[#4ade80] to-[#22c55e] text-white py-2 rounded-2xl hover:brightness-110 transition-all font-bold"
        >
          Finish Workout
        </button>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <AddExerciseModal
          exercises={SAMPLE_EXERCISES}
          onSelect={addExercise}
          onClose={() => setShowAddModal(false)}
          existingExercises={exercises.map(ex => ex.name)}
        />
      )}

      {/* Rest Timer Controls */}
      <RestTimerControls
        isOpen={showRestTimerControls}
        onClose={() => setShowRestTimerControls(false)}
        onPlayPause={toggleRestTimer}
        onSkip={skipRestTimer}
        onReset={resetRestTimer}
        onAdd15s={add15s}
        onSubtract15s={subtract15s}
        isRunning={isRestTimerActive}
        timeRemaining={restTimeRemaining}
        totalDuration={restDuration}
        color={getRestTimerColor()}
      />

      {/* Rest Timer Modal */}
      {showRestTimerModal && (
        <RestTimerModal
          onClose={() => setShowRestTimerModal(false)}
          onSave={(normal, warmup, drop) => {
            setNormalRestDuration(normal);
            setWarmupRestDuration(warmup);
            setDropRestDuration(drop);
            if (!isRestTimerActive) {
              setRestDuration(normal);
              setRestTimeRemaining(normal);
            }
          }}
          initialNormalDuration={normalRestDuration}
          initialWarmupDuration={warmupRestDuration}
          initialDropDuration={dropRestDuration}
        />
      )}

      {/* Time Up Modal */}
      {showTimeUpModal && (
        <TimeUpModal
          onClose={() => setShowTimeUpModal(false)}
        />
      )}

      {/* Cancel Workout Modal */}
      {showCancelModal && (
        <CancelWorkoutModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={cancelWorkout}
        />
      )}

      {/* Incomplete Sets Modal */}
      {showIncompleteSetsModal && (
        <IncompleteSetsModal
          onClose={() => setShowIncompleteSetsModal(false)}
          onCompleteRest={handleCompleteRest}
          onDiscardUnfinished={handleDiscardUnfinished}
        />
      )}

      {/* Workout Complete Modal */}
      {showWorkoutCompleteModal && (() => {
        const completedSets = exercises.reduce(
          (total, ex) => total + ex.sets.filter((s) => s.completed).length,
          0
        );
        return (
          <WorkoutCompleteModal
            onClose={() => setShowWorkoutCompleteModal(false)}
            onConfirm={handleWorkoutComplete}
            exerciseCount={exercises.length}
            setCount={completedSets}
            duration={formatTime(elapsedTime)}
          />
        );
      })()}
    </div>
  );
}