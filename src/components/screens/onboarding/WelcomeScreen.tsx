import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { ShieldCheck, Zap, Sparkles, Globe, ArrowRight, Check } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { navigate } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/40',
      title: 'Zero-Knowledge Privacy',
      desc: 'Messages, voice notes, and media stay strictly between you and your recipients with cryptographic E2E encryption.',
    },
    {
      icon: Zap,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-800/40',
      title: 'Instant UPI BharatPay',
      desc: 'Transfer money right inside your private and group chats without switching to external bank apps.',
    },
    {
      icon: Sparkles,
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-950/40 border-sky-800/40',
      title: 'Bilingual Bharat AI Copilot',
      desc: 'Summarize long group threads, draft business proposals, and generate festival greetings across 14+ Indian languages.',
    },
    {
      icon: Globe,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-950/40 border-indigo-800/40',
      title: '1-Tap Indic Translation',
      desc: 'Communicate effortlessly across Hindi, Tamil, Telugu, Bengali, Marathi, and Gujarati with instant translation bubbles.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950 text-white select-none">
      {/* Top indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-slate-300">BharatChat Experience</span>
        </div>
        <button
          onClick={() => navigate('phone_login')}
          className="text-xs font-medium text-sky-400 hover:text-sky-300"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Card */}
      <div className="my-auto py-8">
        <div className={`p-6 rounded-3xl border ${slides[activeSlide].bgColor} backdrop-blur transition-all duration-300 shadow-xl flex flex-col items-center text-center space-y-4`}>
          <div className="w-16 h-16 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-white/10 shadow-inner">
            {React.createElement(slides[activeSlide].icon, {
              className: `w-8 h-8 ${slides[activeSlide].iconColor}`,
            })}
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {slides[activeSlide].title}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
            {slides[activeSlide].desc}
          </p>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                activeSlide === idx ? 'w-6 bg-sky-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-4">
        {activeSlide < slides.length - 1 ? (
          <button
            onClick={() => setActiveSlide((prev) => prev + 1)}
            className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/20 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <span>Next Feature</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => navigate('phone_login')}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-sky-600 hover:from-orange-600 hover:to-sky-700 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <span>Proceed to Login</span>
            <Check className="w-4 h-4" />
          </button>
        )}

        <p className="text-[10px] text-center text-slate-500">
          By continuing, you accept BharatChat Terms of Service & Privacy Shield.
        </p>
      </div>
    </div>
  );
};
