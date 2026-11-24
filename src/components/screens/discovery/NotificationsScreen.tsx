import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  Bell,
  Check,
  Radio,
  IndianRupee,
  PhoneMissed,
  MessageCircle,
  Users,
  Trash2,
} from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { notifications, markNotificationRead, clearAllNotifications, navigate } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Activity Notifications"
        subtitle="Mentions, payments, broadcasts & security"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('chat_list')}
        rightAction={
          <button
            onClick={clearAllNotifications}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-full"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70 p-2">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm">You are all caught up!</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.type === 'PAYMENT') navigate('passbook');
                else if (n.type === 'CHANNEL') navigate('channel_feed');
                else navigate('private_chat');
              }}
              className={`p-3.5 rounded-2xl flex items-start space-x-3 transition-colors cursor-pointer ${
                !n.isRead ? 'bg-slate-900/90 hover:bg-slate-850' : 'hover:bg-slate-900/40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.type === 'PAYMENT'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : n.type === 'CHANNEL'
                    ? 'bg-sky-950 text-sky-400 border border-sky-800/50'
                    : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                }`}
              >
                {n.type === 'PAYMENT' ? (
                  <IndianRupee className="w-5 h-5" />
                ) : n.type === 'CHANNEL' ? (
                  <Radio className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{n.body}</p>
              </div>

              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
