import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  Share2,
  Users,
  Compass,
} from 'lucide-react';

export const LiveLocationScreen: React.FC = () => {
  const { navigate, currentUser, triggerConfetti } = useApp();
  const [duration, setDuration] = useState('1 hour');
  const [isSharing, setIsSharing] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      <Header
        title="Live Location Sharing"
        subtitle="Real-time GPS with battery & speed radar"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('private_chat')}
      />

      {/* Simulated Map Canvas Viewport */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Map Grid Pattern background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Meeting Point Circle */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 border-2 border-sky-400 animate-ping absolute inset-0"></div>
            <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-sky-400 flex items-center justify-center text-white shadow-2xl relative z-10">
              <img
                src={currentUser.avatar}
                alt="You"
                className="w-13 h-13 rounded-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white z-20">
              ✓
            </div>
          </div>

          <div className="mt-2 px-3 py-1 rounded-full bg-slate-950/90 border border-slate-700 text-xs font-semibold text-white shadow-md text-center">
            <span>Koramangala 4th Block, Bengaluru</span>
            <span className="text-[10px] text-emerald-400 block font-mono">Accuracy: 3 meters • Live</span>
          </div>
        </div>

        {/* Floating Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white shadow-lg">
            <Compass className="w-5 h-5 text-sky-400" />
          </button>
          <button className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white shadow-lg">
            <Navigation className="w-5 h-5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Bottom Controls Sheet */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3 z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-white">Live Sharing Duration</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">54 minutes left</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['15 mins', '1 hour', '8 hours'].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                duration === d
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            triggerConfetti();
            navigate('private_chat');
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 active:scale-98"
        >
          Stop Sharing Live Location
        </button>
      </div>
    </div>
  );
};
