import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  StorySlide,
  StoryItem,
  StoryPrivacy,
  StoryViewItem,
  StoryReactionItem,
  StoryReportItem,
  UserProfile,
} from '../types';
import { getOrCreatePrivateChatInDb, sendFirestoreMessage } from './chatService';

export interface CreateStoryParams {
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'image' | 'video' | 'text';
  mediaUrl?: string;
  caption?: string;
  bgColor?: string;
  stickers?: { emoji: string; x: number; y: number }[];
  linkUrl?: string;
  linkText?: string;
  duration?: number;
  privacy: StoryPrivacy;
  allowedUserIds?: string[];
  excludedUserIds?: string[];
}

/**
 * 1. Create a new 24-hour ephemeral story slide in Firestore
 */
export const createStoryInDb = async (params: CreateStoryParams): Promise<string> => {
  try {
    const storyRef = doc(collection(db, 'stories'));
    const storyId = storyRef.id;
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours TTL

    const storyData: any = {
      id: storyId,
      userId: params.userId,
      userName: params.userName,
      userAvatar: params.userAvatar,
      type: params.type,
      mediaUrl: params.mediaUrl || null,
      url: params.mediaUrl || null,
      caption: params.caption ? params.caption.trim() : '',
      bgColor: params.bgColor || 'from-amber-600 via-rose-600 to-sky-700',
      stickers: params.stickers || [],
      linkUrl: params.linkUrl ? params.linkUrl.trim() : null,
      linkText: params.linkText ? params.linkText.trim() : null,
      duration: params.duration || (params.type === 'video' ? 15 : 5),
      privacy: params.privacy,
      allowedUserIds: params.allowedUserIds || [],
      excludedUserIds: params.excludedUserIds || [],
      viewsCount: 0,
      reactionsCount: 0,
      isDeleted: false,
      createdAt: serverTimestamp(),
      createdAtRaw: now,
      expiresAt: expiresAt,
    };

    await setDoc(storyRef, storyData);
    return storyId;
  } catch (error) {
    console.error('Error creating story in Firestore:', error);
    throw error;
  }
};

/**
 * 2. Subscribe to active (non-expired, non-deleted) stories in real-time
 */
export const subscribeToActiveStories = (
  currentUserId: string,
  viewedStoryIds: Set<string>,
  onUpdate: (stories: StoryItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const now = Date.now();
    // Query active stories within 24h
    const storiesRef = collection(db, 'stories');
    const q = query(
      storiesRef,
      where('expiresAt', '>', now - 60000), // Active or barely expired
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rawSlides: StorySlide[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (data.isDeleted) return;

          // Enforce 24-hour expiration client side as backup
          const docExpiresAt = data.expiresAt || (data.createdAtRaw ? data.createdAtRaw + 24 * 60 * 60 * 1000 : 0);
          if (docExpiresAt < Date.now()) return;

          // Enforce Privacy Check
          const isOwner = data.userId === currentUserId;
          const privacy: StoryPrivacy = data.privacy || 'everyone';
          let isAllowed = false;

          if (isOwner) {
            isAllowed = true;
          } else if (privacy === 'everyone') {
            isAllowed = true;
          } else if (privacy === 'selected' || privacy === 'close_friends') {
            isAllowed = Array.isArray(data.allowedUserIds) && data.allowedUserIds.includes(currentUserId);
          } else if (privacy === 'exclude') {
            isAllowed = !Array.isArray(data.excludedUserIds) || !data.excludedUserIds.includes(currentUserId);
          } else if (privacy === 'contacts') {
            isAllowed = true; // Contacts privacy
          }

          if (isAllowed) {
            rawSlides.push({
              id: data.id || docSnap.id,
              userId: data.userId,
              userName: data.userName || 'Bharat User',
              userAvatar: data.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              type: data.type || 'text',
              mediaUrl: data.mediaUrl || data.url,
              url: data.mediaUrl || data.url,
              caption: data.caption || '',
              bgColor: data.bgColor || 'from-amber-600 via-rose-600 to-sky-700',
              stickers: data.stickers || [],
              linkUrl: data.linkUrl || undefined,
              linkText: data.linkText || undefined,
              duration: data.duration || 5,
              timestamp: formatStoryTimestamp(data.createdAtRaw || (data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now())),
              createdAt: data.createdAt,
              createdAtRaw: data.createdAtRaw || Date.now(),
              expiresAt: docExpiresAt,
              privacy: data.privacy || 'everyone',
              allowedUserIds: data.allowedUserIds || [],
              excludedUserIds: data.excludedUserIds || [],
              viewsCount: data.viewsCount || 0,
              reactionsCount: data.reactionsCount || 0,
              isDeleted: data.isDeleted || false,
            });
          }
        });

        // Group slides by userId into StoryItem groupings
        const userStoriesMap = new Map<string, StoryItem>();

        rawSlides.sort((a, b) => (a.createdAtRaw || 0) - (b.createdAtRaw || 0));

        rawSlides.forEach((slide) => {
          if (!userStoriesMap.has(slide.userId)) {
            userStoriesMap.set(slide.userId, {
              id: `story_user_${slide.userId}`,
              userId: slide.userId,
              userName: slide.userName,
              userAvatar: slide.userAvatar,
              hasUnseen: false,
              timestamp: slide.timestamp,
              slides: [],
            });
          }

          const userStory = userStoriesMap.get(slide.userId)!;
          userStory.slides.push(slide);
          userStory.timestamp = slide.timestamp; // update to most recent slide timestamp
        });

        // Compute hasUnseen for each user story
        const storyItems: StoryItem[] = [];
        userStoriesMap.forEach((storyItem) => {
          const hasAnyUnseen = storyItem.slides.some((s) => !viewedStoryIds.has(s.id));
          storyItem.hasUnseen = hasAnyUnseen;
          storyItems.push(storyItem);
        });

        // Sort: Current user first, then unseen stories, then seen stories by timestamp
        storyItems.sort((a, b) => {
          if (a.userId === currentUserId) return -1;
          if (b.userId === currentUserId) return 1;
          if (a.hasUnseen && !b.hasUnseen) return -1;
          if (!a.hasUnseen && b.hasUnseen) return 1;
          return 0;
        });

        onUpdate(storyItems);
      },
      (error) => {
        console.error('Error listening to stories:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error: any) {
    console.error('Error setting up story listener:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * 3. Record a story view in subcollection /stories/{storyId}/views/{viewerId}
 */
export const recordStoryViewInDb = async (
  storyId: string,
  viewer: UserProfile
): Promise<void> => {
  try {
    const viewRef = doc(db, 'stories', storyId, 'views', viewer.id);
    const existingSnap = await getDoc(viewRef);

    if (!existingSnap.exists()) {
      await setDoc(viewRef, {
        viewerId: viewer.id,
        viewerName: viewer.name,
        viewerAvatar: viewer.avatar,
        viewedAt: Date.now(),
      });

      // Increment views count on story
      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        viewsCount: increment(1),
      });
    }
  } catch (error) {
    console.warn('Note: Could not record story view:', error);
  }
};

/**
 * 4. Subscribe to the real-time viewer list for a story (for story owner)
 */
export const subscribeToStoryViews = (
  storyId: string,
  onUpdate: (views: StoryViewItem[]) => void
): Unsubscribe => {
  try {
    const viewsRef = collection(db, 'stories', storyId, 'views');
    const q = query(viewsRef, orderBy('viewedAt', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const viewers: StoryViewItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as any;
          viewers.push({
            viewerId: data.viewerId || d.id,
            viewerName: data.viewerName || 'Bharat User',
            viewerAvatar: data.viewerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            viewedAt: data.viewedAt || Date.now(),
          });
        });
        onUpdate(viewers);
      },
      (error) => {
        console.warn('Viewer list snapshot error:', error);
      }
    );
  } catch (error) {
    console.error('Error subscribing to story views:', error);
    return () => {};
  }
};

/**
 * 5. React to a story (❤️ 😂 😮 😢 🔥 👍 🙏 🇮🇳)
 */
export const reactToStoryInDb = async (
  storyId: string,
  user: UserProfile,
  emoji: string
): Promise<void> => {
  try {
    const reactionRef = doc(db, 'stories', storyId, 'reactions', user.id);
    await setDoc(reactionRef, {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      emoji: emoji,
      createdAt: Date.now(),
    });

    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      reactionsCount: increment(1),
    });
  } catch (error) {
    console.error('Error reacting to story:', error);
    throw error;
  }
};

/**
 * 6. Reply to a story - routes into private messaging and logs to story replies
 */
export const replyToStoryInDb = async (
  story: StorySlide,
  sender: UserProfile,
  replyText: string
): Promise<void> => {
  try {
    // 1. Record reply in story subcollection
    const replyRef = doc(collection(db, 'stories', story.id, 'replies'));
    await setDoc(replyRef, {
      id: replyRef.id,
      storyId: story.id,
      userId: sender.id,
      userName: sender.name,
      userAvatar: sender.avatar,
      text: replyText.trim(),
      createdAt: serverTimestamp(),
    });

    // 2. Automatically dispatch direct chat message to story owner
    if (story.userId !== sender.id) {
      const recipientUser: UserProfile = {
        id: story.userId,
        name: story.userName,
        avatar: story.userAvatar,
        handle: `@${story.userName.toLowerCase().replace(/\s+/g, '')}`,
        statusQuote: '',
        isOnline: true,
        phone: '',
        upiId: '',
        locale: 'en',
      };

      const chatId = await getOrCreatePrivateChatInDb(sender, recipientUser);
      
      const storyContextLabel = story.type === 'text' 
        ? `"${story.caption?.slice(0, 40) || 'Text story'}..."`
        : `[Story: ${story.caption ? story.caption.slice(0, 30) : 'Photo/Video'}]`;

      const formattedMessage = `📸 Replied to your story (${storyContextLabel}):\n\n${replyText.trim()}`;
      
      await sendFirestoreMessage(chatId, {
        chatId,
        senderId: sender.id,
        senderName: sender.name,
        senderAvatar: sender.avatar,
        text: formattedMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeRaw: Date.now(),
        status: 'sent',
        isStarred: false,
      });
    }
  } catch (error) {
    console.error('Error sending reply to story:', error);
    throw error;
  }
};

/**
 * 7. Delete an active story (owner only)
 */
export const deleteStoryInDb = async (storyId: string): Promise<void> => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      isDeleted: true,
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

/**
 * 8. Report an inappropriate story
 */
export const reportStoryInDb = async (
  story: StorySlide,
  reporter: UserProfile,
  reason: string,
  details?: string
): Promise<void> => {
  try {
    const reportRef = doc(collection(db, 'storyReports'));
    const reportData: StoryReportItem = {
      id: reportRef.id,
      storyId: story.id,
      storyAuthorId: story.userId,
      reporterId: reporter.id,
      reporterName: reporter.name,
      reason,
      details: details ? details.trim() : '',
      createdAt: serverTimestamp(),
    };

    await setDoc(reportRef, reportData);
  } catch (error) {
    console.error('Error reporting story:', error);
    throw error;
  }
};

/**
 * Helper to format story slide relative time
 */
function formatStoryTimestamp(timestamp: number): string {
  if (!timestamp) return 'Just now';
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return 'Yesterday';
}
