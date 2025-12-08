/**
 * components/WorkoutPage.tsx
 * 
 * This is the core component of the application, acting as the main dashboard.
 * It handles:
 * - Navigation between tabs (Program, History, Profile)
 * - State management for workouts, programs, and exercises
 * - Displaying the main views (Charts, Calendar, Lists)
 * - Coordinating modals and sheets for creating/editing content
 */
import { useState, useMemo, createContext, useContext } from "react";
import { AnimatePresence } from "motion/react";
import { ChevronRight, Plus, FolderOpen, TrendingUp, User, X, Play, Dumbbell, History, Layout, Settings, Calendar as CalendarIcon, Clock, Medal, List, Search, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { WorkoutCard } from "./WorkoutCard";
import { ProgramCard } from "./ProgramCard";
import { ProgramModal } from "./ProgramModal";
import { WorkoutModal } from "./WorkoutModal";
import { CreateProgramModal } from "./CreateProgramModal";
import { CreateWorkoutModal } from "./CreateWorkoutModal";
import { CreateExerciseModal } from "./CreateExerciseModal";
import { RenameWorkoutModal } from "./RenameWorkoutModal";
import { WorkoutSummaryModal } from "./WorkoutSummaryModal";
import { WorkoutSessionSheet } from "./WorkoutSessionSheet";
import { VolumeChart } from "./VolumeChart";
import { StainlessSteelPattern } from "./StainlessSteelPattern";
import { DndProvider } from 'react-dnd';
import { toast } from "sonner@2.0.3";
import { HTML5Backend } from 'react-dnd-html5-backend';
import svgPaths from "../imports/svg-shlqasiqlv";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { exerciseData } from "./data/exerciseData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

function isSameDay(d1: Date, d2: Date) {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const fourDaysAgo = new Date(today);
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
const fiveDaysAgo = new Date(today);
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

const initialWorkouts = [
  { id: 1, name: "Push Day A", exercises: 5, duration: "45 min", date: today, displayDate: "Today", exerciseList: ["Bench Press", "Incline Dumbbell Press", "Cable Fly", "Overhead Press", "Lateral Raise"], totalVolume: 12450 },
  { id: 2, name: "Pull Day B", exercises: 6, duration: "52 min", date: yesterday, displayDate: "Yesterday", exerciseList: ["Deadlift", "Pull-up", "Barbell Row", "Face Pull", "Bicep Curl", "Hammer Curl"], totalVolume: 14125 },
  { id: 3, name: "Leg Day", exercises: 4, duration: "38 min", date: twoDaysAgo, displayDate: "2 days ago", exerciseList: ["Squat", "Leg Press", "Romanian Deadlift", "Calf Raise"], totalVolume: 18275 },
  { id: 4, name: "Core & Cardio", exercises: 3, duration: "30 min", date: threeDaysAgo, displayDate: "3 days ago", exerciseList: ["Plank", "Russian Twist", "Treadmill Running"], totalVolume: 0 },
  { id: 5, name: "Upper Body", exercises: 5, duration: "42 min", date: fourDaysAgo, displayDate: "4 days ago", exerciseList: ["Bench Press", "Pull-up", "Overhead Press", "Row", "Dip"], totalVolume: 10850 },
  { id: 6, name: "Lower Body", exercises: 4, duration: "40 min", date: fiveDaysAgo, displayDate: "5 days ago", exerciseList: ["Squat", "Lunge", "Leg Curl", "Leg Extension"], totalVolume: 15400 },
];

const initialPrograms = [
  { id: 1, name: "Push Pull Legs", workouts: 6, weeks: 12, workoutIds: [1, 2, 3] },
  { id: 2, name: "Upper Lower Split", workouts: 4, weeks: 8, workoutIds: [4, 5] },
];

import { exerciseList } from "./data/exerciseList";

// Exercise library
const exerciseLibrary = exerciseList;

import { DateSelector } from "./DateSelector";
import { CustomDragLayer } from "./CustomDragLayer";

export function WorkoutPage() {
  const [activeTab, setActiveTab] = useState("program");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);
  const [showPrograms, setShowPrograms] = useState(false);
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<number | null>(null);
  const [summaryWorkout, setSummaryWorkout] = useState<any>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const [renamingWorkoutId, setRenamingWorkoutId] = useState<number | null>(null);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<string | null>(null);
  const [filterMuscle, setFilterMuscle] = useState("all");
  const [filterEquipment, setFilterEquipment] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [showCreateWorkout, setShowCreateWorkout] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [programs, setPrograms] = useState(initialPrograms);
  const [allExercises, setAllExercises] = useState(exerciseLibrary);
  const [customExerciseData, setCustomExerciseData] = useState<Record<string, any>>({});
  const [recentWorkouts, setWorkouts] = useState(initialWorkouts);
  const [programWorkouts, setProgramWorkouts] = useState<{[key: number]: number[]}>(
    initialPrograms.reduce((acc, p) => ({ ...acc, [p.id]: p.workoutIds }), {})
  );
  const [workoutOrder, setWorkoutOrder] = useState<number[]>(initialWorkouts.map(w => w.id));
  const [programOrder, setProgramOrder] = useState<number[]>(initialPrograms.map(p => p.id));
  const [workoutExercises, setWorkoutExercises] = useState<{[key: number]: string[]}>(
    initialWorkouts.reduce((acc, w) => ({ ...acc, [w.id]: w.exerciseList }), {})
  );


  const [popoverOpenDate, setPopoverOpenDate] = useState<Date | null>(null);

  // Calculate daily workout volume for the calendar heatmap
  const workoutVolume = useMemo(() => recentWorkouts.reduce((acc, workout) => {
    const dateKey = workout.date.toDateString();
    // Volume = reps * weight moved
    const volume = (workout as any).totalVolume || 0;
    acc[dateKey] = (acc[dateKey] || 0) + volume;
    return acc;
  }, {} as Record<string, number>), [recentWorkouts]);

  const maxVolume = Math.max(...Object.values(workoutVolume), 1);

  const getIntensityLevel = (date: Date) => {
    const volume = workoutVolume[date.toDateString()] || 0;
    if (volume === 0) return null;
    
    const ratio = volume / maxVolume;
    if (ratio <= 0.25) return "level1";
    if (ratio <= 0.50) return "level2";
    if (ratio <= 0.75) return "level3";
    return "level4";
  };

  const weeklyVolumeData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toDateString();
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        volume: workoutVolume[dateKey] || 0
      });
    }
    return days;
  }, [workoutVolume]);





  const handleWorkoutDrop = (workoutId: number, programId: number) => {
    setProgramWorkouts(prev => {
      const currentWorkouts = prev[programId] || [];
      // Only add if the workout doesn't already exist in the program
      if (currentWorkouts.includes(workoutId)) {
        return prev; // Return unchanged state if duplicate
      }
      if (currentWorkouts.length >= 7) {
        toast.error("Maximum of 7 workouts per program", { duration: 2000 });
        return prev;
      }
      return {
        ...prev,
        [programId]: [...currentWorkouts, workoutId]
      };
    });
  };

  const handleRemoveWorkout = (workoutId: number, programId: number) => {
    setProgramWorkouts(prev => ({
      ...prev,
      [programId]: prev[programId].filter(id => id !== workoutId)
    }));
  };

  const moveWorkout = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...workoutOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setWorkoutOrder(newOrder);
  };

  const moveProgram = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...programOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setProgramOrder(newOrder);
  };

  const moveProgramWorkout = (programId: number, dragIndex: number, hoverIndex: number) => {
    setProgramWorkouts(prev => {
      const workouts = [...prev[programId]];
      const [removed] = workouts.splice(dragIndex, 1);
      workouts.splice(hoverIndex, 0, removed);
      return { ...prev, [programId]: workouts };
    });
  };

  const moveExercise = (workoutId: number, dragIndex: number, hoverIndex: number) => {
    setWorkoutExercises(prev => {
      const exercises = [...prev[workoutId]];
      const [removed] = exercises.splice(dragIndex, 1);
      exercises.splice(hoverIndex, 0, removed);
      return { ...prev, [workoutId]: exercises };
    });
  };

  const removeExercise = (workoutId: number, exerciseIndex: number) => {
    setWorkoutExercises(prev => ({
      ...prev,
      [workoutId]: prev[workoutId].filter((_, idx) => idx !== exerciseIndex)
    }));
  };

  const addExerciseToWorkout = (workoutId: number, exercise: string) => {
    setWorkoutExercises(prev => ({
      ...prev,
      [workoutId]: [...(prev[workoutId] || []), exercise]
    }));
  };

  const addWorkoutToProgram = (programId: number, workoutId: number) => {
    setProgramWorkouts(prev => {
      const currentWorkouts = prev[programId] || [];
      // Only add if the workout doesn't already exist in the program
      if (currentWorkouts.includes(workoutId)) {
        return prev; // Return unchanged state if duplicate
      }
      if (currentWorkouts.length >= 7) {
        toast.error("Maximum of 7 workouts per program", { duration: 2000 });
        return prev;
      }
      return {
        ...prev,
        [programId]: [...currentWorkouts, workoutId]
      };
    });
  };

  const createProgram = (name: string, workoutNames: string[]) => {
    // Handle duplicate names
    let uniqueName = name;
    let counter = 1;
    const existingNames = programs.map(p => p.name);
    while (existingNames.includes(uniqueName)) {
      uniqueName = `${name} (${counter})`;
      counter++;
    }

    const newId = Math.max(...programs.map(p => p.id), 0) + 1;
    const workoutIds = recentWorkouts
      .filter(w => workoutNames.includes(w.name))
      .map(w => w.id);
    
    const newProgram = {
      id: newId,
      name: uniqueName,
      workouts: workoutIds.length,
      weeks: 12,
      workoutIds
    };
    
    setPrograms([...programs, newProgram]);
    setProgramOrder([...programOrder, newId]);
    setProgramWorkouts(prev => ({ ...prev, [newId]: workoutIds }));
    setShowCreateProgram(false);
  };

  const createWorkout = (name: string, exercises: string[]) => {
    // Handle duplicate names
    let uniqueName = name;
    let counter = 1;
    const existingNames = recentWorkouts.map(w => w.name);
    while (existingNames.includes(uniqueName)) {
      uniqueName = `${name} (${counter})`;
      counter++;
    }

    const newId = Math.max(...recentWorkouts.map(w => w.id), 0) + 1;
    
    const newWorkout = {
      id: newId,
      name: uniqueName,
      exercises: exercises.length,
      duration: "0 min",
      date: new Date(),
      displayDate: "Today",
      exerciseList: exercises,
      totalVolume: 0 // Initialize with 0 until we have actual data tracking
    };
    
    setWorkouts([...recentWorkouts, newWorkout]);
    setWorkoutOrder([...workoutOrder, newId]);
    setWorkoutExercises(prev => ({ ...prev, [newId]: exercises }));
    setShowCreateWorkout(false);
  };

  const handleCreateExercise = (exercise: any) => {
    if (allExercises.includes(exercise.name)) {
      toast.error("Exercise already exists");
      return;
    }
    setCustomExerciseData(prev => ({ ...prev, [exercise.name]: exercise }));
    setAllExercises(prev => [...prev, exercise.name].sort());
  };

  const handleUpdateExercise = (updatedExercise: any) => {
    const oldName = selectedExerciseDetail;
    if (!oldName) return;
    
    const newName = updatedExercise.name;
    
    if (newName !== oldName && allExercises.includes(newName)) {
      toast.error("Exercise name already exists");
      return;
    }
    
    setCustomExerciseData(prev => {
      const newData = { ...prev };
      if (oldName !== newName) {
        delete newData[oldName];
      }
      newData[newName] = updatedExercise;
      return newData;
    });

    if (oldName !== newName) {
      setAllExercises(prev => {
        const newList = prev.filter(ex => ex !== oldName);
        newList.push(newName);
        return newList.sort();
      });
      setSelectedExerciseDetail(newName);
    }
    
    toast.success("Exercise updated successfully");
  };

  const handleDeleteExercise = () => {
    const name = selectedExerciseDetail;
    if (!name) return;
    
    // Remove from custom data
    setCustomExerciseData(prev => {
      const newData = { ...prev };
      delete newData[name];
      return newData;
    });

    // Remove from all exercises list
    setAllExercises(prev => prev.filter(ex => ex !== name));
    
    // Close modal
    setSelectedExerciseDetail(null);
  };

  const selectedProgramData = programs.find(p => p.id === selectedProgram);
  const selectedProgramWorkoutList = selectedProgram 
    ? recentWorkouts.filter(w => programWorkouts[selectedProgram]?.includes(w.id))
        .sort((a, b) => programWorkouts[selectedProgram].indexOf(a.id) - programWorkouts[selectedProgram].indexOf(b.id))
        .map(w => ({
          ...w,
          exercises: workoutExercises[w.id]?.length || 0
        }))
    : [];

  const selectedWorkoutData = recentWorkouts.find(w => w.id === selectedWorkout);

  const orderedWorkouts = workoutOrder.map(id => recentWorkouts.find(w => w.id === id)!).filter(Boolean);
  const orderedPrograms = programOrder.map(id => programs.find(p => p.id === id)!).filter(Boolean);

  // Get unique filter options from exerciseData
  const uniqueMuscles = Array.from(new Set(Object.values(exerciseData).flatMap(e => e.primaryMuscles || []))).sort();
  const uniqueEquipment = Array.from(new Set(Object.values(exerciseData).map(e => e.equipment || "other"))).filter(Boolean).sort();
  const uniqueCategories = Array.from(new Set(Object.values(exerciseData).map(e => e.category || "other"))).filter(Boolean).sort();

  // Filter workouts for the selected date in history view
  const historyWorkouts = selectedDate 
    ? orderedWorkouts.filter(w => isSameDay(w.date, selectedDate))
    : [];


  const calendarComponents = useMemo(() => ({
    DayContent: (props: any) => {
      const date = props.date;
      return (
        <div className="w-full h-full flex items-center justify-center">
          {date.getDate()}
        </div>
      );
    },
    CaptionLabel: (props: any) => {
      return (
        <Popover open={isDateSelectorOpen} onOpenChange={setIsDateSelectorOpen}>
          <PopoverTrigger asChild>
            <button 
              className="text-sm font-medium tracking-wide hover:text-[#22c55e] transition-colors flex items-center gap-1"
            >
               {props.displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                 <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 border-none bg-transparent w-auto" align="center">
             <DateSelector 
               currentDate={currentMonth} 
               onSelectDate={(d) => {
                 setSelectedDate(d);
                 setCurrentMonth(d);
                 setIsDateSelectorOpen(false);
               }}
               onViewMonth={(d) => {
                 setCurrentMonth(d);
                 setIsDateSelectorOpen(false);
               }}
             />
          </PopoverContent>
        </Popover>
      );
    }
  }), [isDateSelectorOpen, currentMonth]);

  const selectedDateVolume = useMemo(() => {
    if (!selectedDate) return 0;
    return workoutVolume[selectedDate.toDateString()] || 0;
  }, [selectedDate, workoutVolume]);

  const currentStreak = useMemo(() => {
    if (recentWorkouts.length === 0) return 0;

    // Sort workouts by date descending
    const sortedWorkouts = [...recentWorkouts].sort((a, b) => b.date.getTime() - a.date.getTime());

    const getWeekStart = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay(); // 0 (Sun) to 6 (Sat)
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
    };

    const weeksWithWorkouts = new Set();
    sortedWorkouts.forEach(w => {
      weeksWithWorkouts.add(getWeekStart(w.date));
    });

    const sortedWeeks = Array.from(weeksWithWorkouts).sort((a, b) => (b as number) - (a as number));

    if (sortedWeeks.length === 0) return 0;

    const currentWeekCheck = getWeekStart(new Date());
    
    // Check if current week is present
    let hasCurrentWeek = sortedWeeks.includes(currentWeekCheck);
    
    // Check if last week is present
    let lastWeek = new Date(currentWeekCheck);
    lastWeek.setDate(lastWeek.getDate() - 7);
    let hasLastWeek = sortedWeeks.includes(lastWeek.getTime());

    // If no workout this week AND no workout last week, streak is 0
    if (!hasCurrentWeek && !hasLastWeek) return 0;

    // Start counting
    // If we have current week, start from there. If not, start from last week.
    let streak = 0;
    let checkWeek = hasCurrentWeek ? currentWeekCheck : lastWeek.getTime();
    
    while (sortedWeeks.includes(checkWeek)) {
      streak++;
      const d = new Date(checkWeek);
      d.setDate(d.getDate() - 7);
      checkWeek = d.getTime();
    }

    return streak;
  }, [recentWorkouts]);

  const getWorkoutDetails = (workoutId: number) => {
    const workout = recentWorkouts.find(w => w.id === workoutId);
    if (!workout) return null;

    // Generate deterministic mock data based on the workout
    // This is just for display purposes since we don't have real set data stored
    const exercises = (workoutExercises[workoutId] || []).map((exName, i) => {
      // Generate slightly randomized but realistic looking data based on exercise name
      let baseWeight = 135;
      let baseReps = 10;
      
      if (exName.toLowerCase().includes('dumbbell')) baseWeight = 45;
      if (exName.toLowerCase().includes('leg')) baseWeight = 225;
      if (exName.toLowerCase().includes('curl')) baseWeight = 30;
      if (exName.toLowerCase().includes('raise')) baseWeight = 20;
      
      return {
        id: i,
        name: exName,
        sets: [
          { id: 1, weight: baseWeight, reps: baseReps + 2, completed: true, rpe: 8 },
          { id: 2, weight: baseWeight, reps: baseReps, completed: true, rpe: 9 },
          { id: 3, weight: baseWeight, reps: baseReps - 2, completed: true, rpe: 10 },
        ]
      };
    });

    return {
      id: workout.id,
      name: workout.name,
      date: workout.date,
      duration: workout.duration,
      volume: (workout as any).totalVolume || 0,
      exercises
    };
  };

  const duplicateWorkout = (workoutId: number) => {
    const original = recentWorkouts.find(w => w.id === workoutId);
    if (!original) return;

    const newId = Math.max(...recentWorkouts.map(w => w.id), 0) + 1;
    const newName = `${original.name} Copy`;
    
    // Copy the workout itself
    const newWorkout = {
      ...original,
      id: newId,
      name: newName,
      date: new Date()
    };

    // Copy the exercises mapping
    const originalExercises = workoutExercises[workoutId] || [];
    
    setWorkouts([...recentWorkouts, newWorkout]);
    setWorkoutOrder([...workoutOrder, newId]);
    setWorkoutExercises(prev => ({
      ...prev,
      [newId]: [...originalExercises]
    }));
  };

  const duplicateProgram = (programId: number) => {
    const original = programs.find(p => p.id === programId);
    if (!original) return;

    const newId = Math.max(...programs.map(p => p.id), 0) + 1;
    const newName = `${original.name} Copy`;

    const newProgram = {
      ...original,
      id: newId,
      name: newName
    };

    const originalWorkouts = programWorkouts[programId] || [];
    
    setPrograms([...programs, newProgram]);
    setProgramOrder([...programOrder, newId]);
    setProgramWorkouts(prev => ({
      ...prev,
      [newId]: [...originalWorkouts]
    }));
  };

  const replaceProgramWorkout = (programId: number, oldWorkoutId: number, newWorkoutId: number) => {
    setProgramWorkouts(prev => {
      const currentWorkouts = prev[programId] || [];
      const newWorkouts = currentWorkouts.map(id => id === oldWorkoutId ? newWorkoutId : id);
      return {
        ...prev,
        [programId]: newWorkouts
      };
    });
  };

  const handleSaveWorkout = (updatedWorkout: any) => {
    if (!updatedWorkout) return;

    // Update the list of exercises for this workout
    const exerciseNames = updatedWorkout.exercises.map((ex: any) => ex.name);
    
    setWorkoutExercises(prev => ({
      ...prev,
      [updatedWorkout.id]: exerciseNames
    }));

    // Update workout metadata (exercise count)
    setWorkouts(prev => prev.map(w => {
      if (w.id === updatedWorkout.id) {
        return {
          ...w,
          name: updatedWorkout.name,
          exercises: exerciseNames.length
        };
      }
      return w;
    }));

    setEditingWorkoutId(null);
  };

  const handleRenameWorkout = (newName: string) => {
    if (!renamingWorkoutId) return;
    
    // Check for duplicate names
    if (recentWorkouts.some(w => w.name === newName && w.id !== renamingWorkoutId)) {
      toast.error("Workout name already exists");
      return;
    }

    setWorkouts(prev => prev.map(w => 
      w.id === renamingWorkoutId ? { ...w, name: newName } : w
    ));
    
    setRenamingWorkoutId(null);
  };

  const handleRenameProgram = (programId: number, newName: string) => {
      // Check for duplicate names
      if (programs.some(p => p.name === newName && p.id !== programId)) {
          toast.error("Program name already exists");
          return;
      }

      setPrograms(prev => prev.map(p =>
          p.id === programId ? { ...p, name: newName } : p
      ));
  };

  const editingWorkout = editingWorkoutId ? getWorkoutDetails(editingWorkoutId) : null;
  const renamingWorkout = renamingWorkoutId ? recentWorkouts.find(w => w.id === renamingWorkoutId) : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <CustomDragLayer />
      <WorkoutSummaryModal 
        isOpen={!!summaryWorkout} 
        onClose={() => setSummaryWorkout(null)} 
        workout={summaryWorkout} 
      />
      <WorkoutSessionSheet
        isOpen={!!editingWorkoutId}
        onClose={() => setEditingWorkoutId(null)}
        onSave={handleSaveWorkout}
        workout={editingWorkout}
      />
      {renamingWorkout && (
        <RenameWorkoutModal
          initialName={renamingWorkout.name}
          onClose={() => setRenamingWorkoutId(null)}
          onSave={handleRenameWorkout}
        />
      )}
      <div className="relative min-h-screen bg-[#222222] text-white">
        {/* Stainless Steel Pattern Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <StainlessSteelPattern />
        </div>

        {/* Header */}
        <div className="px-6 pt-16 pb-6 relative z-10 flex items-center justify-between">
          <style>{`
            @keyframes shine {
              0% {
                background-position: 200% 200%;
              }
              100% {
                background-position: -200% -200%;
              }
            }
          `}</style>
          <h1 
            className="text-[24px] tracking-[0.15em] text-left" 
            style={{ 
              fontFamily: 'BankGothic, sans-serif', 
              fontWeight: 900,
              
              // Metallic Green Gradient
              background: 'linear-gradient(110deg, #4ade80 0%, #22c55e 30%, #86efac 45%, #ffffff 50%, #86efac 55%, #22c55e 70%, #4ade80 100%)',
              
              // Setup for background clip text
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              
              // Animation
              animation: 'shine 5s linear infinite'
            }}
          >
            FORTIS
          </h1>
          
          {activeTab === "profile" && (
            <button 
              aria-label="Settings"
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="pb-32">
          {activeTab === "history" && (
             /* History Section */
             <div className="px-6 mb-8 relative z-10">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                   History
                 </h2>
                 
                 {/* Streak Card */}
                 <div className="bg-gradient-to-br from-[#4ade80]/10 to-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl px-3 py-1.5 flex items-center gap-2">
                   <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                   <div className="flex items-baseline gap-1">
                     <span className="text-white font-bold font-['BankGothic']">{currentStreak}</span>
                     <span className="text-[11px] text-[#4ade80] font-medium uppercase tracking-wider">Week Streak</span>
                   </div>
                 </div>
               </div>
               
               <div className="relative rounded-2xl p-4 mb-6 border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.30)] overflow-hidden">
                 {/* Fog Overlay */}
                 <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/25 via-white/15 to-transparent opacity-100 pointer-events-none backdrop-blur-sm" />
                 
                 <div className="relative z-10">
                   <Calendar
                   mode="single"
                   selected={selectedDate}
                   onSelect={(date) => {
                     if (date) {
                       setSelectedDate(date);
                       setCurrentMonth(date);
                     }
                   }}
                   month={currentMonth}
                   onMonthChange={setCurrentMonth}
                   className="w-full p-0"
                   classNames={{
                     months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                     month: "space-y-4 w-full",
                     caption: "flex justify-center pt-1 relative items-center text-[#DFE2E6] mb-4",
                     caption_label: "text-sm font-medium tracking-wide",
                     nav: "space-x-1 flex items-center",
                     nav_button: "h-7 w-7 bg-white/5 p-0 opacity-70 hover:opacity-100 text-[#DFE2E6] hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center justify-center",
                     nav_button_previous: "absolute left-1",
                     nav_button_next: "absolute right-1",
                     table: "w-full border-collapse space-y-1",
                     head_row: "flex w-full mb-2",
                     head_cell: "text-[#9CA3AF] rounded-md w-9 font-medium text-[0.8rem] flex-1 text-center uppercase tracking-wider opacity-60",
                     row: "flex w-full mt-2",
                     cell: "h-10 w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex items-center justify-center",
                     day: "h-9 w-9 p-0 font-normal text-[#DFE2E6] rounded-full transition-all duration-300 hover:bg-white/10 hover:scale-110 active:scale-95",
                     day_range_end: "day-range-end",
                     day_selected: "bg-gradient-to-b from-[#4ade80] to-[#22c55e] !text-[#1a1a1a] shadow-[0_4px_12px_rgba(34,197,94,0.4)] font-bold scale-110 border border-[#22c55e]/50 ring-2 ring-[#22c55e]/20",
                     day_today: "ring-1 ring-white/30 font-medium text-white",
                     day_outside: "text-gray-600 opacity-30",
                     day_disabled: "text-muted-foreground opacity-50",
                     day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                     day_hidden: "invisible",
                   }}
                   components={calendarComponents}
                   modifiers={{
                     level1: (date) => getIntensityLevel(date) === 'level1',
                     level2: (date) => getIntensityLevel(date) === 'level2',
                     level3: (date) => getIntensityLevel(date) === 'level3',
                     level4: (date) => getIntensityLevel(date) === 'level4',
                   }}
                   modifiersClassNames={{
                     level1: "bg-[#22c55e]/20 text-[#e6f7ed]",
                     level2: "bg-[#22c55e]/40 text-white",
                     level3: "bg-[#22c55e]/60 text-white font-medium",
                     level4: "bg-[#22c55e]/80 text-white font-bold shadow-[0_0_8px_rgba(34,197,94,0.3)]",
                   }}
                 />
                 </div>
               </div>

               <div className="space-y-3">
                 {selectedDate && (
                   <div className="flex items-center justify-between mb-2">
                     <div className="text-[#9CA3AF] text-sm font-medium">
                       {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                     </div>
                     {selectedDateVolume > 0 && (
                       <div className="flex items-center gap-2 px-3 py-1 bg-[#2A2A2A] rounded-full border border-[#22c55e]/30">
                         <span className="text-[#22c55e] text-xs font-bold">Total Volume</span>
                         <span className="text-white text-xs font-medium">{selectedDateVolume.toLocaleString()} lbs</span>
                       </div>
                     )}
                   </div>
                 )}
                 
                 {historyWorkouts.length > 0 ? (
                   historyWorkouts.map((workout) => (
                     <button 
                       key={workout.id} 
                       onClick={() => setSummaryWorkout(getWorkoutDetails(workout.id))}
                       className="relative group w-full text-left p-4 rounded-2xl transition-all duration-200 border border-white/10 hover:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.30)] overflow-hidden"
                     >
                       <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/25 via-white/15 to-transparent opacity-100 pointer-events-none backdrop-blur-sm" />
                       <div className="absolute inset-0 z-1 bg-transparent group-hover:bg-white/5 transition-colors duration-200 pointer-events-none" />
                       <div className="relative z-10">
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-[#DFE2E6] group-hover:text-white transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>{workout.name}</h3>
                         <span className="text-xs text-gray-400">{workout.displayDate}</span>
                       </div>
                       <div className="flex items-center gap-4 text-sm text-gray-400">
                         <div className="flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           <span>{workout.duration}</span>
                         </div>
                         <div className="flex items-center gap-1">
                           
                           <span>{workoutExercises[workout.id]?.length || 0} Exercises</span>
                         </div>
                         <div className="flex items-center gap-1">
                          <span className="text-[#22c55e] font-medium"></span>
                         </div>
                       </div>
                       </div>
                     </button>
                   ))
                 ) : (
                   <div className="text-center py-8 text-[#9CA3AF] bg-[#4A4A4A]/30 rounded-2xl border border-white/5 border-dashed">
                     <History className="w-8 h-8 mx-auto mb-3 opacity-50" />
                     <p>No workouts logged on this day</p>
                   </div>
                 )}
               </div>
             </div>
          )}

          {activeTab === "exercises" && (
             /* Exercises Section - Library */
             <div className="px-6 mb-8 relative z-10">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                   Exercises
                 </h2>
                 <button 
                   onClick={() => setShowCreateExercise(true)}
                   className="group h-[32px] px-4 rounded-2xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] text-white border border-white/10 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_8px_rgba(34,197,94,0.1)] flex items-center gap-2"
                   style={{ fontVariationSettings: "'wdth' 100", background: 'linear-gradient(to bottom, #4ade80, #22c55e)' }}
                 >
                   <Plus className="w-4 h-4" />
                   Add Custom Exercise
                 </button>
               </div>
               
               {/* Filters and Search */}
               <div className="space-y-3 mb-6">
                 {/* Search Box */}
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <input
                     type="text"
                     placeholder="Search exercises"
                     value={exerciseSearch}
                     onChange={(e) => setExerciseSearch(e.target.value)}
                     className="w-full h-[48px] pl-12 pr-4 bg-[#2A2A2A] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]/50 focus:bg-[#333333] transition-all duration-200 shadow-sm"
                   />
                 </div>

                 {/* Dropdown Filters */}
                 <div className="grid grid-cols-3 gap-2">
                   {/* Muscle Filter */}
                   <Select value={filterMuscle} onValueChange={setFilterMuscle}>
                     <SelectTrigger className="bg-[#2A2A2A] border-white/10 text-white h-[36px] text-[12px] px-3 rounded-xl hover:bg-[#333333] hover:border-white/20 transition-all duration-200 shadow-sm">
                       <SelectValue placeholder="Muscle" />
                     </SelectTrigger>
                     <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6]">
                       <SelectItem value="all">All Muscles</SelectItem>
                       {uniqueMuscles.map(m => (
                         <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>

                   {/* Equipment Filter */}
                   <Select value={filterEquipment} onValueChange={setFilterEquipment}>
                     <SelectTrigger className="bg-[#2A2A2A] border-white/10 text-white h-[36px] text-[12px] px-3 rounded-xl hover:bg-[#333333] hover:border-white/20 transition-all duration-200 shadow-sm">
                       <SelectValue placeholder="Equipment" />
                     </SelectTrigger>
                     <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6]">
                       <SelectItem value="all">All Equipment</SelectItem>
                       {uniqueEquipment.map(e => (
                         <SelectItem key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>

                   {/* Category Filter */}
                   <Select value={filterCategory} onValueChange={setFilterCategory}>
                     <SelectTrigger className="bg-[#2A2A2A] border-white/10 text-white h-[36px] text-[12px] px-3 rounded-xl hover:bg-[#333333] hover:border-white/20 transition-all duration-200 shadow-sm">
                       <SelectValue placeholder="Category" />
                     </SelectTrigger>
                     <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6]">
                       <SelectItem value="all">All Categories</SelectItem>
                       {uniqueCategories.map(c => (
                         <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               </div>

               <div className="grid grid-cols-1 gap-2">
                 {[...allExercises]
                   .filter(ex => {
                     const data = customExerciseData[ex] || exerciseData[ex];
                     const matchesSearch = ex.toLowerCase().includes(exerciseSearch.toLowerCase());
                     const matchesMuscle = filterMuscle === "all" || (data && data.primaryMuscles?.includes(filterMuscle));
                     const matchesEquipment = filterEquipment === "all" || (data && data.equipment === filterEquipment);
                     const matchesCategory = filterCategory === "all" || (data && data.category === filterCategory);
                     
                     return matchesSearch && matchesMuscle && matchesEquipment && matchesCategory;
                   })
                   .sort()
                   .map((exercise, index) => (
                   <button 
                     key={exercise} 
                     onClick={() => setSelectedExerciseDetail(exercise)}
                     className="relative group w-full p-4 rounded-2xl transition-all duration-200 text-left border border-white/10 hover:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.30)] overflow-hidden"
                   >
                     <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/25 via-white/15 to-transparent opacity-100 pointer-events-none backdrop-blur-sm" />
                     <div className="absolute inset-0 z-1 bg-transparent group-hover:bg-white/5 transition-colors duration-200 pointer-events-none" />
                     <div className="relative z-10 flex items-center justify-between">
                       <span className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-[#DFE2E6] group-hover:text-white transition-colors" style={{ fontVariationSettings: "'wdth' 100" }}>{exercise}</span>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
          )}

          {/* Create Exercise Modal */}
          {showCreateExercise && (
            <CreateExerciseModal 
              onClose={() => setShowCreateExercise(false)}
              onCreate={handleCreateExercise}
              availableMuscles={uniqueMuscles}
              availableEquipment={uniqueEquipment}
              availableCategories={uniqueCategories}
            />
          )}

          {/* Exercise Detail Modal */}
          {selectedExerciseDetail && (
            <ExerciseDetailModal
              exercise={customExerciseData[selectedExerciseDetail] || exerciseData[selectedExerciseDetail] || null}
              exerciseName={selectedExerciseDetail}
              onClose={() => setSelectedExerciseDetail(null)}
              isCustom={!!customExerciseData[selectedExerciseDetail]}
              onSave={handleUpdateExercise}
              onDelete={handleDeleteExercise}
              availableMuscles={uniqueMuscles}
              availableEquipment={uniqueEquipment}
              availableCategories={uniqueCategories}
            />
          )}

          {activeTab === "program" && (
            <>
              {/* Quick Start Section */}
              <div className="px-6 mb-8 relative z-10">
                <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6] mb-4" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Quick start
                </h2>
                <button className="group w-full h-[36px] rounded-2xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px] text-white border border-white/10 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_8px_rgba(34,197,94,0.1)]" style={{ fontVariationSettings: "'wdth' 100", background: 'linear-gradient(to bottom, #4ade80, #22c55e)' }}>
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-5 h-5 fill-current" />
                    Start a Blank Workout
                  </span>
                </button>
              </div>

              {/* Programs Section */}
              <div className="px-6 mb-8 relative z-10">
                <div className="group w-full flex items-center justify-between mb-4">
                  <button
                    onClick={() => setShowPrograms(!showPrograms)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full border border-[#22c55e]/50 flex items-center justify-center transition-all duration-300" style={{ background: 'transparent' }}>
                      <ChevronRight
                        className={`w-4 h-4 text-[#22c55e] transition-transform duration-300 ${
                          showPrograms ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Programs
                    </h2>
                  </button>
                  <button 
                    onClick={() => setShowCreateProgram(true)}
                    className="w-8 h-8 rounded-full border border-[#22c55e]/50 hover:border-[#22c55e] transition-all duration-300 flex items-center justify-center" style={{ background: 'transparent' }}
                  >
                    <FolderOpen className="w-5 h-5 text-[#22c55e]" />
                  </button>
                </div>

                {showPrograms && (
                  <div className="space-y-3">
                    {orderedPrograms.map((program, index) => (
                      <ProgramCard 
                        key={program.id} 
                        index={index}
                        program={{
                          ...program,
                          workouts: programWorkouts[program.id]?.length || 0
                        }} 
                        onDrop={(workoutId) => handleWorkoutDrop(workoutId, program.id)}
                        onClick={() => setSelectedProgram(program.id)}
                        moveProgram={moveProgram}
                        onDuplicate={() => duplicateProgram(program.id)}
                        onDelete={() => {
                          setPrograms(programs.filter(p => p.id !== program.id));
                          setProgramOrder(programOrder.filter(id => id !== program.id));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Workouts Section */}
              <div className="px-6 mb-8 relative z-10">
                <div className="group w-full flex items-center justify-between mb-4">
                  <button
                    onClick={() => setShowWorkouts(!showWorkouts)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full border border-[#22c55e]/50 flex items-center justify-center transition-all duration-300" style={{ background: 'transparent' }}>
                      <ChevronRight
                        className={`w-4 h-4 text-[#22c55e] transition-transform duration-300 ${
                          showWorkouts ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Workouts
                    </h2>
                  </button>
                  <button 
                    onClick={() => setShowCreateWorkout(true)}
                    className="w-8 h-8 rounded-full border border-[#22c55e]/50 hover:border-[#22c55e] transition-all duration-300 flex items-center justify-center" style={{ background: 'transparent' }}
                  >
                    <Plus className="w-5 h-5 text-[#22c55e]" />
                  </button>
                </div>

                {showWorkouts && (
                  <div className="grid grid-cols-2 gap-3">
                    {orderedWorkouts.map((workout, index) => (
                      <WorkoutCard 
                        key={workout.id} 
                        index={index}
                        workout={{
                          ...workout,
                          exercises: workoutExercises[workout.id]?.length || 0
                        }}
                        onClick={() => setSelectedWorkout(workout.id)}
                        moveWorkout={moveWorkout}
                        onEdit={() => setEditingWorkoutId(workout.id)}
                        onDuplicate={() => duplicateWorkout(workout.id)}
                        onRename={() => setRenamingWorkoutId(workout.id)}
                        onDelete={() => {
                          setWorkouts(recentWorkouts.filter(w => w.id !== workout.id));
                          setWorkoutOrder(workoutOrder.filter(id => id !== workout.id));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <div className="px-6 mb-8 relative z-10">

               <div className="flex flex-col items-center justify-center py-12">
                 <div className="w-24 h-24 bg-[#252525] rounded-full flex items-center justify-center mb-4 border-2 border-[#22c55e]/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                   <User className="w-12 h-12 text-[#22c55e]" />
                 </div>
                 <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[24px] text-[#DFE2E6] mb-1" style={{ fontVariationSettings: "'wdth' 100" }}>
                   User Profile
                 </h2>
                 <p className="text-gray-400 text-sm mb-8">Joined November 2023</p>
                 
                 <VolumeChart data={weeklyVolumeData} />
                 



               </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-[#242424]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-[80px] px-6 flex items-center justify-between w-[90%] max-w-[420px]">
            {/* History Tab (First) */}
            <button
              onClick={() => setActiveTab("history")}
              className="flex flex-col items-center gap-1 transition-all group w-14"
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                activeTab === "history" ? "bg-[#22c55e]/20" : "group-hover:bg-white/5"
              }`}>
                <CalendarIcon className={`w-5 h-5 transition-colors ${
                  activeTab === "history" ? "text-[#22c55e]" : "text-gray-400 group-hover:text-gray-300"
                }`} />
              </div>
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  activeTab === "history" ? "" : "text-gray-400"
                }`}
                style={activeTab === "history" ? {
                  background: 'linear-gradient(to bottom, #4ade80, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } : {}}
              >
                History
              </span>
            </button>

            {/* Exercises Tab (Second) */}
            <button
              onClick={() => setActiveTab("exercises")}
              className="flex flex-col items-center gap-1 transition-all group w-14"
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                activeTab === "exercises" ? "bg-[#22c55e]/20" : "group-hover:bg-white/5"
              }`}>
                <List className={`w-5 h-5 transition-colors ${
                  activeTab === "exercises" ? "text-[#22c55e]" : "text-gray-400 group-hover:text-gray-300"
                }`} />
              </div>
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  activeTab === "exercises" ? "" : "text-gray-400"
                }`}
                style={activeTab === "exercises" ? {
                  background: 'linear-gradient(to bottom, #4ade80, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } : {}}
              >
                Exercises
              </span>
            </button>

            {/* Start Workout Center Button (Third - Center) */}
            <div className="flex flex-col items-center -mt-6">
              <button 
                onClick={() => setShowCreateWorkout(true)}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-[0_2px_8px_rgba(34,197,94,0.1)] group hover:shadow-[0_4px_12px_rgba(34,197,94,0.15)] border-2 border-[#242424]"
                style={{
                  background: 'linear-gradient(to bottom, #4ade80, #22c55e)',
                }}
              >
                <Dumbbell className="w-6 h-6 text-white fill-current ml-0.5 transition-transform group-hover:rotate-[-10deg]" />
              </button>
              <span className="text-[11px] font-bold mt-1" style={{
                  background: 'linear-gradient(to bottom, #4ade80, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Start</span>
            </div>

            {/* Program Tab (Fourth) */}
            <button
              onClick={() => setActiveTab("program")}
              className="flex flex-col items-center gap-1 transition-all group w-14"
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                activeTab === "program" ? "bg-[#22c55e]/20" : "group-hover:bg-white/5"
              }`}>
                <Layout className={`w-5 h-5 transition-colors ${
                  activeTab === "program" ? "text-[#22c55e]" : "text-gray-400 group-hover:text-gray-300"
                }`} />
              </div>
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  activeTab === "program" ? "" : "text-gray-400"
                }`}
                style={activeTab === "program" ? {
                  background: 'linear-gradient(to bottom, #4ade80, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } : {}}
              >
                Programs
              </span>
            </button>

            {/* Profile Tab (Fifth) */}
            <button
              onClick={() => setActiveTab("profile")}
              className="flex flex-col items-center gap-1 transition-all group w-14"
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                activeTab === "profile" ? "bg-[#22c55e]/20" : "group-hover:bg-white/5"
              }`}>
                <User className={`w-5 h-5 transition-colors ${
                  activeTab === "profile" ? "text-[#22c55e]" : "text-gray-400 group-hover:text-gray-300"
                }`} />
              </div>
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  activeTab === "profile" ? "" : "text-gray-400"
                }`}
                style={activeTab === "profile" ? {
                  background: 'linear-gradient(to bottom, #4ade80, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } : {}}
              >
                Profile
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {/* Program Modal */}
          {selectedProgram && (
            <ProgramModal
              key="program-modal"
              program={selectedProgramData!}
              workouts={selectedProgramWorkoutList}
              allWorkouts={recentWorkouts.map(w => ({
                ...w,
                exercises: workoutExercises[w.id]?.length || 0
              }))}

              onClose={() => setSelectedProgram(null)}
              onRemoveWorkout={(workoutId) => handleRemoveWorkout(workoutId, selectedProgram)}
              onAddWorkout={(workoutId) => addWorkoutToProgram(selectedProgram, workoutId)}
              moveWorkout={(dragIndex, hoverIndex) => moveProgramWorkout(selectedProgram, dragIndex, hoverIndex)}
              onWorkoutClick={(workoutId) => {
                setSelectedWorkout(workoutId);
              }}
              onReplaceWorkout={(oldId, newId) => replaceProgramWorkout(selectedProgram, oldId, newId)}
              onRename={(newName) => handleRenameProgram(selectedProgram, newName)}
            />
          )}

          {/* Workout Modal */}
          {selectedWorkout && selectedWorkoutData && (
            <WorkoutModal
              key="workout-modal"
              workout={selectedWorkoutData}
              exercises={workoutExercises[selectedWorkout]}
              exerciseLibrary={exerciseLibrary}
              onClose={() => setSelectedWorkout(null)}
              moveExercise={(dragIndex, hoverIndex) => moveExercise(selectedWorkout, dragIndex, hoverIndex)}
              removeExercise={(index) => removeExercise(selectedWorkout, index)}
              addExercise={(exercise) => addExerciseToWorkout(selectedWorkout, exercise)}
              isBottomSheet={!selectedProgram}
              readOnly={!!selectedProgram}
            />
          )}

          {/* Create Program Modal */}
          {showCreateProgram && (
            <CreateProgramModal
              key="create-program-modal"
              onClose={() => setShowCreateProgram(false)}
              onCreate={createProgram}
            />
          )}

          {/* Create Workout Modal */}
          {showCreateWorkout && (
            <CreateWorkoutModal
              key="create-workout-modal"
              onClose={() => setShowCreateWorkout(false)}
              onCreate={createWorkout}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}
