import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { STICKERS_DATA } from '../../../data/mockData';
import { Smile, Sparkles, Download, Check, Plus, Heart } from 'lucide-react';

export const StickerHubScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [downloadedPacks, setDownloadedPacks] = useState<string[]>(['st_festive', 'st_bengaluru']);

  const toggleDownload = (packId: string) => {
    if (downloadedPacks.includes(packId)) {
      setDownloadedPacks(downloadedPacks.filter((id) => id !== packId));
    } else {
      setDownloadedPacks([...downloadedPacks, packId]);
      triggerConfetti();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Desi Sticker & Meme Hub"
        subtitle="Animated Indic stickers & reactions"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('private_chat')}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {STICKERS_DATA.map((pack) => {
          const isAdded = downloadedPacks.includes(pack.id);

          return (
            <div
              key={pack.id}
              className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <span>{pack.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-normal">
                      {pack.category}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {pack.items.length} Animated Stickers • Free
                  </p>
                </div>

                <button
                  onClick={() => toggleDownload(pack.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                    isAdded
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Add Pack</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sticker Grid preview */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {pack.items.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      triggerConfetti();
                      navigate('private_chat');
                    }}
                    className="h-16 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:scale-105 flex items-center justify-center text-3xl transition-all active:scale-95 cursor-pointer shadow-inner"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
