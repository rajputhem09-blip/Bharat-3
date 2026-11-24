import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { ShieldCheck, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const PhoneLoginScreen: React.FC = () => {
  const { navigate, handleSendOtp, authError, setAuthError } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [countryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setAuthError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      await handleSendOtp(`${countryCode}${cleanNumber}`);
    } catch (err: any) {
      console.error('Phone Auth Error:', err);
      // The authError is already set in AppContext handleSendOtp
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950 text-white select-none">
      {/* Container for invisible Firebase phone recaptcha */}
      <div id="recaptcha-container" />

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('welcome')}
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <span className="text-xs font-mono text-sky-400">Step 1 of 3</span>
      </div>

      {/* Center content */}
      <div className="my-auto space-y-6 max-w-sm mx-auto w-full">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400 shadow-lg">
            <Phone className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Enter your Phone Number
          </h2>
          <p className="text-xs text-slate-400">
            We will send a 6-digit cryptographic OTP to verify your identity.
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-start space-x-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleContinue} className="space-y-4">
          <div className="flex rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-sky-500 overflow-hidden shadow-inner p-1">
            <div className="flex items-center px-3 border-r border-slate-800 bg-slate-900/60 space-x-1.5">
              <span className="text-base">🇮🇳</span>
              <span className="text-xs font-semibold text-slate-200">{countryCode}</span>
            </div>
            <input
              id="input-phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="98765 43210"
              maxLength={10}
              className="flex-1 px-4 py-3.5 bg-transparent text-sm text-white font-mono tracking-wider focus:outline-none placeholder-slate-600"
              autoFocus
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your phone number is encrypted with Firebase & BharatPKI. Never shared with third parties.
            </span>
          </div>

          <button
            id="btn-phone-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending OTP via Firebase...</span>
              </>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom helper */}
      <div className="text-center pb-4">
        <button
          onClick={() => navigate('chat_list')}
          className="text-xs text-slate-500 hover:text-slate-300 underline"
        >
          Explore as Guest Demo User →
        </button>
      </div>
    </div>
  );
};
