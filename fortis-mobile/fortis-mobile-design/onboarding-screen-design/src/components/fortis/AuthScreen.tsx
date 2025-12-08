import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { OnboardingLayout } from "./OnboardingLayout";
import { ChevronRight, Loader2, Lock, Mail, User } from "lucide-react";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') {
      if (email) setStep('password');
      return;
    }
    
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onAuthenticated();
  };

  return (
    <OnboardingLayout>
      <style>{`
        @keyframes shine {
          0% {
            background-position: 200% 200%;
          }
          100% {
            background-position: -200% -200%;
          }
        }
      `}</style>
      <div className="w-full max-w-[400px] mx-auto px-6 pt-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <h1 
            className="text-[38px] tracking-[0.15em] text-center relative" 
            style={{ 
              fontFamily: 'BankGothic, sans-serif', 
              fontWeight: 900,
              
              // Metallic Green Gradient
              background: 'linear-gradient(110deg, #4ade80 0%, #22c55e 30%, #86efac 45%, #ffffff 50%, #86efac 55%, #22c55e 70%, #4ade80 100%)',
              
              // Setup for background clip text
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              
              // Animation
              animation: 'shine 5s linear infinite'
            }}
          >
            FORTIS
          </h1>
        </motion.div>

        <div className="rounded-2xl p-4 mb-6 border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.30)] relative overflow-hidden bg-black/20">
           {/* Fog Overlay */}
           <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/5 via-white/5 to-transparent opacity-100 pointer-events-none backdrop-blur-[2px]" />

           <div className="relative z-10">
             <div className="mb-6">
                <p className="text-[#DFE2E6] text-[16px] font-medium text-center">
                  Create an account or sign in
                </p>
             </div>
  
             <form onSubmit={handleContinue} className="space-y-4">
               <AnimatePresence mode="popLayout" initial={false}>
                 {step === 'password' && (
                   <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                   >
                      <div className="space-y-2">
                        <Label className="text-zinc-400 uppercase text-[10px] tracking-wider ml-1">Name</Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#22c55e] transition-colors" />
                          <Input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 h-[36px] rounded-2xl bg-black/40 border-zinc-800 text-white focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 transition-all"
                          />
                        </div>
                      </div>
  
                      <div className="space-y-2">
                        <Label className="text-zinc-400 uppercase text-[10px] tracking-wider ml-1">Password</Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#22c55e] transition-colors" />
                          <Input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={step === 'password'}
                            autoFocus
                            className="pl-10 h-[36px] rounded-2xl bg-black/40 border-zinc-800 text-white focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 transition-all"
                          />
                        </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
  
               <div className="space-y-2">
                  <Label className="text-zinc-400 uppercase text-[10px] tracking-wider ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#22c55e] transition-colors" />
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={step === 'password'}
                      className="pl-10 h-[36px] rounded-2xl bg-black/40 border-zinc-800 text-white focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 transition-all disabled:opacity-50"
                    />
                  </div>
               </div>
  
               <div className="pt-2">
                 <button 
                   type="submit"
                   disabled={isLoading}
                   className="group w-full h-[36px] rounded-2xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px] text-white border border-white/10 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_8px_rgba(34,197,94,0.1)]" 
                   style={{ 
                     fontVariationSettings: "'wdth' 100", 
                     background: 'linear-gradient(to bottom, #4ade80, #22c55e)' 
                   }}
                 >
                   <span className="flex items-center justify-center gap-2">
                     {isLoading ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                     ) : (
                       <>
                         {step === 'email' ? "Continue" : "Sign In"}
                       </>
                     )}
                   </span>
                 </button>
               </div>
             </form>
  
             <div className="my-6 flex items-center gap-4">
               <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
               <span className="text-[14px] text-zinc-400">or</span>
               <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
             </div>
  
             <div className="space-y-3">
                <Button variant="outline" className="w-full relative bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:text-white text-white h-[40px] rounded-full justify-center font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px]">
                   <div className="absolute left-4 flex items-center justify-center">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                     </svg>
                   </div>
                   Continue with Google
                </Button>
                <Button variant="outline" className="w-full relative bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:text-white text-white h-[40px] rounded-full justify-center font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px]">
                   <div className="absolute left-4 flex items-center justify-center">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.77.74 3.69 1.81-3.22 1.75-2.56 6.23.62 7.72-.54 1.37-1.26 2.64-2.9 3.5zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor" />
                     </svg>
                   </div>
                   Continue with Apple
                </Button>
             </div>
           </div>
        </div>
        

      </div>
    </OnboardingLayout>
  );
}
