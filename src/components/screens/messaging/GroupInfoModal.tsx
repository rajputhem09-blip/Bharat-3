import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  X,
  Users,
  Shield,
  Crown,
  Star,
  Settings,
  Link as LinkIcon,
  Copy,
  Check,
  RefreshCw,
  Slash,
  UserPlus,
  UserMinus,
  VolumeX,
  Volume2,
  Ban,
  Trash2,
  LogOut,
  Edit2,
  Search,
  CheckCircle,
  QrCode,
  Share2,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Lock,
  Unlock,
} from 'lucide-react';
import { ChatItem, GroupMember, GroupPermissions, GroupRole, UserProfile } from '../../../types';
import { CONTACTS_DATA } from '../../../data/mockData';

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: ChatItem;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  isOpen,
  onClose,
  group,
}) => {
  const {
    currentUser,
    updateGroupInfo,
    updateGroupPermissions,
    addMembersToGroup,
    removeMemberFromGroup,
    updateMemberRole,
    toggleMuteMember,
    toggleBanMember,
    manageGroupInviteLink,
    leaveGroup,
    deleteGroup,
    navigate,
    triggerConfetti,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'members' | 'permissions' | 'invite' | 'settings' | 'banned'>('members');
  const [memberSearch, setMemberSearch] = useState('');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [editDescription, setEditDescription] = useState(group.description || group.topic || '');
  const [editTopic, setEditTopic] = useState(group.topic || '');
  const [editAvatar, setEditAvatar] = useState(group.avatar);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddingMemberModal, setIsAddingMemberModal] = useState(false);
  const [selectedNewMemberIds, setSelectedNewMemberIds] = useState<string[]>([]);
  const [actionMenuMemberId, setActionMenuMemberId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine current user's role in this group
  const isOwner = group.ownerId === currentUser.id || group.createdBy === currentUser.id;
  const isAdmin = isOwner || (group.adminIds && group.adminIds.includes(currentUser.id));
  const isModerator = isAdmin || (group.moderatorIds && group.moderatorIds.includes(currentUser.id));
  const currentMemberProfile = group.memberProfiles?.[currentUser.id];
  const userRole: GroupRole = isOwner ? 'owner' : isAdmin ? 'admin' : isModerator ? 'moderator' : (currentMemberProfile?.role || 'member');

  // Build member list from memberIds & memberProfiles & mock fallback
  const rawMemberIds = group.memberIds || [currentUser.id];
  const memberList: GroupMember[] = rawMemberIds.map((id) => {
    const profile = group.memberProfiles?.[id];
    const contact = CONTACTS_DATA.find((c) => c.id === id);
    let role: GroupRole = 'member';
    if (id === group.ownerId || id === group.createdBy) role = 'owner';
    else if (group.adminIds?.includes(id)) role = 'admin';
    else if (group.moderatorIds?.includes(id)) role = 'moderator';

    return {
      id,
      name: id === currentUser.id ? `${currentUser.name} (You)` : (profile?.name || contact?.name || 'BharatChat Member'),
      handle: profile?.handle || (contact ? `@${contact.name.toLowerCase().replace(/\s+/g, '_')}` : `@user_${id.slice(0, 5)}`),
      avatar: profile?.avatar || contact?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: profile?.phone || contact?.phone,
      role: profile?.role || role,
      isMuted: group.mutedUserIds?.includes(id) || profile?.isMuted,
      isOnline: id === currentUser.id ? true : Math.random() > 0.4,
    };
  });

  const filteredMembers = memberList.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.handle.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const bannedMembers = (group.bannedUserIds || []).map((id) => {
    const contact = CONTACTS_DATA.find((c) => c.id === id);
    return {
      id,
      name: contact?.name || `Banned User (${id.slice(0, 6)})`,
      handle: contact ? `@${contact.name.toLowerCase().replace(/\s+/g, '_')}` : '@banned',
      avatar: contact?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };
  });

  const permissions: GroupPermissions = group.permissions || {
    sendMessages: 'all',
    sendMedia: 'all',
    sendFiles: 'all',
    sendVoice: 'all',
    addMembers: 'all',
    pinMessages: 'all',
    editGroupInfo: 'admins_only',
  };

  const inviteUrl = group.inviteCode
    ? `https://bharatchat.in/join/${group.inviteCode}`
    : `https://bharatchat.in/join/bharat_${group.id.slice(0, 8)}`;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await updateGroupInfo(group.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      topic: editTopic.trim() || editDescription.trim(),
      avatar: editAvatar,
    });
    setIsEditingInfo(false);
    triggerConfetti();
  };

  const handleTogglePermission = async (
    key: keyof GroupPermissions,
    value: 'all' | 'admins_only'
  ) => {
    if (!isAdmin) return;
    const updated = { ...permissions, [key]: value };
    await updateGroupPermissions(group.id, updated);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleResetInvite = async () => {
    if (!isAdmin) return;
    await manageGroupInviteLink(group.id, 'reset');
    triggerConfetti();
  };

  const handleRevokeInvite = async () => {
    if (!isAdmin) return;
    if (confirm('Revoke this invite link? Existing link will no longer allow new members to join.')) {
      await manageGroupInviteLink(group.id, 'revoke');
    }
  };

  const handleAddSelectedMembers = async () => {
    if (selectedNewMemberIds.length === 0) return;
    const profilesToAdd: UserProfile[] = selectedNewMemberIds.map((cid) => {
      const contact = CONTACTS_DATA.find((c) => c.id === cid);
      return {
        id: cid,
        name: contact?.name || 'Member',
        handle: contact ? `@${contact.name.toLowerCase().replace(/\s+/g, '_')}` : `@user_${cid.slice(0, 5)}`,
        avatar: contact?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: contact?.phone,
      };
    });
    await addMembersToGroup(group.id, profilesToAdd);
    setSelectedNewMemberIds([]);
    setIsAddingMemberModal(false);
    triggerConfetti();
  };

  const availableContactsToAdd = CONTACTS_DATA.filter(
    (c) => !rawMemberIds.includes(c.id) && !group.bannedUserIds?.includes(c.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">Group Administration & Info</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Profile Hero */}
        <div className="p-5 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800 flex flex-col items-center text-center relative">
          {isAdmin && !isEditingInfo && (
            <button
              onClick={() => setIsEditingInfo(true)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs flex items-center space-x-1"
              title="Edit Group Info"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Edit</span>
            </button>
          )}

          {!isEditingInfo ? (
            <>
              <div className="relative mb-3">
                <img
                  src={group.avatar}
                  alt={group.name}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-sky-500/20 shadow-xl"
                />
                {isOwner && (
                  <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-full shadow">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-white flex items-center justify-center space-x-2">
                <span>{group.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {group.topic || group.description || 'BharatChat Community Group'}
              </p>

              <div className="flex items-center space-x-3 mt-3 text-xs text-slate-300">
                <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 flex items-center space-x-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>{memberList.length} Members</span>
                </span>

                <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 flex items-center space-x-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="capitalize">{userRole}</span>
                </span>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveInfo} className="w-full space-y-3 pt-2 text-left">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Group Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Topic / Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Group Avatar URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 min-w-[90px] py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'members'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members ({memberList.length})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex-1 min-w-[90px] py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
                activeTab === 'permissions'
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Permissions</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 min-w-[80px] py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'invite'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>

          {isAdmin && bannedMembers.length > 0 && (
            <button
              onClick={() => setActiveTab('banned')}
              className={`flex-1 min-w-[80px] py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
                activeTab === 'banned'
                  ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Banned ({bannedMembers.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[80px] py-2.5 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: MEMBERS MANAGEMENT */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between space-x-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {(isAdmin || permissions.addMembers === 'all') && (
                  <button
                    onClick={() => setIsAddingMemberModal(true)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                )}
              </div>

              {/* Members List */}
              <div className="divide-y divide-slate-800 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                {filteredMembers.map((member) => {
                  const isMemberOwner = member.role === 'owner';
                  const isMemberAdmin = member.role === 'admin';
                  const isMemberMod = member.role === 'moderator';
                  const canManageThisUser =
                    isAdmin &&
                    member.id !== currentUser.id &&
                    !isMemberOwner &&
                    (isOwner || !isMemberAdmin);

                  return (
                    <div
                      key={member.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-900/60 transition-colors relative"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="relative">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                          />
                          {member.isOnline && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 absolute bottom-0 right-0" />
                          )}
                        </div>

                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {member.name}
                            </span>
                            {isMemberOwner && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-0.5">
                                <Crown className="w-2.5 h-2.5 mr-0.5 fill-current" />
                                <span>Owner</span>
                              </span>
                            )}
                            {isMemberAdmin && !isMemberOwner && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center space-x-0.5">
                                <Shield className="w-2.5 h-2.5 mr-0.5" />
                                <span>Admin</span>
                              </span>
                            )}
                            {isMemberMod && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-0.5">
                                <Star className="w-2.5 h-2.5 mr-0.5" />
                                <span>Mod</span>
                              </span>
                            )}
                            {member.isMuted && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-0.5">
                                <VolumeX className="w-2.5 h-2.5 mr-0.5" />
                                <span>Muted</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{member.handle}</span>
                        </div>
                      </div>

                      {/* Member Action Menu Trigger */}
                      {canManageThisUser && (
                        <div>
                          <button
                            onClick={() =>
                              setActionMenuMemberId(
                                actionMenuMemberId === member.id ? null : member.id
                              )
                            }
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            Manage
                          </button>

                          {/* Dropdown Menu */}
                          {actionMenuMemberId === member.id && (
                            <div className="absolute right-3 top-12 z-20 w-48 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 space-y-1 text-xs text-slate-200">
                              {/* Role management */}
                              {isOwner && !isMemberAdmin && (
                                <button
                                  onClick={() => {
                                    updateMemberRole(group.id, member.id, member.name, 'admin');
                                    setActionMenuMemberId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2 text-sky-400"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  <span>Make Group Admin</span>
                                </button>
                              )}

                              {isOwner && isMemberAdmin && !isMemberOwner && (
                                <button
                                  onClick={() => {
                                    updateMemberRole(group.id, member.id, member.name, 'member');
                                    setActionMenuMemberId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2 text-amber-400"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  <span>Dismiss as Admin</span>
                                </button>
                              )}

                              {!isMemberMod ? (
                                <button
                                  onClick={() => {
                                    updateMemberRole(group.id, member.id, member.name, 'moderator');
                                    setActionMenuMemberId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2 text-purple-400"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  <span>Make Moderator</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    updateMemberRole(group.id, member.id, member.name, 'member');
                                    setActionMenuMemberId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2 text-slate-300"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  <span>Remove Moderator</span>
                                </button>
                              )}

                              {/* Mute/Unmute */}
                              <button
                                onClick={() => {
                                  toggleMuteMember(group.id, member.id, member.name, !member.isMuted);
                                  setActionMenuMemberId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2 text-amber-300"
                              >
                                {member.isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                                <span>{member.isMuted ? 'Unmute Member' : 'Mute in Group'}</span>
                              </button>

                              {/* Remove */}
                              <button
                                onClick={() => {
                                  if (confirm(`Remove ${member.name} from group?`)) {
                                    removeMemberFromGroup(group.id, member.id, member.name);
                                    setActionMenuMemberId(null);
                                  }
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-950 text-rose-400 flex items-center space-x-2"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                                <span>Remove from Group</span>
                              </button>

                              {/* Ban */}
                              <button
                                onClick={() => {
                                  if (confirm(`Ban ${member.name} from this group?`)) {
                                    toggleBanMember(group.id, member.id, member.name, true);
                                    setActionMenuMemberId(null);
                                  }
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-950 text-rose-400 flex items-center space-x-2"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Ban User</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GROUP PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-2xl text-xs text-sky-200">
                <p className="font-semibold">Role-Based Permission Controls</p>
                <p className="text-[11px] text-sky-300/80 mt-0.5">
                  Configure what regular members are permitted to do in this group. Admins and Owner always retain full authority.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'sendMessages' as keyof GroupPermissions,
                    title: 'Send Messages',
                    desc: 'Allow all members or restrict to announcement mode (admins only)',
                  },
                  {
                    key: 'sendMedia' as keyof GroupPermissions,
                    title: 'Send Photos & Videos',
                    desc: 'Allow members to share photos and video media',
                  },
                  {
                    key: 'sendFiles' as keyof GroupPermissions,
                    title: 'Send Files & Documents',
                    desc: 'Allow members to attach PDF and documents',
                  },
                  {
                    key: 'sendVoice' as keyof GroupPermissions,
                    title: 'Send Voice Notes',
                    desc: 'Allow members to record and send voice messages',
                  },
                  {
                    key: 'addMembers' as keyof GroupPermissions,
                    title: 'Add Other Members',
                    desc: 'Allow any member to add their contacts to the group',
                  },
                  {
                    key: 'pinMessages' as keyof GroupPermissions,
                    title: 'Pin Messages',
                    desc: 'Allow members to pin important chat notices',
                  },
                  {
                    key: 'editGroupInfo' as keyof GroupPermissions,
                    title: 'Edit Group Information',
                    desc: 'Change group subject, icon, and description',
                  },
                ].map((item) => {
                  const isAdminsOnly = permissions[item.key] === 'admins_only';
                  return (
                    <div
                      key={item.key}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="pr-3">
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>

                      <button
                        onClick={() =>
                          handleTogglePermission(
                            item.key,
                            isAdminsOnly ? 'all' : 'admins_only'
                          )
                        }
                        disabled={!isAdmin}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                          isAdminsOnly
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isAdminsOnly ? 'Admins Only' : 'All Members'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: INVITATIONS & QR CODE */}
          {activeTab === 'invite' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Group Invite Link</span>
                  {group.isInviteLinkRevoked && (
                    <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                      Revoked
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-sky-400 truncate pr-2">
                    {inviteUrl}
                  </span>
                  <button
                    onClick={handleCopyInvite}
                    className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* QR Code Graphic Display */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-slate-950 text-center space-y-2">
                  <QrCode className="w-32 h-32 text-slate-900" />
                  <p className="text-[11px] font-bold text-slate-800">
                    Scan with BharatChat to join {group.name}
                  </p>
                </div>

                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={handleCopyInvite}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Invite Link</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={handleResetInvite}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                      title="Reset code"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {isAdmin && !group.isInviteLinkRevoked && (
                  <button
                    onClick={handleRevokeInvite}
                    className="w-full py-2 text-center text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
                  >
                    Revoke Invite Link
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BANNED MEMBERS */}
          {activeTab === 'banned' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Banned users cannot join this group even if they possess an invite link.
              </p>

              <div className="divide-y divide-slate-800 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                {bannedMembers.map((banned) => (
                  <div
                    key={banned.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-900/60"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={banned.avatar} alt={banned.name} className="w-8 h-8 rounded-full object-cover grayscale" />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-300">{banned.name}</h4>
                        <p className="text-[10px] text-rose-400">Banned</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBanMember(group.id, banned.id, banned.name, false)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold"
                    >
                      Unban
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GROUP SETTINGS & DANGER ZONE */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Group Actions</h4>

                <button
                  onClick={async () => {
                    if (confirm(`Are you sure you want to leave "${group.name}"?`)) {
                      await leaveGroup(group.id);
                      onClose();
                    }
                  }}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-400 border border-slate-800 hover:border-rose-800/40 text-xs font-semibold flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Group</span>
                </button>

                {isOwner && (
                  <button
                    onClick={async () => {
                      if (confirm(`Permanently delete group "${group.name}"? This action cannot be undone.`)) {
                        await deleteGroup(group.id);
                        onClose();
                      }
                    }}
                    className="w-full p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800/40 text-xs font-bold flex items-center space-x-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Delete Group (Owner Only)</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal for adding new members from contact book */}
        {isAddingMemberModal && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white">Select Contacts to Add</h4>
              <button
                onClick={() => setIsAddingMemberModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto divide-y divide-slate-800 rounded-xl bg-slate-900 border border-slate-800">
              {availableContactsToAdd.map((contact) => {
                const isSelected = selectedNewMemberIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedNewMemberIds(selectedNewMemberIds.filter((id) => id !== contact.id));
                      } else {
                        setSelectedNewMemberIds([...selectedNewMemberIds, contact.id]);
                      }
                    }}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-800 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={contact.avatar} alt={contact.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs text-white">{contact.name}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
              {availableContactsToAdd.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  All available contacts are already in this group.
                </div>
              )}
            </div>

            <button
              onClick={handleAddSelectedMembers}
              disabled={selectedNewMemberIds.length === 0}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
            >
              Add {selectedNewMemberIds.length} Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
