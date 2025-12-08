import { StainlessSteelPattern } from './components/StainlessSteelPattern';
import { ParticleBackground } from './components/ParticleBackground';

export default function App() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-black">
      {/* Keyframe animation for metallic shine */}
      <style>{`
        @keyframes shine {
          0% {
            background-position: 200% 200%;
          }
          100% {
            background-position: -200% -200%;
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      
      {/* Background Layers */}
      <StainlessSteelPattern />
      <ParticleBackground />
      
      {/* Fortis Logo with subtle backdrop */}
      <div className="relative z-10" style={{ animation: 'fadeIn 0.8s ease-out' }}>
        <div className="px-6 pt-16 pb-8 relative z-10">
          <h1 
            className="text-[38px] tracking-[0.15em] relative text-center" 
            style={{ 
              fontFamily: 'BankGothic, sans-serif', 
              fontWeight: 900,
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
      </div>
    </div>
  );
}