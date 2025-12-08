
/**
 * Logo.tsx
 * 
 * The branded "FORTIS" logo component with metallic styling.
 */
export function Logo() {
  return (
    <h1 
      className="text-[38px] tracking-[0.15em] text-center relative select-none" 
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
  );
}