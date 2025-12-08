import { Calendar, List, Clock, GripVertical, MoreVertical, Copy, Trash } from "lucide-react";
import { useDrop, useDrag } from 'react-dnd';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { StainlessSteelPattern } from "./StainlessSteelPattern";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ProgramCardProps {
  program: {
    id: number;
    name: string;
    workouts: number;
    weeks: number;
  };
  index: number;
  onDrop: (workoutId: number) => void;
  onClick: () => void;
  moveProgram: (dragIndex: number, hoverIndex: number) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function ProgramCard({ program, index, onDrop, onClick, moveProgram, onDuplicate, onDelete }: ProgramCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [{ isOverWorkout }, workoutDrop] = useDrop(() => ({
    accept: 'workout',
    drop: (item: { id: number }) => onDrop(item.id),
    collect: (monitor) => ({
      isOverWorkout: !!monitor.isOver(),
    }),
  }));

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'program',
    item: { type: 'program', ...program, index, width: ref.current?.offsetWidth, height: ref.current?.offsetHeight },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [program, index]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  const [{ isOverProgram }, programDrop] = useDrop({
    accept: 'program',
    hover: (item: { id: number; index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      // Immediately rearrange when hovered
      moveProgram(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOverProgram: !!monitor.isOver(),
    }),
  });

  // Connect drag and drop to the entire card
  drag(workoutDrop(programDrop(ref)));

  const isOver = isOverWorkout || isOverProgram;

  return (
    <motion.div
      ref={ref}
      layout
      layoutId={`program-${program.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isDragging ? 0 : 1,
        scale: isDragging ? 0.8 : 1,
        rotateZ: isDragging ? 0 : 0,
        grayscale: isDragging ? 1 : 0,
      }}
      whileHover={{ scale: isDragging ? 0.95 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      onClick={onClick}
      className={`group relative rounded-2xl p-2 transition-all duration-200 border overflow-hidden ${
        isOverWorkout 
          ? 'border-white/8 scale-[1.02] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.30)]' 
          : isOverProgram
          ? 'border-white/8 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.30)]'
          : isDragging
          ? 'border-white/8 shadow-[0_12px_32px_rgba(0,0,0,0.48),0_0_0_1px_rgba(34,197,94,0.36)] cursor-grabbing'
          : 'border-white/10 hover:border-white/20 cursor-grab shadow-[0_2px_8px_rgba(0,0,0,0.30)]'
      }`}
    >
      {/* Fog Overlay for Contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/25 via-white/15 to-transparent opacity-100 pointer-events-none backdrop-blur-sm" />

      {/* State Overlay */}
      <div className={`absolute inset-0 z-1 pointer-events-none transition-colors duration-200 ${
         isOverWorkout 
           ? 'bg-[#22c55e]/12' 
           : isOverProgram
           ? 'bg-[#22c55e]/8'
           : isDragging
           ? 'bg-[#22c55e]/8'
           : 'bg-transparent group-hover:bg-white/5'
      }`} />

      {/* Actions Menu */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 right-2 z-20"
      >
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-1.5 hover:bg-white/10 rounded-lg text-[#9CA3AF] hover:text-white transition-colors focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#2A2A2A] border-white/10 text-white min-w-[160px]">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-xs font-medium">
              <Copy className="w-3.5 h-3.5 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer text-xs font-medium">
              <Trash className="w-3.5 h-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Program Header - Name and Workout Count */}
      <div className="relative z-10 flex flex-col gap-1 pr-7">
        <h3 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-[#DFE2E6] truncate w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          {program.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[12px]">
          <List className="w-3.5 h-3.5 text-[#22c55e]/80" />
          <span>{program.workouts} Workouts</span>
        </div>
      </div>

      {/* Drop Indicator */}
      {isOverWorkout && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#22c55e]/70 pointer-events-none z-30 bg-[#22c55e]/5"
          style={{
            boxShadow: 'inset 0 0 20px rgba(34, 197, 94, 0.15)',
          }}
        />
      )}

      {isOverProgram && !isOverWorkout && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 rounded-2xl border-2 border-[#22c55e]/60 pointer-events-none z-30"
          style={{
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
          }}
        />
      )}
    </motion.div>
  );
}
