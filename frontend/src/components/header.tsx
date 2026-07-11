import React, { useState, useEffect } from 'react';
import { Thermometer, Timer} from 'lucide-react';
import { TRIAL_LIMIT_MS } from '../constants';
import { formatTime } from '../helper';
import { useAppState } from '../AppContext';

const Header: React.FC = () => {

  const { usersession, mode, setMode, resetSessionStatus, timeLeft, setTimeLeft } = useAppState();

  // Timer Tick
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = usersession.expiryTime - now;
          
      if (diff <= 0) {
        setTimeLeft(0);
        if (usersession.isActive && !usersession.balancePaid) {
          setMode('off');
          resetSessionStatus();
        }
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [usersession]);

  return (
    <header className="w-full max-w-5xl flex justify-between items-center z-10 mb-12">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
          <Thermometer className="text-black" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">LuminaTemp</h1>
      </div>
        
      <div className={`glass px-4 py-2 rounded-full flex items-center gap-3 border ${timeLeft < 60000 ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white/80'}`}>
        <Timer size={18} />
        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
        {usersession.isTrial && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-md">Trial</span>}
      </div>
    </header>
  );
};

export default Header;
