import React from 'react';
import { useAppState } from '../AppContext';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

const History: React.FC = () => {

  const { insight, loadingInsight, temp } = useAppState();

// @TODO Update Dynamic Data
// Temporary Mock history data
const data = [
  { name: '10:00', t: 18 },
  { name: '10:15', t: 20 },
  { name: '10:30', t: 22 },
  { name: '10:45', t: 21 },
  { name: '11:00', t: 23 },
  { name: 'Now', t: temp },
]; 

  return (
    <div className="glass p-6 rounded-[32px] flex-1 min-w-0">
      <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-6">Environment History</h3>
      <div className="h-40 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="t" stroke="#6366f1" fillOpacity={1} fill="url(#colorT)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default History;
