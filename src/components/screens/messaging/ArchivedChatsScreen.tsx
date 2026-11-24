import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { Archive, ArrowRight, ShieldCheck, Undo2 } from 'lucide-react';

export const ArchivedChatsScreen: React.FC = () => {
  const { chats, navigate, setActiveChatId } = useApp();
  const archivedChats = chats.filter((c) => c.isArchived);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Archived Chats"
        subtitle="Muted conversations kept out of primary inbox"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('chat_list')}
      />

      <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 text-xs text-slate-400 flex items-start space-x-2">
        <Archive className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <span>
          Archived chats will remain here and won't trigger notification badges on your main home screen unless mentioned directly.
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {archivedChats.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Archive className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm">No archived chats.</p>
          </div>
        ) : (
          archivedChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                navigate('private_chat', chat.id);
              }}
              className="flex items-center justify-between p-4 hover:bg-slate-900 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <img src={chat.avatar} alt={chat.name} className="w-11 h-11 rounded-2xl object-cover" />
                <div>
                  <h4 className="text-xs font-semibold text-white">{chat.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{chat.lastMessage}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500">{chat.lastMessageTime}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
