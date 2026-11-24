import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Tablet,
  Monitor,
  Grid,
  Sparkles,
  Palette,
  Globe,
  Wifi,
  Battery,
  Layers,
  Check,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { ScreenId, AppTheme } from '../../types';
import { INDIC_LANGUAGES } from '../../data/mockData';
import { BHARAT_CHAT_PROMPT_SPEC } from '../../data/promptSpec';
import { ScreenGalleryModal } from './ScreenGalleryModal';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const {
    deviceMode,
    setDeviceMode,
    currentTheme,
    setTheme,
    currentLanguage,
    setLanguage,
    currentScreen,
    navigate,
    triggerConfetti,
  } = useApp();

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showScreenPicker, setShowScreenPicker] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const themeOptions: { id: AppTheme; name: string; color: string; desc: string }[] = [
    {
      id: 'classic_saffron',
      name: 'Vedic Saffron & Gold',
      color: 'bg-amber-500',
      desc: 'Terracotta gold and sunlit saffron',
    },
    {
      id: 'bengaluru_tech',
      name: 'Bengaluru Tech Blue',
      color: 'bg-sky-500',
      desc: 'Futuristic silicon blue with crisp contrast',
    },
    {
      id: 'kerala_emerald',
      name: 'Kerala Emerald',
      color: 'bg-emerald-500',
      desc: 'Lush tropical greenery & clean natural tones',
    },
    {
      id: 'jaipur_pink',
      name: 'Jaipur Royal Pink',
      color: 'bg-rose-500',
      desc: 'Heritage pink sandstone and palace elegance',
    },
    {
      id: 'himalayan_snow',
      name: 'Himalayan Mist',
      color: 'bg-slate-400',
      desc: 'High altitude monochrome and subtle slate',
    },
  ];

  const screensCatalog: { id: ScreenId; label: string; category: string; icon: string }[] = [
    // 1. Onboarding
    { id: 'splash', label: '1. Splash Screen', category: 'Onboarding & Auth', icon: '🇮🇳' },
    { id: 'welcome', label: '2. Welcome Carousel', category: 'Onboarding & Auth', icon: '✨' },
    { id: 'phone_login', label: '3. Phone OTP Login', category: 'Onboarding & Auth', icon: '📱' },
    { id: 'otp_verify', label: '4. OTP Verification', category: 'Onboarding & Auth', icon: '🔢' },
    { id: 'profile_setup', label: '5. Profile & Avatar Setup', category: 'Onboarding & Auth', icon: '👤' },
    // 2. Messaging
    { id: 'chat_list', label: '6. Primary Chat List', category: 'Core Messaging', icon: '💬' },
    { id: 'private_chat', label: '7. Private 1-on-1 Chat', category: 'Core Messaging', icon: '🔒' },
    { id: 'group_chat', label: '8. Group Chat Experience', category: 'Core Messaging', icon: '👥' },
    { id: 'channel_feed', label: '9. Broadcast Channel', category: 'Core Messaging', icon: '📢' },
    { id: 'channel_detail', label: '10. Channel Info & Settings', category: 'Core Messaging', icon: '⚙️' },
    { id: 'create_group', label: '11. Create Group Flow', category: 'Core Messaging', icon: '➕' },
    { id: 'starred_messages', label: '12. Starred Messages', category: 'Core Messaging', icon: '⭐' },
    { id: 'archived_chats', label: '13. Archived Chats Vault', category: 'Core Messaging', icon: '📦' },
    // 3. Calls & Live
    { id: 'voice_call', label: '14. HD Voice Call', category: 'Voice & Video', icon: '📞' },
    { id: 'video_call', label: '15. HD Video Call', category: 'Voice & Video', icon: '📹' },
    { id: 'group_video_call', label: '16. Group Video Conference', category: 'Voice & Video', icon: '🎥' },
    { id: 'live_stream_viewer', label: '17. Live Stream & SuperChat', category: 'Voice & Video', icon: '🔴' },
    { id: 'live_stream_studio', label: '18. Live Host Studio', category: 'Voice & Video', icon: '🎙️' },
    // 4. Stories & Fintech
    { id: 'status_stories', label: '19. Bharat Stories (Status)', category: 'Stories & Fintech', icon: '⭕' },
    { id: 'story_viewer', label: '20. Fullscreen Story Viewer', category: 'Stories & Fintech', icon: '👁️' },
    { id: 'media_gallery', label: '21. Media & Docs Gallery', category: 'Stories & Fintech', icon: '🖼️' },
    { id: 'upi_payment', label: '22. UPI BharatPay Transfer', category: 'Stories & Fintech', icon: '💸' },
    { id: 'passbook', label: '23. BharatPassbook & Split Bill', category: 'Stories & Fintech', icon: '🧾' },
    { id: 'document_vault', label: '24. DigiLocker ID Vault', category: 'Stories & Fintech', icon: '🪪' },
    // 5. AI & Tools
    { id: 'bharat_ai', label: '25. Bharat AI Copilot', category: 'AI & Smart Tools', icon: '🤖' },
    { id: 'poll_quiz', label: '26. Polls & Live Quiz', category: 'AI & Smart Tools', icon: '📊' },
    { id: 'live_location', label: '27. Live Location & ETA', category: 'AI & Smart Tools', icon: '📍' },
    { id: 'sticker_hub', label: '28. Desi Stickers & Memes', category: 'AI & Smart Tools', icon: '🎭' },
    // 6. Discovery & Search
    { id: 'global_search', label: '29. Universal Global Search', category: 'Discovery & People', icon: '🔍' },
    { id: 'explore_hub', label: '30. Explore Channels & Live', category: 'Discovery & People', icon: '🧭' },
    { id: 'contacts', label: '31. Contacts & Radar', category: 'Discovery & People', icon: '📇' },
    { id: 'qr_scanner', label: '32. BharatPay QR Scanner', category: 'Discovery & People', icon: '📷' },
    { id: 'notifications', label: '33. Activity Notifications', category: 'Discovery & People', icon: '🔔' },
    // 7. Settings & Admin
    { id: 'settings_hub', label: '34. Settings Hub', category: 'Settings & Admin', icon: '⚙️' },
    { id: 'user_profile', label: '35. Profile & Bio', category: 'Settings & Admin', icon: '👤' },
    { id: 'privacy_security', label: '36. Privacy & BharatPKI', category: 'Settings & Admin', icon: '🔐' },
    { id: 'indic_language', label: '37. 10+ Indic Languages', category: 'Settings & Admin', icon: '🌐' },
    { id: 'theme_customizer', label: '38. Appearance & Theme', category: 'Settings & Admin', icon: '🎨' },
    { id: 'data_storage', label: '39. Storage & Low Data', category: 'Settings & Admin', icon: '💾' },
    { id: 'blocked_users', label: '40. Blocked Numbers', category: 'Settings & Admin', icon: '🚫' },
    { id: 'admin_dashboard', label: '41. Admin Creator Studio', category: 'Settings & Admin', icon: '📈' },
    { id: 'help_support', label: '42. DigiSahayak 24/7 Support', category: 'Settings & Admin', icon: '❓' },
  ];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(BHARAT_CHAT_PROMPT_SPEC);
    setCopiedPrompt(true);
    triggerConfetti();
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-white theme-${currentTheme}`}>
      {/* Top Studio Control Bar */}
      <nav className="bg-slate-950/95 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-40 backdrop-blur sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-orange-500 flex items-center justify-center font-black text-white shadow-md">
              🇮🇳
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white tracking-tight">BharatChat</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-sky-950 text-sky-400 border border-sky-800/60 rounded">
                  40 Screens Ecosystem
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Modern Indian Messaging, Calling & BharatPay
              </span>
            </div>
          </div>
        </div>

        {/* Center Controls: Viewport Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 space-x-1">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'mobile'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile Phone Simulation"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'tablet'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet 2-Pane Mode"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'desktop'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop Web 3-Column Mode"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDeviceMode('gallery')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'gallery'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow font-semibold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
            title="View All 40 Screens Matrix"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>40 Screens</span>
          </button>
        </div>

        {/* Right Tools: Jump Screen, Theme, Indic Languages, AI Studio Prompt Blueprint */}
        <div className="flex items-center space-x-2">
          {/* Screen Jumper Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowScreenPicker(!showScreenPicker)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span className="max-w-[100px] truncate hidden sm:inline">Jump Screen</span>
              <span className="text-[10px] bg-slate-700 px-1 py-0.2 rounded text-slate-300">
                {screensCatalog.findIndex((s) => s.id === currentScreen) + 1 || 1}/40
              </span>
            </button>

            {showScreenPicker && (
              <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 divide-y divide-slate-800">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Jump to Any Screen (1 - 40)
                </div>
                <div className="pt-1 space-y-0.5">
                  {screensCatalog.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        navigate(s.id);
                        setShowScreenPicker(false);
                      }}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        currentScreen === s.id
                          ? 'bg-sky-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{s.icon}</span>
                        <span className="truncate">{s.label}</span>
                      </span>
                      {currentScreen === s.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700"
              title="Change Theme Palette"
            >
              <Palette className="w-4 h-4 text-orange-400" />
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">
                  Design Themes
                </div>
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeMenu(false);
                      triggerConfetti();
                    }}
                    className={`w-full text-left flex items-center space-x-2.5 px-2 py-1.5 rounded-lg text-xs ${
                      currentTheme === t.id
                        ? 'bg-sky-950 border border-sky-700 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                    <div className="flex-1">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-[10px] text-slate-400">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Indic Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700"
              title="Indic Language Selector"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-52 max-h-72 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">
                  10+ Indic Locales
                </div>
                {INDIC_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.name);
                      setShowLangMenu(false);
                      triggerConfetti();
                    }}
                    className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${
                      currentLanguage === l.name
                        ? 'bg-emerald-950 border border-emerald-700 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.nativeScript} ({l.name})</span>
                    {currentLanguage === l.name && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Master AI Studio Prompt Blueprint Button */}
          <button
            id="btn-open-prompt-studio"
            onClick={() => setShowPromptModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            title="View Full 40-Screen Prompt Specification for Google AI Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden lg:inline font-bold">AI Studio Prompt</span>
            <span className="lg:hidden">Prompt</span>
          </button>
        </div>
      </nav>

      {/* Main Simulation Viewport */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-6 bg-slate-950/70 overflow-x-hidden">
        {deviceMode === 'mobile' ? (
          <div className="relative w-full max-w-[400px] h-[830px] max-h-[92vh] bg-slate-900 border-[10px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
            {/* Dynamic Island Header */}
            <div className="h-7 bg-slate-950 flex items-center justify-between px-6 pt-1 text-[11px] font-semibold text-slate-200 select-none z-40 border-b border-transparent">
              <span>9:41</span>
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center space-x-2 px-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] text-white/80 font-mono">BHARAT</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col relative">
              {children}
            </div>

            {/* Home indicator bar */}
            <div className="h-5 bg-slate-950 flex items-center justify-center">
              <div className="w-32 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        ) : deviceMode === 'tablet' ? (
          <div className="relative w-full max-w-[860px] h-[780px] max-h-[90vh] bg-slate-900 border-[12px] border-slate-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
            <div className="h-7 bg-slate-950 flex items-center justify-between px-6 text-xs font-medium text-slate-300 select-none z-30">
              <span className="font-semibold">BharatPad • 10:45 AM</span>
              <span className="text-slate-400">Battery 98% • Wi-Fi Active 🇮🇳</span>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
              {children}
            </div>
          </div>
        ) : deviceMode === 'desktop' ? (
          <div className="relative w-full max-w-[1240px] h-[820px] max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
            <div className="h-9 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 text-xs select-none">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-3 text-slate-400 font-mono text-[11px]">
                  https://web.bharatchat.in/app
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Zero-Knowledge BharatPKI Encrypted Cloud</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-950 flex flex-col">
              {children}
            </div>
          </div>
        ) : (
          /* Gallery Bento Matrix Mode */
          <div className="w-full max-w-7xl max-h-[88vh] overflow-y-auto p-2">
            <ScreenGalleryModal isOpen={true} onClose={() => setDeviceMode('mobile')} />
          </div>
        )}
      </main>

      {/* AI Studio Prompt Specification Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Google AI Studio Prompt Blueprint</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      40 Original Screens
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive master prompt for building BharatChat in AI Studio without Telegram cloning
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPromptModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Code Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/90 whitespace-pre-wrap selection:bg-amber-500 selection:text-slate-950">
              {BHARAT_CHAT_PROMPT_SPEC}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                <span>Copy this prompt directly into Google AI Studio</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyPrompt}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-900" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
