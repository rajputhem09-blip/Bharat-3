import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { CONTACTS_DATA } from '../../../data/mockData';
import {
  UserPlus,
  QrCode,
  Search,
  Phone,
  Video,
  IndianRupee,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const ContactsScreen: React.FC = () => {
  const { navigate, startDirectChatWithUser, startCall } = useApp();
  const [search, setSearch] = useState('');

  const filteredContacts = CONTACTS_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.upiId && c.upiId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Contacts & Friends"
        subtitle={`${CONTACTS_DATA.length} Verified BharatChat Users`}
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('chat_list')}
        rightAction={
          <button
            onClick={() => navigate('qr_scanner')}
            className="p-2 text-sky-400 hover:bg-sky-950/40 rounded-full"
            title="Scan QR Code"
          >
            <QrCode className="w-5 h-5" />
          </button>
        }
      />

      {/* Search Input */}
      <div className="p-3 bg-slate-900 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or mobile number..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Invite & Sync Cards */}
      <div className="p-3 grid grid-cols-2 gap-2 bg-slate-900/60 border-b border-slate-800/80 text-xs">
        <button
          onClick={() => navigate('create_group')}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center space-x-2 font-semibold text-sky-400"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Group</span>
        </button>
        <button
          onClick={() => navigate('qr_scanner')}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center space-x-2 font-semibold text-emerald-400"
        >
          <QrCode className="w-4 h-4" />
          <span>My QR Card</span>
        </button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70 p-2">
        {filteredContacts.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900 transition-colors"
          >
            <div
              onClick={() => {
                startDirectChatWithUser({
                  id: c.id,
                  name: c.name,
                  phone: c.phone,
                  handle: c.name.toLowerCase().replace(/\s+/g, '_'),
                  avatar: c.avatar,
                  statusQuote: 'BharatChat verified user',
                  isOnline: c.isOnline,
                  isVerified: true,
                  upiId: c.upiId,
                  locale: 'en',
                });
              }}
              className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
            >
              <div className="relative">
                <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-2xl object-cover" />
                {c.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1">
                  <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-400">{c.phone}</p>
                <span className="text-[9px] font-mono text-emerald-400">{c.upiId}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  startCall('voice', c.name, c.avatar, c.id);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  startCall('video', c.name, c.avatar, c.id);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-sky-400 hover:bg-sky-950/40"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
