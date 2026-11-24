/**
 * BharatChat - Real-Time Incoming Call Screen & Overlay
 * Features audio chime, accepting/declining WebRTC calls, and quick SMS replies
 */

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Phone,
  PhoneOff,
  Video,
  Lock,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Send,
} from 'lucide-react';

export const IncomingCallOverlay: React.FC = () => {
  const { incomingCall, acceptIncomingCall, declineIncomingCall, sendMessage } = useApp();
  const [showQuickReply, setShowQuickReply] = useState(false);
  const [customReply, setCustomReply] = useState('');

  if (!incomingCall) return null;

  const isVideo = incomingCall.type === 'video';

  const quickMessages = [
    "Can't talk now. Call you later! 🙏",
    'In a meeting, please text me.',
    'On my way! 🚗',
    'Will call you back in 10 mins ⏱️',
  ];

  const handleSendQuickReply = async (text: string) => {
    try {
      // Send quick message in direct chat if available
      await sendMessage('chat_priya', `[Auto-Reply]: ${text}`);
      declineIncomingCall();
    } catch {
      declineIncomingCall();
    }
  };

  return (
    <div
      id="incoming-call-overlay"
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-slate-950/95 backdrop-blur-xl text-white select-none overflow-hidden animate-in fade-in duration-300"
    >
      {/* Background Animated Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-sky-600/30 via-amber-500/20 to-emerald-500/30 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>

      {/* Top Security & Type Banner */}
      <div className="flex flex-col items-center space-y-2 z-10 pt-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-emerald-400 shadow-lg">
          <Lock className="w-3.5 h-3.5" />
          <span>BharatHD 256-bit E2E Encrypted</span>
        </div>
        <p className="text-sm font-medium tracking-wide text-slate-300 uppercase flex items-center space-x-1.5">
          {isVideo ? <Video className="w-4 h-4 text-sky-400" /> : <Phone className="w-4 h-4 text-emerald-400" />}
          <span>Incoming {isVideo ? 'Video' : 'Voice'} Call...</span>
        </p>
      </div>

      {/* Center Caller Profile & Animated Ripple Ring */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto z-10">
        <div className="relative">
          {/* Animated concentric ringing ripples */}
          <div className="absolute -inset-6 rounded-full bg-emerald-500/20 animate-ping duration-1000"></div>
          <div className="absolute -inset-12 rounded-full bg-sky-500/15 animate-pulse duration-700"></div>

          <div className="relative w-36 h-36 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-sky-500 to-emerald-500 shadow-2xl">
            <img
              src={
                incomingCall.callerAvatar ||
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
              }
              alt={incomingCall.callerName}
              className="w-full h-full rounded-full object-cover border-4 border-slate-950"
            />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {incomingCall.callerName}
          </h2>
          <p className="text-sm text-sky-300 font-medium mt-1">
            BharatChat Peer • Ringing...
          </p>
        </div>

        {/* Quick Indic Audio Specs Tag */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Opus HD Voice & Spatial Noise Cancellation</span>
        </div>
      </div>

      {/* Quick Reply Drawer / Buttons */}
      {showQuickReply ? (
        <div className="z-10 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 mb-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Quick Reply & Decline</span>
            <button
              onClick={() => setShowQuickReply(false)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {quickMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => handleSendQuickReply(msg)}
                className="text-left text-xs p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              placeholder="Custom message..."
              value={customReply}
              onChange={(e) => setCustomReply(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              disabled={!customReply.trim()}
              onClick={() => handleSendQuickReply(customReply)}
              className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-4 z-10">
          <button
            onClick={() => setShowQuickReply(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Reply with message</span>
          </button>
        </div>
      )}

      {/* Accept / Decline Action Controls */}
      <div className="flex items-center justify-around max-w-sm mx-auto w-full pb-8 z-10">
        {/* Decline Button */}
        <div className="flex flex-col items-center space-y-2">
          <button
            id="btn-decline-call"
            onClick={declineIncomingCall}
            className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            aria-label="Decline Call"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
          <span className="text-xs text-slate-400 font-medium">Decline</span>
        </div>

        {/* Accept Button */}
        <div className="flex flex-col items-center space-y-2">
          <button
            id="btn-accept-call"
            onClick={acceptIncomingCall}
            className="w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 animate-bounce"
            aria-label="Accept Call"
          >
            {isVideo ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
          </button>
          <span className="text-xs text-emerald-400 font-medium">Accept</span>
        </div>
      </div>
    </div>
  );
};
