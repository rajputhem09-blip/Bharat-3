import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Lock,
  Wifi,
  Activity,
} from 'lucide-react';
import { createAudioAnalyser } from '../../../services/callService';

export const VoiceCallScreen: React.FC = () => {
  const {
    callState,
    endCall,
    toggleMuteCall,
    toggleSpeakerCall,
    localStream,
    remoteStream,
    callStatus,
  } = useApp();

  const [frequencyBars, setFrequencyBars] = useState<number[]>([
    25, 45, 65, 80, 50, 90, 70, 40, 85, 60, 35, 75, 55, 30, 20,
  ]);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Attach remote stream to HTMLAudioElement
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Real-time audio analyser for frequency visualization
  useEffect(() => {
    const activeStream = remoteStream || localStream;
    if (!activeStream) return;

    const analyser = createAudioAnalyser(activeStream);
    if (!analyser) return;

    let animId: number;
    const updateFrequencies = () => {
      const bars = analyser.getFrequencies(15);
      setFrequencyBars(bars);
      animId = requestAnimationFrame(updateFrequencies);
    };

    updateFrequencies();

    return () => {
      cancelAnimationFrame(animId);
      analyser.close();
    };
  }, [localStream, remoteStream]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (callStatus === 'offering' || callStatus === 'ringing') {
      return 'Ringing...';
    }
    if (callStatus === 'reconnecting') {
      return 'Reconnecting audio stream...';
    }
    if (callStatus === 'connected') {
      return 'Connected • Spatial Opus HD';
    }
    return 'Calling...';
  };

  return (
    <div
      id="voice-call-screen"
      className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white select-none relative overflow-hidden h-full"
    >
      {/* Hidden Audio Element for WebRTC Remote Stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Background Animated Auras */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-sky-600/20 via-indigo-600/15 to-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Top Encryption & Status Banner */}
      <div className="flex flex-col items-center space-y-2 z-10 pt-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-emerald-400 shadow-md">
          <Lock className="w-3.5 h-3.5" />
          <span>BharatHD Opus Voice (256-bit E2E Encrypted)</span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              callStatus === 'connected'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400 animate-ping'
            }`}
          ></span>
          <span>
            {callStatus === 'connected'
              ? formatDuration(callState.duration)
              : getStatusText()}
          </span>
        </div>
      </div>

      {/* Center Caller Profile & Animated Voice Waveform */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto z-10">
        <div className="relative">
          {/* Animated sound ripple rings */}
          {callStatus === 'connected' && !callState.isMuted && (
            <>
              <div className="absolute -inset-4 rounded-full bg-sky-500/20 animate-ping duration-1000"></div>
              <div className="absolute -inset-8 rounded-full bg-sky-500/10 animate-pulse duration-700"></div>
            </>
          )}

          <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-500 shadow-2xl">
            <img
              src={
                callState.participantAvatar ||
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
              }
              alt={callState.participantName}
              className="w-full h-full rounded-full object-cover border-4 border-slate-950"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {callState.participantName}
          </h2>
          <p
            className={`text-xs font-medium mt-1 ${
              callStatus === 'connected' ? 'text-sky-400' : 'text-amber-400'
            }`}
          >
            {getStatusText()}
          </p>
        </div>

        {/* Dynamic Sine Wave Visualizer reacting to WebRTC audio input */}
        <div className="flex items-center space-x-1.5 h-12 py-2 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          {frequencyBars.map((heightPct, i) => (
            <span
              key={i}
              className="w-1.5 bg-gradient-to-t from-sky-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(12, heightPct)}%`,
              }}
            />
          ))}
        </div>

        {/* Network & Audio Feature Badges */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI DeepNoise Suppression</span>
          </div>
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-emerald-400">
            <Wifi className="w-3 h-3" />
            <span>Full HD 48kHz</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="space-y-4 pb-8 z-10">
        <div className="flex items-center justify-center space-x-6">
          {/* Mute Button */}
          <button
            id="btn-voice-mute"
            onClick={toggleMuteCall}
            className={`p-4 rounded-full transition-all active:scale-95 ${
              callState.isMuted
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
            }`}
            title={callState.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* End Call Button */}
          <button
            id="btn-voice-end-call"
            onClick={endCall}
            className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/40 transition-all hover:scale-105 active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Speakerphone Button */}
          <button
            id="btn-voice-speaker"
            onClick={toggleSpeakerCall}
            className={`p-4 rounded-full transition-all active:scale-95 ${
              callState.isSpeaker
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
            }`}
            title={callState.isSpeaker ? 'Speaker On' : 'Speaker Off'}
          >
            {callState.isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};
