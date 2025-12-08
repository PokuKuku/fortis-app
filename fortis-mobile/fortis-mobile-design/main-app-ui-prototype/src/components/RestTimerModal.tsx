import { X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { StainlessSteelPattern } from "./StainlessSteelPattern";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface RestTimerModalProps {
  onClose: () => void;
  onSave: (normal: number, warmup: number, drop: number) => void;
  initialNormalDuration: number;
  initialWarmupDuration: number;
  initialDropDuration: number;
}

export function RestTimerModal({ onClose, onSave, initialNormalDuration, initialWarmupDuration, initialDropDuration }: RestTimerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<'normal' | 'warmup' | 'drop'>('normal');
  
  // Store the durations for both types
  const [durations, setDurations] = useState({
    normal: initialNormalDuration,
    warmup: initialWarmupDuration,
    drop: initialDropDuration
  });

  const [isSaved, setIsSaved] = useState(false);

  // Initialize picker state based on activeType
  const getParts = (d: number) => {
    const m = Math.floor(d / 60);
    const rawS = d % 60;
    const s = Math.round(rawS / 5) * 5;
    return { m: m > 10 ? 10 : m, s: s >= 60 ? 0 : s };
  };

  const initialParts = getParts(initialNormalDuration);
  
  const [selectedMinutes, setSelectedMinutes] = useState(initialParts.m);
  const [selectedSeconds, setSelectedSeconds] = useState(initialParts.s);

  const minScrollRef = useRef<HTMLDivElement>(null);
  const secScrollRef = useRef<HTMLDivElement>(null);
  
  const prevMinRef = useRef(selectedMinutes);
  const prevSecRef = useRef(selectedSeconds);

  const minutes = Array.from({ length: 11 }, (_, i) => i); // 0-10
  const seconds = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, ..., 55

  const ITEM_HEIGHT = 60;

  useEffect(() => {
    // Trigger animation on mount
    setIsOpen(true);
  }, []);

  // Handle switching types
  const handleTypeChange = (newType: 'normal' | 'warmup' | 'drop') => {
    if (newType === activeType) return;

    // Save current picker value to current type
    const currentTotal = selectedMinutes * 60 + selectedSeconds;
    const newDurations = { ...durations, [activeType]: currentTotal };
    setDurations(newDurations);

    // Load new type value
    setActiveType(newType);
    const { m, s } = getParts(newDurations[newType]);
    setSelectedMinutes(m);
    setSelectedSeconds(s);

    // Trigger scroll update (using setTimeout to ensure state applied)
    setTimeout(() => {
       if (minScrollRef.current) {
         setScroll(minScrollRef, m, minutes);
       }
       if (secScrollRef.current) {
         setScroll(secScrollRef, s, seconds);
       }
    }, 0);
  };

  const setScroll = (ref: React.RefObject<HTMLDivElement>, value: number, valuesArray: number[]) => {
    if (ref.current) {
      const index = valuesArray.indexOf(value);
      if (index !== -1) {
        // For this specific layout with h-[90px] spacer and h-[240px] container:
        // Target Center = 90 (spacer) + index * 60 + 30 (half item) = 120 + index * 60
        // Visible Center = scrollTop + 120 (half container)
        // Equating them: scrollTop = index * 60
        const scrollPosition = index * ITEM_HEIGHT;
        ref.current.scrollTop = scrollPosition;
      }
    }
  };

  useEffect(() => {
    // Initial scroll positioning
    setScroll(minScrollRef, selectedMinutes, minutes);
    setScroll(secScrollRef, selectedSeconds, seconds);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Haptic feedback
  useEffect(() => {
    let v = false;
    if (prevMinRef.current !== selectedMinutes) {
      v = true;
      prevMinRef.current = selectedMinutes;
    }
    if (prevSecRef.current !== selectedSeconds) {
      v = true;
      prevSecRef.current = selectedSeconds;
    }

    if (v && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [selectedMinutes, selectedSeconds]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200);
  };

  const handleSaveOnly = () => {
    // Save current picker value
    const currentTotal = selectedMinutes * 60 + selectedSeconds;
    const finalDurations = { ...durations, [activeType]: currentTotal };
    setDurations(finalDurations);
    
    onSave(finalDurations.normal, finalDurations.warmup, finalDurations.drop);

    // Show saved feedback
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleSaveAndClose = () => {
    handleSaveOnly();
    handleClose();
  };

  const handleScrollLogic = (
    e: React.UIEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement>, 
    valuesArray: number[], 
    setter: (val: number) => void,
    currentVal: number
  ) => {
    if (!e.isTrusted) return;
    
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const containerHeight = ref.current.clientHeight;
      const centerPosition = scrollTop + containerHeight / 2;
      const centerOffset = 90 + 30; 
      
      const rawIndex = (centerPosition - centerOffset) / ITEM_HEIGHT;
      const index = Math.round(rawIndex);
      const clampedIndex = Math.max(0, Math.min(valuesArray.length - 1, index));
      
      const newValue = valuesArray[clampedIndex];
      if (newValue !== currentVal) {
        setter(newValue);
        // Haptic feedback on value change
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    }
  };

  const handleMinScroll = (e: React.UIEvent<HTMLDivElement>) => {
    handleScrollLogic(e, minScrollRef, minutes, setSelectedMinutes, selectedMinutes);
  };

  const handleSecScroll = (e: React.UIEvent<HTMLDivElement>) => {
    handleScrollLogic(e, secScrollRef, seconds, setSelectedSeconds, selectedSeconds);
  };

  const getButtonColor = (type: 'normal' | 'warmup' | 'drop') => {
      if (type === 'normal') return 'bg-[#22c55e]/20 text-[#22c55e]';
      if (type === 'warmup') return 'bg-yellow-500/20 text-yellow-500';
      return 'bg-blue-400/20 text-blue-400';
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative rounded-2xl w-[90%] max-w-md mx-4 transition-all duration-200 overflow-hidden bg-[#222222] ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <StainlessSteelPattern opacity={0.15} />
        
        {/* Header */}
        <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center px-4 pt-6 pb-4 gap-2">
          <div className="flex justify-start">
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${getButtonColor(activeType)} hover:opacity-80 active:scale-95 duration-200`}
                >
                  <span className="font-bold text-sm whitespace-nowrap">
                    {activeType === 'normal' ? 'Normal' : activeType === 'warmup' ? 'Warm Up' : 'Drop Set'}
                  </span>
                  <ChevronDown className="size-3" strokeWidth={3} />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="center" className="w-[160px] bg-[#222222] border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => handleTypeChange('normal')}
                  className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 text-sm font-medium flex items-center gap-2"
                >
                  <div className="size-2 rounded-full bg-[#22c55e]" />
                  Normal Set
                </button>
                <button
                  onClick={() => handleTypeChange('warmup')}
                  className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 text-sm font-medium flex items-center gap-2"
                >
                  <div className="size-2 rounded-full bg-yellow-500" />
                  Warm Up Set
                </button>
                <button
                  onClick={() => handleTypeChange('drop')}
                  className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 text-sm font-medium flex items-center gap-2"
                >
                  <div className="size-2 rounded-full bg-blue-400" />
                  Drop Set
                </button>
              </PopoverContent>
            </Popover>
          </div>

          <h2 className="text-white text-[22px] text-center whitespace-nowrap">Rest Timer</h2>

          <div className="flex justify-end">
            <button onClick={handleClose} className="bg-[#2a2a2a] rounded-lg p-1 hover:bg-[#333333] transition-colors">
              <X className="size-5 text-[#ef4444]" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Controls Container (Only Dials now) */}
        <div className="relative py-4 z-10 flex justify-center items-center gap-2">
           {/* PICKERS */}
           <div className="flex gap-2 relative rounded-2xl overflow-hidden">
              {/* Selection indicator */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[60px] bg-[#22c55e]/10 border-2 border-[#22c55e] pointer-events-none z-10 rounded-2xl" />
              
              {/* Gradients */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#161616] to-transparent pointer-events-none z-20" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#161616] to-transparent pointer-events-none z-20" />

              {/* MINUTES COLUMN */}
              <div className="w-[120px] relative">
                <div className="text-center text-[#979ca6] text-xs font-medium mb-1 absolute top-[-20px] w-full">MIN</div>
                <div 
                  ref={minScrollRef}
                  onScroll={handleMinScroll}
                  className="h-[240px] overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="h-[90px]" />
                  {minutes.map((m) => (
                    <div key={m} className="h-[60px] flex items-center justify-center snap-center">
                      <span className={`text-[28px] transition-all duration-200 ${
                        m === selectedMinutes ? 'text-white scale-110 font-medium' : 'text-[#979ca6] scale-90'
                      }`}>
                        {m}
                      </span>
                      <span className={`ml-0.5 text-xs mt-2 ${m === selectedMinutes ? 'text-white' : 'text-[#979ca6]'}`}>m</span>
                    </div>
                  ))}
                  <div className="h-[90px]" />
                </div>
              </div>

              {/* SECONDS COLUMN */}
              <div className="w-[120px] relative">
                <div className="text-center text-[#979ca6] text-xs font-medium mb-1 absolute top-[-20px] w-full">SEC</div>
                <div 
                  ref={secScrollRef}
                  onScroll={handleSecScroll}
                  className="h-[240px] overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="h-[90px]" />
                  {seconds.map((s) => (
                    <div key={s} className="h-[60px] flex items-center justify-center snap-center">
                      <span className={`text-[28px] transition-all duration-200 ${
                        s === selectedSeconds ? 'text-white scale-110 font-medium' : 'text-[#979ca6] scale-90'
                      }`}>
                        {s.toString().padStart(2, '0')}
                      </span>
                      <span className={`ml-0.5 text-xs mt-2 ${s === selectedSeconds ? 'text-white' : 'text-[#979ca6]'}`}>s</span>
                    </div>
                  ))}
                  <div className="h-[90px]" />
                </div>
              </div>
           </div>
        </div>

        {/* Confirm Button */}
        <div className="relative z-10 flex flex-col gap-3 pb-6 px-6 pt-4">
          <button
            onClick={handleSaveOnly}
            className={`w-full py-3 rounded-2xl transition-colors font-semibold ${
              isSaved
                ? 'bg-[#22c55e] text-white'
                : selectedMinutes === 0 && selectedSeconds === 0
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                  : 'bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30'
            }`}
          >
             {isSaved 
               ? "Saved!"
               : selectedMinutes === 0 && selectedSeconds === 0 
                 ? "Disable Timer" 
                 : `Set ${selectedMinutes}m ${selectedSeconds}s`}
          </button>

          <button
            onClick={handleSaveAndClose}
            className="w-full py-3 rounded-2xl font-semibold bg-gradient-to-b from-[#4ade80] to-[#22c55e] text-white hover:brightness-110 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}