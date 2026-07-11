import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import { useAppState } from '../AppContext';

const Insights: React.FC = () => {

  const { insight, loadingInsight } = useAppState(); 

  return (
    <div className="glass p-6 rounded-[32px] min-h-[220px] relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-indigo-400" size={20} />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">Smart Insight</h3>
      </div>
            
      {loadingInsight ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-3/4 bg-white/10 rounded" />
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-5/6 bg-white/5 rounded" />
        </div>
      ) : insight ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-xl font-bold text-white mb-1">{insight.title}</h4>
            <p className="text-sm text-white/60 leading-relaxed">{insight.description}</p>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 flex items-start gap-3">
            <Info size={16} className="text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-300 italic">{insight.advice}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center py-4">
          <h2>Feature Coming Soon...</h2>
          <p className="text-white/30 text-sm">Select Heating or Cooling to see AI-driven atmosphere analysis</p>
        </div>
      )}
    </div>
  );
};

export default Insights;
