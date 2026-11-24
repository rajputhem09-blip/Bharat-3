import React, { useState, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { CONTACTS_DATA } from '../../../data/mockData';
import {
  Users,
  Check,
  Camera,
  Shield,
  ArrowRight,
  X,
  Search,
  Lock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { GroupPermissions, UserProfile } from '../../../types';

export const CreateGroupScreen: React.FC = () => {
  const { navigate, createNewGroupWithAdmin, triggerConfetti } = useApp();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['c2', 'c3']);
  const [contactSearch, setContactSearch] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80'
  );
  const [isAnnouncementMode, setIsAnnouncementMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
  ];

  const toggleSelect = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((c) => c !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setAvatarUrl(tempUrl);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedProfiles: UserProfile[] = selectedContacts.map((cid) => {
        const contact = CONTACTS_DATA.find((c) => c.id === cid);
        return {
          id: cid,
          name: contact?.name || 'BharatChat Member',
          handle: `@${contact?.name.toLowerCase().replace(/\s+/g, '_') || cid}`,
          avatar: contact?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          phone: contact?.phone,
        };
      });

      const initialPermissions: GroupPermissions = {
        sendMessages: isAnnouncementMode ? 'admins_only' : 'all',
        sendMedia: isAnnouncementMode ? 'admins_only' : 'all',
        sendFiles: isAnnouncementMode ? 'admins_only' : 'all',
        sendVoice: isAnnouncementMode ? 'admins_only' : 'all',
        addMembers: 'all',
        pinMessages: 'all',
        editGroupInfo: 'admins_only',
      };

      await createNewGroupWithAdmin(
        groupName.trim(),
        groupDescription.trim(),
        avatarUrl,
        selectedProfiles,
        initialPermissions
      );
    } catch (error) {
      console.error('Group creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredContacts = CONTACTS_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.phone.includes(contactSearch)
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Create New Group"
        subtitle={`${selectedContacts.length} members selected`}
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('chat_list')}
      />

      <form onSubmit={handleCreate} className="flex-1 flex flex-col justify-between overflow-hidden">
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Group Identity Card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer group shrink-0 ring-2 ring-sky-500/30"
              >
                <img src={avatarUrl} alt="group avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />

              <div className="flex-1">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name (e.g. Goa Trip 🏖️)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
                  required
                />
                <input
                  type="text"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Topic / Purpose (e.g. Planning & updates)"
                  className="w-full px-3.5 py-1.5 mt-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Quick Preset Avatars */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Presets:</span>
              {presetAvatars.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-7 h-7 rounded-full overflow-hidden border transition-transform ${
                    avatarUrl === url ? 'ring-2 ring-sky-500 scale-110' : 'border-slate-700 opacity-60'
                  }`}
                >
                  <img src={url} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Group Permission Mode Setting */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Group Messaging Mode</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAnnouncementMode(!isAnnouncementMode)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  isAnnouncementMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isAnnouncementMode ? 'Broadcast / Admins Only' : 'Open Discussion'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {isAnnouncementMode
                ? 'Only admins can post messages. Great for notices, newsletters, and announcements.'
                : 'All members can send messages, media, and voice notes freely.'}
            </p>
          </div>

          {/* Selected Member Chips */}
          {selectedContacts.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Added Members ({selectedContacts.length})
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
                {selectedContacts.map((cid) => {
                  const contact = CONTACTS_DATA.find((c) => c.id === cid);
                  if (!contact) return null;
                  return (
                    <div
                      key={cid}
                      onClick={() => toggleSelect(cid)}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-white shrink-0 cursor-pointer hover:bg-rose-950 hover:border-rose-700 transition-colors"
                    >
                      <img src={contact.avatar} alt={contact.name} className="w-4 h-4 rounded-full object-cover" />
                      <span className="max-w-[80px] truncate">{contact.name.split(' ')[0]}</span>
                      <X className="w-3 h-3 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Picker List with Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Contacts from Address Book
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search contacts by name or phone..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
              {filteredContacts.map((c) => {
                const isSelected = selectedContacts.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleSelect(c.id)}
                    className="flex items-center justify-between p-3 hover:bg-slate-850 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <h4 className="text-xs font-semibold text-white">{c.name}</h4>
                        <p className="text-[10px] text-slate-400">{c.phone}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <button
            id="btn-create-group-submit"
            type="submit"
            disabled={!groupName.trim() || isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
          >
            <span>{isSubmitting ? 'Creating Group...' : 'Create Group & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
