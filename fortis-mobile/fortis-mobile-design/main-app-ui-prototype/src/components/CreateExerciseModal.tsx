/**
 * components/CreateExerciseModal.tsx
 * 
 * This modal allows users to create custom exercises.
 * It captures the exercise name, primary/secondary muscles, equipment, and category.
 * The new exercise is added to the local state in WorkoutPage.
 */
import { X, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { StainlessSteelPattern } from "./StainlessSteelPattern";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CreateExerciseModalProps {
  onClose: () => void;
  onCreate: (exercise: any) => void;
  availableMuscles: string[];
  availableEquipment: string[];
  availableCategories: string[];
}

export function CreateExerciseModal({ 
  onClose, 
  onCreate, 
  availableMuscles, 
  availableEquipment, 
  availableCategories 
}: CreateExerciseModalProps) {
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [secondaryMuscle, setSecondaryMuscle] = useState("");
  const [equipment, setEquipment] = useState("");
  const [category, setCategory] = useState("");

  const handleCreate = () => {
    if (name && muscle && equipment && category) {
      onCreate({
        name,
        primaryMuscles: [muscle],
        secondaryMuscles: secondaryMuscle ? [secondaryMuscle] : [],
        equipment,
        category,
        instructions: [],
        level: "beginner", // default
        mechanic: "compound", // default
        force: "push", // default
        images: []
      });
      onClose();
    }
  };

  const isValid = name && muscle && equipment && category;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#222222] w-full max-w-md rounded-3xl max-h-[85vh] overflow-hidden border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stainless Steel Pattern Background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
          <StainlessSteelPattern />
        </div>

        {/* Header */}
        <div className="bg-transparent border-b border-white/5 px-6 py-5 flex items-center justify-between relative z-10">
          <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Create Exercise
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5"
          >
            <X className="w-5 h-5 text-[#EF4444]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)] relative z-10">
          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="text-[#C4C8CC] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] mb-2 block" style={{ fontVariationSettings: "'wdth' 100" }}>
                Exercise Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dumbbell Press"
                className="w-full h-[48px] px-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
              />
            </div>

            {/* Muscle Select */}
            <div>
              <label className="text-[#C4C8CC] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] mb-2 block" style={{ fontVariationSettings: "'wdth' 100" }}>
                Primary Muscle
              </label>
              <Select value={muscle} onValueChange={setMuscle}>
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

            {/* Secondary Muscle Select */}
            <div>
              <label className="text-[#C4C8CC] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] mb-2 block" style={{ fontVariationSettings: "'wdth' 100" }}>
                Secondary Muscle <span className="text-white/30 font-normal">(Optional)</span>
              </label>
              <Select value={secondaryMuscle} onValueChange={setSecondaryMuscle}>
                <SelectTrigger className="w-full h-[48px] px-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select muscle" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6]">
                  <SelectItem value="none">None</SelectItem>
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
              <Select value={equipment} onValueChange={setEquipment}>
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
              <Select value={category} onValueChange={setCategory}>
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

            {/* Submit Button */}
            <button
              onClick={handleCreate}
              disabled={!isValid}
              className="w-full bg-[#22c55e] hover:bg-[#1db051] h-[50px] rounded-[20px] font-['SF_Pro:Bold',sans-serif] font-[700] text-[17px] text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#22c55e]/20 flex items-center justify-center gap-2 mt-8"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              <Check className="w-5 h-5" />
              Create Exercise
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
