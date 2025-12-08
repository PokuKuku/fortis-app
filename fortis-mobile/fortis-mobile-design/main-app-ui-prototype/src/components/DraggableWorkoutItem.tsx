import { X, GripVertical, MoreVertical, Eye, Trash, Calendar, List, RefreshCw } from "lucide-react";
import { useDrag, useDrop } from 'react-dnd';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DraggableWorkoutItemProps {
  workout: {
    id: number;
    name: string;
    exercises: number;
  };
  index: number;
  isSelected?: boolean;
  onRemove: () => void;
  moveWorkout: (dragIndex: number, hoverIndex: number) => void;
  onClick?: () => void;
  onInfoClick?: () => void;
  onReplace?: () => void;
}

export function DraggableWorkoutItem({ workout, index, isSelected, onRemove, moveWorkout, onClick, onInfoClick, onReplace }: DraggableWorkoutItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'program-workout',
    item: { id: workout.id, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [workout.id, index]);

  const [, drop] = useDrop({
    accept: 'program-workout',
    hover: (item: { id: number; index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveWorkout(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      layout
      layoutId={`program-workout-${workout.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0 : 1,
        scale: isDragging ? 0.8 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      className={`group relative rounded-2xl p-3 transition-all duration-200 border shadow-[0_2px_8px_rgba(0,0,0,0.30)] ${
        isDragging
          ? 'border-[#22c55e]/40 bg-[#22c55e]/8 shadow-[0_12px_32px_rgba(0,0,0,0.48),0_0_0_1px_rgba(34,197,94,0.36)] cursor-grabbing'
          : isSelected
            ? 'border-[#22c55e] bg-[#22c55e]/10 shadow-[0_0_0_1px_rgba(34,197,94,0.5)] cursor-grab'
            : 'border-white/10 hover:border-white/20 cursor-grab bg-gradient-to-b from-[#5A5A5A] to-[#404040] hover:from-[#666666] hover:to-[#4d4d4d]'
      }`}
      style={{
        boxShadow: isDragging 
          ? '0 12px 32px rgba(0, 0, 0, 0.48), 0 0 0 1px rgba(34, 197, 94, 0.36)' 
          : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Actions Menu */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 right-2 z-20"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-1.5 hover:bg-white/10 rounded-lg text-[#9CA3AF] hover:text-white transition-colors focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#2A2A2A] border-white/10 text-white min-w-[160px] z-[100]">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onInfoClick?.(); }} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-xs font-medium">
              <Eye className="w-3.5 h-3.5 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onReplace?.(); }} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-xs font-medium">
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Replace
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer text-xs font-medium">
              <Trash className="w-3.5 h-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between pr-7">
        <div className="flex flex-col gap-1">
           <h3 className="text-[15px] text-[#DFE2E6] font-['SF_Pro:Semibold',sans-serif] font-[590] truncate" style={{ fontVariationSettings: "'wdth' 100" }}>
             {workout.name}
           </h3>
           <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
             <span className="px-2 py-0.5 rounded-md bg-[#22c55e]/20 text-[#22c55e] font-medium text-[11px] border border-[#22c55e]/20">
               Workout {index + 1}
             </span>
             <div className="flex items-center gap-1.5">
               <List className="w-3.5 h-3.5 text-[#22c55e]/80" />
               <span>{workout.exercises} exercises</span>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
