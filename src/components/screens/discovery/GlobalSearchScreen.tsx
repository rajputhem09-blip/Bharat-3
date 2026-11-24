import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Search,
  MessageSquare,
  Users,
  Radio,
  ArrowRight,
  X,
  Clock,
  UserCheck,
  ShieldCheck,
  IndianRupee,
} from 'lucide-react';
import { UserProfile } from '../../../types';

export const GlobalSearchScreen: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    chats,
    navigate,
    setActiveChatId,
    searchUsers,
    startDirectChatWithUser,
    searchPublicChannels,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'users' | 'chats' | 'channels'>('all');
  const [searchedUsers, setSearchedUsers] = useState<UserProfile[]>([]);
  const [searchedChannels, setSearchedChannels] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Search users & public channels whenever query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchedUsers([]);
      setSearchedChannels([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const [userResults, channelResults] = await Promise.all([
          searchUsers(searchQuery),
          searchPublicChannels ? searchPublicChannels(searchQuery) : Promise.resolve([]),
        ]);
        setSearchedUsers(userResults);
        setSearchedChannels(channelResults || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredChats = chats.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'chats') return c.type === 'direct' || c.type === 'group';
    if (filterType === 'channels') return c.type === 'channel';
    return true;
  });

  const recentSearches = [
    'ISRO Mission Updates',
    'Priya Sundaram',
    'Gaganyaan',
    'Bengaluru Founders',
    '@priya_sundaram',
    '@rahul_verma',
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Search Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by @username, name, or phone..."
            className="w-full pl-10 pr-8 py-2 rounded-2xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => navigate('chat_list')}
          className="text-xs text-sky-400 font-semibold px-2 py-1 hover:underline"
        >
          Cancel
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {(['all', 'users', 'chats', 'channels'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${
              filterType === t
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results or Recent Searches */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {!searchQuery ? (
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Recent Searches & Suggestions
            </div>
            <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              {recentSearches.map((term, i) => (
                <div
                  key={i}
                  onClick={() => setSearchQuery(term)}
                  className="flex items-center justify-between p-3 hover:bg-slate-850 cursor-pointer text-xs"
                >
                  <div className="flex items-center space-x-2.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{term}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Users section */}
            {(filterType === 'all' || filterType === 'users') && searchedUsers.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Users Found ({searchedUsers.length})</span>
                  {isSearchingUsers && <span className="text-[10px] text-slate-500">Searching...</span>}
                </div>
                <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                  {searchedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-850 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-2xl object-cover"
                          />
                          {u.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-white truncate">{u.name}</h4>
                            {u.isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-sky-300 font-mono">@{u.handle}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.statusQuote}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => startDirectChatWithUser(u)}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all flex items-center space-x-1 ml-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public Channels Discovered Section */}
            {(filterType === 'all' || filterType === 'channels') && searchedChannels.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Public Channels Found ({searchedChannels.length})</span>
                </div>
                <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                  {searchedChannels.map((ch) => (
                    <div
                      key={ch.id}
                      onClick={() => {
                        setActiveChatId(ch.id);
                        navigate('channel_feed', ch.id);
                      }}
                      className="flex items-center justify-between p-3 hover:bg-slate-850 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <img
                          src={ch.avatar || ch.photo || 'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80'}
                          alt={ch.name}
                          className="w-10 h-10 rounded-2xl object-cover ring-1 ring-amber-500/30"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                            <span className="text-sky-400 text-xs">✓</span>
                          </div>
                          <p className="text-[11px] text-amber-400 font-mono">
                            {ch.username ? `@${ch.username}` : `${ch.category || 'Channel'}`}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {(ch.subscribersCount || ch.membersCount || 1).toLocaleString()} Subscribers
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChatId(ch.id);
                          navigate('channel_feed', ch.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center space-x-1 ml-2 border border-amber-500/30"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Chats & Channels */}
            {(filterType === 'all' || filterType === 'chats' || filterType === 'channels') && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Conversations & My Channels ({filteredChats.length})
                </div>
                {filteredChats.length === 0 && searchedUsers.length === 0 && searchedChannels.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No results found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          if (chat.type === 'channel') navigate('channel_feed', chat.id);
                          else if (chat.type === 'group') navigate('group_chat', chat.id);
                          else navigate('private_chat', chat.id);
                        }}
                        className="flex items-center justify-between p-3 hover:bg-slate-850 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={chat.avatar}
                            alt={chat.name}
                            className="w-10 h-10 rounded-2xl object-cover"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white">{chat.name}</h4>
                            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {chat.lastMessage}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">{chat.lastMessageTime}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
