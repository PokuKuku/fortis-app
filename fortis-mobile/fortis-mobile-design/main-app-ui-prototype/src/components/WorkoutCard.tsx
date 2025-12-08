/**
 * components/WorkoutCard.tsx
 * 
 * Displays a concise summary of a workout (name, exercise count) in a list or grid.
 * It supports drag-and-drop reordering and includes a context menu for actions
 * like editing, duplicating, or deleting the workout.
 */
import { Clock, List, GripVertical, MoreVertical, Pencil, Copy, Trash, Edit } from "lucide-react";
import { useDrag, useDrop } from 'react-dnd';
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

interface WorkoutCardProps {
  workout: {
    id: number;
    name: string;
    exercises: number;
    duration?: string;
    date?: string;
  };
  index: number;
  onClick?: () => void;
  moveWorkout: (dragIndex: number, hoverIndex: number) => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export function WorkoutCard({ workout, index, onClick, moveWorkout, onEdit, onDuplicate, onRename, onDelete }: WorkoutCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'workout',
    item: { type: 'workout', ...workout, index, width: ref.current?.offsetWidth, height: ref.current?.offsetHeight },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [workout, index]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  const [{ isOver }, drop] = useDrop({
    accept: 'workout',
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
      moveWorkout(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Connect drag and drop to the entire card
  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      layout
      layoutId={`workout-${workout.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0 : 1,
        scale: isDragging ? 0.8 : 1,
        grayscale: isDragging ? 1 : 0,
      }}
      whileHover={{ scale: isDragging ? 0.95 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      onClick={onClick}
      className={`group relative rounded-2xl p-1.75 transition-all duration-200 border overflow-hidden ${
        isOver 
          ? 'border-[#22c55e]/50 scale-[1.02] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.30)]' 
          : isDragging
          ? 'border-[#22c55e]/40 shadow-[0_12px_32px_rgba(0,0,0,0.48),0_0_0_1px_rgba(34,197,94,0.36)] cursor-grabbing'
          : 'border-white/10 hover:border-white/20 cursor-grab shadow-[0_2px_8px_rgba(0,0,0,0.30)]'
      }`}
    >
      {/* Fog Overlay for Contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/25 via-white/15 to-transparent opacity-100 pointer-events-none backdrop-blur-sm" />

      {/* State Overlay */}
      <div className={`absolute inset-0 z-1 pointer-events-none transition-colors duration-200 ${
         isOver ? 'bg-[#22c55e]/20' : isDragging ? 'bg-[#22c55e]/10' : 'bg-transparent group-hover:bg-white/5'
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
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-xs font-medium">
              <Edit className="w-3.5 h-3.5 mr-2" />
              Edit Content
            </DropdownMenuItem>
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

      {/* Workout Header - Name and Exercise Count */}
      <div className="relative z-10 flex flex-col gap-1 pr-7">
        <h3 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-[#DFE2E6] truncate w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          {workout.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[12px]">
          <List className="w-3.5 h-3.5 text-[#22c55e]/80" />
          <span>{workout.exercises} Exercises</span>
        </div>
      </div>

      {/* Drop Indicator */}
      {isOver && (
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
