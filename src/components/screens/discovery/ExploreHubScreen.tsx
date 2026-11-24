import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { BottomNav } from '../../common/BottomNav';
import {
  Compass,
  TrendingUp,
  Radio,
  Users,
  Flame,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const ExploreHubScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [selectedTag, setSelectedTag] = useState('All');

  const trendingTopics = [
    { tag: '#ISROSpaceMission', postsCount: '1.2M Posts', isTrending: true },
    { tag: '#BharatTechSummit2026', postsCount: '840K Posts', isTrending: true },
    { tag: '#UPIFintechRevolution', postsCount: '520K Posts', isTrending: false },
    { tag: '#CricketLiveIndVsAus', postsCount: '2.8M Posts', isTrending: true },
  ];

  const featuredChannels = [
    {
      id: 'isro_feed',
      name: 'ISRO Space Operations 🚀',
      subscribers: '845K',
      avatar: 'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80',
      description: 'Official launch streams, live telemetry & payload updates.',
    },
    {
      id: 'tech_bharat',
      name: 'Tech Startups & Founders 🇮🇳',
      subscribers: '320K',
      avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80',
      description: 'Daily venture fundings, product breakdowns & hiring leads.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Explore Bharat"
        subtitle="Trending channels, public communities & streams"
        showBack={false}
        showSearch={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Live Broadcast Hero Banner */}
        <div
          onClick={() => navigate('live_stream_viewer')}
          className="relative p-5 rounded-3xl bg-gradient-to-r from-orange-600 via-rose-600 to-indigo-900 border border-white/20 shadow-xl overflow-hidden cursor-pointer group"
        >
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-black/50 text-[10px] font-bold uppercase tracking-wider text-white">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span>Trending Live Broadcast</span>
            </div>
            <h3 className="text-base font-extrabold text-white leading-tight">
              ISRO Gaganyaan Mission Technical Briefing
            </h3>
            <p className="text-xs text-white/80">
              Live with Chief Flight Scientists • 4.2K watching
            </p>
          </div>
        </div>

        {/* Trending Hashtags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Trending in India</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {trendingTopics.map((topic, i) => (
              <div
                key={i}
                onClick={() => {
                  triggerConfetti();
                  navigate('channel_feed');
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500 cursor-pointer transition-all"
              >
                <div className="text-xs font-bold text-sky-400">{topic.tag}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{topic.postsCount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Verified Channels */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Popular Public Channels
          </h3>

          <div className="space-y-2.5">
            {featuredChannels.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate('channel_feed')}
                className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-2xl object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1">
                      <span>{c.name}</span>
                      <span className="text-sky-400 text-xs">✓</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{c.description}</p>
                    <span className="text-[9px] font-mono text-emerald-400">{c.subscribers} Subscribers</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-sky-600/20 text-sky-400 font-semibold text-xs border border-sky-600/40">
                  Join
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
