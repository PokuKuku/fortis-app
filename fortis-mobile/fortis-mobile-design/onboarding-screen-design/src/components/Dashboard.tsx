import { useState } from "react";
import { Button } from "./ui/button";
import { FortisLogo } from "./fortis/FortisLogo";
import { StainlessSteelPattern } from "./fortis/StainlessSteelPattern";
import { LayoutDashboard, Dumbbell, Calendar, Settings, Plus, Trophy, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-zinc-100 font-sans flex flex-col md:flex-row">
       {/* Sidebar */}
       <aside className="w-full md:w-64 bg-[#222222] border-r border-white/5 flex flex-col">
         <div className="p-6 flex items-center justify-center md:justify-start border-b border-white/5">
           <FortisLogo size="sm" />
         </div>

         <nav className="flex-1 p-4 space-y-2">
           <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-[#22c55e] hover:bg-white/5">
             <LayoutDashboard className="w-5 h-5" /> Dashboard
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-[#22c55e] hover:bg-white/5">
             <Dumbbell className="w-5 h-5" /> Workouts
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-[#22c55e] hover:bg-white/5">
             <Calendar className="w-5 h-5" /> Schedule
           </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-[#22c55e] hover:bg-white/5">
             <Trophy className="w-5 h-5" /> PRs
           </Button>
         </nav>

         <div className="p-4 border-t border-white/5">
            <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-500 hover:text-red-500" onClick={onLogout}>
               <Settings className="w-5 h-5" /> Logout
            </Button>
         </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 relative overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#22c55e] rounded-full blur-[150px] opacity-5 mix-blend-screen"></div>
         </div>
         <div className="relative z-10 p-6 md:p-10 space-y-8">
           
           <header className="flex justify-between items-center">
             <div>
               <h1 className="text-3xl font-bold text-white uppercase tracking-wide">Dashboard</h1>
               <p className="text-zinc-500">Welcome back, Athlete.</p>
             </div>
             <Button className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]">
               <Plus className="w-5 h-5 mr-2" /> New Workout
             </Button>
           </header>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#222222] border-white/5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Dumbbell className="w-24 h-24 text-[#22c55e]" />
                </div>
                <CardHeader>
                  <CardTitle className="text-zinc-400 text-sm uppercase tracking-wider">Total Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white">24,500 <span className="text-sm font-normal text-zinc-500">kg</span></div>
                  <div className="text-[#22c55e] text-xs mt-2 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> +12% vs last week
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#222222] border-white/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-zinc-400 text-sm uppercase tracking-wider">Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white">12</div>
                  <div className="text-zinc-500 text-xs mt-2">Completed this month</div>
                </CardContent>
              </Card>

              <Card className="bg-[#222222] border-white/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-zinc-400 text-sm uppercase tracking-wider">Active Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white">5 <span className="text-sm font-normal text-zinc-500">days</span></div>
                  <div className="text-[#22c55e] text-xs mt-2">Keep it up!</div>
                </CardContent>
              </Card>
           </div>

           {/* Recent Activity */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-white uppercase">Recent History</h3>
                <div className="space-y-3">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="bg-[#222222] border border-white/5 p-4 rounded-lg flex items-center justify-between hover:border-[#22c55e]/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#22c55e] group-hover:bg-[#22c55e]/10 transition-all">
                              <Dumbbell className="w-6 h-6" />
                           </div>
                           <div>
                             <h4 className="font-bold text-zinc-200">Upper Body Power</h4>
                             <p className="text-xs text-zinc-500">Yesterday • 1h 15m</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-sm font-bold text-white">12,450 kg</div>
                           <div className="text-xs text-zinc-500">Volume</div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white uppercase">Next Up</h3>
                <Card className="bg-gradient-to-br from-[#22c55e] to-[#16a34a] border-none text-black">
                   <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-2xl uppercase italic">Leg Day</h4>
                        <Calendar className="w-6 h-6 opacity-50" />
                      </div>
                      <p className="font-medium opacity-80">Scheduled for Tomorrow, 18:00</p>
                      <div className="pt-4">
                        <Button className="w-full bg-black/20 hover:bg-black/30 text-black border-0">
                          View Routine
                        </Button>
                      </div>
                   </CardContent>
                </Card>
              </div>
           </div>

         </div>
       </main>
    </div>
  );
}
