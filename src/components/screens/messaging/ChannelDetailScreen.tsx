import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  Radio,
  Bell,
  BellOff,
  Share2,
  Lock,
  Users,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  ShieldCheck,
  TrendingUp,
  Settings,
  Copy,
  Check,
  LogOut,
  Trash2,
  Sparkles,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { ChatItem } from '../../../types';
import {
  subscribeToChannelDetails,
  generateChannelInviteCode,
} from '../../../services/channelService';
import { ChannelAdminModal } from './ChannelAdminModal';

export const ChannelDetailScreen: React.FC = () => {
  const {
    chats,
    activeChatId,
    navigate,
    currentUser,
    unsubscribeFromChannel,
    deleteChannelPost,
    triggerConfetti,
  } = useApp();

  const fallbackChannel =
    chats.find((c) => c.type === 'channel' && c.id === activeChatId) ||
    chats.find((c) => c.type === 'channel') ||
    chats[3];

  const [channel, setChannel] = useState<ChatItem>(fallbackChannel);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (activeChatId && !activeChatId.startsWith('chat_')) {
      const unsubscribe = subscribeToChannelDetails(activeChatId, (ch) => {
        if (ch) setChannel(ch);
      });
      return () => unsubscribe();
    }
  }, [activeChatId]);

  const isOwner = channel.ownerId === currentUser.id || channel.createdBy === currentUser.id;
  const isAdmin = isOwner || channel.adminIds?.includes(currentUser.id) || channel.moderatorIds?.includes(currentUser.id);
  const isSubscribed = channel.memberIds?.includes(currentUser.id) ?? true;

  const inviteCode = channel.inviteCode || generateChannelInviteCode(channel.id);
  const inviteUrl = `https://bharatchat.in/channel/join/${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    triggerConfetti();
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: channel.name,
          text: `Join the official ${channel.name} channel on BharatChat!`,
          url: inviteUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleLeaveChannel = async () => {
    if (confirm('Are you sure you want to unsubscribe from this channel?')) {
      await unsubscribeFromChannel(channel.id);
      navigate('chat_list');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Channel Info"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('channel_feed', channel.id)}
        rightAction={
          isAdmin ? (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              title="Admin Settings"
            >
              <Settings className="w-5 h-5 text-sky-400" />
            </button>
          ) : undefined
        }
      />

      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Banner Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-3.5 shadow-xl">
          <div className="relative">
            <img
              src={channel.avatar || channel.photo || 'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80'}
              alt={channel.name}
              className="w-24 h-24 rounded-3xl object-cover ring-2 ring-sky-500/40 shadow-xl"
            />
            {channel.channelType === 'private' ? (
              <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-indigo-600 text-white shadow">
                <Lock className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sky-600 text-white shadow">
                <Globe className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center justify-center space-x-1.5">
              <span>{channel.name}</span>
              <span className="text-sky-400 text-sm">✓</span>
            </h2>
            {channel.username && (
              <p className="text-xs text-sky-400 font-mono mt-0.5">
                @{channel.username}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
            {channel.description || 'Official space mission updates, live feeds and scientific announcements.'}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-4 pt-1 text-xs text-slate-400 font-mono">
            <div>
              <span className="font-bold text-white">
                {(channel.subscribersCount || channel.membersCount || 845000).toLocaleString()}
              </span>{' '}
              Subscribers
            </div>
            <span>•</span>
            <div>
              <span className="font-bold text-white">{channel.category || 'Technology'}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-2.5 pt-2 w-full max-w-xs">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Channel</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <BellOff className="w-4 h-4 text-amber-400" /> : <Bell className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Invite Link Card */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Shareable Invite Link
          </span>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs text-slate-300">
            <span className="truncate pr-2">{inviteUrl}</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-sky-600/20 text-sky-400 hover:bg-sky-600 hover:text-white font-sans text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Rules & Guidelines Card */}
        {channel.rules && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-lg">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Channel Guidelines</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{channel.rules}</p>
          </div>
        )}

        {/* Media / Analytics Shortcuts */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden text-xs shadow-lg">
          <div
            onClick={() => navigate('media_gallery')}
            className="flex items-center justify-between p-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-white">Media & Broadcast Photos</span>
                <p className="text-[10px] text-slate-400">Photos, telemetry graphics, launch releases</p>
              </div>
            </div>
            <span className="text-slate-500">→</span>
          </div>

          <div
            onClick={() => navigate('media_gallery')}
            className="flex items-center justify-between p-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-white">Documents & Whitepapers</span>
                <p className="text-[10px] text-slate-400">Official PDFs, telemetry docs & releases</p>
              </div>
            </div>
            <span className="text-slate-500">→</span>
          </div>

          {isAdmin && (
            <div
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center justify-between p-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-white">Admin Management & Roles</span>
                  <p className="text-[10px] text-slate-400">Manage permissions, invite links & moderators</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-semibold text-[10px]">
                Manage
              </span>
            </div>
          )}
        </div>

        {/* Leave Channel Button */}
        {!isOwner && isSubscribed && (
          <button
            onClick={handleLeaveChannel}
            className="w-full py-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-xs font-bold text-rose-300 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Unsubscribe & Leave Channel</span>
          </button>
        )}
      </div>

      <ChannelAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        channel={channel}
      />
    </div>
  );
};
