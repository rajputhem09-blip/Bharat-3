import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChatItem, ChannelPost, ChannelComment, GroupRole, UserProfile } from '../types';
import { dispatchGroupNotification } from './notificationService';

export interface CreateChannelParams {
  name: string;
  username: string; // e.g. "bharat_tech" or "@bharat_tech"
  description: string;
  category: string;
  channelType: 'public' | 'private';
  avatar?: string;
  rules?: string;
  isCommentsEnabled?: boolean;
}

/**
 * Generate a unique channel invite code
 */
export const generateChannelInviteCode = (channelId: string): string => {
  const cleanId = channelId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BC-CH-${cleanId}-${randomChars}`;
};

/**
 * Create a new Telegram-style Channel in BharatChat
 */
export const createChannel = async (
  params: CreateChannelParams,
  creator: UserProfile
): Promise<string> => {
  try {
    const cleanUsername = params.username
      .replace(/^@/, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    // Check if username already exists for public channels
    if (params.channelType === 'public' && cleanUsername) {
      const existingQuery = query(
        collection(db, 'chats'),
        where('type', '==', 'channel'),
        where('username', '==', cleanUsername),
        limit(1)
      );
      const snap = await getDocs(existingQuery);
      if (!snap.empty) {
        throw new Error(`The username @${cleanUsername} is already taken. Please choose another.`);
      }
    }

    const channelRef = doc(collection(db, 'chats'));
    const channelId = channelRef.id;
    const inviteCode = generateChannelInviteCode(channelId);

    const defaultAvatar =
      params.avatar ||
      'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80';

    const channelData: Record<string, any> = {
      id: channelId,
      groupId: channelId,
      type: 'channel',
      name: params.name.trim(),
      username: cleanUsername,
      description: params.description.trim() || 'Welcome to this BharatChat Channel!',
      category: params.category || 'Technology',
      channelType: params.channelType || 'public',
      avatar: defaultAvatar,
      photo: defaultAvatar,
      topic: params.description.trim() || 'Official Announcements & Feed',
      rules: params.rules || 'Be respectful, no spam, stay on topic.',
      isCommentsEnabled: params.isCommentsEnabled !== false,
      isVerified: true,
      createdBy: creator.id,
      ownerId: creator.id,
      adminIds: [creator.id],
      moderatorIds: [],
      memberIds: [creator.id],
      bannedUserIds: [],
      mutedUserIds: [],
      subscribersCount: 1,
      membersCount: 1,
      inviteCode: inviteCode,
      isInviteLinkRevoked: false,
      adminPermissions: {
        [creator.id]: {
          canPost: true,
          canEditInfo: true,
          canDeletePosts: true,
          canManageInvites: true,
        },
      },
      memberProfiles: {
        [creator.id]: {
          name: creator.name,
          avatar: creator.avatar,
          handle: creator.handle || `@${creator.name.toLowerCase().replace(/\s+/g, '_')}`,
          role: 'owner' as GroupRole,
          joinedAt: Date.now(),
        },
      },
      unreadCount: 0,
      lastMessage: `Channel created by ${creator.name}`,
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(channelRef, channelData);

    // Save creator to subcollection members
    const memberDoc = doc(db, 'chats', channelId, 'members', creator.id);
    await setDoc(memberDoc, {
      userId: creator.id,
      channelId: channelId,
      role: 'owner',
      joinedAt: Date.now(),
      status: 'active',
      isMuted: false,
    });

    // Create initial welcome post in the channel
    const postsRef = collection(db, 'chats', channelId, 'posts');
    await addDoc(postsRef, {
      channelId,
      title: `Welcome to ${params.name.trim()}! 🇮🇳`,
      body: `Welcome subscribers! This official BharatChat broadcast channel is now live. Stay tuned for real-time announcements, verified media releases, and community discussions.`,
      mediaType: 'none',
      authorId: creator.id,
      authorName: creator.name,
      authorAvatar: creator.avatar,
      viewsCount: 1,
      forwardsCount: 0,
      commentsCount: 0,
      isPinned: true,
      reactions: { '🇮🇳': 1, '🚀': 1, '❤️': 1, '🔥': 1, '👏': 1 },
      userReactions: { '🇮🇳': [creator.id] },
      createdAt: serverTimestamp(),
      createdAtRaw: Date.now(),
    });

    return channelId;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
};

/**
 * Subscribe to channel updates in real time
 */
export const subscribeToChannelDetails = (
  channelId: string,
  onUpdate: (channel: ChatItem | null) => void
) => {
  if (!channelId || channelId.startsWith('chat_')) {
    onUpdate(null);
    return () => {};
  }

  const channelRef = doc(db, 'chats', channelId);
  return onSnapshot(
    channelRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data();
      onUpdate({
        id: snap.id,
        type: 'channel',
        name: data.name || 'Channel',
        avatar: data.avatar || data.photo || '',
        username: data.username || '',
        category: data.category || 'General',
        channelType: data.channelType || 'public',
        description: data.description || data.topic || '',
        topic: data.topic || '',
        rules: data.rules || '',
        isCommentsEnabled: data.isCommentsEnabled !== false,
        isVerified: data.isVerified ?? true,
        createdBy: data.createdBy || '',
        ownerId: data.ownerId || data.createdBy || '',
        adminIds: data.adminIds || [],
        moderatorIds: data.moderatorIds || [],
        memberIds: data.memberIds || [],
        bannedUserIds: data.bannedUserIds || [],
        mutedUserIds: data.mutedUserIds || [],
        subscribersCount: data.subscribersCount || (data.memberIds ? data.memberIds.length : 1),
        membersCount: data.subscribersCount || (data.memberIds ? data.memberIds.length : 1),
        inviteCode: data.inviteCode || '',
        isInviteLinkRevoked: data.isInviteLinkRevoked || false,
        adminPermissions: data.adminPermissions || {},
        memberProfiles: data.memberProfiles || {},
        lastMessage: data.lastMessage || '',
        lastMessageTime: data.lastMessageTime || '',
        lastMessageRaw: data.lastMessageRaw || 0,
        unreadCount: data.unreadCount || 0,
      } as ChatItem);
    },
    (error) => {
      console.warn('Channel listener notice:', error?.message || error);
      onUpdate(null);
    }
  );
};

/**
 * Subscribe a user to a channel (Follow/Join)
 */
export const subscribeToChannel = async (channelId: string, user: UserProfile) => {
  if (!channelId || !user.id || channelId.startsWith('chat_')) return;

  try {
    const channelRef = doc(db, 'chats', channelId);
    const snap = await getDoc(channelRef);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data.bannedUserIds?.includes(user.id)) {
      throw new Error('You have been banned from this channel by an administrator.');
    }

    const currentMemberIds = data.memberIds || [];
    if (!currentMemberIds.includes(user.id)) {
      const updatedProfiles = {
        ...(data.memberProfiles || {}),
        [user.id]: {
          name: user.name,
          avatar: user.avatar,
          handle: user.handle || `@${user.name.toLowerCase().replace(/\s+/g, '_')}`,
          role: 'member' as GroupRole,
          joinedAt: Date.now(),
        },
      };

      await updateDoc(channelRef, {
        memberIds: arrayUnion(user.id),
        subscribersCount: increment(1),
        membersCount: increment(1),
        memberProfiles: updatedProfiles,
        updatedAt: serverTimestamp(),
      });

      const memberDoc = doc(db, 'chats', channelId, 'members', user.id);
      await setDoc(memberDoc, {
        userId: user.id,
        channelId,
        role: 'subscriber',
        joinedAt: Date.now(),
        status: 'active',
        isMuted: false,
      });
    }
  } catch (error) {
    console.error('Error subscribing to channel:', error);
    throw error;
  }
};

/**
 * Unsubscribe / Leave a channel
 */
export const unsubscribeFromChannel = async (channelId: string, userId: string) => {
  if (!channelId || !userId || channelId.startsWith('chat_')) return;

  try {
    const channelRef = doc(db, 'chats', channelId);
    const snap = await getDoc(channelRef);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data.ownerId === userId) {
      throw new Error('As the channel owner, you cannot leave. Transfer ownership or delete the channel instead.');
    }

    const updatedProfiles = { ...(data.memberProfiles || {}) };
    delete updatedProfiles[userId];

    await updateDoc(channelRef, {
      memberIds: arrayRemove(userId),
      adminIds: arrayRemove(userId),
      moderatorIds: arrayRemove(userId),
      subscribersCount: increment(-1),
      membersCount: increment(-1),
      memberProfiles: updatedProfiles,
      updatedAt: serverTimestamp(),
    });

    const memberDoc = doc(db, 'chats', channelId, 'members', userId);
    await deleteDoc(memberDoc).catch(() => {});
  } catch (error) {
    console.error('Error leaving channel:', error);
    throw error;
  }
};

/**
 * Real-time listener for Channel Posts
 */
export const subscribeToChannelPosts = (
  channelId: string,
  onUpdate: (posts: ChannelPost[]) => void
) => {
  if (!channelId || channelId.startsWith('chat_')) {
    onUpdate([]);
    return () => {};
  }

  const postsRef = collection(db, 'chats', channelId, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'), limit(60));

  return onSnapshot(
    q,
    (snap) => {
      const posts: ChannelPost[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.isDeleted) return;

        let timeStr = 'Just now';
        if (d.createdAt?.toDate) {
          const date = d.createdAt.toDate();
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        posts.push({
          id: docSnap.id,
          channelId: d.channelId || channelId,
          title: d.title || '',
          body: d.body || '',
          mediaUrl: d.mediaUrl || '',
          mediaType: d.mediaType || 'none',
          mediaName: d.mediaName || '',
          authorId: d.authorId || '',
          authorName: d.authorName || 'Admin',
          authorAvatar: d.authorAvatar || '',
          createdAt: timeStr,
          createdAtRaw: d.createdAtRaw || (d.createdAt?.toDate ? d.createdAt.toDate().getTime() : Date.now()),
          viewsCount: d.viewsCount || 1,
          forwardsCount: d.forwardsCount || 0,
          reactions: d.reactions || { '🇮🇳': 0, '🚀': 0, '❤️': 0, '🔥': 0, '👏': 0 },
          userReactions: d.userReactions || {},
          isPinned: d.isPinned || false,
          commentsCount: d.commentsCount || 0,
          isLiveSoon: d.isLiveSoon || false,
          liveStreamUrl: d.liveStreamUrl || '',
          pollData: d.pollData || undefined,
        });
      });
      onUpdate(posts);
    },
    (error) => {
      console.warn('Channel posts listener notice:', error?.message || error);
      onUpdate([]);
    }
  );
};

/**
 * Publish a new post to the channel (Admin only)
 */
export const createChannelPost = async (
  channelId: string,
  postData: {
    title?: string;
    body: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'document' | 'audio' | 'none';
    mediaName?: string;
    isLiveSoon?: boolean;
    liveStreamUrl?: string;
    pollData?: any;
  },
  author: UserProfile
): Promise<string> => {
  try {
    const channelRef = doc(db, 'chats', channelId);
    const snap = await getDoc(channelRef);
    if (!snap.exists()) throw new Error('Channel not found');

    const channelData = snap.data();
    const isAdmin =
      channelData.ownerId === author.id ||
      channelData.adminIds?.includes(author.id) ||
      channelData.moderatorIds?.includes(author.id);

    if (!isAdmin) {
      throw new Error('Only channel administrators can publish broadcasts.');
    }

    const postsRef = collection(db, 'chats', channelId, 'posts');
    const newPostRef = await addDoc(postsRef, {
      channelId,
      title: postData.title?.trim() || '',
      body: postData.body.trim(),
      mediaUrl: postData.mediaUrl || '',
      mediaType: postData.mediaType || 'none',
      mediaName: postData.mediaName || '',
      isLiveSoon: postData.isLiveSoon || false,
      liveStreamUrl: postData.liveStreamUrl || '',
      pollData: postData.pollData || null,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      viewsCount: 1,
      forwardsCount: 0,
      commentsCount: 0,
      isPinned: false,
      reactions: { '🇮🇳': 0, '🚀': 0, '❤️': 0, '🔥': 0, '👏': 0 },
      userReactions: {},
      createdAt: serverTimestamp(),
      createdAtRaw: Date.now(),
    });

    const snippet = postData.title ? postData.title : postData.body.slice(0, 45);
    await updateDoc(channelRef, {
      lastMessage: snippet,
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
      updatedAt: serverTimestamp(),
    });

    // Notify channel subscribers
    const targetSubscribers = (channelData.memberIds || []).filter((uid: string) => uid !== author.id);
    if (targetSubscribers.length > 0) {
      await dispatchGroupNotification(targetSubscribers.slice(0, 50), {
        type: 'group_announcement',
        title: channelData.name || 'New Broadcast',
        body: snippet,
        groupId: channelId,
        groupName: channelData.name || 'Channel',
        senderId: author.id,
        senderName: author.name,
      });
    }

    return newPostRef.id;
  } catch (error) {
    console.error('Error creating channel post:', error);
    throw error;
  }
};

/**
 * Edit an existing channel post
 */
export const updateChannelPost = async (
  channelId: string,
  postId: string,
  updates: {
    title?: string;
    body?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'document' | 'audio' | 'none';
  }
) => {
  try {
    const postRef = doc(db, 'chats', channelId, 'posts', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating channel post:', error);
    throw error;
  }
};

/**
 * Delete a channel post (Soft delete)
 */
export const deleteChannelPost = async (channelId: string, postId: string) => {
  try {
    const postRef = doc(db, 'chats', channelId, 'posts', postId);
    await updateDoc(postRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error deleting channel post:', error);
    throw error;
  }
};

/**
 * Pin or Unpin a channel post
 */
export const pinChannelPost = async (channelId: string, postId: string, isPinned: boolean) => {
  try {
    const postRef = doc(db, 'chats', channelId, 'posts', postId);
    await updateDoc(postRef, {
      isPinned: isPinned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error pinning channel post:', error);
    throw error;
  }
};

/**
 * React to a channel post
 */
export const reactToChannelPost = async (
  channelId: string,
  postId: string,
  emoji: string,
  userId: string
) => {
  if (!channelId || !postId || !userId) return;

  try {
    const postRef = doc(db, 'chats', channelId, 'posts', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const reactions = { ...(data.reactions || {}) };
    const userReactions = { ...(data.userReactions || {}) };

    const currentReactors: string[] = userReactions[emoji] || [];
    const hasReacted = currentReactors.includes(userId);

    if (hasReacted) {
      // Remove reaction
      userReactions[emoji] = currentReactors.filter((id) => id !== userId);
      reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
    } else {
      // Add reaction
      userReactions[emoji] = [...currentReactors, userId];
      reactions[emoji] = (reactions[emoji] || 0) + 1;
    }

    await updateDoc(postRef, {
      reactions,
      userReactions,
    });
  } catch (error) {
    console.warn('Error reacting to channel post:', error);
  }
};

/**
 * Increment channel post view count
 */
export const incrementChannelPostView = async (channelId: string, postId: string) => {
  if (!channelId || !postId || channelId.startsWith('chat_')) return;

  try {
    const postRef = doc(db, 'chats', channelId, 'posts', postId);
    await updateDoc(postRef, {
      viewsCount: increment(1),
    });
  } catch (error) {
    // Non-blocking view increment error
  }
};

/**
 * Real-time listener for Post Comments / Discussions
 */
export const subscribeToPostComments = (
  channelId: string,
  postId: string,
  onUpdate: (comments: ChannelComment[]) => void
) => {
  if (!channelId || !postId || channelId.startsWith('chat_')) {
    onUpdate([]);
    return () => {};
  }

  const commentsRef = collection(db, 'chats', channelId, 'posts', postId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'asc'), limit(80));

  return onSnapshot(
    q,
    (snap) => {
      const items: ChannelComment[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        let timeStr = 'Just now';
        if (d.createdAt?.toDate) {
          timeStr = d.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        items.push({
          id: docSnap.id,
          postId: d.postId || postId,
          channelId: d.channelId || channelId,
          userId: d.userId || '',
          userName: d.userName || 'Subscriber',
          userAvatar: d.userAvatar || '',
          text: d.text || '',
          createdAt: timeStr,
          likesCount: d.likesCount || 0,
        });
      });
      onUpdate(items);
    },
    (error) => {
      console.warn('Post comments listener notice:', error?.message || error);
      onUpdate([]);
    }
  );
};

/**
 * Add a comment to a channel post
 */
export const addChannelComment = async (
  channelId: string,
  postId: string,
  text: string,
  user: UserProfile
) => {
  if (!channelId || !postId || !text.trim() || !user.id) return;

  try {
    const commentsRef = collection(db, 'chats', channelId, 'posts', postId, 'comments');
    await addDoc(commentsRef, {
      postId,
      channelId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: text.trim(),
      likesCount: 0,
      createdAt: serverTimestamp(),
    });

    // Increment commentsCount on the post
    const postRef = doc(db, 'chats', channelId, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1),
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Channel Admin Actions (Promote/Demote/Remove subscriber/Update Settings)
 */
export const updateChannelInfo = async (
  channelId: string,
  updates: {
    name?: string;
    username?: string;
    description?: string;
    category?: string;
    avatar?: string;
    rules?: string;
    isCommentsEnabled?: boolean;
  },
  adminUser: UserProfile
) => {
  try {
    const channelRef = doc(db, 'chats', channelId);
    const snap = await getDoc(channelRef);
    if (!snap.exists()) throw new Error('Channel not found');

    const data = snap.data();
    const isAdmin = data.ownerId === adminUser.id || data.adminIds?.includes(adminUser.id);
    if (!isAdmin) throw new Error('Permission denied: You are not a channel administrator.');

    if (updates.username && updates.username !== data.username) {
      const cleanUsername = updates.username
        .replace(/^@/, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      const existingQuery = query(
        collection(db, 'chats'),
        where('type', '==', 'channel'),
        where('username', '==', cleanUsername),
        limit(1)
      );
      const existingSnap = await getDocs(existingQuery);
      if (!existingSnap.empty && existingSnap.docs[0].id !== channelId) {
        throw new Error(`The username @${cleanUsername} is already taken.`);
      }
      updates.username = cleanUsername;
    }

    await updateDoc(channelRef, {
      ...updates,
      photo: updates.avatar || data.photo,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating channel info:', error);
    throw error;
  }
};

/**
 * Manage Channel Admins
 */
export const updateChannelMemberRole = async (
  channelId: string,
  targetUserId: string,
  newRole: 'admin' | 'moderator' | 'subscriber',
  adminUser: UserProfile
) => {
  try {
    const channelRef = doc(db, 'chats', channelId);
    const snap = await getDoc(channelRef);
    if (!snap.exists()) throw new Error('Channel not found');

    const data = snap.data();
    if (data.ownerId !== adminUser.id) {
      throw new Error('Only the channel owner can promote or demote administrators.');
    }

    let adminIds = data.adminIds || [];
    let moderatorIds = data.moderatorIds || [];

    if (newRole === 'admin') {
      if (!adminIds.includes(targetUserId)) adminIds.push(targetUserId);
      moderatorIds = moderatorIds.filter((id: string) => id !== targetUserId);
    } else if (newRole === 'moderator') {
      if (!moderatorIds.includes(targetUserId)) moderatorIds.push(targetUserId);
      adminIds = adminIds.filter((id: string) => id !== targetUserId);
    } else {
      adminIds = adminIds.filter((id: string) => id !== targetUserId);
      moderatorIds = moderatorIds.filter((id: string) => id !== targetUserId);
    }

    const memberProfiles = { ...(data.memberProfiles || {}) };
    if (memberProfiles[targetUserId]) {
      memberProfiles[targetUserId].role = newRole;
    }

    await updateDoc(channelRef, {
      adminIds,
      moderatorIds,
      memberProfiles,
      updatedAt: serverTimestamp(),
    });

    const memDoc = doc(db, 'chats', channelId, 'members', targetUserId);
    await updateDoc(memDoc, { role: newRole }).catch(() => {});
  } catch (error) {
    console.error('Error updating channel member role:', error);
    throw error;
  }
};

/**
 * Search public channels by name, handle or category
 */
export const searchPublicChannels = async (searchTerm: string): Promise<ChatItem[]> => {
  if (!searchTerm.trim()) return [];

  try {
    const cleanQuery = searchTerm.toLowerCase().trim().replace(/^@/, '');
    const channelsRef = collection(db, 'chats');
    const q = query(
      channelsRef,
      where('type', '==', 'channel'),
      where('channelType', '==', 'public'),
      limit(20)
    );

    const snap = await getDocs(q);
    const results: ChatItem[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const name = (d.name || '').toLowerCase();
      const username = (d.username || '').toLowerCase();
      const category = (d.category || '').toLowerCase();
      const description = (d.description || '').toLowerCase();

      if (
        name.includes(cleanQuery) ||
        username.includes(cleanQuery) ||
        category.includes(cleanQuery) ||
        description.includes(cleanQuery)
      ) {
        results.push({
          id: docSnap.id,
          type: 'channel',
          name: d.name || 'Channel',
          avatar: d.avatar || d.photo || '',
          username: d.username || '',
          category: d.category || 'General',
          channelType: d.channelType || 'public',
          description: d.description || '',
          topic: d.topic || '',
          isVerified: d.isVerified ?? true,
          subscribersCount: d.subscribersCount || (d.memberIds?.length ?? 1),
          membersCount: d.subscribersCount || (d.memberIds?.length ?? 1),
          memberIds: d.memberIds || [],
          adminIds: d.adminIds || [],
          ownerId: d.ownerId || '',
          lastMessage: d.lastMessage || '',
          lastMessageTime: d.lastMessageTime || '',
          lastMessageRaw: d.lastMessageRaw || 0,
          unreadCount: 0,
        });
      }
    });

    return results;
  } catch (error) {
    console.warn('Error searching public channels:', error);
    return [];
  }
};
