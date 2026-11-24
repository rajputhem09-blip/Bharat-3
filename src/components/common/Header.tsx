import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Search, MoreVertical, Phone, Video, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  avatar?: string;
  isOnline?: boolean;
  showBack?: boolean;
  showSearch?: boolean;
  showCallButtons?: boolean;
  showAiBadge?: boolean;
  onSearchClick?: () => void;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'BharatChat',
  subtitle,
  avatar,
  isOnline,
  showBack = false,
  showSearch = true,
  showCallButtons = false,
  showAiBadge = false,
  onSearchClick,
  onBackClick,
  rightAction,
}) => {
  const { goBack, navigate, startCall } = useApp();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center space-x-3">
        {showBack && (
          <button
            id="btn-header-back"
            onClick={onBackClick || goBack}
            className="p-1.5 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {avatar ? (
          <div className="relative cursor-pointer" onClick={() => navigate('user_profile')}>
            <img
              src={avatar}
              alt={title}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/20"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            )}
          </div>
        ) : (
          !showBack && (
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('chat_list')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
                <span className="text-base tracking-tighter">🇮🇳</span>
              </div>
            </div>
          )
        )}

        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <h1 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight truncate max-w-[180px] sm:max-w-[240px]">
              {title}
            </h1>
            {showAiBadge && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Indic AI
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <span className="truncate max-w-[180px]">{subtitle}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        {showCallButtons && (
          <>
            <button
              id="btn-header-voice-call"
              onClick={() => startCall('voice', title, avatar || '')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Voice Call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              id="btn-header-video-call"
              onClick={() => startCall('video', title, avatar || '')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
          </>
        )}

        {showSearch && (
          <button
            id="btn-header-search"
            onClick={onSearchClick || (() => navigate('global_search'))}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Global Search"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {rightAction || (
          <button
            id="btn-header-more"
            onClick={() => navigate('settings')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Settings & Menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
