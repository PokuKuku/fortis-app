import React from 'react';
import { cn } from "../ui/utils";

interface FortisLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FortisLogo({ className, size = "lg" }: FortisLogoProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-[38px]"
  };

  return (
    <div className={cn("relative", className)}>
      <style>{`
        @keyframes shine {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
      `}</style>

      <h1 
        className={cn(
          "tracking-[0.15em] text-center font-black uppercase italic", 
          sizeClasses[size]
        )}
        style={{ 
          fontFamily: 'BankGothic, "Arial Black", sans-serif', 
          fontWeight: 900,
          // Metallic Green Gradient
          background: 'linear-gradient(110deg, #4ade80 0%, #22c55e 30%, #86efac 45%, #ffffff 50%, #86efac 55%, #22c55e 70%, #4ade80 100%)',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shine 5s linear infinite'
        }}
      >
        FORTIS
      </h1>
    </div>
  );
}
