import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Link2,
  Download,
  Share2,
} from 'lucide-react';

export const MediaGalleryScreen: React.FC = () => {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'audio' | 'links'>('media');

  const photos = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
  ];

  const docs = [
    { name: 'Gaganyaan_Crew_Telemetry_Report.pdf', size: '3.4 MB', date: 'Yesterday' },
    { name: 'BharatChat_Architecture_Design_2026.pdf', size: '8.2 MB', date: 'Aug 24' },
    { name: 'Dosa_Party_Expense_Receipt.pdf', size: '420 KB', date: 'Aug 22' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Shared Media & Files"
        subtitle="Photos, Videos, Documents & Voice Notes"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('chat_list')}
      />

      {/* Tabs */}
      <div className="flex items-center justify-around bg-slate-900 border-b border-slate-800 text-xs font-semibold p-1">
        {[
          { id: 'media', label: 'Media (142)', icon: ImageIcon },
          { id: 'docs', label: 'Docs (24)', icon: FileText },
          { id: 'audio', label: 'Audio (18)', icon: Music },
          { id: 'links', label: 'Links (65)', icon: Link2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 py-2.5 px-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'media' && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer border border-slate-800"
              >
                <img
                  src={src}
                  alt="Gallery"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-2">
            {docs.map((d, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:bg-slate-850 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate max-w-[200px]">{d.name}</h4>
                    <p className="text-[10px] text-slate-400">{d.size} • {d.date}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-sky-400" title="Download">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'audio' || activeTab === 'links') && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Showing all synced files from encrypted cache.
          </div>
        )}
      </div>
    </div>
  );
};
