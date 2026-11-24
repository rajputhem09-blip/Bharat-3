import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  CircleDashed,
  PhoneCall,
  CreditCard,
  Sparkles,
  Settings,
} from 'lucide-react';
import { ScreenId } from '../../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate, chats } = useApp();

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const navItems: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; isAi?: boolean }[] = [
    {
      id: 'chat_list',
      label: 'Chats',
      icon: MessageSquare,
      badge: totalUnread,
    },
    {
      id: 'status_stories',
      label: 'Stories',
      icon: CircleDashed,
      badge: 3,
    },
    {
      id: 'bharat_ai',
      label: 'Bharat AI',
      icon: Sparkles,
      isAi: true,
    },
    {
      id: 'passbook',
      label: 'BharatPay',
      icon: CreditCard,
    },
    {
      id: 'settings_hub',
      label: 'Settings',
      icon: Settings,
    },
  ];

  // Don't show bottom nav in dedicated full-screen modals like active calls or story viewer
  const hideScreens: ScreenId[] = [
    'splash',
    'welcome',
    'phone_login',
    'otp_verify',
    'profile_setup',
    'voice_call',
    'video_call',
    'group_video_call',
    'story_viewer',
    'live_stream_studio',
  ];

  if (hideScreens.includes(currentScreen)) {
    return null;
  }

  return (
    <nav className="sticky bottom-0 z-30 flex items-center justify-around px-2 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 transition-colors">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        if (item.isAi) {
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => navigate(item.id)}
              className={`relative flex flex-col items-center justify-center p-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/25 scale-105'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:scale-105'
              }`}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-[10px] font-bold mt-0.5 tracking-tight">AI Copilot</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            id={`nav-tab-${item.id}`}
            onClick={() => navigate(item.id)}
            className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              isActive
                ? 'text-sky-600 dark:text-sky-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] mt-1">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-sky-600 dark:bg-sky-400 rounded-full mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
