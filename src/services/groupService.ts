import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ChatItem,
  ChatMessage,
  GroupMember,
  GroupPermissions,
  GroupRole,
  UserProfile,
} from '../types';
import { dispatchGroupNotification } from './notificationService';

// Default Group Permissions
export const DEFAULT_GROUP_PERMISSIONS: GroupPermissions = {
  sendMessages: 'all',
  sendMedia: 'all',
  sendFiles: 'all',
  sendVoice: 'all',
  addMembers: 'all',
  pinMessages: 'all',
  editGroupInfo: 'admins_only',
};

// Generate cryptographically random secure invite code
export const generateGroupInviteCode = (chatId: string): string => {
  const cleanId = chatId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `bharat_${cleanId}_${randomSuffix}`;
};

// 1. Create a Complete Group in Firestore with Owner, Admin, and Permissions
export const createGroupWithAdmin = async (
  name: string,
  description: string,
  avatar: string,
  creator: UserProfile,
  initialMembers: UserProfile[],
  permissions: GroupPermissions = DEFAULT_GROUP_PERMISSIONS
): Promise<string> => {
  try {
    const chatsRef = collection(db, 'chats');
    const newChatRef = doc(chatsRef);
    const chatId = newChatRef.id;

    const allMemberProfiles: Record<string, any> = {
      [creator.id]: {
        name: creator.name,
        avatar: creator.avatar,
        handle: creator.handle,
        phone: creator.phone || '',
        role: 'owner',
        isMuted: false,
        joinedAt: Date.now(),
      },
    };

    const memberIds = [creator.id];
    initialMembers.forEach((m) => {
      if (m.id !== creator.id) {
        memberIds.push(m.id);
        allMemberProfiles[m.id] = {
          name: m.name,
          avatar: m.avatar,
          handle: m.handle,
          phone: m.phone || '',
          role: 'member',
          isMuted: false,
          joinedAt: Date.now(),
        };
      }
    });

    const inviteCode = generateGroupInviteCode(chatId);

    const groupData: Record<string, any> = {
      groupId: chatId,
      type: 'group',
      name: name.trim(),
      description: description.trim() || 'BharatChat Community Group',
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
      photo:
        avatar ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
      topic: description.trim() || 'Welcome to our BharatChat community group!',
      createdBy: creator.id,
      ownerId: creator.id,
      adminIds: [creator.id],
      moderatorIds: [],
      memberIds: memberIds,
      bannedUserIds: [],
      mutedUserIds: [],
      memberCount: memberIds.length,
      inviteSettings: {
        requireAdminApproval: false,
        expiresAt: null,
      },
      permissions: permissions,
      inviteCode: inviteCode,
      isInviteLinkRevoked: false,
      memberProfiles: allMemberProfiles,
      lastMessage: `${creator.name} created the group "${name}"`,
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newChatRef, groupData);

    // Also persist subcollection membership docs for rich queries
    for (const memberId of memberIds) {
      const memberSubDoc = doc(db, 'chats', chatId, 'members', memberId);
      const prof = allMemberProfiles[memberId];
      await setDoc(memberSubDoc, {
        userId: memberId,
        groupId: chatId,
        role: prof.role || 'member',
        joinedAt: prof.joinedAt || Date.now(),
        status: 'active',
      });
    }

    // Add initial system message
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: creator.id,
      senderName: creator.name,
      senderAvatar: creator.avatar,
      text: `🎉 ${creator.name} created the group "${name}". Welcome everyone!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });

    // Notify initial members
    const otherMembers = memberIds.filter((id) => id !== creator.id);
    if (otherMembers.length > 0) {
      await dispatchGroupNotification(otherMembers, {
        type: 'group_invite',
        title: `Added to ${name}`,
        body: `${creator.name} added you to the group "${name}"`,
        groupId: chatId,
        groupName: name,
        senderId: creator.id,
        senderName: creator.name,
      });
    }

    return chatId;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// 2. Real-time Subscription to Group Details
export const subscribeToGroupDetails = (
  chatId: string,
  onUpdate: (groupData: ChatItem | null) => void
) => {
  if (!chatId || chatId.startsWith('chat_')) {
    onUpdate(null);
    return () => {};
  }

  const chatRef = doc(db, 'chats', chatId);
  return onSnapshot(
    chatRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const d = snap.data();
      const groupItem: ChatItem = {
        id: snap.id,
        type: d.type || 'group',
        name: d.name || 'Group',
        avatar: d.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
        lastMessage: d.lastMessage || '',
        lastMessageTime: d.lastMessageTime || 'Just now',
        lastMessageRaw: d.lastMessageRaw || Date.now(),
        unreadCount: 0,
        isPinned: d.isPinned || false,
        isArchived: d.isArchived || false,
        isMuted: d.isMuted || false,
        isOnline: true,
        isVerified: d.isVerified || false,
        membersCount: d.memberIds?.length || 1,
        topic: d.topic || d.description || '',
        description: d.description || '',
        role: d.ownerId === d.createdBy ? 'owner' : (d.adminIds?.length ? 'admin' : 'member'),
        ownerId: d.ownerId || d.createdBy,
        adminIds: d.adminIds || [],
        moderatorIds: d.moderatorIds || [],
        memberIds: d.memberIds || [],
        bannedUserIds: d.bannedUserIds || [],
        mutedUserIds: d.mutedUserIds || [],
        permissions: d.permissions || DEFAULT_GROUP_PERMISSIONS,
        inviteCode: d.inviteCode,
        isInviteLinkRevoked: d.isInviteLinkRevoked || false,
        memberProfiles: d.memberProfiles || {},
      };
      onUpdate(groupItem);
    },
    (err) => {
      console.warn('Group subscription note:', err);
    }
  );
};

// 3. Update Group Info (Name, Description, Topic, Avatar)
export const updateGroupInfoInDb = async (
  chatId: string,
  updates: {
    name?: string;
    description?: string;
    topic?: string;
    avatar?: string;
  },
  editor: UserProfile
) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) throw new Error('Group not found');

    await updateDoc(chatRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      lastMessage: `${editor.name} updated group details`,
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
    });

    // Add system notification
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: editor.id,
      senderName: editor.name,
      senderAvatar: editor.avatar,
      text: `✏️ ${editor.name} updated group information.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating group info:', error);
    throw error;
  }
};

// 4. Update Group Permissions
export const updateGroupPermissionsInDb = async (
  chatId: string,
  newPermissions: GroupPermissions,
  adminUser: UserProfile
) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      permissions: newPermissions,
      updatedAt: serverTimestamp(),
    });

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: adminUser.id,
      senderName: adminUser.name,
      senderAvatar: adminUser.avatar,
      text: `🛡️ ${adminUser.name} updated group permissions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating group permissions:', error);
    throw error;
  }
};

// 5. Add Members to Group
export const addMembersToGroupInDb = async (
  chatId: string,
  newMembers: UserProfile[],
  adder: UserProfile
) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) throw new Error('Group not found');

    const data = snap.data();
    const currentMemberIds: string[] = data.memberIds || [];
    const bannedUserIds: string[] = data.bannedUserIds || [];
    const currentProfiles = data.memberProfiles || {};

    const addedNames: string[] = [];
    const addedUids: string[] = [];
    const updatedMemberIds = [...currentMemberIds];

    for (const member of newMembers) {
      if (bannedUserIds.includes(member.id)) {
        throw new Error(`Cannot add ${member.name} because they are banned from this group.`);
      }

      if (!updatedMemberIds.includes(member.id)) {
        updatedMemberIds.push(member.id);
        addedNames.push(member.name);
        addedUids.push(member.id);
        currentProfiles[member.id] = {
          name: member.name,
          avatar: member.avatar,
          handle: member.handle,
          phone: member.phone || '',
          role: 'member',
          isMuted: false,
          joinedAt: Date.now(),
        };

        // Subcollection sync
        const memRef = doc(db, 'chats', chatId, 'members', member.id);
        await setDoc(memRef, {
          userId: member.id,
          groupId: chatId,
          role: 'member',
          joinedAt: Date.now(),
          status: 'active',
        });
      }
    }

    if (addedNames.length === 0) return;

    await updateDoc(chatRef, {
      memberIds: updatedMemberIds,
      memberCount: updatedMemberIds.length,
      memberProfiles: currentProfiles,
      updatedAt: serverTimestamp(),
      lastMessage: `${adder.name} added ${addedNames.join(', ')}`,
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
    });

    // Post system message
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: adder.id,
      senderName: adder.name,
      senderAvatar: adder.avatar,
      text: `👋 ${adder.name} added ${addedNames.join(', ')} to the group.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });

    // Dispatch notification
    await dispatchGroupNotification(addedUids, {
      type: 'group_invite',
      title: `Added to ${data.name || 'Group'}`,
      body: `${adder.name} added you to "${data.name || 'Group'}"`,
      groupId: chatId,
      groupName: data.name || 'Group',
      senderId: adder.id,
      senderName: adder.name,
    });
  } catch (error) {
    console.error('Error adding members to group:', error);
    throw error;
  }
};

// 6. Remove/Kick Member from Group
export const removeMemberFromGroupInDb = async (
  chatId: string,
  targetUserId: string,
  targetUserName: string,
  adminUser: UserProfile
) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) throw new Error('Group not found');

    const data = snap.data();
    if (data.ownerId === targetUserId) {
      throw new Error('The group owner cannot be removed.');
    }

    const currentProfiles = data.memberProfiles || {};
    delete currentProfiles[targetUserId];

    const newMemberIds = (data.memberIds || []).filter((id: string) => id !== targetUserId);

    await updateDoc(chatRef, {
      memberIds: arrayRemove(targetUserId),
      adminIds: arrayRemove(targetUserId),
      moderatorIds: arrayRemove(targetUserId),
      mutedUserIds: arrayRemove(targetUserId),
      memberCount: newMemberIds.length,
      memberProfiles: currentProfiles,
      updatedAt: serverTimestamp(),
      lastMessage: `${adminUser.name} removed ${targetUserName}`,
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
    });

    // Remove or update subcollection member doc
    const memRef = doc(db, 'chats', chatId, 'members', targetUserId);
    await deleteDoc(memRef).catch(() => {});

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: adminUser.id,
      senderName: adminUser.name,
      senderAvatar: adminUser.avatar,
      text: `🚪 ${adminUser.name} removed ${targetUserName} from the group.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });

    await dispatchGroupNotification([targetUserId], {
      type: 'admin_action',
      title: `Removed from ${data.name || 'Group'}`,
      body: `${adminUser.name} removed you from "${data.name || 'Group'}"`,
      groupId: chatId,
      groupName: data.name || 'Group',
      senderId: adminUser.id,
      senderName: adminUser.name,
    });
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

// 7. Promote / Demote Member Role (Admin / Moderator / Member)
export const updateMemberRoleInDb = async (
  chatId: string,
  targetUserId: string,
  targetUserName: string,
  newRole: GroupRole,
  adminUser: UserProfile
) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) throw new Error('Group not found');

    const data = snap.data();
    if (data.ownerId === targetUserId && newRole !== 'owner') {
      throw new Error('Group owner role cannot be demoted.');
    }

    const currentProfiles = data.memberProfiles || {};
    if (currentProfiles[targetUserId]) {
      currentProfiles[targetUserId].role = newRole;
    }

    const updates: Record<string, any> = {
      memberProfiles: currentProfiles,
      updatedAt: serverTimestamp(),
    };

    if (newRole === 'admin') {
      updates.adminIds = arrayUnion(targetUserId);
      updates.moderatorIds = arrayRemove(targetUserId);
    } else if (newRole === 'moderator') {
      updates.moderatorIds = arrayUnion(targetUserId);
      updates.adminIds = arrayRemove(targetUserId);
    } else if (newRole === 'member') {
      updates.adminIds = arrayRemove(targetUserId);
      updates.moderatorIds = arrayRemove(targetUserId);
    }

    await updateDoc(chatRef, updates);

    // Update subcollection member status
    const memRef = doc(db, 'chats', chatId, 'members', targetUserId);
    await setDoc(memRef, { role: newRole }, { merge: true }).catch(() => {});

    const roleNames: Record<GroupRole, string> = {
      owner: 'Owner',
      admin: 'Admin',
      moderator: 'Moderator',
      member: 'Member',
    };

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: adminUser.id,
      senderName: adminUser.name,
      senderAvatar: adminUser.avatar,
      text: `⭐ ${adminUser.name} changed ${targetUserName}'s role to ${roleNames[newRole]}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });

    await dispatchGroupNotification([targetUserId], {
      type: 'admin_action',
      title: `Role updated in ${data.name || 'Group'}`,
      body: `You were promoted to ${roleNames[newRole]} by ${adminUser.name}`,
      groupId: chatId,
      groupName: data.name || 'Group',
      senderId: adminUser.id,
      senderName: adminUser.name,
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

// 8. Mute / Unmute Member
export const toggleMuteMemberInDb = async (
  chatId: string,
  targetUserId: string,
  targetUserName: string,
  isMuted: boolean,
  adminUser: UserProfile
) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) throw new Error('Group not found');

    const data = snap.data();
    if (data.ownerId === targetUserId) {
      throw new Error('Group owner cannot be muted.');
    }

    const currentProfiles = data.memberProfiles || {};
    if (currentProfiles[targetUserId]) {
      currentProfiles[targetUserId].isMuted = isMuted;
    }

    await updateDoc(chatRef, {
      mutedUserIds: isMuted ? arrayUnion(targetUserId) : arrayRemove(targetUserId),
      memberProfiles: currentProfiles,
      updatedAt: serverTimestamp(),
    });

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: adminUser.id,
      senderName: adminUser.name,
      senderAvatar: adminUser.avatar,
      text: isMuted
        ? `🔇 ${adminUser.name} restricted ${targetUserName} from sending messages.`
        : `🔊 ${adminUser.name} unmuted ${targetUserName}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error toggling member mute:', error);
    throw error;
  }
};

// 9. Ban / Unban Member
export const toggleBanMemberInDb = async (
  chatId: string,
  targetUserId: string,
  targetUserName: string,
  isBanned: boolean,
  adminUser: UserProfile
) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) throw new Error('Group not found');

    const data = snap.data();
    if (data.ownerId === targetUserId) {
      throw new Error('Group owner cannot be banned.');
    }

    const currentProfiles = data.memberProfiles || {};

    if (isBanned) {
      delete currentProfiles[targetUserId];
      await updateDoc(chatRef, {
        bannedUserIds: arrayUnion(targetUserId),
        memberIds: arrayRemove(targetUserId),
        adminIds: arrayRemove(targetUserId),
        moderatorIds: arrayRemove(targetUserId),
        mutedUserIds: arrayRemove(targetUserId),
        memberProfiles: currentProfiles,
        updatedAt: serverTimestamp(),
        lastMessage: `${adminUser.name} banned ${targetUserName}`,
        lastMessageTime: 'Just now',
        lastMessageRaw: Date.now(),
      });
    } else {
      await updateDoc(chatRef, {
        bannedUserIds: arrayRemove(targetUserId),
        updatedAt: serverTimestamp(),
      });
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: adminUser.id,
      senderName: adminUser.name,
      senderAvatar: adminUser.avatar,
      text: isBanned
        ? `🚫 ${adminUser.name} banned ${targetUserName} from the group.`
        : `✅ ${adminUser.name} unbanned ${targetUserName}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error toggling member ban:', error);
    throw error;
  }
};

// 10. Generate / Reset / Revoke Invite Link
export const manageGroupInviteLinkInDb = async (
  chatId: string,
  action: 'reset' | 'revoke',
  adminUser: UserProfile
): Promise<string | null> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    let newCode: string | null = null;

    if (action === 'reset') {
      newCode = generateGroupInviteCode(chatId);
      await updateDoc(chatRef, {
        inviteCode: newCode,
        isInviteLinkRevoked: false,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(chatRef, {
        isInviteLinkRevoked: true,
        updatedAt: serverTimestamp(),
      });
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: adminUser.id,
      senderName: adminUser.name,
      senderAvatar: adminUser.avatar,
      text:
        action === 'reset'
          ? `🔗 ${adminUser.name} reset the group invite link.`
          : `🔒 ${adminUser.name} revoked the group invite link.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });

    return newCode;
  } catch (error) {
    console.error('Error managing invite link:', error);
    throw error;
  }
};

// 11. Validate and Join Group via Invite Code
export const joinGroupByInviteCodeInDb = async (
  inviteCode: string,
  user: UserProfile
): Promise<{ success: boolean; chatId?: string; message?: string }> => {
  try {
    const cleanCode = inviteCode.trim();
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('inviteCode', '==', cleanCode), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: 'Invalid or expired invite link.' };
    }

    const chatDoc = snapshot.docs[0];
    const data = chatDoc.data();

    if (data.isInviteLinkRevoked) {
      return { success: false, message: 'This invite link has been revoked by an admin.' };
    }

    const bannedUsers = data.bannedUserIds || [];
    if (bannedUsers.includes(user.id)) {
      return { success: false, message: 'You have been banned from joining this group.' };
    }

    const memberIds = data.memberIds || [];
    if (memberIds.includes(user.id)) {
      return { success: true, chatId: chatDoc.id, message: 'You are already a member.' };
    }

    const currentProfiles = data.memberProfiles || {};
    currentProfiles[user.id] = {
      name: user.name,
      avatar: user.avatar,
      handle: user.handle,
      phone: user.phone || '',
      role: 'member',
      isMuted: false,
      joinedAt: Date.now(),
    };

    await updateDoc(chatDoc.ref, {
      memberIds: arrayUnion(user.id),
      memberProfiles: currentProfiles,
      updatedAt: serverTimestamp(),
      lastMessage: `${user.name} joined via invite link`,
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
    });

    const messagesRef = collection(db, 'chats', chatDoc.id, 'messages');
    await addDoc(messagesRef, {
      chatId: chatDoc.id,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: `👋 ${user.name} joined the group using the invite link.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });

    return { success: true, chatId: chatDoc.id };
  } catch (error: any) {
    console.error('Error joining group by code:', error);
    return { success: false, message: error.message || 'Failed to join group.' };
  }
};

// 12. Leave Group
export const leaveGroupInDb = async (chatId: string, user: UserProfile) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const memberIds: string[] = data.memberIds || [];
    const remainingMembers = memberIds.filter((id) => id !== user.id);
    const currentProfiles = data.memberProfiles || {};
    delete currentProfiles[user.id];

    let newOwnerId = data.ownerId;
    let newAdminIds: string[] = (data.adminIds || []).filter((id: string) => id !== user.id);

    // If owner left, transfer ownership to the first admin or oldest member
    if (data.ownerId === user.id && remainingMembers.length > 0) {
      newOwnerId = newAdminIds.length > 0 ? newAdminIds[0] : remainingMembers[0];
      if (!newAdminIds.includes(newOwnerId)) {
        newAdminIds.push(newOwnerId);
      }
      if (currentProfiles[newOwnerId]) {
        currentProfiles[newOwnerId].role = 'owner';
      }
    }

    await updateDoc(chatRef, {
      memberIds: remainingMembers,
      adminIds: newAdminIds,
      moderatorIds: arrayRemove(user.id),
      mutedUserIds: arrayRemove(user.id),
      ownerId: newOwnerId,
      memberProfiles: currentProfiles,
      updatedAt: serverTimestamp(),
      lastMessage: `${user.name} left the group`,
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
    });

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: `👋 ${user.name} has left the group.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
      isSystemMessage: true,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

// 13. Delete Group (Owner only)
export const deleteGroupInDb = async (chatId: string) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// 14. Search Messages inside a Group
export const searchGroupMessagesInDb = async (
  chatId: string,
  keyword: string
): Promise<ChatMessage[]> => {
  try {
    const cleanWord = keyword.trim().toLowerCase();
    if (!cleanWord) return [];

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timeRaw', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    const matches: ChatMessage[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const text = (d.text || '').toLowerCase();
      const sender = (d.senderName || '').toLowerCase();
      if (text.includes(cleanWord) || sender.includes(cleanWord)) {
        matches.push({
          id: docSnap.id,
          chatId,
          senderId: d.senderId,
          senderName: d.senderName,
          senderAvatar: d.senderAvatar,
          text: d.text || '',
          timestamp: d.timestamp || 'Just now',
          timeRaw: d.timeRaw || Date.now(),
          status: d.status || 'sent',
          attachments: d.attachments,
          isStarred: d.isStarred,
          isPinned: d.isPinned,
        });
      }
    });

    return matches;
  } catch (error) {
    console.error('Error searching group messages:', error);
    return [];
  }
};
