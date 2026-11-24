import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  SwitchCamera,
  Sparkles,
  Lock,
  Maximize2,
  Minimize2,
  Wifi,
} from 'lucide-react';

export const VideoCallScreen: React.FC = () => {
  const {
    callState,
    endCall,
    toggleMuteCall,
    toggleVideoCall,
    switchCamera,
    cameraFacing,
    currentUser,
    localStream,
    remoteStream,
    callStatus,
  } = useApp();

  const [blurBg, setBlurBg] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isSwapped, setIsSwapped] = useState(false);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach remote stream to HTMLVideoElement
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Attach local stream to HTMLVideoElement
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

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
      return 'Reconnecting video stream...';
    }
    if (callStatus === 'connected') {
      return `HD 1080p • ${formatDuration(callState.duration)}`;
    }
    return 'Calling...';
  };

  return (
    <div
      id="video-call-screen"
      className="flex-1 flex flex-col justify-between bg-slate-950 text-white select-none relative overflow-hidden h-full"
    >
      {/* Remote Fullscreen Video Stream */}
      <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-all duration-300 ${
              blurBg ? 'filter blur-sm scale-105' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-500 shadow-2xl">
                <img
                  src={
                    callState.participantAvatar ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={callState.participantName}
                  className="w-full h-full rounded-full object-cover border-4 border-slate-950"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px]">
                🇮🇳
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {callState.participantName}
            </h3>
            <p className="text-xs text-sky-400 font-mono mt-1">
              {getStatusText()}
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
      </div>

      {/* Top Bar Header */}
      <div className="flex items-center justify-between p-4 z-20">
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-xs font-mono text-emerald-400 flex items-center space-x-1.5 shadow-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                callStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400 animate-ping'
              }`}
            ></span>
            <span>{getStatusText()}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] text-slate-300 backdrop-blur">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>BharatE2E 256-bit</span>
          </div>
        </div>

        <button
          id="btn-portrait-bokeh"
          onClick={() => setBlurBg(!blurBg)}
          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur border transition-all ${
            blurBg
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
          }`}
        >
          ✨ Bokeh {blurBg ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* PiP Local User Camera Preview */}
      <div
        id="pip-local-video-container"
        onClick={() => setIsSwapped(!isSwapped)}
        className="absolute top-16 right-4 w-28 sm:w-36 h-40 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl z-20 bg-slate-900 cursor-pointer group transition-transform duration-200 active:scale-95"
        title="Tap to switch PiP focus"
      >
        {localStream && !callState.isVideoOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              cameraFacing === 'user' ? '-scale-x-100' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 p-2 text-center">
            <img
              src={currentUser.avatar}
              alt="Self"
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 mb-1"
            />
            <span className="text-[10px] text-slate-400">Camera Off</span>
          </div>
        )}

        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white backdrop-blur flex items-center space-x-1">
          {callState.isMuted && <MicOff className="w-2.5 h-2.5 text-rose-400" />}
          <span>You</span>
        </div>
      </div>

      {/* Center AR Festive Sticker Filter if active */}
      {activeFilter && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none animate-bounce">
          <span className="text-7xl filter drop-shadow-2xl">
            {activeFilter.split(' ')[0]}
          </span>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="p-6 z-20 space-y-3">
        {/* AR Festive Filters Row */}
        <div className="flex items-center justify-center space-x-2 pb-1 overflow-x-auto no-scrollbar">
          {['🪔 Diwali Diya', '🎨 Holi Colors', '👑 Royal Crown', '🇮🇳 Tricolor Aura'].map(
            (f, i) => (
              <button
                key={i}
                onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? 'bg-amber-500 text-slate-950 font-bold scale-105 shadow-md shadow-amber-500/20'
                    : 'bg-black/50 text-slate-200 border border-white/10 hover:bg-black/70'
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Button */}
          <button
            id="btn-video-mute"
            onClick={toggleMuteCall}
            className={`p-3.5 rounded-full backdrop-blur transition-all active:scale-95 ${
              callState.isMuted
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-black/60 text-white border border-white/20 hover:bg-black/80'
            }`}
            title={callState.isMuted ? 'Unmute' : 'Mute'}
          >
            {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle Button */}
          <button
            id="btn-video-camera-toggle"
            onClick={toggleVideoCall}
            className={`p-3.5 rounded-full backdrop-blur transition-all active:scale-95 ${
              callState.isVideoOff
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-black/60 text-white border border-white/20 hover:bg-black/80'
            }`}
            title={callState.isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {callState.isVideoOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
          </button>

          {/* End Call Button */}
          <button
            id="btn-video-end-call"
            onClick={endCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/50 active:scale-95 transition-transform hover:scale-105"
            title="End Video Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Switch Camera Button (Front / Back) */}
          <button
            id="btn-video-switch-camera"
            onClick={switchCamera}
            className="p-3.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur hover:bg-black/80 active:scale-95 transition-all"
            title={`Switch to ${cameraFacing === 'user' ? 'Rear' : 'Front'} Camera`}
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
