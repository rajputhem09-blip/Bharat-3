import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface ScreenGalleryModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ScreenGalleryModal: React.FC<ScreenGalleryModalProps> = ({ onClose }) => {
  const { navigate, setDeviceMode, currentScreen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterQuery, setFilterQuery] = useState<string>('');

  const screens: {
    id: ScreenId;
    number: number;
    title: string;
    category: string;
    description: string;
    icon: string;
    badge: string;
  }[] = [
    // 1. Onboarding & Identity (5)
    {
      id: 'splash',
      number: 1,
      title: 'Splash & Brand Aura',
      category: 'Onboarding',
      description: 'Soundwave Bharat emblem, tricolor ambient glow, and high-speed engine boot.',
      icon: '🇮🇳',
      badge: 'Auth Flow',
    },
    {
      id: 'welcome',
      number: 2,
      title: 'Welcome & Value Carousel',
      category: 'Onboarding',
      description: 'Multi-slide showcase of E2E encryption, UPI payments, and Indic AI Copilot.',
      icon: '✨',
      badge: 'Auth Flow',
    },
    {
      id: 'phone_login',
      number: 3,
      title: 'Phone Number OTP Login',
      category: 'Onboarding',
      description: '+91 Country selector, fast numpad, privacy pledge and OTP trigger.',
      icon: '📱',
      badge: 'Auth Flow',
    },
    {
      id: 'otp_verify',
      number: 4,
      title: '6-Digit OTP Verification',
      category: 'Onboarding',
      description: 'Auto-jumping 6-digit PIN boxes, 30-sec resend countdown, biometric sign-in.',
      icon: '🔢',
      badge: 'Auth Flow',
    },
    {
      id: 'profile_setup',
      number: 5,
      title: 'Profile Setup & Avatar',
      category: 'Onboarding',
      description: 'Custom handle @username generator, avatar upload with Indian festive frames.',
      icon: '👤',
      badge: 'Auth Flow',
    },

    // 2. Core Messaging (8)
    {
      id: 'chat_list',
      number: 6,
      title: 'Primary Chat Hub (List)',
      category: 'Messaging',
      description: 'Smart filter tabs (All, Direct, Groups, Channels, BharatPay), pinned conversations, presence dots.',
      icon: '💬',
      badge: 'Core Hub',
    },
    {
      id: 'private_chat',
      number: 7,
      title: 'Private 1-on-1 Chat',
      category: 'Messaging',
      description: 'Waveform voice notes, 1-tap Indic translation, UPI payment chip, disappearing messages.',
      icon: '🔒',
      badge: 'Core Hub',
    },
    {
      id: 'group_chat',
      number: 8,
      title: 'Group Chat Experience',
      category: 'Messaging',
      description: 'Member avatar stack, admin crowns, @mention drawer, topic threads, shared pinned note.',
      icon: '👥',
      badge: 'Core Hub',
    },
    {
      id: 'channel_feed',
      number: 9,
      title: 'Broadcast Channel Feed',
      category: 'Messaging',
      description: 'One-to-many broadcast, emoji reaction counts, subscriber tally, live polls.',
      icon: '📢',
      badge: 'Channels',
    },
    {
      id: 'channel_detail',
      number: 10,
      title: 'Channel Info & Management',
      category: 'Messaging',
      description: 'Subscriber permissions, vanity link sharing, media archive, mute settings.',
      icon: '⚙️',
      badge: 'Channels',
    },
    {
      id: 'create_group',
      number: 11,
      title: 'Create Group Wizard',
      category: 'Messaging',
      description: 'Multi-contact search & selection chips, group picture customizer, privacy toggle.',
      icon: '➕',
      badge: 'Creation',
    },
    {
      id: 'starred_messages',
      number: 12,
      title: 'Starred Messages Vault',
      category: 'Messaging',
      description: 'Filter saved messages by photos, documents, links, and voice notes.',
      icon: '⭐',
      badge: 'Saved',
    },
    {
      id: 'archived_chats',
      number: 13,
      title: 'Archived Conversations',
      category: 'Messaging',
      description: 'Hidden chats with swipe-to-unarchive and auto-mute background rules.',
      icon: '📦',
      badge: 'Archive',
    },

    // 3. Voice, Video & Live (5)
    {
      id: 'voice_call',
      number: 14,
      title: 'Crystal HD Voice Call',
      category: 'Voice & Video',
      description: 'Real-time audio sine-wave visualizer, noise suppression toggle, call timer.',
      icon: '📞',
      badge: 'HD Audio',
    },
    {
      id: 'video_call',
      number: 15,
      title: '1-on-1 HD Video Call',
      category: 'Voice & Video',
      description: 'Picture-in-picture floating self-view, background blur, camera flip, AR filters.',
      icon: '📹',
      badge: 'HD Video',
    },
    {
      id: 'group_video_call',
      number: 16,
      title: 'Group Video Conference',
      category: 'Voice & Video',
      description: '4-8 participant dynamic grid, active speaker highlight, raise hand queue.',
      icon: '🎥',
      badge: 'Conference',
    },
    {
      id: 'live_stream_viewer',
      number: 17,
      title: 'Live Stream & SuperChat',
      category: 'Voice & Video',
      description: 'Floating heart reaction cascade, live comment feed, SuperChat BharatPay donations.',
      icon: '🔴',
      badge: 'Broadcasting',
    },
    {
      id: 'live_stream_studio',
      number: 18,
      title: 'Live Stream Host Studio',
      category: 'Voice & Video',
      description: 'Host control center, stream bitrate monitor, co-host invitations, category tags.',
      icon: '🎙️',
      badge: 'Broadcasting',
    },

    // 4. Ephemeral Stories & Fintech (6)
    {
      id: 'status_stories',
      number: 19,
      title: 'Bharat Stories (24h Status)',
      category: 'Stories & Fintech',
      description: 'Vibrant circular story rings, text status creator with festive gradients, camera trigger.',
      icon: '⭕',
      badge: 'Stories',
    },
    {
      id: 'story_viewer',
      number: 20,
      title: 'Fullscreen Story Viewer',
      category: 'Stories & Fintech',
      description: 'Segmented auto-advancing progress bars, pause-on-press, swipe-up reply, reaction emojis.',
      icon: '👁️',
      badge: 'Stories',
    },
    {
      id: 'media_gallery',
      number: 21,
      title: 'Media, Docs & Links Gallery',
      category: 'Stories & Fintech',
      description: 'Segmented tabs: Photos, Videos, Audio, Documents, Links with PDF preview.',
      icon: '🖼️',
      badge: 'Media',
    },
    {
      id: 'upi_payment',
      number: 22,
      title: 'UPI BharatPay Transfer',
      category: 'Stories & Fintech',
      description: 'In-chat peer-to-peer money transfer, QR scanner, PIN keypad, instant confetti receipt.',
      icon: '💸',
      badge: 'Fintech',
    },
    {
      id: 'passbook',
      number: 23,
      title: 'BharatPassbook & Split Bill',
      category: 'Stories & Fintech',
      description: 'Ledger of transactions, group bill splitting calculator, cashback scratch cards.',
      icon: '🧾',
      badge: 'Fintech',
    },
    {
      id: 'document_vault',
      number: 24,
      title: 'DigiLocker ID Vault',
      category: 'Stories & Fintech',
      description: 'Encrypted Aadhaar, PAN, and Driving License cards with shareable OTP verification.',
      icon: '🪪',
      badge: 'Govt Tech',
    },

    // 5. Bharat AI & Smart Tools (4)
    {
      id: 'bharat_ai',
      number: 25,
      title: 'Bharat AI Copilot',
      category: 'AI & Smart Tools',
      description: 'Gemini-powered Indian bilingual companion: Thread summarizer, greeting crafter, translator.',
      icon: '🤖',
      badge: 'AI Powered',
    },
    {
      id: 'poll_quiz',
      number: 26,
      title: 'Polls & Live Quizzes',
      category: 'AI & Smart Tools',
      description: 'Single-choice, multi-choice, anonymous voting, timed group quizzes with live percentages.',
      icon: '📊',
      badge: 'Interactivity',
    },
    {
      id: 'live_location',
      number: 27,
      title: 'Live Location & ETA Radar',
      category: 'AI & Smart Tools',
      description: 'Real-time GPS tracker simulation, meeting rendezvous point, ETA distance calculation.',
      icon: '📍',
      badge: 'Geo Tools',
    },
    {
      id: 'sticker_hub',
      number: 28,
      title: 'Desi Stickers & Meme Packs',
      category: 'AI & Smart Tools',
      description: 'Indian festival animated stickers, Bollywood slang, custom sticker studio.',
      icon: '🎭',
      badge: 'Expression',
    },

    // 6. Discovery & Search (5)
    {
      id: 'global_search',
      number: 29,
      title: 'Universal Global Search',
      category: 'Discovery',
      description: 'Instant search across messages, people, groups, channels, media files, and hashtags.',
      icon: '🔍',
      badge: 'Discovery',
    },
    {
      id: 'explore_hub',
      number: 30,
      title: 'Explore Channels & Live',
      category: 'Discovery',
      description: 'Discover trending Indian channels, verified creators, live broadcasts, and audio rooms.',
      icon: '🧭',
      badge: 'Discovery',
    },
    {
      id: 'contacts',
      number: 31,
      title: 'Contacts & Nearby Radar',
      category: 'Discovery',
      description: 'Address book sync, SMS invites, frequent contacts, nearby BharatChat users pulse.',
      icon: '📇',
      badge: 'Contacts',
    },
    {
      id: 'qr_scanner',
      number: 32,
      title: 'BharatPay QR Scanner',
      category: 'Discovery',
      description: 'Scan any Bharat QR code or share your personal UPI ID & handle instantly.',
      icon: '📷',
      badge: 'Camera',
    },
    {
      id: 'notifications',
      number: 33,
      title: 'Activity Notifications',
      category: 'Discovery',
      description: 'Activity stream for mentions, UPI receipts, channel broadcasts, and security alerts.',
      icon: '🔔',
      badge: 'Activity',
    },

    // 7. Settings, Security & Administration (9)
    {
      id: 'settings_hub',
      number: 34,
      title: 'Settings Overview Hub',
      category: 'Settings & Admin',
      description: 'Profile card, Bharat ID QR share, fast shortcuts to security, notifications, storage.',
      icon: '⚙️',
      badge: 'Settings',
    },
    {
      id: 'user_profile',
      number: 35,
      title: 'User Profile & Bio',
      category: 'Settings & Admin',
      description: 'Mutual groups, shared media, 60-digit encryption fingerprint verification, block/report.',
      icon: '👤',
      badge: 'Profile',
    },
    {
      id: 'privacy_security',
      number: 36,
      title: 'Privacy & Biometric Center',
      category: 'Settings & Admin',
      description: 'Fingerprint lock, 2-step PIN, active linked sessions, disappearing messages default.',
      icon: '🔐',
      badge: 'Security',
    },
    {
      id: 'indic_language',
      number: 37,
      title: 'Indic Language & Locales',
      category: 'Settings & Admin',
      description: '10+ official Indian languages with native script font rendering and regional keyboards.',
      icon: '🌐',
      badge: 'Localization',
    },
    {
      id: 'theme_customizer',
      number: 38,
      title: 'Appearance & Themes Studio',
      category: 'Settings & Admin',
      description: 'Saffron Sunset, Bengaluru Blue, Kerala Emerald, Jaipur Pink, Dark/Light modes.',
      icon: '🎨',
      badge: 'Customization',
    },
    {
      id: 'data_storage',
      number: 39,
      title: 'Storage & Network Optimizer',
      category: 'Settings & Admin',
      description: '1-tap cache cleaner, auto-download media controls for Wi-Fi and 2G mobile data saver.',
      icon: '💾',
      badge: 'Performance',
    },
    {
      id: 'blocked_users',
      number: 40,
      title: 'Blocked Users & Anti-Spam',
      category: 'Settings & Admin',
      description: 'Managed blacklist, telemarketer spam filter, silence unknown callers toggle.',
      icon: '🚫',
      badge: 'Privacy',
    },
    {
      id: 'admin_dashboard',
      number: 41,
      title: 'Channel Admin Analytics',
      category: 'Settings & Admin',
      description: 'Channel subscriber growth metrics, moderation logs, ban list, broadcast scheduler.',
      icon: '📈',
      badge: 'Admin Tools',
    },
    {
      id: 'help_support',
      number: 42,
      title: 'Help, Support & FAQs',
      category: 'Settings & Admin',
      description: 'Interactive FAQ accordion, 24x7 support ticket submission, community safety rules.',
      icon: '❓',
      badge: 'Support',
    },
  ];

  const categories = [
    'All',
    'Onboarding',
    'Messaging',
    'Voice & Video',
    'Stories & Fintech',
    'AI & Tools',
    'Discovery',
    'Settings & Admin',
  ];

  const filteredScreens = screens.filter((s) => {
    const matchesCat =
      selectedCategory === 'All' ||
      s.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'AI & Tools' && s.category.includes('AI'));
    const matchesQuery =
      s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="p-4 sm:p-8 bg-slate-900/90 rounded-3xl border border-slate-800 text-slate-100 shadow-2xl backdrop-blur-xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950">
              🇮🇳 Complete Design System
            </span>
            <span className="text-xs text-slate-400 font-mono">
              42 Live Interactive Screens
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
            BharatChat Screen Matrix & Architecture
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Explore every custom screen designed from scratch with original Indian aesthetics, peer-to-peer UPI fintech, bilingual AI copilot, and encrypted messaging.
          </p>
        </div>

        {/* Search inside screens */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search screens, flows, tools..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 py-4 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Grid Matrix of Screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
        {filteredScreens.map((s) => {
          const isCurrent = currentScreen === s.id;
          return (
            <div
              key={s.id}
              onClick={() => {
                navigate(s.id);
                setDeviceMode('mobile');
                if (onClose) onClose();
              }}
              className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Screen #{s.number}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-sky-800/40">
                    {s.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">{s.category}</span>
                <span className="inline-flex items-center space-x-1 font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{isCurrent ? 'Active Now' : 'Launch View'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
