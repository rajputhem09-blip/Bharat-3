import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  X,
  Shield,
  ShieldCheck,
  Users,
  Settings,
  Link as LinkIcon,
  Copy,
  RefreshCw,
  Trash2,
  UserPlus,
  UserMinus,
  Check,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ChatItem } from '../../../types';
import {
  updateChannelInfo,
  updateChannelMemberRole,
  generateChannelInviteCode,
} from '../../../services/channelService';

interface ChannelAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: ChatItem;
}

export const ChannelAdminModal: React.FC<ChannelAdminModalProps> = ({
  isOpen,
  onClose,
  channel,
}) => {
  const { currentUser, triggerConfetti } = useApp();

  const [activeTab, setActiveTab] = useState<'settings' | 'admins' | 'subscribers' | 'invites'>('settings');

  // Form states
  const [name, setName] = useState(channel.name || '');
  const [username, setUsername] = useState(channel.username || '');
  const [description, setDescription] = useState(channel.description || '');
  const [category, setCategory] = useState(channel.category || 'Technology & Startups');
  const [rules, setRules] = useState(channel.rules || '');
  const [isCommentsEnabled, setIsCommentsEnabled] = useState(channel.isCommentsEnabled !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const isOwner = channel.ownerId === currentUser.id || channel.createdBy === currentUser.id;
  const isAdmin = isOwner || channel.adminIds?.includes(currentUser.id);

  const inviteCode = channel.inviteCode || generateChannelInviteCode(channel.id);
  const inviteUrl = `https://bharatchat.in/channel/join/${inviteCode}`;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setStatusMsg(null);

    try {
      await updateChannelInfo(
        channel.id,
        {
          name: name.trim(),
          username: username.trim(),
          description: description.trim(),
          category,
          rules: rules.trim(),
          isCommentsEnabled,
        },
        currentUser
      );

      setStatusMsg({ type: 'success', text: 'Channel settings updated successfully!' });
      triggerConfetti();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update channel settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: 'admin' | 'moderator' | 'subscriber') => {
    try {
      await updateChannelMemberRole(channel.id, targetUserId, newRole, currentUser);
      setStatusMsg({ type: 'success', text: `Role updated for subscriber.` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update role.' });
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Channel Management</h3>
              <p className="text-[11px] text-slate-400">Manage settings, admins and subscriber privileges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3">
          {[
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'admins', label: 'Admins', icon: ShieldCheck },
            { id: 'subscribers', label: 'Members', icon: Users },
            { id: 'invites', label: 'Invite Link', icon: LinkIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setStatusMsg(null);
                }}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mx-4 mt-3 p-3 rounded-2xl text-xs flex items-center space-x-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-800 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveInfo} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Username Handle (@)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Description / Bio
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Channel Rules & Guidelines
                </label>
                <input
                  type="text"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Enable Comments & Discussions</h4>
                    <p className="text-[10px] text-slate-400">Subscribers can reply to posts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCommentsEnabled(!isCommentsEnabled)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${
                    isCommentsEnabled ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      isCommentsEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSaving || !isAdmin}
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
              </button>
            </form>
          )}

          {activeTab === 'admins' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Channel administrators can publish posts, moderate discussions, and manage settings.
              </p>

              <div className="space-y-2">
                {Object.entries(channel.memberProfiles || {}).map(([uid, rawProf]) => {
                  const prof = rawProf as any;
                  const isThisOwner = uid === channel.ownerId;
                  const isThisAdmin = channel.adminIds?.includes(uid);
                  const isThisMod = channel.moderatorIds?.includes(uid);

                  return (
                    <div
                      key={uid}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={prof?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={prof?.name || 'User'}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white">{prof?.name || 'User'}</span>
                            {isThisOwner && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                Owner
                              </span>
                            )}
                            {isThisAdmin && !isThisOwner && (
                              <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[9px] font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{prof?.handle || `@user_${uid.slice(0, 5)}`}</span>
                        </div>
                      </div>

                      {isOwner && !isThisOwner && (
                        <div className="flex items-center space-x-1">
                          {isThisAdmin ? (
                            <button
                              onClick={() => handleRoleChange(uid, 'subscriber')}
                              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-[10px] font-semibold transition-colors"
                            >
                              Demote
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(uid, 'admin')}
                              className="px-2.5 py-1 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-600/40 text-[10px] font-semibold hover:bg-sky-600 hover:text-white transition-colors"
                            >
                              Promote to Admin
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'subscribers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Total Subscribers ({channel.subscribersCount || channel.memberIds?.length || 1})
                </span>
              </div>

              <div className="space-y-2">
                {Object.entries(channel.memberProfiles || {}).map(([uid, rawProf]) => {
                  const prof = rawProf as any;
                  return (
                    <div
                      key={uid}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={prof?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={prof?.name || 'User'}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <div>
                          <span className="text-xs font-semibold text-white">{prof?.name || 'User'}</span>
                          <div className="text-[10px] text-slate-400 font-mono">{prof?.handle || `@user_${uid.slice(0, 5)}`}</div>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-500">Subscribed</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'invites' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Channel Invite Link
                </span>
                <p className="text-[11px] text-slate-400">
                  Anyone with this link can join and subscribe to this channel.
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between font-mono text-xs text-slate-200 overflow-hidden">
                  <span className="truncate pr-2">{inviteUrl}</span>
                  <button
                    onClick={copyInvite}
                    className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-sans text-xs font-semibold flex items-center space-x-1 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
