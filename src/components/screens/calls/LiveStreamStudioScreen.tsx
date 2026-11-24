import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  Radio,
  Settings,
  Users,
  Eye,
  Sparkles,
  Zap,
  Share2,
  Video,
  Mic,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const LiveStreamStudioScreen: React.FC = () => {
  const { navigate } = useApp();
  const [streamTitle, setStreamTitle] = useState('Building Next-Gen Tech in Bengaluru 🚀');
  const [category, setCategory] = useState('Technology & Startups');
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Live Broadcast Studio"
        subtitle="Host Control Center"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('chat_list')}
      />

      <div className="p-4 space-y-4">
        {/* Stream Preview Monitor */}
        <div className="relative h-48 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
            alt="Studio preview"
            className="w-full h-full object-cover filter brightness-75"
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur text-xs text-white font-mono flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Bitrate: 6,400 kbps (1080p 60fps)</span>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <button className="p-2 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black">
              <Mic className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black">
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Setup Form */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Broadcast Title
            </label>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option>Technology & Startups</option>
              <option>Science & Space</option>
              <option>Finance & Stocks</option>
              <option>Education & Vedic Studies</option>
              <option>Music & Entertainment</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setIsLive(!isLive);
                if (!isLive) navigate('live_stream_viewer');
              }}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${
                isLive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-orange-500 via-rose-500 to-sky-600 hover:opacity-90 text-white shadow-orange-500/20'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isLive ? 'End Live Broadcast' : 'Go Live to 845,000 Subscribers'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
