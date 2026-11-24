import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface GroupNotification {
  id?: string;
  userId: string;
  type:
    | 'group_message'
    | 'group_mention'
    | 'admin_action'
    | 'group_invite'
    | 'group_announcement';
  title: string;
  body: string;
  groupId: string;
  groupName: string;
  senderId?: string;
  senderName?: string;
  createdAt: any;
  isRead: boolean;
  actionUrl?: string;
  meta?: Record<string, any>;
}

/**
 * Dispatch an in-app and Firestore-backed notification to target group members
 */
export const dispatchGroupNotification = async (
  targetUserIds: string[],
  notification: Omit<GroupNotification, 'userId' | 'createdAt' | 'isRead'>
) => {
  try {
    for (const uid of targetUserIds) {
      if (!uid) continue;
      const notifRef = collection(db, 'users', uid, 'notifications');
      await addDoc(notifRef, {
        ...notification,
        userId: uid,
        createdAt: serverTimestamp(),
        isRead: false,
      });
    }
  } catch (error) {
    console.warn('Group notification dispatch note:', error);
  }
};

/**
 * Subscribe to user notifications in real time with error protection
 */
export const subscribeToUserNotifications = (
  userId: string,
  onUpdate: (notifications: GroupNotification[]) => void
) => {
  if (!userId || userId.startsWith('local_')) {
    return () => {};
  }

  const notifsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notifsRef, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snap) => {
      const items: GroupNotification[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: d.userId,
          type: d.type || 'group_message',
          title: d.title || 'BharatChat Alert',
          body: d.body || '',
          groupId: d.groupId || '',
          groupName: d.groupName || 'Group',
          senderId: d.senderId,
          senderName: d.senderName,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleTimeString() : 'Just now',
          isRead: d.isRead || false,
          actionUrl: d.actionUrl,
          meta: d.meta,
        });
      });
      onUpdate(items);
    },
    (error) => {
      console.warn('Notifications listener note:', error?.message || error);
    }
  );
};

/**
 * Mark notification as read
 */
export const markNotificationAsReadInDb = async (userId: string, notifId: string) => {
  try {
    const docRef = doc(db, 'users', userId, 'notifications', notifId);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    console.warn('Mark notification note:', error);
  }
};
