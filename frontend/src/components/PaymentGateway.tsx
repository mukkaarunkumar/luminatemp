import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface PaymentGatewayProps {
  paymentStatus: (status: string) => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ paymentStatus }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = import.meta.env.VITE_RAZORPAY_PAYMENT_SCRIPT;
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

    const data = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'amount': 10,
        'currency': 'INR',
      }),
    }).then((t) => t.json());

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with your Razorpay key ID
      amount: '10',
      currency: 'INR',
      name: 'Lumina Temp Premium Access',
      description: '1 Hour Premium Temperature Access',
      order_id: data.id,
      handler: async function (response: any) {

        const status = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-payment`, {
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
          // setShowPayment(false);
          // handlePaymentSuccess();
          paymentStatus('success');
        } else {
          setStep('details');
          // setShowPayment(true);
          // resetSessionStatus();
          paymentStatus('failed');
        }
      },
      theme: { color: '#4f46e5' },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };




  return (
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
  );
};

export default PaymentGateway;
