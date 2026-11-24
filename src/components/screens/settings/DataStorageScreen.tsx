import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { HardDrive, Trash2, Wifi, Zap, Check, Shield } from 'lucide-react';

export const DataStorageScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [cleared, setCleared] = useState(false);

  const storageItems = [
    { label: 'Photos & Videos', size: '840 MB', color: 'bg-sky-500' },
    { label: 'Voice Notes & Opus Audio', size: '210 MB', color: 'bg-emerald-500' },
    { label: 'Documents & DigiLocker', size: '120 MB', color: 'bg-amber-500' },
    { label: 'Bharat AI Cache & Index', size: '45 MB', color: 'bg-rose-500' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Data & Network Storage"
        subtitle="Manage offline cache, low-bandwidth mode & media"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('settings_hub')}
      />

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Storage Bar Card */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Device Storage</span>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400">1.21 GB Used</span>
          </div>

          {/* Segmented bar */}
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="w-[60%] bg-sky-500" />
            <div className="w-[20%] bg-emerald-500" />
            <div className="w-[12%] bg-amber-500" />
            <div className="w-[8%] bg-rose-500" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {storageItems.map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-slate-400 text-[11px] truncate">{item.label}</span>
                <span className="text-white font-mono font-semibold text-[10px] ml-auto">{item.size}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setCleared(true);
              triggerConfetti();
              setTimeout(() => setCleared(false), 2500);
            }}
            className="w-full py-2.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <Trash2 className="w-4 h-4" />
            <span>{cleared ? 'Cache Cleared! (Freed 480 MB)' : 'Clear Temporary Cache'}</span>
          </button>
        </div>

        {/* Network & Low Bandwidth Mode */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 p-2 text-xs">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-semibold text-white">2G / Low-Bandwidth Mode</div>
                <div className="text-[11px] text-slate-400">Compresses images by 70% for rural networks</div>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-500 rounded" />
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <Wifi className="w-5 h-5 text-sky-400" />
              <div>
                <div className="font-semibold text-white">Auto-Download on Wi-Fi Only</div>
                <div className="text-[11px] text-slate-400">Saves mobile data quota</div>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-sky-500 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
