import { motion, AnimatePresence } from "motion/react";
import { X, Edit2, Check, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Exercise } from "../types/exercise";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { StainlessSteelPattern } from "./StainlessSteelPattern";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  exerciseName?: string;
  onClose: () => void;
  isCustom?: boolean;
  onSave?: (updatedExercise: Exercise) => void;
  onDelete?: () => void;
  availableMuscles?: string[];
  availableEquipment?: string[];
  availableCategories?: string[];
}

export function ExerciseDetailModal({ 
  exercise, 
  exerciseName, 
  onClose,
  isCustom,
  onSave,
  onDelete,
  availableMuscles = [],
  availableEquipment = [],
  availableCategories = []
}: ExerciseDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMuscle, setEditMuscle] = useState("");
  const [editEquipment, setEditEquipment] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    if (exercise) {
      setEditName(exercise.name);
      setEditMuscle(exercise.primaryMuscles[0] || "");
      setEditEquipment(exercise.equipment || "");
      setEditCategory(exercise.category);
    }
  }, [exercise]);

  const handleSave = () => {
    if (!exercise || !onSave) return;
    
    const updatedExercise: Exercise = {
      ...exercise,
      name: editName,
      primaryMuscles: [editMuscle as any], // Casting as any to satisfy literal types
      equipment: editEquipment as any,
      category: editCategory as any
    };
    
    onSave(updatedExercise);
    setIsEditing(false);
  };

  if (!exercise && !exerciseName) return null;

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
          className="bg-[#222222] rounded-[32px] shadow-[0_24px_48px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden border border-white/10 flex flex-col max-h-[85vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Stainless Steel Pattern Background */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
            <StainlessSteelPattern />
          </div>

          {/* Header with Image */}
          <div className="relative h-56 shrink-0 bg-[#2A2A2A] z-10">
            {exercise?.images?.[0] ? (
              <ImageWithFallback
                src={exercise.images[0]}
                alt={exercise.name}
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]">
                <span className="text-white/20 font-['BankGothic'] text-4xl font-bold">FORTIS</span>
               </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-transparent to-transparent" />
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {isCustom && !isEditing && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5 group"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#222] border-white/10 z-[100]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Exercise?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          This will permanently delete "{exercise?.name}" from your library. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[#333] text-white border-white/10 hover:bg-[#444] hover:text-white hover:border-white/20">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5 group"
                  >
                    <Edit2 className="w-4 h-4 text-[#22c55e] group-hover:text-[#4ade80]" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5"
              >
                <X className="w-5 h-5 text-[#EF4444]" />
              </button>
            </div>
            
            <div className="absolute bottom-4 left-6">
              <h2 className="text-2xl font-['SF_Pro:Bold',sans-serif] font-bold text-white mb-1">
                {isEditing ? "Edit Exercise" : (exercise?.name || exerciseName)}
              </h2>
              {exercise?.category && !isEditing && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20 capitalize">
                  {exercise.category}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar relative z-10">
            {isEditing ? (
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="text-[#C4C8CC] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] mb-2 block" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-[48px] px-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
                  />
                </div>

                {/* Muscle Select */}
                <div>
                  <label className="text-[#C4C8CC] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] mb-2 block" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Primary Muscle
                  </label>
                  <Select value={editMuscle} onValueChange={setEditMuscle}>
                    <SelectTrigger className="w-full h-[48px] px-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select muscle" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6]">
                      {availableMuscles.map(m => (
                        <SelectItem key={m} value={m}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Equipment Select */}
                <div>
                  <label className="text-[#C4C8CC] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] mb-2 block" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Equipment
                  </label>
                  <Select value={editEquipment} onValueChange={setEditEquipment}>
                    <SelectTrigger className="w-full h-[48px] px-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6]">
                      {availableEquipment.map(e => (
                        <SelectItem key={e} value={e}>
                          {e.charAt(0).toUpperCase() + e.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Select */}
                <div>
                  <label className="text-[#C4C8CC] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] mb-2 block" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Category
                  </label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger className="w-full h-[48px] px-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6]">
                      {availableCategories.map(c => (
                        <SelectItem key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-[50px] rounded-[20px] font-['SF_Pro:Bold',sans-serif] font-[700] text-[15px] text-[#DFE2E6] bg-[#333] hover:bg-[#444] border border-white/5 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-[#22c55e] hover:bg-[#1db051] h-[50px] rounded-[20px] font-['SF_Pro:Bold',sans-serif] font-[700] text-[15px] text-white active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#22c55e]/20 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : exercise ? (
              <div className="space-y-6">
                {/* Tags Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem label="Level" value={exercise.level} />
                  <DetailItem label="Force" value={exercise.force} />
                  <DetailItem label="Mechanic" value={exercise.mechanic} />
                  <DetailItem label="Equipment" value={exercise.equipment} />
                </div>

                {/* Muscles */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider text-[11px]">Primary Muscles</h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise.primaryMuscles.map((muscle) => (
                        <span key={muscle} className="px-3 py-1 rounded-lg bg-[#22c55e] text-black text-xs font-bold capitalize">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                  {exercise.secondaryMuscles.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider text-[11px]">Secondary Muscles</h3>
                      <div className="flex flex-wrap gap-2">
                        {exercise.secondaryMuscles.map((muscle) => (
                          <span key={muscle} className="px-3 py-1 rounded-lg bg-[#333] text-gray-300 border border-white/5 text-xs font-medium capitalize">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div>
                   <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider text-[11px]">Instructions</h3>
                   <div className="space-y-4">
                     {exercise.instructions.map((step, idx) => (
                       <div key={idx} className="flex gap-3">
                         <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#333] border border-white/10 flex items-center justify-center text-xs font-bold text-[#22c55e]">
                           {idx + 1}
                         </div>
                         <p className="text-sm text-gray-300 leading-relaxed pt-0.5">
                           {step}
                         </p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">No detailed information available for this exercise.</p>
                <p className="text-xs text-gray-600">This is a mock data limitation.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="bg-[#252525] rounded-xl p-3 border border-white/5">
      <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</span>
      <span className="block text-sm text-white capitalize font-medium">{value}</span>
    </div>
  );
}
