import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Heart,
  IndianRupee,
  Share2,
  Users,
  Send,
  Sparkles,
  ArrowLeft,
  Flame,
} from 'lucide-react';

export const LiveStreamViewerScreen: React.FC = () => {
  const { liveStream, navigate, triggerConfetti } = useApp();
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState(liveStream.comments);
  const [likesCount, setLikesCount] = useState(liveStream.likesCount);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: 'c_' + Date.now(),
        userName: 'Aarav Sharma (You)',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        text: commentInput,
        timestamp: 'Just now',
      },
    ]);
    setCommentInput('');
  };

  const handleHeartClick = () => {
    setLikesCount((prev) => prev + 1);
    const newHeart = { id: Date.now() + Math.random(), left: Math.floor(Math.random() * 60) + 20 };
    setFloatingHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const handleSuperChat = (amount: number) => {
    triggerConfetti();
    setComments((prev) => [
      ...prev,
      {
        id: 'sc_' + Date.now(),
        userName: 'Aarav Sharma (You)',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        text: `Supported the live stream with ₹${amount} SuperChat! 🇮🇳❤️`,
        isSuperChat: true,
        superChatAmount: amount,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-950 text-white select-none relative overflow-hidden">
      {/* Background Live Broadcast Video */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=1200&q=80"
          alt="Live Stream Feed"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80"></div>
      </div>

      {/* Floating Hearts Animation Container */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-20 text-3xl animate-bounce"
            style={{ left: `${h.left}%`, animationDuration: '1.5s' }}
          >
            💖
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 z-20">
        <button
          onClick={() => navigate('channel_feed')}
          className="p-2 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-rose-600/40 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>LIVE</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-xs text-white font-mono flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>4.2K</span>
          </div>
        </div>
      </div>

      {/* Live Comments Overlay Stream */}
      <div className="p-4 z-20 space-y-3 mt-auto">
        <div className="max-h-56 overflow-y-auto space-y-2 no-scrollbar">
          {comments.slice(-6).map((c) => (
            <div
              key={c.id}
              className={`p-2.5 rounded-2xl text-xs backdrop-blur max-w-sm ${
                c.isSuperChat
                  ? 'bg-gradient-to-r from-amber-600/90 to-orange-600/90 border border-amber-400 text-white font-medium shadow-lg'
                  : 'bg-black/60 border border-white/10 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-sky-300">{c.userName}</span>
                {c.isSuperChat && (
                  <span className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200 font-bold font-mono text-[10px]">
                    ₹{c.superChatAmount} BharatPay Tip
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        {/* SuperChat Quick Tips */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0">
            SuperChat:
          </span>
          {[50, 100, 500, 1000].map((amt) => (
            <button
              key={amt}
              onClick={() => handleSuperChat(amt)}
              className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold shrink-0 active:scale-95 transition-all"
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Comment Input and Reaction Button */}
        <form onSubmit={handleSendComment} className="flex items-center space-x-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Send a live comment..."
            className="flex-1 py-2.5 px-4 rounded-2xl bg-black/70 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 backdrop-blur"
          />

          <button
            type="submit"
            className="p-2.5 rounded-full bg-sky-600 text-white hover:bg-sky-500"
          >
            <Send className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleHeartClick}
            className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 active:scale-125 transition-transform"
          >
            <Heart className="w-4 h-4 fill-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
