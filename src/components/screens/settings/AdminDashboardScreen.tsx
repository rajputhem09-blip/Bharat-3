import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  TrendingUp,
  Users,
  Eye,
  Radio,
  IndianRupee,
  ShieldCheck,
  Send,
  Sparkles,
  BarChart2,
  Calendar,
} from 'lucide-react';

export const AdminDashboardScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [broadcastText, setBroadcastText] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    triggerConfetti();
    alert('Broadcast dispatched to 845,000 subscribers!');
    setBroadcastText('');
  };

  const metrics = [
    { label: 'Subscribers', val: '845,210', change: '+14.2%', icon: Users, color: 'text-sky-400' },
    { label: 'Monthly Views', val: '18.4M', change: '+22.5%', icon: Eye, color: 'text-emerald-400' },
    { label: 'SuperChat Revenue', val: '₹142,500', change: '+38.0%', icon: IndianRupee, color: 'text-amber-400' },
    { label: 'Live Engagement', val: '94.8%', change: '+5.4%', icon: TrendingUp, color: 'text-purple-400' },
  ];

  const cityBreakdown = [
    { city: 'Bengaluru', pct: 34 },
    { city: 'Delhi NCR', pct: 24 },
    { city: 'Mumbai', pct: 18 },
    { city: 'Hyderabad', pct: 14 },
    { city: 'Chennai & Others', pct: 10 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Creator & Admin Studio"
        subtitle="Channel Analytics & Broadcaster Tools"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('settings_hub')}
      />

      <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div className="text-xl font-extrabold text-white font-mono">{m.val}</div>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                  <span>{m.change} this month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audience Regional Demographics */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart2 className="w-4 h-4 text-sky-400" />
              <span>Audience Distribution (Indic Hubs)</span>
            </h3>
            <span className="text-[10px] text-slate-400">All India</span>
          </div>

          <div className="space-y-2 pt-1">
            {cityBreakdown.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{item.city}</span>
                  <span className="font-mono font-bold text-white">{item.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full" style={{ width: `${item.pct * 2.5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Channel Announcement Form */}
        <form onSubmit={handleBroadcast} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-orange-400" />
            <span>Instant Broadcast to All Channel Subscribers</span>
          </h3>

          <textarea
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            rows={3}
            placeholder="Write official announcement in any Indic script..."
            className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-sky-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Broadcast Update</span>
          </button>
        </form>
      </div>
    </div>
  );
};
