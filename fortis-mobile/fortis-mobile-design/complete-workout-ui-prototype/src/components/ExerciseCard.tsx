/**
 * ExerciseCard.tsx
 * 
 * Displays a single exercise within the workout logger.
 * Manages the list of sets for that exercise, allowing users to:
 * - Log weight/reps/RPE
 * - Mark sets as complete
 * - Trigger the rest timer upon set completion
 * - Remove the exercise
 */
import { useState } from "react";
import {
  CheckIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
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

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  onUpdate: (exercise: Exercise) => void;
  onRemove: () => void;
  onStartRestTimer?: (type: SetType) => void;
}

export function ExerciseCard({
  exercise,
  exerciseNumber,
  onUpdate,
  onRemove,
  onStartRestTimer,
}: ExerciseCardProps) {
  const [selectedSetId, setSelectedSetId] = useState<
    string | null
  >(null);
  const [swipedSetId, setSwipedSetId] = useState<string | null>(
    null,
  );
  const [touchStart, setTouchStart] = useState<number | null>(
    null,
  );
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [activeRpeSetId, setActiveRpeSetId] = useState<
    string | null
  >(null);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, { weight?: boolean; reps?: boolean }>
  >({});
  const [shakingSets, setShakingSets] = useState<
    Record<string, { weight?: boolean; reps?: boolean }>
  >({});

  const triggerError = (
    setId: string,
    fields: ("weight" | "reps")[],
  ) => {
    setValidationErrors((prev) => {
      const next = { ...prev };
      if (!next[setId]) next[setId] = {};
      fields.forEach((f) => (next[setId]![f] = true));
      return next;
    });

    setShakingSets((prev) => {
      const next = { ...prev };
      if (!next[setId]) next[setId] = {};
      fields.forEach((f) => (next[setId]![f] = true));
      return next;
    });

    setTimeout(() => {
      setShakingSets((prev) => {
        const next = { ...prev };
        if (next[setId]) {
          const setErrors = { ...next[setId] };
          fields.forEach((f) => (setErrors[f!] = false));
          next[setId] = setErrors;
        }
        return next;
      });
    }, 500);
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: Set = {
      id: Date.now().toString(),
      weight: "",
      reps: "",
      rpe: "",
      completed: false,
      type: "normal" as SetType,
      previousWeight: lastSet?.weight,
      previousReps: lastSet?.reps,
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const updateSet = (
    setId: string,
    field: "weight" | "reps" | "rpe",
    value: string,
  ) => {
    // Validation logic
    if (field === "weight" || field === "rpe") {
      // Allow numbers and one decimal point
      if (!/^\d*\.?\d*$/.test(value)) return;
    } else if (field === "reps") {
      // Allow only integers
      if (!/^\d*$/.test(value)) return;
    }

    // Clear error if exists
    if (
      (field === "weight" || field === "reps") &&
      validationErrors[setId]?.[field]
    ) {
      setValidationErrors((prev) => ({
        ...prev,
        [setId]: { ...prev[setId], [field]: false },
      }));
    }

    const updatedSets = exercise.sets.map((set) =>
      set.id === setId
        ? { ...set, [field]: value, completed: false }
        : set,
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const updateSetType = (setId: string, type: SetType) => {
    const updatedSets = exercise.sets.map((set) =>
      set.id === setId ? { ...set, type } : set,
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const removeSet = (setId: string) => {
    // If this is the only set, remove the entire exercise
    if (exercise.sets.length === 1) {
      onRemove();
      return;
    }

    const updatedSets = exercise.sets.filter(
      (set) => set.id !== setId,
    );
    onUpdate({ ...exercise, sets: updatedSets });
    setSwipedSetId(null);
  };

  const toggleSetComplete = (
    setId: string,
    updates?: Partial<Set>,
  ) => {
    const setIndex = exercise.sets.findIndex(
      (s) => s.id === setId,
    );
    if (setIndex === -1) return;

    const set = exercise.sets[setIndex];
    const prevSet =
      setIndex > 0 ? exercise.sets[setIndex - 1] : null;
    const isNowCompleting = !set.completed;

    let autofillUpdates: Partial<Set> = {};

    if (isNowCompleting) {
      // Check if we should autofill from previous completed set
      if (prevSet && prevSet.completed) {
        if (!set.weight && !updates?.weight && prevSet.weight) {
          autofillUpdates.weight = prevSet.weight;
        }
        if (!set.reps && !updates?.reps && prevSet.reps) {
          autofillUpdates.reps = prevSet.reps;
        }
        if (!set.rpe && !updates?.rpe && prevSet.rpe) {
          autofillUpdates.rpe = prevSet.rpe;
        }
      }

      const missingFields: ("weight" | "reps")[] = [];
      const checkWeight =
        updates?.weight ?? autofillUpdates.weight ?? set.weight;
      const checkReps =
        updates?.reps ?? autofillUpdates.reps ?? set.reps;

      if (!checkWeight) missingFields.push("weight");
      if (!checkReps) missingFields.push("reps");

      if (missingFields.length > 0) {
        triggerError(setId, missingFields);
        return;
      }
    }

    const updatedSets = [...exercise.sets];
    updatedSets[setIndex] = {
      ...set,
      completed: isNowCompleting,
      ...updates,
      ...autofillUpdates,
    };

    onUpdate({ ...exercise, sets: updatedSets });

    // Start rest timer if completing a set
    if (isNowCompleting && onStartRestTimer) {
      onStartRestTimer(set.type);
    }

    // Focus next set's weight input
    setTimeout(() => {
      const currentSetElement = document.querySelector(
        `[data-set-id="${setId}"]`,
      );
      const nextSetElement =
        currentSetElement?.parentElement?.nextElementSibling?.querySelector(
          "[data-set-id]",
        );
      const nextWeightInput = nextSetElement?.querySelector(
        'input[inputMode="decimal"]',
      ) as HTMLInputElement;
      nextWeightInput?.focus();
    }, 0);
  };

  const handleTouchStart = (
    e: React.TouchEvent,
    setId: string,
  ) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (setId: string) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;

    if (isLeftSwipe) {
      setSwipedSetId(setId);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const getSetDisplay = (set: Set, index: number) => {
    switch (set.type) {
      case "warmup":
        return { label: "W", color: "text-yellow-500" };
      case "failure":
        return { label: "F", color: "text-red-500" };
      case "drop":
        return { label: "D", color: "text-blue-400" };
      default:
        return {
          label: (index + 1).toString(),
          color: "text-white",
        };
    }
  };

  const getInputClassName = (
    set: Set,
    field: "weight" | "reps" | "rpe",
  ) => {
    const hasError =
      (field === "weight" || field === "reps") &&
      validationErrors[set.id]?.[field];
    const isShaking =
      (field === "weight" || field === "reps") &&
      shakingSets[set.id]?.[field];

    let baseClass =
      "rounded-lg px-2 py-2 text-center text-[14px] focus:outline-none focus:ring-2 disabled:opacity-60 min-w-0 transition-colors";

    if (hasError) {
      return `${baseClass} bg-red-500/10 border border-red-500 text-red-500 placeholder-red-500/50 focus:ring-red-500 ${isShaking ? "animate-shake" : ""}`;
    }

    if (set.completed) {
      return `${baseClass} bg-[#22c55e]/20 border border-[#22c55e]/30 text-white placeholder-white/50 focus:ring-[#22c55e]`;
    }

    return `${baseClass} bg-white/5 border border-white/10 text-white placeholder-gray-500 hover:bg-white/10 focus:ring-[#22c55e]`;
  };

  const selectedSet = selectedSetId
    ? exercise.sets.find((s) => s.id === selectedSetId)
    : null;
  const selectedSetIndex = selectedSet
    ? exercise.sets.findIndex((s) => s.id === selectedSetId)
    : -1;

  return (
    <div className="space-y-4 rounded-2xl p-4 border border-white/10 hover:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.30)] bg-gradient-to-b from-[#454545] to-[#303030] transition-all duration-200">
      {/* Exercise Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[#22c55e] text-[20px] font-semibold">
          {exercise.name}
        </h3>
        <button
          onClick={onRemove}
          className="text-[#b9bec7] hover:text-red-500 transition-colors"
        >
          <TrashIcon className="size-5" />
        </button>
      </div>

      {/* Notes Section */}
      <input
        type="text"
        value={exercise.notes || ""}
        onChange={(e) =>
          onUpdate({ ...exercise, notes: e.target.value })
        }
        placeholder="Add notes..."
        className="w-full bg-transparent border-0 px-0 py-0 text-[#b9bec7] placeholder-[#979ca6] focus:outline-none focus:text-white"
      />

      {/* Sets Table */}
      <div className="space-y-3">
        {/* Header Row */}
        <div className="grid grid-cols-[40px_65px_60px_55px_50px_1fr] gap-2 text-[#DFE2E6] text-[14px]">
          <div className="text-center">Set</div>
          <div className="text-center">Previous</div>
          <div className="text-center">lbs</div>
          <div className="text-center">Reps</div>
          <div className="flex justify-center items-center">
            <div className="relative">
              RPE
              <Dialog>
                <DialogTrigger asChild>
                  <button className="absolute -top-1.5 -right-4 hover:opacity-80 transition-opacity flex items-center justify-center">
                    <div className="h-3.5 w-3.5 rounded-full border border-[#DFE2E6] flex items-center justify-center text-[9px] font-medium opacity-50 hover:opacity-100 transition-opacity">
                      ?
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#222222] border-0 text-[#DFE2E6] w-[90%] max-w-md rounded-2xl overflow-hidden p-0 [&>button]:hidden">
                  <StainlessSteelPattern opacity={0.15} />
                  <div className="relative z-10 p-6">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-2">
                      <div />
                      <DialogTitle className="text-xl font-semibold text-white text-center whitespace-nowrap">
                        Understanding RPE
                      </DialogTitle>
                      <div className="flex justify-end">
                        <DialogClose asChild>
                          <button className="bg-[#2a2a2a] rounded-lg p-1 hover:bg-[#333333] transition-colors focus:outline-none">
                            <XMarkIcon
                              className="size-5 text-[#ef4444]"
                              strokeWidth={2.5}
                            />
                          </button>
                        </DialogClose>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <DialogDescription className="text-[16px] leading-relaxed text-gray-200">
                        Rate of Perceived Exertion (RPE) is a
                        metric that attempts to measure the
                        difficulty of a set.
                      </DialogDescription>
                      <p className="text-[16px] leading-relaxed text-gray-200">
                        Reps in reserve (RIR) is an estimate of
                        how many more reps you could perform
                        before reaching muscular failure.
                      </p>
                      <div className="space-y-3 text-[15px] font-medium text-white bg-[#161616] p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between">
                          <span>6 RPE</span>{" "}
                          <span className="text-gray-400">
                            4 RIR
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>7 RPE</span>{" "}
                          <span className="text-gray-400">
                            3 RIR
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>8 RPE</span>{" "}
                          <span className="text-gray-400">
                            2 RIR
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>9 RPE</span>{" "}
                          <span className="text-gray-400">
                            1 RIR
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>10 RPE</span>{" "}
                          <span className="text-gray-400">
                            0 RIR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div></div>
        </div>

        {/* Set Rows */}
        {exercise.sets.map((set, index) => {
          const prevSet =
            index > 0 ? exercise.sets[index - 1] : null;

          return (
            <div
              key={set.id}
              className="relative animate-fade-scale-in"
            >
              <div
                data-set-id={set.id}
                className={`flex gap-2 items-center transition-all duration-200 rounded-lg ${
                  swipedSetId === set.id
                    ? "-translate-x-20"
                    : ""
                }`}
                onTouchStart={(e) =>
                  handleTouchStart(e, set.id)
                }
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(set.id)}
              >
                <div
                  className={`grid grid-cols-[40px_65px_60px_55px_50px] gap-2 items-center rounded-lg transition-colors ${
                    set.completed ? "bg-[#22c55e]/25" : ""
                  }`}
                >
                  <div className="relative flex items-center justify-center w-full h-full">
                    <Popover
                      open={selectedSetId === set.id}
                      onOpenChange={(open) =>
                        setSelectedSetId(open ? set.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <button
                          className={`${getSetDisplay(set, index).color} text-[14px] text-center cursor-pointer hover:opacity-80 font-semibold`}
                        >
                          {getSetDisplay(set, index).label}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={5}
                        className="bg-[#1c1c1e] border border-white/10 rounded-xl shadow-2xl min-w-[150px] overflow-hidden flex flex-col py-1 p-0 w-auto"
                      >
                        {[
                          {
                            type: "normal",
                            label: "Normal",
                            color: "text-white",
                            icon: (index + 1).toString(),
                          },
                          {
                            type: "warmup",
                            label: "Warm Up",
                            color: "text-yellow-500",
                            icon: "W",
                          },
                          {
                            type: "failure",
                            label: "Failure",
                            color: "text-red-500",
                            icon: "F",
                          },
                          {
                            type: "drop",
                            label: "Drop Set",
                            color: "text-blue-400",
                            icon: "D",
                          },
                        ].map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => {
                              updateSetType(
                                set.id,
                                opt.type as SetType,
                              );
                              setSelectedSetId(null);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left w-full"
                          >
                            <span
                              className={`${opt.color} w-5 text-center font-semibold`}
                            >
                              {opt.icon}
                            </span>
                            <span className="text-sm text-gray-300">
                              {opt.label}
                            </span>
                          </button>
                        ))}
                        <div className="h-px bg-white/10 my-1" />
                        <button
                          onClick={() => {
                            removeSet(set.id);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left text-red-500 w-full"
                        >
                          <TrashIcon className="size-4" />
                          <span className="text-sm">
                            Remove
                          </span>
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="text-gray-500 text-center text-[13px]">
                    —
                  </div>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(
                        set.id,
                        "weight",
                        e.target.value,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        // Commit placeholder if empty
                        if (
                          !set.weight &&
                          prevSet?.weight &&
                          prevSet.completed
                        ) {
                          updateSet(
                            set.id,
                            "weight",
                            prevSet.weight,
                          );
                          // Proceed to focus next since we filled it
                        } else if (!set.weight) {
                          // If still empty
                          triggerError(set.id, ["weight"]);
                          return;
                        }

                        const nextInput =
                          e.currentTarget.parentElement?.querySelector(
                            `input[inputMode="numeric"]`,
                          ) as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    placeholder={
                      prevSet?.completed ? prevSet.weight : ""
                    }
                    className={getInputClassName(set, "weight")}
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(set.id, "reps", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        // Commit placeholder if empty
                        if (
                          !set.reps &&
                          prevSet?.reps &&
                          prevSet.completed
                        ) {
                          updateSet(
                            set.id,
                            "reps",
                            prevSet.reps,
                          );
                        } else if (!set.reps) {
                          triggerError(set.id, ["reps"]);
                          return;
                        }

                        const nextSibling =
                          e.currentTarget.nextElementSibling;
                        const nextInput =
                          nextSibling?.querySelector("input");
                        (nextInput as HTMLElement)?.focus();
                      }
                    }}
                    placeholder={
                      prevSet?.completed ? prevSet.reps : ""
                    }
                    className={getInputClassName(set, "reps")}
                  />

                  <div className="relative w-[50px] min-w-[50px] max-w-[50px]">
                    <Popover
                      open={activeRpeSetId === set.id}
                      onOpenChange={(open) =>
                        !open && setActiveRpeSetId(null)
                      }
                    >
                      <PopoverAnchor asChild>
                        <input
                          type="text"
                          readOnly
                          value={set.rpe}
                          onClick={() =>
                            setActiveRpeSetId(set.id)
                          }
                          onFocus={() =>
                            setActiveRpeSetId(set.id)
                          }
                          onBlur={() => setActiveRpeSetId(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              // Validate before completing
                              const missing: (
                                | "weight"
                                | "reps"
                              )[] = [];
                              if (!set.weight)
                                missing.push("weight");
                              if (!set.reps)
                                missing.push("reps");

                              if (missing.length > 0) {
                                triggerError(set.id, missing);
                                return;
                              }

                              // Commit placeholder if empty
                              if (
                                !set.rpe &&
                                prevSet?.rpe &&
                                prevSet.completed
                              ) {
                                toggleSetComplete(set.id, {
                                  rpe: prevSet.rpe,
                                });
                              } else {
                                toggleSetComplete(set.id);
                              }
                              setActiveRpeSetId(null);
                            }
                          }}
                          placeholder={
                            prevSet?.completed
                              ? prevSet.rpe
                              : ""
                          }
                          className={`${getInputClassName(set, "rpe")} w-full cursor-pointer caret-transparent`}
                        />
                      </PopoverAnchor>
                      <PopoverContent
                        side="top"
                        className="flex gap-2 p-2 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-xl w-auto min-w-0"
                        onOpenAutoFocus={(e) =>
                          e.preventDefault()
                        }
                        onMouseDown={(e) => e.preventDefault()}
                        onInteractOutside={(e) =>
                          e.preventDefault()
                        }
                      >
                        {[
                          {
                            val: 6,
                            color: "bg-[#22c55e] text-white",
                          },
                          {
                            val: 7,
                            color:
                              "bg-[#84cc16] text-[#1c1c1e]",
                          },
                          {
                            val: 8,
                            color:
                              "bg-[#eab308] text-[#1c1c1e]",
                          },
                          {
                            val: 9,
                            color: "bg-[#f97316] text-white",
                          },
                          {
                            val: 10,
                            color: "bg-[#ef4444] text-white",
                          },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => {
                              updateSet(
                                set.id,
                                "rpe",
                                opt.val.toString(),
                              );
                              setActiveRpeSetId(null);
                            }}
                            className={`size-10 rounded-lg flex items-center justify-center text-sm font-bold ${opt.color} hover:brightness-110 transition-all`}
                          >
                            {opt.val}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex-1 flex justify-end pr-3">
                  <button
                    onClick={() => toggleSetComplete(set.id)}
                    className={`size-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      set.completed
                        ? "bg-[#22c55e]"
                        : "bg-transparent hover:bg-[#14291e]"
                    }`}
                  >
                    <CheckIcon className="size-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Delete Button (appears on swipe) */}
              {swipedSetId === set.id && (
                <button
                  onClick={() => removeSet(set.id)}
                  className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center rounded-lg"
                >
                  <TrashIcon className="size-6 text-white" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Set Button */}
      <button
        onClick={addSet}
        className="w-full py-1.5 rounded-xl bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30 transition-colors font-semibold"
      >
        + Add Set
      </button>
    </div>
  );
}