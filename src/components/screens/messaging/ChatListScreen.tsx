import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { BottomNav } from '../../common/BottomNav';
import {
  Search,
  Pin,
  CheckCheck,
  Plus,
  Users,
  Radio,
  Sparkles,
  Zap,
  Archive,
  Star,
  ShieldCheck,
  CreditCard,
  Link as LinkIcon,
  MessageSquare,
  X,
} from 'lucide-react';
import { ChatItem } from '../../../types';
import { JoinGroupModal } from './JoinGroupModal';
import { CreateChannelModal } from './CreateChannelModal';

export const ChatListScreen: React.FC = () => {
  const {
    chats,
    navigate,
    stories,
    openStory,
    setActiveChatId,
    currentUser,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'direct' | 'groups' | 'channels' | 'unread' | 'pay'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'direct', label: 'Direct' },
    { id: 'groups', label: 'Groups' },
    { id: 'channels', label: 'Channels' },
    { id: 'unread', label: 'Unread' },
    { id: 'pay', label: 'BharatPay 💸' },
  ];

  const filteredChats = chats.filter((chat) => {
    if (chat.isArchived) return false;

    // Filter type
    if (activeFilter === 'direct' && chat.type !== 'direct') return false;
    if (activeFilter === 'groups' && chat.type !== 'group') return false;
    if (activeFilter === 'channels' && chat.type !== 'channel') return false;
    if (activeFilter === 'unread' && (!chat.unreadCount || chat.unreadCount === 0)) return false;
    if (activeFilter === 'pay' && !chat.lastMessage.includes('₹') && !chat.lastMessage.includes('BharatPay')) return false;

    // Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        chat.name.toLowerCase().includes(q) ||
        chat.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleChatClick = (chat: ChatItem) => {
    setActiveChatId(chat.id);
    if (chat.type === 'channel') {
      navigate('channel_feed', chat.id);
    } else if (chat.type === 'group') {
      navigate('group_chat', chat.id);
    } else if (chat.type === 'ai_bot') {
      navigate('bharat_ai');
    } else {
      navigate('private_chat', chat.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 select-none overflow-hidden">
      <Header
        title="BharatChat"
        subtitle="14+ Indic Languages • E2E Encrypted"
        showSearch={true}
        onSearchClick={() => navigate('global_search')}
        rightAction={
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigate('starred_messages')}
              className="p-2 text-slate-400 hover:text-amber-400 rounded-full"
              title="Starred Messages"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('archived_chats')}
              className="p-2 text-slate-400 hover:text-sky-400 rounded-full"
              title="Archived Chats"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Top Stories Rail */}
      <div className="py-2.5 px-4 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar flex items-center space-x-3.5">
        {/* Add My Story */}
        <div
          onClick={() => navigate('status_stories')}
          className="flex flex-col items-center space-y-1 cursor-pointer shrink-0"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt="My Story"
              className="w-13 h-13 rounded-full object-cover p-0.5 border border-slate-700"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold border-2 border-slate-900">
              +
            </div>
          </div>
          <span className="text-[10px] text-slate-400 max-w-[54px] truncate">My Status</span>
        </div>

        {/* Other Stories */}
        {stories.filter(s => s.userId !== currentUser.id).map((st) => (
          <div
            key={st.id}
            onClick={() => openStory(st)}
            className="flex flex-col items-center space-y-1 cursor-pointer shrink-0"
          >
            <div className={`p-0.5 rounded-full ${st.hasUnseen ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-sky-500' : 'bg-slate-700'}`}>
              <img
                src={st.userAvatar}
                alt={st.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-950"
              />
            </div>
            <span className="text-[10px] text-slate-300 max-w-[54px] truncate">{st.userName}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pt-2.5 pb-1 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === tab.id
                ? 'bg-sky-600 text-white shadow-sm font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <p className="text-sm">No conversations found for this filter.</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="text-xs text-sky-400 hover:underline font-medium"
            >
              Show all chats
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              className="flex items-center px-4 py-3.5 hover:bg-slate-850 cursor-pointer transition-colors group relative"
            >
              {/* Avatar + presence badge */}
              <div className="relative shrink-0 mr-3.5">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/10 group-hover:scale-102 transition-transform"
                />
                {chat.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                )}
                {chat.type === 'group' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">
                    <Users className="w-2.5 h-2.5" />
                  </div>
                )}
                {chat.type === 'channel' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px]">
                    <Radio className="w-2.5 h-2.5" />
                  </div>
                )}
                {chat.type === 'ai_bot' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white flex items-center justify-center text-[9px]">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              {/* Chat Title and Preview */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {chat.name}
                    </h3>
                    {chat.isVerified && (
                      <span className="text-[10px] text-sky-400 font-bold" title="Verified Bharat Entity">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                    {chat.lastMessageTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 truncate pr-2 flex items-center space-x-1">
                    {chat.lastMessage.includes('₹') && (
                      <CreditCard className="w-3 h-3 text-emerald-400 inline shrink-0 mr-1" />
                    )}
                    <span className="truncate">{chat.lastMessage}</span>
                  </p>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {chat.isPinned && (
                      <Pin className="w-3 h-3 text-sky-400 rotate-45" />
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for New Group / Message / Join */}
      <div className="absolute bottom-18 right-5 z-30 flex flex-col items-end space-y-2">
        {isFabMenuOpen && (
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-1 text-xs mb-2 animate-scale-up">
            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                setIsCreateChannelOpen(true);
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-white"
            >
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Create New Channel</span>
            </button>

            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                navigate('create_group');
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-white"
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Create New Group</span>
            </button>

            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                setIsJoinGroupOpen(true);
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-white"
            >
              <LinkIcon className="w-4 h-4 text-emerald-400" />
              <span>Join via Invite Link</span>
            </button>

            <button
              onClick={() => {
                setIsFabMenuOpen(false);
                navigate('contacts_list');
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-white"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>New Direct Chat</span>
            </button>
          </div>
        )}

        <button
          id="btn-fab-create-group"
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className={`w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-xl shadow-sky-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isFabMenuOpen ? 'rotate-45' : ''
          }`}
          title="New Group or Chat"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
      />

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />

      <BottomNav />
    </div>
  );
};
