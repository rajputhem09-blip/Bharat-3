import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  Hand,
  Users,
  MessageSquare,
  Sparkles,
  Share2,
} from 'lucide-react';

export const GroupVideoCallScreen: React.FC = () => {
  const { endCall, toggleMuteCall, callState, currentUser } = useApp();
  const [handRaised, setHandRaised] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState('Priya Sundaram');

  const participants = [
    { name: 'Priya Sundaram', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', isSpeaking: true },
    { name: 'Rohan Verma', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80', isSpeaking: false },
    { name: 'Dr. Ananya Roy', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', isSpeaking: false },
    { name: 'Aarav (You)', avatar: currentUser.avatar, isSpeaking: false },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-950 text-white select-none p-3 relative overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
            Bengaluru Founders Live (4/8)
          </div>
        </div>
        <div className="text-xs text-slate-400">
          08:42
        </div>
      </div>

      {/* 2x2 Grid of Video Participants */}
      <div className="grid grid-cols-2 gap-2 my-auto">
        {participants.map((p, idx) => (
          <div
            key={idx}
            className={`relative h-44 rounded-2xl overflow-hidden bg-slate-900 border-2 transition-all ${
              p.isSpeaking ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-slate-800'
            }`}
          >
            <img
              src={p.avatar}
              alt={p.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur text-[10px] font-semibold text-white flex items-center space-x-1">
              <span>{p.name}</span>
              {p.isSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
          </div>
        ))}
      </div>

      {/* Raised hand banner */}
      {handRaised && (
        <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-300 text-xs text-center flex items-center justify-center space-x-1.5">
          <Hand className="w-3.5 h-3.5" />
          <span>Your hand is raised. Moderator will give you the mic soon.</span>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex items-center justify-center space-x-4 pt-2">
        <button
          onClick={toggleMuteCall}
          className="p-3 rounded-full bg-slate-850 hover:bg-slate-800 text-white border border-slate-700"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={() => setHandRaised(!handRaised)}
          className={`p-3 rounded-full border transition-all ${
            handRaised ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-slate-850 text-white border-slate-700'
          }`}
          title="Raise Hand"
        >
          <Hand className="w-5 h-5" />
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg active:scale-95"
        >
          <PhoneOff className="w-6 h-6" />
        </button>

        <button
          className="p-3 rounded-full bg-slate-850 hover:bg-slate-800 text-white border border-slate-700"
          title="Share Screen"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
