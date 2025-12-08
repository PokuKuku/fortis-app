import { RestTimerModal } from "../components/RestTimerModal";
import { AddExerciseModal } from "../components/AddExerciseModal";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Trash2, MoreVertical, Timer, X, Pencil, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import svgPaths from "./svg-3r2k1lo6zy";
import { StainlessSteelPattern } from "../components/StainlessSteelPattern";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

function Icon() {
  return (
    <div className="h-[19.998px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[9.37%_15.62%_9.38%_15.62%]" data-name="Vector">
        <div className="absolute inset-[-3.85%_-4.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 18">
            <path d={svgPaths.p30b17c60} id="Vector" stroke="var(--stroke-0, #B9BEC7)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24989" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ExerciseMenu({ onDelete, onSetTimer, onReplace }: { onDelete?: () => void, onSetTimer?: () => void, onReplace?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative rounded-[10px] shrink-0 size-[30px] cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center outline-none" data-name="Button">
          <MoreVertical className="text-[#DFE2E6]" size={20} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#252525] border-white/10 text-[#DFE2E6]">
        <DropdownMenuItem onClick={onReplace} className="focus:bg-white/5 focus:text-white cursor-pointer">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          <span>Replace Exercise</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSetTimer} className="focus:bg-white/5 focus:text-white cursor-pointer">
          <Timer className="mr-2 h-4 w-4" />
          <span>Set Rest Timer</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Exercise</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ExerciseCard() {
  return (
    <div className="opacity-50 relative rounded-[2.19112e+07px] shrink-0 size-[13.999px]" data-name="ExerciseCard">
      <div aria-hidden="true" className="absolute border-[#dfe2e6] border-[0.653px] border-solid inset-0 pointer-events-none rounded-[2.19112e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center p-[0.653px] relative size-[13.999px]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[13.5px] not-italic relative shrink-0 text-[#dfe2e6] text-[9px] text-center text-nowrap tracking-[0.167px] whitespace-pre">?</p>
      </div>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick?: () => void }) {
  return (
    <div onClick={onClick} className="relative rounded-[10px] shrink-0 size-[31.997px] cursor-pointer hover:bg-red-500/20 transition-colors flex items-center justify-center" data-name="Button">
      <Trash2 className="text-red-500" size={16} />
    </div>
  );
}

function Button2({ onClick }: { onClick?: () => void }) {
  return (
    <div onClick={onClick} className="bg-[rgba(34,197,94,0.2)] h-[35.997px] rounded-[14px] w-full relative cursor-pointer hover:bg-[rgba(34,197,94,0.3)] transition-colors select-none" data-name="Button">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-1/2 not-italic text-[16px] text-center text-green-500 text-nowrap top-1/2 -translate-x-1/2 -translate-y-1/2 tracking-[-0.3125px] whitespace-pre">+ Add Set</p>
    </div>
  );
}

function Button3({ onClick }: { onClick?: () => void }) {
  return (
    <div onClick={onClick} className="h-[43.915px] relative rounded-[16px] shrink-0 w-full cursor-pointer hover:bg-[rgba(34,197,94,0.05)] transition-colors" data-name="Button">
      <div aria-hidden="true" className="absolute border-[1.959px] border-[rgba(34,197,94,0.3)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-1/2 not-italic text-[16px] text-center text-green-500 text-nowrap top-1/2 -translate-x-1/2 -translate-y-1/2 tracking-[-0.3125px] whitespace-pre">+ Add Exercise</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute h-full left-0 top-0 w-full" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 394 853">
        <g clipPath="url(#clip0_182_1512)" id="Icon">
          <g id="Vector"></g>
        </g>
        <defs>
          <clipPath id="clip0_182_1512">
            <rect fill="white" height="852.825" width="393.109" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container14() {
  return <div className="absolute h-full left-0 top-0 w-full" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 393.11 852.83\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(0 -60.304 -27.797 0 196.55 426.41)\\\'><stop stop-color=\\\'rgba(0,0,0,0)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(0,0,0,0.2)\\\' offset=\\\'1\\\'/></radialGradient></defs></svg>')" }} />;
}

function StainlessSteelPatternLocal() {
  return (
    <div className="absolute h-full left-0 top-0 w-full pointer-events-none" data-name="StainlessSteelPattern">
      <Icon2 />
      <Container14 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute h-[158.986px] left-0 top-0 w-full" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 394 159">
        <g clipPath="url(#clip0_182_1504)" id="Icon">
          <g id="Vector"></g>
        </g>
        <defs>
          <clipPath id="clip0_182_1504">
            <rect fill="white" height="158.986" width="393.109" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container16() {
  return <div className="absolute h-[158.986px] left-0 top-0 w-full" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 393.11 158.99\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(0 -11.242 -27.797 0 196.55 79.493)\\\'><stop stop-color=\\\'rgba(0,0,0,0)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(0,0,0,0.2)\\\' offset=\\\'1\\\'/></radialGradient></defs></svg>')" }} />;
}

function StainlessSteelPattern1Local() {
  return (
    <div className="absolute h-[158.986px] left-0 top-0 w-full" data-name="StainlessSteelPattern">
      <Icon3 />
      <Container16 />
    </div>
  );
}


function SaveButton({ onClick }: { onClick?: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className="absolute left-[24px] top-[32px] h-[36px] px-6 rounded-2xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px] text-white border border-white/10 active:scale-[0.98] transition-all duration-200 z-50 flex items-center justify-center"
      style={{ fontVariationSettings: "'wdth' 100", background: 'linear-gradient(to bottom, #4ade80, #22c55e)' }}
      data-name="Button"
    >
      Save
    </button>
  );
}

function CloseButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-[24px] top-[32px] w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5 z-50"
      data-name="Button"
    >
      <X className="w-5 h-5 text-[#EF4444]" />
    </button>
  );
}

function SetRow({ set, index, onDelete, onUpdate }: { set: any, index: number, onDelete?: () => void, onUpdate: (field: string, value: string | number) => void }) {
  const [isRpeOpen, setIsRpeOpen] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);
  const repsRef = useRef<HTMLInputElement>(null);

  // Common input style class
  const inputClass = 
    "rounded-lg px-2 py-2 text-center text-[14px] focus:outline-none focus:ring-2 min-w-0 transition-colors bg-white/5 border border-white/10 text-white hover:bg-white/10 focus:ring-[#22c55e] w-full";

  const triggerError = (field: string) => {
    setErrorField(field);
    setTimeout(() => setErrorField(null), 500);
  };

  const handleWeightChange = (val: string) => {
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onUpdate('weight', val);
    } else {
      triggerError('weight');
    }
  };

  const handleRepsChange = (val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      onUpdate('reps', val);
    } else {
      triggerError('reps');
    }
  };

  const handleWeightKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      repsRef.current?.focus();
    }
  };

  const shakeAnimation = {
    x: [0, -5, 5, -5, 5, 0]
  };

  const errorStyle = {
    borderColor: "#EF4444",
    boxShadow: "0 0 0 2px #EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.2)"
  };

  return (
    <div className="flex items-center gap-2 h-[38px] w-full">
      {/* Set Number */}
      <div className="w-[40px] flex justify-center">
         <span className="text-white font-semibold text-sm">{index + 1}</span>
      </div>
      {/* Previous */}
      <div className="w-[64px] flex justify-center">
         <span className="text-[#6a7282] text-xs">—</span>
      </div>
      {/* Weight */}
      <div className="flex-1">
        <motion.input 
           className={inputClass}
           style={errorField === 'weight' ? errorStyle : undefined}
           type="text"
           inputMode="decimal"
           value={set.weight || ''}
           onChange={(e) => handleWeightChange(e.target.value)}
           onKeyDown={handleWeightKeyDown}
           onFocus={(e) => e.target.select()}
           animate={errorField === 'weight' ? shakeAnimation : {}}
           transition={{ duration: 0.4 }}
        />
      </div>
      {/* Reps */}
      <div className="flex-1">
        <motion.input 
           ref={repsRef}
           className={inputClass}
           style={errorField === 'reps' ? errorStyle : undefined}
           type="text"
           inputMode="numeric"
           value={set.reps || ''}
           onChange={(e) => handleRepsChange(e.target.value)}
           onFocus={(e) => e.target.select()}
           animate={errorField === 'reps' ? shakeAnimation : {}}
           transition={{ duration: 0.4 }}
        />
      </div>
      {/* RPE */}
      <div className="w-[50px]">
        <Popover open={isRpeOpen} onOpenChange={setIsRpeOpen}>
          <PopoverTrigger asChild>
            <input
              type="text"
              readOnly
              value={set.rpe || ''}
              className={`${inputClass} cursor-pointer caret-transparent`}
            />
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="flex gap-2 p-2 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-xl w-auto min-w-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {[
              { val: 6, color: "bg-[#22c55e] text-white" },
              { val: 7, color: "bg-[#84cc16] text-[#1c1c1e]" },
              { val: 8, color: "bg-[#eab308] text-[#1c1c1e]" },
              { val: 9, color: "bg-[#f97316] text-white" },
              { val: 10, color: "bg-[#ef4444] text-white" },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => {
                  onUpdate('rpe', opt.val.toString());
                  setIsRpeOpen(false);
                }}
                className={`size-10 rounded-lg flex items-center justify-center text-sm font-bold ${opt.color} hover:brightness-110 transition-all`}
              >
                {opt.val}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      {/* Delete Button */}
      <div className="w-[32px] shrink-0 flex justify-center">
         <DeleteButton onClick={onDelete} /> 
      </div>
    </div>
  )
}

function Headers() {
  return (
    <div className="flex items-center gap-2 mb-2">
       <div className="w-[40px] text-center"><span className="text-[#dfe2e6] text-xs">Set</span></div>
       <div className="w-[64px] text-center"><span className="text-[#dfe2e6] text-xs">Previous</span></div>
       <div className="flex-1 text-center"><span className="text-[#dfe2e6] text-xs">lbs</span></div>
       <div className="flex-1 text-center"><span className="text-[#dfe2e6] text-xs">Reps</span></div>
       <div className="w-[50px] flex items-center justify-center gap-1">
          <span className="text-[#dfe2e6] text-xs">RPE</span>
       </div>
       <div className="w-[32px]" />
    </div>
  )
}

function ExerciseCardItem({ exercise, onAddSet, onDeleteSet, onDeleteExercise, onUpdateSet, onSetRestTimer, onReplace }: { exercise: any, onAddSet?: () => void, onDeleteSet?: (index: number) => void, onDeleteExercise?: () => void, onUpdateSet?: (setIndex: number, field: string, value: string | number) => void, onSetRestTimer?: () => void, onReplace?: () => void }) {
  return (
    <div className="relative bg-gradient-to-b border-[0.653px] border-[rgba(255,255,255,0.1)] border-solid from-[#454545] to-[#303030] rounded-[16px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.3)] w-full p-4 flex flex-col gap-4" data-name="ExerciseCard">
      
      {/* Header */}
      <div className="flex items-center justify-between h-[30px]">
        <div className="h-[29.997px] relative shrink-0 grow overflow-hidden">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[30px] text-[20px] text-green-500 text-nowrap tracking-[-0.4492px] truncate">
            {exercise.name}
          </p>
        </div>
        <ExerciseMenu onDelete={onDeleteExercise} onSetTimer={onSetRestTimer} onReplace={onReplace} /> 
      </div>

      {/* Sets */}
      <div className="flex flex-col gap-3">
         <Headers />
         
         {exercise.sets && exercise.sets.map((set: any, i: number) => (
            <SetRow 
               key={set.id || i} 
               set={set} 
               index={i} 
               onDelete={() => onDeleteSet && onDeleteSet(i)}
               onUpdate={(field, value) => onUpdateSet && onUpdateSet(i, field, value)}
            />
         ))}
      </div>

      <Button2 onClick={onAddSet} /> 
    </div>
  );
}

function WorkoutLogger({ workout, onAddSet, onDeleteSet, onDeleteExercise, onUpdateSet, onSetRestTimer, onAddExerciseClick, onReplaceExercise }: { workout: any, onAddSet: (index: number) => void, onDeleteSet: (exIndex: number, setIndex: number) => void, onDeleteExercise: (index: number) => void, onUpdateSet: (exIndex: number, setIndex: number, field: string, value: string | number) => void, onSetRestTimer: (index: number) => void, onAddExerciseClick: () => void, onReplaceExercise: (index: number) => void }) {
  return (
    <div className="absolute bg-transparent h-full left-0 top-0 w-full overflow-y-auto pb-32 no-scrollbar" data-name="WorkoutLogger">
       {/* Header Spacer */}
       <div className="h-[88px] shrink-0" />
       
       <div className="flex flex-col gap-4 px-4 pb-8 max-w-md mx-auto w-full">
          {workout && workout.exercises ? (
            workout.exercises.map((ex: any, i: number) => (
               <ExerciseCardItem 
                  key={ex.id || i} 
                  exercise={ex} 
                  onAddSet={() => onAddSet(i)} 
                  onDeleteSet={(setIndex) => onDeleteSet(i, setIndex)}
                  onDeleteExercise={() => onDeleteExercise(i)}
                  onUpdateSet={(setIndex, field, value) => onUpdateSet(i, setIndex, field, value)}
                  onSetRestTimer={() => onSetRestTimer(i)}
                  onReplace={() => onReplaceExercise(i)}
               />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">No exercises found</div>
          )}
          
           {/* Add Exercise Button */}
           <div className="mt-2 mb-8">
             <Button3 onClick={onAddExerciseClick} />
           </div>
       </div>
    </div>
  )
}

function WorkoutLogger1({ onClose, onSave, onTitleChange, title }: { onClose?: () => void, onSave?: () => void, onTitleChange: (newTitle: string) => void, title?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute bg-[#222222] h-[88px] left-0 overflow-clip top-0 w-full z-20" data-name="WorkoutLogger">
      <StainlessSteelPattern />
      <div className="absolute flex flex-row gap-2 items-center justify-center left-1/2 -translate-x-1/2 top-[32px] max-w-[260px]" data-name="Container">
        {/* Ghost element to balance the pencil icon and ensure perfect centering */}
        <div className="w-[22px] h-[22px] shrink-0 opacity-0 pointer-events-none" />
        
        <div className="relative grid place-items-center min-w-[20px] max-w-full">
           <span className="invisible font-['Inter:Bold',sans-serif] font-bold text-[17px] whitespace-pre truncate max-w-full pointer-events-none px-1">
             {title || "Workout Name"}
           </span>
           <input
             ref={inputRef}
             value={title || ""}
             onChange={(e) => onTitleChange(e.target.value)}
             placeholder="Workout Name"
             className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-center font-['Inter:Bold',sans-serif] font-bold text-[17px] text-[#22c55e] placeholder-white/20 p-0 m-0 px-1 truncate"
           />
        </div>

        <button onClick={() => inputRef.current?.focus()} className="text-[#666666] hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 flex items-center justify-center w-[22px] h-[22px] shrink-0">
          <Pencil size={14} />
        </button>
      </div>
      <SaveButton onClick={onSave} />
      <CloseButton onClick={onClose} />
    </div>
  );
}

export default function CompleteWorkoutLoggingUi({ onClose, onSave, workout }: { onClose?: () => void, onSave?: (workout: any) => void, workout?: any }) {
  const [localWorkout, setLocalWorkout] = useState(workout);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [editingRestTimerIndex, setEditingRestTimerIndex] = useState<number | null>(null);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalWorkout(workout);
  }, [workout]);

  const handleRename = (newName: string) => {
    if (!localWorkout) return;
    setLocalWorkout({ ...localWorkout, name: newName });
  };

  const handleAddExercises = (exerciseNames: string[]) => {
    if (!localWorkout) return;
    const newWorkout = { ...localWorkout };
    
    const newExercises = exerciseNames.map(name => ({
      id: Math.random(),
      name: name,
      sets: [
        { id: Math.random(), weight: 0, reps: 0, rpe: 0, completed: false }
      ]
    }));
    
    newWorkout.exercises = [...(newWorkout.exercises || []), ...newExercises];
    setLocalWorkout(newWorkout);
    setIsAddExerciseModalOpen(false);
  };

  const handleReplaceExercise = (exerciseNames: string[]) => {
     if (replacingExerciseIndex === null || !localWorkout || exerciseNames.length === 0) return;
     const newName = exerciseNames[0];
     const newWorkout = { ...localWorkout };
     newWorkout.exercises = [...newWorkout.exercises];
     
     const newExercise = {
        id: Math.random(),
        name: newName,
        sets: [
           { id: Math.random(), weight: 0, reps: 0, rpe: 0, completed: false }
        ]
     };
     
     newWorkout.exercises[replacingExerciseIndex] = newExercise;
     setLocalWorkout(newWorkout);
     setReplacingExerciseIndex(null);
  };

  const handleAddSet = (exerciseIndex: number) => {
     if (!localWorkout) return;
     const newWorkout = { ...localWorkout };
     const exercise = newWorkout.exercises[exerciseIndex];
     const lastSet = exercise.sets[exercise.sets.length - 1];
     
     const newSet = {
       id: Math.random(), 
       weight: lastSet ? lastSet.weight : 0,
       reps: lastSet ? lastSet.reps : 0,
       rpe: lastSet ? lastSet.rpe : 0,
       completed: false
     };
     
     newWorkout.exercises = [...newWorkout.exercises];
     newWorkout.exercises[exerciseIndex] = {
        ...exercise,
        sets: [...exercise.sets, newSet]
     };

     setLocalWorkout(newWorkout);
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
     if (!localWorkout) return;
     const newWorkout = { ...localWorkout };
     const exercise = newWorkout.exercises[exerciseIndex];
     
     newWorkout.exercises = [...newWorkout.exercises];
     newWorkout.exercises[exerciseIndex] = {
        ...exercise,
        sets: exercise.sets.filter((_: any, i: number) => i !== setIndex)
     };

     setLocalWorkout(newWorkout);
  };

  const handleDeleteExercise = (exerciseIndex: number) => {
     if (!localWorkout) return;
     const newWorkout = { ...localWorkout };
     newWorkout.exercises = newWorkout.exercises.filter((_: any, i: number) => i !== exerciseIndex);
     setLocalWorkout(newWorkout);
  };

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: string, value: string | number) => {
     if (!localWorkout) return;
     const newWorkout = { ...localWorkout };
     // Deep copy to avoid mutation
     newWorkout.exercises = [...newWorkout.exercises];
     const exercise = { ...newWorkout.exercises[exerciseIndex] };
     exercise.sets = [...exercise.sets];
     const set = { ...exercise.sets[setIndex] };
     
     set[field] = value;
     exercise.sets[setIndex] = set;
     newWorkout.exercises[exerciseIndex] = exercise;

     setLocalWorkout(newWorkout);
  };

  const handleSaveClick = () => {
    setIsSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    setIsSaveDialogOpen(false);
    if (onSave) {
      onSave(localWorkout);
    }
  };

  const handleSetRestTimer = (exerciseIndex: number) => {
    setEditingRestTimerIndex(exerciseIndex);
  };

  const handleSaveRestTimer = (normal: number, warmup: number, drop: number) => {
    if (editingRestTimerIndex === null || !localWorkout) return;
    
    const newWorkout = { ...localWorkout };
    const exercise = { ...newWorkout.exercises[editingRestTimerIndex] };
    
    // Store rest timer settings in the exercise object
    // Assuming the exercise object can store these properties
    exercise.restTimer = { normal, warmup, drop };
    
    newWorkout.exercises = [...newWorkout.exercises];
    newWorkout.exercises[editingRestTimerIndex] = exercise;
    
    setLocalWorkout(newWorkout);
    // Do not close the modal here, as the "Set ..." button should only save and show feedback
    // setEditingRestTimerIndex(null); 
  };

  return (
    <div className="bg-[#222222] relative w-full h-full" data-name="Complete Workout Logging UI">
      <StainlessSteelPattern />
      <WorkoutLogger 
         workout={localWorkout} 
         onAddSet={handleAddSet} 
         onDeleteSet={handleDeleteSet}
         onDeleteExercise={handleDeleteExercise}
         onUpdateSet={handleUpdateSet}
         onSetRestTimer={handleSetRestTimer}
         onAddExerciseClick={() => setIsAddExerciseModalOpen(true)}
         onReplaceExercise={(index) => setReplacingExerciseIndex(index)}
       />
      <WorkoutLogger1 
        onClose={onClose} 
        onSave={handleSaveClick} 
        onTitleChange={handleRename}
        title={localWorkout?.name} 
      />
      
      <AddExerciseModal 
        isOpen={isAddExerciseModalOpen}
        onClose={() => setIsAddExerciseModalOpen(false)}
        onAddExercises={handleAddExercises}
        workoutName={localWorkout?.name}
        currentExerciseCount={localWorkout?.exercises?.length || 0}
        existingExercises={localWorkout?.exercises?.map((e: any) => e.name) || []}
      />

      <AddExerciseModal 
        isOpen={replacingExerciseIndex !== null}
        onClose={() => setReplacingExerciseIndex(null)}
        onAddExercises={handleReplaceExercise}
        workoutName={localWorkout?.name}
        mode="replace"
        existingExercises={localWorkout?.exercises?.map((e: any) => e.name) || []}
      />

      {editingRestTimerIndex !== null && localWorkout && localWorkout.exercises[editingRestTimerIndex] && (
        <RestTimerModal 
          onClose={() => setEditingRestTimerIndex(null)}
          onSave={handleSaveRestTimer}
          initialNormalDuration={localWorkout.exercises[editingRestTimerIndex].restTimer?.normal || 90}
          initialWarmupDuration={localWorkout.exercises[editingRestTimerIndex].restTimer?.warmup || 90}
          initialDropDuration={localWorkout.exercises[editingRestTimerIndex].restTimer?.drop || 90}
        />
      )}

      <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <AlertDialogContent className="bg-[#222222] border border-white/10 text-[#DFE2E6]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Save Changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to save these changes to your workout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-[#DFE2E6] hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} className="bg-[#22c55e] text-black hover:bg-[#16a34a]">Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
