
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Thermometer, Sun, Wind, Lock, Timer, Info, Sparkles, LogOut, ChevronUp, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import IlluminationEffect from './components/IlluminationEffect';
import PaymentGateway from './components/PaymentGateway';
import { Mode, UserSession, ComfortInsight } from '../types';
import { BrowserRouter as Router } from 'react-router';
import crypto from "crypto";

const TRIAL_LIMIT_MS = 10 * 60 * 1000; // 10 minutes
const PREMIUM_LIMIT_MS = 60 * 60 * 1000; // 1 hour

const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>('off');
    const [temp, setTemp] = useState(22);
    const [session, setSession] = useState<UserSession>({
        isActive: true,
        isTrial: true,
        startTime: Date.now(),
        expiryTime: Date.now() + TRIAL_LIMIT_MS,
        balancePaid: false,
    });
    const [showPayment, setShowPayment] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TRIAL_LIMIT_MS);
    const [insight, setInsight] = useState<ComfortInsight | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);
  
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

    // Timer Tick
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = session.expiryTime - now;
          
            if (diff <= 0) {
                setTimeLeft(0);
                if (session.isActive && !session.balancePaid) {
                    setMode('off');
                    setShowPayment(true);
                    resetSessionStatus();
                }
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [session]);

    const changeTemp = (delta: number) => {
        if (timeLeft <= 0 && !session.balancePaid) {
            setShowPayment(true);
            resetSessionStatus();
            return;
        }

        const nextTemp = Math.max(16, Math.min(30, temp + delta));
        setTemp(nextTemp);
    };

    const toggleMode = (newMode: Mode) => {
        if (timeLeft <= 0 && !session.balancePaid && newMode !== 'off') {
            setShowPayment(true);
            resetSessionStatus();
            return;
        }
        setMode(newMode);
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        setLoadingInsight(true);
        setSession({
            isActive: true,
            isTrial: false,
            startTime: Date.now(),
            expiryTime: Date.now() + PREMIUM_LIMIT_MS,
            balancePaid: true,
        });
    };

    const resetSessionStatus = () => {
        setShowPayment(true);
        setLoadingInsight(false);
        setSession({
            isActive: true,
            isTrial: true,
            startTime: Date.now(),
            expiryTime: Date.now() + PREMIUM_LIMIT_MS,
            balancePaid: false,
        });
    };


    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    interface PaymentGatewayProps {
        onSuccess: () => void;
        onCancel: () => void;
        amount: number;
    };

    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePay = async () => {
        setStep('processing');
        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Check your internet connection.');
            return;
        }

        const data = await fetch('http://localhost:5000/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'amount': 10,
                'currency': 'INR',
            }),
        }).then((t) => t.json());

        const options = {
            key: 'XXXXXXXXXXXXXXXXXXXXXX', // Replace with your Razorpay key ID
            amount: '10',
            currency: 'INR',
            name: 'Lumina Temp Premium Access',
            description: '1 Hour Premium Temperature Access',
            order_id: data.id,
            handler: async function (response: any) {

                const status = await fetch("http://localhost:5000/api/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: data.id,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                    }),
                }).then((t) => t.json());

                if (status && status.success) {
                    setStep('success');
                    setShowPayment(false);
                    handlePaymentSuccess();
                } else {
                    setStep('details');
                    setShowPayment(true);
                    resetSessionStatus();
                }
            },
            theme: { color: '#4f46e5' },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();

    };


  return (
    <Router>
    <div className="min-h-screen relative flex flex-col items-center justify-start p-6 md:p-12 overflow-hidden">
      <IlluminationEffect mode={mode} intensity={mode === 'off' ? 0 : 1} />
    
      {/* Header */}
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
          {session.isTrial && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-md">Trial</span>}
        </div>
      </header>

      {/* Main Controls Area */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left: Thermostat Circle */}
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

        {/* Right: Insights & Data */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* AI Insights Card */}
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

          {/* History Chart */}
          <div className="glass p-6 rounded-[32px] flex-1">
             <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-6">Environment History</h3>
             <div className="h-40 w-full">
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

          {/* Premium Prompt */}
          {!session.balancePaid && (
            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 p-6 rounded-[32px] border border-yellow-500/30">
               <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2">
                   <Lock className="text-yellow-400" size={18} />
                   <h3 className="font-bold text-yellow-500">Upgrade to Premium</h3>
                 </div>
                 <span className="text-xs font-bold text-yellow-500/80">₹10 / HR</span>
               </div>
               <p className="text-sm text-yellow-200/60 mb-4">The free 10-minute trial is limited. Get 1 hour of full illuminate control for just ₹10.</p>
               <button 
                 onClick={() => handlePay()}
                 className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-2xl shadow-xl shadow-yellow-900/20 transition-all active:scale-95"
               >
                 Activate 1 Hour
               </button>
            </div>
          )}
        </div>
      </main>
    </div>
    </Router>
  );
};

export default App;
