import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { Star, MessageSquare, ArrowRight, Trash2, Globe, FileText, Image } from 'lucide-react';

export const StarredMessagesScreen: React.FC = () => {
  const { messages, chats, navigate, toggleStarMessage } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'docs' | 'links'>('all');

  // Collect all starred messages across all chats
  const allStarred: { chatId: string; chatName: string; msg: any }[] = [];
  Object.entries(messages).forEach(([chatId, msgs]) => {
    const chat = chats.find((c) => c.id === chatId);
    if (Array.isArray(msgs)) {
      msgs.forEach((m) => {
        if (m.isStarred) {
          allStarred.push({
            chatId,
            chatName: chat?.name || 'Chat',
            msg: m,
          });
        }
      });
    }
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Starred Messages"
        subtitle={`${allStarred.length} Bookmarked Messages`}
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('chat_list')}
      />

      {/* Filter Tabs */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {['all', 'media', 'docs', 'links'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Starred List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {allStarred.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Star className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm">No starred messages yet.</p>
            <p className="text-xs text-slate-600">
              Hover or tap any message in chat and click the Star icon to bookmark it here.
            </p>
          </div>
        ) : (
          allStarred.map(({ chatId, chatName, msg }) => (
            <div
              key={msg.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 truncate max-w-[200px]">
                  {chatName}
                </span>
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => navigate('private_chat', chatId)}
                  className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center space-x-1"
                >
                  <span>Jump to Chat</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => toggleStarMessage(chatId, msg.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
