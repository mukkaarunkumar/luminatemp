
import React, { useState } from 'react';
import { CreditCard, CheckCircle, Loader2, X } from 'lucide-react';

interface PaymentGatewayProps {
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ onSuccess, onCancel, amount }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');


  // ✅ Load Razorpay script dynamically
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

    // // 🧠 Create order on backend
    // const data = await fetch('/api/create-order', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount }),
    // }).then((t) => t.json());

    const options = {
      key: 'rzp_test_S2R645ZFtHhWt0', // 🪙 Replace with your Razorpay key ID
      amount: 10,
      currency: 'INR',
      name: 'Lumina Temp Premium Access',
      description: '1 Hour Premium Temperature Access',
      order_id: crypto.randomUUID(),
      handler: function (response: any) {
        // ✅ Payment successful
        setStep('success');
        setTimeout(() => onSuccess(), 1500);
      },
      theme: { color: '#4f46e5' },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Secure Payment</h2>
            <button onClick={onCancel} className="text-white/60 hover:text-white"><X size={24} /></button>
          </div>

          {step === 'details' && (
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-sm text-white/60">Amount to Pay</p>
                <p className="text-3xl font-bold text-white">₹{amount}.00</p>
                <p className="text-xs text-white/40 mt-1">1 Hour Premium Temperature Access</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/70">Card Details</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input 
                    type="text" 
                    placeholder="4444 4444 4444 4444" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500"
                  />
                  <input 
                    type="password" 
                    placeholder="CVC" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                Pay Now
              </button>
              <p className="text-[10px] text-center text-white/30 uppercase tracking-widest">Encrypted by LuminaSecure</p>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <p className="text-lg font-medium">Verifying Transaction...</p>
              <p className="text-sm text-white/40">Please do not close this window</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <p className="text-lg font-medium">Payment Successful!</p>
              <p className="text-sm text-white/40">Redirecting to your experience...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
