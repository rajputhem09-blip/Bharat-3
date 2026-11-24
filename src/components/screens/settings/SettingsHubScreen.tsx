import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { BottomNav } from '../../common/BottomNav';
import {
  User,
  Shield,
  Globe,
  Palette,
  HardDrive,
  UserX,
  TrendingUp,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Sparkles,
  QrCode,
} from 'lucide-react';

export const SettingsHubScreen: React.FC = () => {
  const { currentUser, navigate, currentLanguage, currentTheme, isDarkMode, handleSignOut } = useApp();

  const settingsGroups = [
    {
      label: 'Account & Identity',
      items: [
        { id: 'user_profile', label: 'Profile & Bharat Handle', icon: User, badge: '@' + currentUser.handle },
        { id: 'privacy_security', label: 'Privacy, Lock & Encryption', icon: Shield, badge: 'BharatPKI High' },
      ],
    },
    {
      label: 'Preferences & Regional',
      items: [
        { id: 'indic_language', label: 'App Language', icon: Globe, badge: currentLanguage },
        { id: 'theme_customizer', label: 'Appearance & Theme', icon: Palette, badge: `${currentTheme} (${isDarkMode ? 'Dark' : 'Light'})` },
        { id: 'notifications', label: 'Notification Chimes', icon: Bell, badge: 'Enabled' },
      ],
    },
    {
      label: 'Storage & Moderation',
      items: [
        { id: 'data_storage', label: 'Storage & Offline Cache', icon: HardDrive, badge: '1.2 GB Used' },
        { id: 'blocked_users', label: 'Blocked Numbers & Spam', icon: UserX, badge: '1 Blocked' },
      ],
    },
    {
      label: 'Creator & System',
      items: [
        { id: 'admin_dashboard', label: 'Admin Analytics & Broadcasts', icon: TrendingUp, badge: 'VIP Host' },
        { id: 'help_support', label: 'Help, FAQ & DigiSahayak', icon: HelpCircle, badge: '24/7 AI Support' },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Settings & Hub"
        subtitle="Manage privacy, theme, Indic languages & AI"
        showBack={false}
        showSearch={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* User Card */}
        <div
          onClick={() => navigate('user_profile')}
          className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 flex items-center justify-between hover:border-sky-500 cursor-pointer transition-all shadow-lg"
        >
          <div className="flex items-center space-x-3.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/40"
            />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1">
                <span>{currentUser.name}</span>
                <span className="text-emerald-400 text-xs">✓</span>
              </h3>
              <p className="text-xs text-sky-400 font-mono">@{currentUser.handle}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser.phone}</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('qr_scanner');
            }}
            className="p-2.5 rounded-xl bg-slate-800 text-sky-400 hover:bg-slate-700"
            title="My QR"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Sections */}
        {settingsGroups.map((grp, i) => (
          <div key={i} className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              {grp.label}
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
              {grp.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(item.id as any)}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-850 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-white">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400 font-mono">{item.badge}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign Out Card */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Session & Authentication
          </div>
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden">
            <button
              id="btn-settings-sign-out"
              onClick={async () => {
                const confirmed = window.confirm('Are you sure you want to sign out from BharatChat?');
                if (confirmed) {
                  await handleSignOut();
                }
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-rose-950/40 cursor-pointer transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-rose-300">Sign Out of BharatChat</span>
                  <p className="text-[10px] text-slate-400">Safely terminates current Firebase session</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-500/60" />
            </button>
          </div>
        </div>

        {/* App Version & Footer */}
        <div className="text-center pt-2 pb-4 space-y-1 text-slate-500 text-[11px]">
          <p className="font-semibold text-slate-400">BharatChat Ecosystem v2.5.0</p>
          <p>Made with ❤️ in Bharat • Secured with 256-bit BharatPKI</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
