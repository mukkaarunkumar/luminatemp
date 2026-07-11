
import React, { useState } from 'react';
import IlluminationEffect from './components/IlluminationEffect';
import PaymentGateway from './components/PaymentGateway';
import { BrowserRouter as Router } from 'react-router';
import { AppProvider } from './AppContext';
import Header from './components/header';
import ThermoControl from './components/thermoControl';
import Insights from './components/insights';
import History from './components/history';
import { useAppState } from './AppContext';
import { PREMIUM_LIMIT_MS } from './constants';

const App: React.FC = () => {

  const { setUserSession, mode, usersession, setLoadingInsight, setShowPayment, resetSessionStatus } = useAppState();

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setLoadingInsight(true);
    setUserSession({
      isActive: true,
      isTrial: false,
      startTime: Date.now(),
      expiryTime: Date.now() + PREMIUM_LIMIT_MS,
      balancePaid: true,
    });
  };

  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

  const handlePaymentStatus = (status: string) => {
        if (status == 'success') {
          setStep('success');
          setShowPayment(false);
          handlePaymentSuccess();
        } else {
          setStep('details');
          setShowPayment(true);
          resetSessionStatus();
        }
  };

  return (
    <Router>
        <div className="min-h-screen relative flex flex-col items-center justify-start p-6 md:p-12 overflow-hidden">
          <IlluminationEffect mode={mode} intensity={mode === 'off' ? 0 : 1} />
        
          {/* Header */}
          <Header />

          {/* Main Controls Area */}
          <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">

            {/* Left: Thermostat Circle */}
            <ThermoControl />

            {/* Right: Insights & Data */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* AI Insights Card */}
              <Insights />

              {/* History Chart */}
              <History />

              {/* Premium Prompt */}
              {!usersession.balancePaid && (
                <PaymentGateway paymentStatus={handlePaymentStatus} />
              )}
            </div>
          </main>
        </div>
    </Router>
  );
};

export default App;
