import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { UserX, ShieldAlert, Plus, Unlock } from 'lucide-react';

export const BlockedUsersScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [blockedList, setBlockedList] = useState([
    { id: 'b1', name: 'Unknown Telemarketer', phone: '+91 1800-419-8888', date: 'Blocked on Aug 12' },
  ]);

  const unblock = (id: string) => {
    setBlockedList(blockedList.filter((b) => b.id !== id));
    triggerConfetti();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Blocked Users & Spam"
        subtitle="Manage restricted numbers and scam filters"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('settings_hub')}
      />

      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center space-x-2 text-xs text-rose-400">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          Blocked contacts cannot call you or see your online status or status stories.
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {blockedList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <UserX className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm">No blocked contacts.</p>
          </div>
        ) : (
          blockedList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md"
            >
              <div>
                <h4 className="text-xs font-bold text-white">{item.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{item.phone}</p>
                <span className="text-[9px] text-slate-500">{item.date}</span>
              </div>

              <button
                onClick={() => unblock(item.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center space-x-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unblock</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
