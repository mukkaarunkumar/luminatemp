import { createContext, useContext, useState, ReactNode } from 'react';
import { Mode, UserSession, ComfortInsight } from './types';
import { TRIAL_LIMIT_MS, PREMIUM_LIMIT_MS } from './constants';

export type showPayment = true | false;
export type loadingInsight = true | false;
export type temp = number;
export type timeLeft = number;


const currentTemperature: temp = 24;

interface AppContextType {
  usersession: UserSession;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession>>;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  showpayment: showPayment, 
  setShowPayment: React.Dispatch<React.SetStateAction<showPayment>>,
  temp: temp,
  setTemp: React.Dispatch<React.SetStateAction<temp>>,
  currentTemperature: temp,
  timeLeft: timeLeft,
  setTimeLeft: React.Dispatch<React.SetStateAction<timeLeft>>,
  loadingInsight: loadingInsight,
  setLoadingInsight: React.Dispatch<React.SetStateAction<loadingInsight>>,
  insight: ComfortInsight | null,
  setInsight: React.Dispatch<React.SetStateAction<ComfortInsight | null>>,
  resetSessionStatus: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [usersession, setUserSession] = useState<UserSession>({
    isActive: true,
    isTrial: true,
    startTime: Date.now(),
    expiryTime: Date.now() + TRIAL_LIMIT_MS,
    balancePaid: false,
  });

  const [mode, setMode] = useState<Mode>('off');
  const [showpayment, setShowPayment] = useState<showPayment>(true);

  const [temp, setTemp] = useState(currentTemperature);

  const [insight, setInsight] = useState<ComfortInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TRIAL_LIMIT_MS);

  const resetSessionStatus = (resetMode = 'free') => {
    setShowPayment(true);
    setLoadingInsight(false);
    let expiryTime;
    if (resetMode == 'free') {
      expiryTime = 0;
    } else {
      expiryTime = Date.now() + TRIAL_LIMIT_MS;
    }

    setUserSession({
      isActive: true,
      isTrial: true,
      startTime: Date.now(),
      expiryTime: expiryTime,
      balancePaid: false,
    });
  };

  return (
    <AppContext.Provider value={{ usersession, setUserSession, mode, setMode, temp, setTemp, showpayment, setShowPayment, currentTemperature, timeLeft, setTimeLeft, insight, setInsight, loadingInsight, setLoadingInsight, resetSessionStatus }}>
      {children}
    </AppContext.Provider>
  );  
};

// Custom hook for clean usage
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within an AppProvider');
  return context;
};
