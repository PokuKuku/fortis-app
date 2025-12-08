import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts";

interface VolumeChartProps {
  data: { date: string; day: string; volume: number }[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  const totalVolume = data.reduce((acc, curr) => acc + curr.volume, 0);
  
  return (
    <div className="w-full h-[220px] bg-gradient-to-b from-[#5A5A5A] to-[#404040] rounded-2xl p-5 border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.30)] mb-8">
      <div className="mb-6 flex items-center justify-between">
         <div className="flex flex-col gap-1">
             <h3 className="text-sm font-semibold text-[#DFE2E6] uppercase tracking-wide opacity-80">Weekly Volume</h3>
             <p className="text-2xl font-bold text-white font-['BankGothic'] tracking-wide">
                {(totalVolume / 1000).toFixed(1)}<span className="text-[#22c55e] text-lg ml-1">k</span>
             </p>
         </div>
      </div>
      <div className="w-full h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} 
              dy={10}
              interval={0}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1A1A1A]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
                      <p className="text-xs text-[#9CA3AF] mb-1 font-medium uppercase tracking-wider">{payload[0].payload.date}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-white font-['BankGothic']">
                            {(payload[0].value as number).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#22c55e] font-bold uppercase">lbs</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="volume" radius={[6, 6, 6, 6]}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.volume > 0 ? "url(#barGradient)" : "rgba(255,255,255,0.05)"}
                    stroke={entry.volume > 0 ? "rgba(34, 197, 94, 0.5)" : "transparent"}
                    strokeWidth={1}
                />
              ))}
            </Bar>
            <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
