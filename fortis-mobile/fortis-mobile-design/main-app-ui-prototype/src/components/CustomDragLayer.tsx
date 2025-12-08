import { useDragLayer, XYCoord } from 'react-dnd';
import { List, GripVertical, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = currentOffset;
  
  const transform = `translate(${x}px, ${y}px)`;
  
  return {
    transform,
    WebkitTransform: transform,
  };
}

const WorkoutCardPreview = ({ item }: { item: any }) => {
  return (
    <motion.div 
      initial={{ scale: 1, rotate: 0 }}
      animate={{ scale: 1.05, rotate: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-gradient-to-b from-[#5A5A5A] to-[#404040] rounded-2xl p-1.75 border border-[#22c55e]/40 shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(34,197,94,0.4)] flex flex-col relative"
      style={{ width: item.width || '160px', height: item.height || 'auto' }}
    >
      <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20">
        <MoreVertical className="w-4 h-4 text-[#9CA3AF]" />
      </div>

      <div className="flex flex-col gap-1 pr-7">
        <h3 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-[#DFE2E6] truncate w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          {item.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[12px]">
          <List className="w-3.5 h-3.5 text-[#22c55e]/80" />
          <span>{item.exercises} Exercises</span>
        </div>
      </div>
    </motion.div>
  );
};

const ProgramCardPreview = ({ item }: { item: any }) => {
  return (
    <motion.div 
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: 1.05, rotate: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-gradient-to-b from-[#5A5A5A] to-[#404040] rounded-2xl p-2 border border-[#22c55e]/40 shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(34,197,94,0.4)] relative"
        style={{ width: item.width || '300px', height: item.height || 'auto' }}
    >
      <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20">
        <MoreVertical className="w-4 h-4 text-[#9CA3AF]" />
      </div>

      <div className="flex flex-col gap-1 pr-7">
        <h3 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-[#DFE2E6] truncate w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          {item.name}
        </h3>
        <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[12px]">
          <List className="w-3.5 h-3.5 text-[#22c55e]/80" />
          <span>{item.workouts} Workouts</span>
        </div>
      </div>
    </motion.div>
  );
};

export const CustomDragLayer = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {itemType === 'workout' && <WorkoutCardPreview item={item} />}
        {itemType === 'program' && <ProgramCardPreview item={item} />}
      </div>
    </div>
  );
};
