import React, { useState, useEffect } from 'react';
import { Sun, Wind, LogOut, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppState } from '../AppContext';
import { Mode } from '../types';

const ThermoControl: React.FC = () => {

  const { temp, mode, usersession, timeLeft, setTemp, setMode, resetSessionStatus } = useAppState();

  const changeTemp = (delta: number) => {
    if (timeLeft <= 0 && !usersession.balancePaid) {
      resetSessionStatus();
      return;
    }

    const nextTemp = Math.max(16, Math.min(30, temp + delta));
    setTemp(nextTemp);
  };

  const toggleMode = (newMode: Mode) => {
    if (timeLeft <= 0 && !usersession.balancePaid && newMode !== 'off') {
      resetSessionStatus();
      return;
    }
    setMode(newMode);
  };

  return (
    <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 glass rounded-[40px] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
        <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white/5 flex flex-col items-center justify-center bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors duration-700 ${mode === 'hot' ? 'border-red-500/20 shadow-[inset_0_0_30px_rgba(239,68,68,0.1)]' : mode === 'cool' ? 'border-blue-500/20 shadow-[inset_0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/5'}`}>

        <span className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] mb-2">Target Temp</span>
        <div className="flex items-start">
          <span className="text-7xl md:text-8xl font-black text-white">{temp}</span>
          <span className="text-2xl md:text-3xl font-light text-white/50 mt-2">°C</span>
        </div>

        <div className="mt-6 flex gap-8">
          <button onClick={() => changeTemp(-1)} className="p-3 glass rounded-full hover:bg-white/10 transition-colors active:scale-90">
            <ChevronDown size={32} />
          </button>
          <button onClick={() => changeTemp(1)} className="p-3 glass rounded-full hover:bg-white/10 transition-colors active:scale-90">
            <ChevronUp size={32} />
          </button>
        </div>
      </div>

      <div className="mt-12 w-full grid grid-cols-3 gap-4">
        <button 
          onClick={() => toggleMode('cool')}
          className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${mode === 'cool' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 scale-105' : 'glass text-white/60 hover:text-white'}`}
        >
          <Wind size={28} />
          <span className="font-bold">Cooling</span>
        </button>
        <button 
          onClick={() => toggleMode('off')}
          className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${mode === 'off' ? 'bg-white text-black shadow-xl shadow-white/20 scale-105' : 'glass text-white/60 hover:text-white'}`}
        >
          <LogOut size={28} />
          <span className="font-bold">Off</span>
        </button>
        <button 
          onClick={() => toggleMode('hot')}
          className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${mode === 'hot' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40 scale-105' : 'glass text-white/60 hover:text-white'}`}
        >
          <Sun size={28} />
          <span className="font-bold">Heating</span>
        </button>
      </div>
    </div>
  );
};

export default ThermoControl;
