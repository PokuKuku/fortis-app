import { useState, useEffect } from "react";
import { StainlessSteelPattern } from "./StainlessSteelPattern";
import { Calendar } from "./ui/calendar";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DateSelectorProps {
  onSelectDate: (date: Date) => void;
  onViewMonth: (date: Date) => void;
  currentDate: Date;
}

export function DateSelector({ onSelectDate, onViewMonth, currentDate }: DateSelectorProps) {
  const [viewDate, setViewDate] = useState(currentDate);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());

  // Update state when currentDate changes
  useEffect(() => {
    setViewDate(currentDate);
    setSelectedYear(currentDate.getFullYear().toString());
    setSelectedMonth(currentDate.getMonth().toString());
  }, [currentDate]);

  // Update view date when selectors change
  useEffect(() => {
    const newDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
    setViewDate(newDate);
  }, [selectedYear, selectedMonth]);

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onSelectDate(date);
    }
  };

  const handleViewMonth = () => {
    onViewMonth(viewDate);
  };

  return (
    <div className="bg-[#222222] text-white w-[280px] rounded-xl overflow-hidden relative border border-white/10 shadow-2xl">
       <div className="absolute inset-0 z-0 pointer-events-none">
          <StainlessSteelPattern />
        </div>
        
        <div className="relative z-10 p-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
             <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-[#2A2A2A] border-white/10 text-white h-[32px] text-xs rounded-lg px-2 flex items-center justify-between">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6] max-h-[200px] z-50">
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-[#2A2A2A] border-white/10 text-white h-[32px] text-xs rounded-lg px-2 flex items-center justify-between">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-white/10 text-[#DFE2E6] max-h-[200px] z-50">
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-white/5 p-1 bg-transparent">
            <Calendar
              mode="single"
              month={viewDate}
              onMonthChange={setViewDate}
              selected={currentDate}
              onSelect={handleDateSelect}
              className="w-full p-0 scale-95 origin-top"
              classNames={{
                months: "flex flex-col space-y-1",
                month: "space-y-1 w-full",
                caption: "hidden", 
                caption_label: "hidden",
                nav: "hidden",
                table: "w-full border-collapse space-y-0.5",
                head_row: "flex w-full mb-1",
                head_cell: "text-[#9CA3AF] rounded-md w-8 font-medium text-[0.65rem] flex-1 text-center uppercase tracking-wider opacity-60",
                row: "flex w-full mt-0.5",
                cell: "h-7 w-full text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex items-center justify-center",
                day: "h-7 w-7 p-0 font-normal text-[#DFE2E6] rounded-full transition-all duration-300 hover:bg-white/10 hover:scale-110 active:scale-95 text-[0.8rem]",
                day_selected: "bg-gradient-to-b from-[#4ade80] to-[#22c55e] !text-[#1a1a1a] shadow-[0_4px_12px_rgba(34,197,94,0.4)] font-bold scale-110 border border-[#22c55e]/50 ring-2 ring-[#22c55e]/20",
                day_today: "ring-1 ring-white/30 font-medium text-white",
                day_outside: "text-gray-600 opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
              components={{
                DayContent: (props: any) => {
                  const date = props.date;
                  return (
                    <div className="w-full h-full flex items-center justify-center">
                      {date.getDate()}
                    </div>
                  );
                }
              }}
            />
          </div>

          <button 
            onClick={handleViewMonth}
            className="w-full py-2 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] rounded-lg text-xs font-bold tracking-wide uppercase transition-colors border border-[#22c55e]/20 flex items-center justify-center gap-2"
          >
            <span>Jump to {months[parseInt(selectedMonth)]} {selectedYear}</span>
          </button>
        </div>
    </div>
  );
}
