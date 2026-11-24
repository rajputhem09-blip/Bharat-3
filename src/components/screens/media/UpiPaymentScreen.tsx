import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  IndianRupee,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const UpiPaymentScreen: React.FC = () => {
  const { sendUpiPayment, navigate, chats, activeChatId } = useApp();
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[1];

  const [amount, setAmount] = useState('1450');
  const [note, setNote] = useState('Team Lunch Contribution 🍽️');
  const [step, setStep] = useState<'amount' | 'pin' | 'success'>('amount');
  const [pin, setPin] = useState('');

  const quickAmounts = [100, 250, 500, 1000, 1450, 2000];

  const handleKeypadPress = (val: string) => {
    if (val === 'back') {
      setPin((p) => p.slice(0, -1));
    } else if (pin.length < 4) {
      const nextPin = pin + val;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Complete transfer
        setTimeout(() => {
          sendUpiPayment(
            activeChat.name,
            'priya@okhdfcbank',
            parseFloat(amount) || 100,
            note,
            activeChat.avatar
          );
          setStep('success');
        }, 600);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="BharatPay UPI Transfer"
        subtitle="Instant Peer-to-Peer Zero Fee Transfer"
        showBack={true}
        showSearch={false}
        onBackClick={() => (step === 'success' ? navigate('chat_list') : navigate('private_chat'))}
      />

      <div className="flex-1 p-4 flex flex-col justify-between max-w-sm mx-auto w-full">
        {step === 'amount' && (
          <div className="space-y-6 my-auto">
            {/* Recipient Profile Card */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5 shadow-lg">
              <img
                src={activeChat.avatar}
                alt={activeChat.name}
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold text-white truncate">{activeChat.name}</h3>
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                <p className="text-xs text-slate-400 font-mono">priya@okhdfcbank</p>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Verified BharatPay Merchant / Friend
                </span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Enter Transfer Amount
              </span>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-3xl font-extrabold text-emerald-400">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-48 text-3xl font-extrabold text-white bg-transparent text-center focus:outline-none font-mono"
                  placeholder="0"
                  autoFocus
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center justify-center flex-wrap gap-1.5 pt-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-mono font-medium text-slate-200 transition-colors"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Note input */}
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (e.g. Dinner split 🍕)"
                className="w-full mt-3 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center space-x-2 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>NPCI / UPI 2.0 256-bit Tokenized Protocol</span>
            </div>

            <button
              onClick={() => setStep('pin')}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <span>Proceed to UPI PIN (₹{amount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-6 my-auto text-center">
            <div className="space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Enter 4-Digit UPI PIN</h3>
              <p className="text-xs text-slate-400">
                Paying ₹{amount} to {activeChat.name}
              </p>
            </div>

            {/* PIN Dots */}
            <div className="flex items-center justify-center space-x-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? 'bg-emerald-400 border-emerald-400 scale-110'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                />
              ))}
            </div>

            {/* Simulated Numpad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((key, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => key && handleKeypadPress(key)}
                  className={`h-12 rounded-2xl text-lg font-bold transition-all ${
                    key
                      ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-90 border border-slate-800'
                      : 'invisible'
                  }`}
                >
                  {key === 'back' ? '⌫' : key}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 my-auto text-center py-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Payment Successful!</h2>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">
                ₹{amount}
              </p>
              <p className="text-xs text-slate-400">
                Transferred to {activeChat.name}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-semibold text-white">BHARAT/{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">From:</span>
                <span>State Bank of India (••4821)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span>Today, {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('private_chat')}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg active:scale-98"
            >
              Return to Chat with Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
