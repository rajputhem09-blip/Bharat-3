import React, { useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ShieldCheck, Sparkles, Lock, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white select-none">
      <div className="w-full flex justify-end">
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          v2.4 • Made in India 🇮🇳
        </span>
      </div>

      {/* Center Animated Brand Emblem */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto">
        <div className="relative">
          {/* Saffron & Peacock Blue ambient halo */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-500/30 via-sky-500/30 to-emerald-500/30 blur-xl animate-pulse"></div>
          
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-blue-700 p-0.5 shadow-2xl flex items-center justify-center border border-white/20">
            <div className="w-full h-full rounded-[22px] bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center">
              <span className="text-4xl filter drop-shadow-md">🇮🇳</span>
              <div className="flex items-center space-x-0.5 mt-2">
                <span className="w-1 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-4 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                <span className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></span>
                <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            BharatChat
          </h1>
          <p className="text-xs text-sky-400 font-medium tracking-wide">
            Next-Gen Indian Messaging & Fintech
          </p>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs text-slate-300">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-bit Military Grade E2E Encrypted</span>
        </div>
      </div>

      {/* Bottom CTA to step into app or welcome carousel */}
      <div className="w-full space-y-3 pb-4">
        <button
          id="btn-splash-get-started"
          onClick={() => navigate('welcome')}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="btn-splash-direct-chats"
          onClick={() => navigate('chat_list')}
          className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors text-center"
        >
          Skip Onboarding to Live Chats →
        </button>
      </div>
    </div>
  );
};
