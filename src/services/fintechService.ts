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
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UpiTransaction, StoryItem } from '../types';

// 1. Record a UPI BharatPay transaction in Firestore
export const recordUpiTransaction = async (
  tx: Omit<UpiTransaction, 'id'>,
  senderUid: string
): Promise<string> => {
  try {
    const txCollection = collection(db, 'transactions');
    const docRef = await addDoc(txCollection, {
      ...tx,
      senderUid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error logging UPI transaction:', error);
    throw error;
  }
};

// 2. Real-time Passbook Subscription
export const subscribeToTransactions = (
  uid: string,
  onUpdate: (transactions: UpiTransaction[]) => void
) => {
  if (!uid || uid.startsWith('local_')) {
    return () => {};
  }

  const txRef = collection(db, 'transactions');
  const q = query(
    txRef,
    where('senderUid', '==', uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const items: UpiTransaction[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          txId: data.txId || `BHARAT/${new Date().getFullYear()}/${d.id.slice(0, 8)}`,
          recipientName: data.recipientName || 'Contact',
          recipientAvatar: data.recipientAvatar,
          recipientUpi: data.recipientUpi || 'user@bharatpay',
          amount: data.amount || 0,
          timestamp: data.timestamp || 'Today',
          status: data.status || 'SUCCESS',
          note: data.note || 'BharatPay Transfer',
          type: data.type || 'SENT',
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Transactions listener fallback:', err);
    }
  );
};

// 3. Post a 24-hour Bharat Story
export const createStoryInDb = async (
  userId: string,
  userName: string,
  userAvatar: string,
  mediaUrl: string,
  caption?: string
) => {
  try {
    const storiesRef = collection(db, 'stories');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const docRef = await addDoc(storiesRef, {
      userId,
      userName,
      userAvatar,
      mediaUrl,
      caption: caption || '',
      createdAt: serverTimestamp(),
      expiresAt,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error publishing story:', error);
    throw error;
  }
};
