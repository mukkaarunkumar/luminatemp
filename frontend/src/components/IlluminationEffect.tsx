
import React, { useMemo } from 'react';

interface IlluminationEffectProps {
  mode: 'hot' | 'cool' | 'off';
  intensity: number; // 0 to 1
}

const IlluminationEffect: React.FC<IlluminationEffectProps> = ({ mode, intensity }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      size: 2 + Math.random() * 4,
    }));
  }, []);

  if (mode === 'off') return null;

  const color = mode === 'hot' ? 'rgba(239, 68, 68,' : 'rgba(59, 130, 246,';
  const shadowClass = mode === 'hot' ? 'glow-red' : 'glow-blue';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Central Ambient Glow */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full transition-all duration-1000 ${shadowClass}`}
        style={{ 
          opacity: intensity * 0.4,
          background: `radial-gradient(circle, ${color} 0.2) 0%, transparent 70%)`
        }}
      />

      {/* Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: `${color} 0.6)`,
            boxShadow: `0 0 15px ${color} 0.8)`,
            animation: `float ${p.duration}s infinite ease-in-out ${p.delay}s`,
            opacity: intensity * 0.8,
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
          50% { transform: translateY(-100px) scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default IlluminationEffect;
