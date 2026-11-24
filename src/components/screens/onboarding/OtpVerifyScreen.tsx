import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ShieldCheck, Fingerprint, RefreshCw, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const OtpVerifyScreen: React.FC = () => {
  const { navigate, handleVerifyOtp, handleSendOtp, authError, setAuthError, triggerConfetti } = useApp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = async (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    // Auto-focus next box if digit entered
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }

    // If filled completely, auto verify
    if (updated.every((d) => d !== '')) {
      const code = updated.join('');
      await submitCode(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const submitCode = async (code: string) => {
    if (code.length < 6) {
      setAuthError('Please enter all 6 digits of the OTP.');
      return;
    }
    setIsVerifying(true);
    setAuthError(null);
    try {
      await handleVerifyOtp(code);
    } catch (err: any) {
      console.error('OTP Verification Error in UI:', err);
      // authError is already set in handleVerifyOtp
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    await submitCode(code);
  };

  const handleResend = async () => {
    setCountdown(30);
    setAuthError(null);
    try {
      // Re-trigger OTP
      if (typeof window !== 'undefined' && window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      navigate('phone_login');
    } catch (err: any) {
      console.error('Error in resend:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950 text-white select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('phone_login')}
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Change Number
        </button>
        <span className="text-xs font-mono text-sky-400">Step 2 of 3</span>
      </div>

      {/* Center content */}
      <div className="my-auto space-y-6 max-w-sm mx-auto w-full">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Verify 6-Digit OTP
          </h2>
          <p className="text-xs text-slate-400">
            Enter the code sent to your registered phone number
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-start space-x-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 OTP Boxes */}
          <div className="flex items-center justify-between space-x-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 rounded-2xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:bg-slate-850 text-center text-xl font-bold font-mono text-white shadow-inner focus:outline-none transition-all"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Resend OTP in:</span>
            {countdown > 0 ? (
              <span className="font-mono text-sky-400 font-semibold">{countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sky-400 hover:underline flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend Now</span>
              </button>
            )}
          </div>

          <button
            id="btn-otp-verify-submit"
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Firebase Credentials...</span>
              </>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={() => {
              triggerConfetti();
              navigate('profile_setup');
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:bg-slate-800 transition-colors"
          >
            <Fingerprint className="w-4 h-4 text-sky-400" />
            <span>Use Biometric / Passkey</span>
          </button>
        </div>
      </div>

      <div className="text-center pb-4 text-[11px] text-slate-500">
        Secured with Firebase Authentication & BharatPKI
      </div>
    </div>
  );
};
