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
  limit,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChatItem, ChatMessage, MessageReaction, UserProfile } from '../types';

// 1. Search Users across BharatChat by Username or Handle or Display Name
export const searchUsersInDb = async (
  searchQueryStr: string,
  currentUserId?: string
): Promise<UserProfile[]> => {
  try {
    const cleanQuery = searchQueryStr.trim().toLowerCase();
    if (!cleanQuery) return [];

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const results: UserProfile[] = [];

    snapshot.forEach((docSnap) => {
      if (docSnap.id === currentUserId) return;
      const d = docSnap.data();
      const name = (d.displayName || d.name || '').toLowerCase();
      const handle = (d.username || d.handle || '').toLowerCase();
      const phone = (d.phoneNumber || d.phone || '');

      if (
        name.includes(cleanQuery) ||
        handle.includes(cleanQuery) ||
        phone.includes(cleanQuery)
      ) {
        results.push({
          id: docSnap.id,
          name: d.displayName || d.name || 'Bharat User',
          phone: d.phoneNumber || d.phone || '',
          handle: d.username || d.handle || `user_${docSnap.id.slice(0, 5)}`,
          avatar:
            d.profilePhoto ||
            d.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          statusQuote: d.bio || d.statusQuote || 'Building on BharatChat 🇮🇳',
          isOnline: d.isOnline ?? false,
          isVerified: d.isVerified ?? true,
          upiId: d.upiId || `${(d.username || 'user')}@bharatpay`,
          locale: d.language || d.locale || 'en',
          bio: d.bio || '',
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error searching users in Firestore:', error);
    return [];
  }
};

// 2. Get or Automatically Create Private Conversation between 2 Users
export const getOrCreatePrivateChatInDb = async (
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<string> => {
  try {
    // Deterministic Chat ID avoids duplicate rooms
    const sortedIds = [currentUser.id, targetUser.id].sort();
    const chatId = `direct_${sortedIds[0]}_${sortedIds[1]}`;
    const chatDocRef = doc(db, 'chats', chatId);

    const snap = await getDoc(chatDocRef);
    if (!snap.exists()) {
      await setDoc(chatDocRef, {
        type: 'direct',
        memberIds: [currentUser.id, targetUser.id],
        memberProfiles: {
          [currentUser.id]: {
            name: currentUser.name,
            avatar: currentUser.avatar,
            handle: currentUser.handle,
            phone: currentUser.phone,
          },
          [targetUser.id]: {
            name: targetUser.name,
            avatar: targetUser.avatar,
            handle: targetUser.handle,
            phone: targetUser.phone,
          },
        },
        lastMessage: 'Conversation started',
        lastMessageTime: 'Just now',
        lastMessageRaw: Date.now(),
        unreadCount: {
          [currentUser.id]: 0,
          [targetUser.id]: 0,
        },
        createdAt: serverTimestamp(),
        createdBy: currentUser.id,
      });
    }

    return chatId;
  } catch (error) {
    console.error('Failed to get/create private chat:', error);
    throw error;
  }
};

// 3. Real-time subscription to user's chat conversations with peer profile resolution
export const subscribeToUserChats = (
  userId: string,
  onUpdate: (chats: ChatItem[]) => void
) => {
  if (!userId || userId.startsWith('local_')) {
    return () => {};
  }

  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('memberIds', 'array-contains', userId),
    orderBy('lastMessageRaw', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ChatItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();

        // For direct 1-on-1 chats, resolve the other member's name and avatar
        let displayName = d.name || 'Chat';
        let displayAvatar =
          d.avatar ||
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
        let peerHandle = '';

        if (d.type === 'direct' && d.memberProfiles) {
          const peerId = (d.memberIds as string[]).find((id) => id !== userId);
          if (peerId && d.memberProfiles[peerId]) {
            displayName = d.memberProfiles[peerId].name || displayName;
            displayAvatar = d.memberProfiles[peerId].avatar || displayAvatar;
            peerHandle = d.memberProfiles[peerId].handle || '';
          }
        }

        items.push({
          id: docSnap.id,
          type: d.type || 'direct',
          name: displayName,
          avatar: displayAvatar,
          lastMessage: d.lastMessage || '',
          lastMessageTime: d.lastMessageTime || 'Just now',
          lastMessageRaw: d.lastMessageRaw || Date.now(),
          unreadCount: d.unreadCount?.[userId] || 0,
          isPinned: d.isPinned || false,
          isArchived: d.isArchived || false,
          isMuted: d.isMuted || false,
          isOnline: d.isOnline || false,
          isVerified: d.isVerified || false,
          membersCount: d.memberIds?.length || 2,
          topic: peerHandle ? `@${peerHandle}` : (d.topic || ''),
          description: d.description || '',
          role: d.adminIds?.includes(userId) ? 'admin' : 'member',
          disappearingTimer: d.disappearingTimer || 0,
          memberIds: d.memberIds || [],
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Chats listener note:', err);
    }
  );
};

// 4. Real-time subscription to messages in a specific chat
export const subscribeToChatMessages = (
  chatId: string,
  onUpdate: (messages: ChatMessage[]) => void
) => {
  if (!chatId || chatId.startsWith('chat_')) {
    return () => {};
  }

  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timeRaw', 'asc'), limit(200));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        msgs.push({
          id: docSnap.id,
          chatId,
          senderId: d.senderId,
          senderName: d.senderName,
          senderAvatar: d.senderAvatar,
          text: d.text || '',
          translatedText: d.translatedText,
          translatedLanguage: d.translatedLanguage,
          timestamp: d.timestamp || 'Just now',
          timeRaw: d.timeRaw || Date.now(),
          status: d.status || 'sent',
          isStarred: d.isStarred || false,
          replyTo: d.replyTo,
          attachments: d.attachments,
          reactions: d.reactions,
          isPinned: d.isPinned || false,
          isDeleted: d.isDeleted || false,
        });
      });
      onUpdate(msgs);
    },
    (error) => {
      // Graceful fallback for non-existent chat or local mode
      console.warn(`Firestore messages subscription for ${chatId}:`, error?.message || error);
    }
  );
};

// 5. Send message to Firestore and update conversation metadata
export const sendFirestoreMessage = async (
  chatId: string,
  message: Omit<ChatMessage, 'id'>
): Promise<string> => {
  if (!chatId || chatId.startsWith('chat_')) {
    return 'local_msg_' + Date.now();
  }

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...message,
      createdAt: serverTimestamp(),
    });

    // Form summary snippet
    let summary = message.text || '';
    if (!summary && message.attachments && message.attachments.length > 0) {
      const first = message.attachments[0];
      if (first.type === 'image') summary = '📷 Photo';
      else if (first.type === 'video') summary = '🎥 Video';
      else if (first.type === 'audio') summary = '🎤 Voice note';
      else if (first.type === 'document') summary = `📄 ${first.name || 'Document'}`;
      else if (first.type === 'upi_payment') summary = `₹${first.amount} BharatPay UPI`;
      else summary = `[${first.type}]`;
    }

    // Update parent chat document
    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
      lastMessage: summary,
      lastMessageTime: message.timestamp,
      lastMessageRaw: message.timeRaw,
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message to Firestore:', error);
    throw error;
  }
};

// 6. Mark messages as read by current user
export const markMessagesAsReadInDb = async (chatId: string, currentUserId: string) => {
  if (!chatId || chatId.startsWith('chat_')) return;

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '!=', currentUserId),
      limit(50)
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      if (data.status !== 'read') {
        await updateDoc(docSnap.ref, { status: 'read' });
      }
    });

    // Reset unread count for current user
    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
      [`unreadCount.${currentUserId}`]: 0,
    });
  } catch (error) {
    // Non-critical, ignore if rule doesn't allow bulk status
  }
};

// 7. Update Typing Indicator status
export const setChatTypingInDb = async (
  chatId: string,
  userId: string,
  isTyping: boolean
) => {
  if (!chatId || chatId.startsWith('chat_')) return;

  try {
    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
      [`typing.${userId}`]: isTyping,
    });
  } catch {
    // Ignore non-critical typing errors
  }
};

// 8. Subscribe to Typing Status in Chat
export const subscribeToChatTyping = (
  chatId: string,
  currentUserId: string,
  onTypingChange: (isTyping: boolean) => void
) => {
  if (!chatId || chatId.startsWith('chat_')) {
    return () => {};
  }

  const chatDocRef = doc(db, 'chats', chatId);
  return onSnapshot(
    chatDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const typingMap = data.typing || {};
        const peerTyping = Object.entries(typingMap).some(
          ([uid, typing]) => uid !== currentUserId && typing === true
        );
        onTypingChange(peerTyping);
      }
    },
    (err) => {
      // Non-critical, ignore if permission not available for uncreated chats
    }
  );
};

// 9. Edit Message
export const editMessageInDb = async (
  chatId: string,
  messageId: string,
  newText: string
) => {
  try {
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, {
      text: newText,
      isEdited: true,
      editedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

// 10. Delete Message (Soft delete for audit & security)
export const deleteMessageInDb = async (
  chatId: string,
  messageId: string
) => {
  try {
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, {
      isDeleted: true,
      text: '🚫 This message was deleted',
      attachments: [],
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// 11. Pin/Unpin Message in Chat
export const togglePinMessageInDb = async (
  chatId: string,
  messageId: string,
  currentPinned: boolean
) => {
  try {
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, { isPinned: !currentPinned });

    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
      pinnedMessageId: !currentPinned ? messageId : null,
    });
  } catch (error) {
    console.error('Error pinning message:', error);
  }
};

// 12. Star/Unstar Message
export const toggleStarMessageInDb = async (
  chatId: string,
  messageId: string,
  currentStarred: boolean
) => {
  try {
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, { isStarred: !currentStarred });
  } catch (error) {
    console.error('Error toggling star:', error);
  }
};

// 13. Add/Remove Message Reaction
export const updateMessageReactionInDb = async (
  chatId: string,
  messageId: string,
  userId: string,
  emoji: string
) => {
  try {
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const existingReactions: MessageReaction[] = data.reactions || [];
    const foundIndex = existingReactions.findIndex((r) => r.emoji === emoji);

    let updatedReactions: MessageReaction[];
    if (foundIndex >= 0) {
      const match = existingReactions[foundIndex];
      const hasUser = match.users?.includes(userId);
      if (hasUser) {
        const newUsers = match.users.filter((u) => u !== userId);
        if (newUsers.length === 0) {
          updatedReactions = existingReactions.filter((r) => r.emoji !== emoji);
        } else {
          updatedReactions = existingReactions.map((r, i) =>
            i === foundIndex ? { ...r, count: newUsers.length, users: newUsers } : r
          );
        }
      } else {
        const newUsers = [...(match.users || []), userId];
        updatedReactions = existingReactions.map((r, i) =>
          i === foundIndex ? { ...r, count: newUsers.length, users: newUsers } : r
        );
      }
    } else {
      updatedReactions = [...existingReactions, { emoji, count: 1, users: [userId] }];
    }

    await updateDoc(msgRef, { reactions: updatedReactions });
  } catch (error) {
    console.error('Failed to update reaction:', error);
  }
};

// 14. Create a New Group Conversation in Firestore
export const createGroupInFirestore = async (
  name: string,
  creatorId: string,
  memberIds: string[],
  description?: string,
  avatar?: string
): Promise<string> => {
  try {
    const allMembers = Array.from(new Set([creatorId, ...memberIds]));
    const chatsRef = collection(db, 'chats');
    const newChatRef = doc(chatsRef);

    await setDoc(newChatRef, {
      type: 'group',
      name,
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
      lastMessage: 'Group created',
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
      memberIds: allMembers,
      adminIds: [creatorId],
      createdBy: creatorId,
      description: description || 'BharatChat Community',
      createdAt: serverTimestamp(),
    });

    return newChatRef.id;
  } catch (error) {
    console.error('Failed to create group in Firestore:', error);
    throw error;
  }
};
