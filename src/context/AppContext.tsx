import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  GroupMember,
  GroupPermissions,
  GroupRole,
  ScreenId,
  DeviceMode,
  AppTheme,
  UserProfile,
  ChatItem,
  ChatMessage,
  StoryItem,
  StorySlide,
  StoryPrivacy,
  StoryViewItem,
  StoryReactionItem,
  StoryReportItem,
  UpiTransaction,
  LiveStreamData,
  PollData,
  CallSession,
  CallStatus,
} from '../types';
import {
  CURRENT_USER,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_STORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_LIVE_STREAM,
  INITIAL_POLL,
  CONTACTS_DATA,
} from '../data/mockData';
import confetti from 'canvas-confetti';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  getUserProfile,
  saveUserProfile,
  logoutFirebaseUser,
  sendPhoneOtp,
  verifyPhoneOtp,
  checkUsernameAvailability,
  signInGuestUser,
} from '../services/authService';
import {
  subscribeToUserChats,
  subscribeToChatMessages,
  sendFirestoreMessage,
  updateMessageReactionInDb,
  toggleStarMessageInDb,
  createGroupInFirestore,
  getOrCreatePrivateChatInDb,
  searchUsersInDb,
  editMessageInDb,
  deleteMessageInDb,
  togglePinMessageInDb,
  markMessagesAsReadInDb,
  setChatTypingInDb,
  subscribeToChatTyping,
} from '../services/chatService';
import {
  createGroupWithAdmin,
  subscribeToGroupDetails,
  updateGroupInfoInDb,
  updateGroupPermissionsInDb,
  addMembersToGroupInDb,
  removeMemberFromGroupInDb,
  updateMemberRoleInDb,
  toggleMuteMemberInDb,
  toggleBanMemberInDb,
  manageGroupInviteLinkInDb,
  joinGroupByInviteCodeInDb,
  leaveGroupInDb,
  deleteGroupInDb,
  searchGroupMessagesInDb,
  DEFAULT_GROUP_PERMISSIONS,
} from '../services/groupService';
import {
  createChannel,
  CreateChannelParams,
  subscribeToChannelDetails,
  subscribeToChannelPosts,
  createChannelPost,
  updateChannelPost,
  deleteChannelPost as deleteChannelPostInDb,
  pinChannelPost as pinChannelPostInDb,
  reactToChannelPost as reactToChannelPostInDb,
  incrementChannelPostView,
  subscribeToChannel as subscribeToChannelInDb,
  unsubscribeFromChannel as unsubscribeFromChannelInDb,
  searchPublicChannels as searchPublicChannelsInDb,
} from '../services/channelService';
import {
  uploadChatMedia,
  UploadProgressCallback,
} from '../services/storageService';
import {
  recordUpiTransaction,
  subscribeToTransactions,
} from '../services/fintechService';
import {
  createStoryInDb,
  subscribeToActiveStories,
  recordStoryViewInDb,
  reactToStoryInDb,
  replyToStoryInDb,
  deleteStoryInDb,
  reportStoryInDb,
  CreateStoryParams,
} from '../services/storyService';
import {
  initiateCallSession,
  answerCallSession,
  declineCallSession,
  endCallSession,
  subscribeToIncomingCalls,
  getLocalUserMedia,
  switchVideoCamera,
  callAudioTones,
} from '../services/callService';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'PAYMENT' | 'CHANNEL' | 'MESSAGE' | 'SECURITY';
}

interface AppContextType {
  currentScreen: ScreenId;
  previousScreen: ScreenId | null;
  deviceMode: DeviceMode;
  currentTheme: AppTheme;
  isDarkMode: boolean;
  currentLanguage: string;
  currentUser: UserProfile;
  firebaseUser: User | null;
  isAuthLoading: boolean;
  authError: string | null;
  chats: ChatItem[];
  activeChatId: string;
  messages: Record<string, ChatMessage[]>;
  stories: StoryItem[];
  transactions: UpiTransaction[];
  liveStream: LiveStreamData;
  poll: PollData;
  notifications: NotificationItem[];
  isGalleryOpen: boolean;
  activeStory: StoryItem | null;
  activeStoryIndex: number;
  callState: {
    isActive: boolean;
    callType: 'voice' | 'video' | 'group_video' | null;
    participantName: string;
    participantAvatar: string;
    duration: number;
    isMuted: boolean;
    isSpeaker: boolean;
    isVideoOff: boolean;
    callStatus: CallStatus;
  };
  incomingCall: CallSession | null;
  activeCallSession: CallSession | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  cameraFacing: 'user' | 'environment';
  callStatus: CallStatus;

  // Phase 2 Messaging Additions
  isPeerTyping: boolean;
  uploadProgress: number | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchUsers: (queryStr: string) => Promise<UserProfile[]>;
  startDirectChatWithUser: (targetUser: UserProfile) => Promise<string>;
  editMessage: (chatId: string, messageId: string, newText: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  togglePinMessage: (chatId: string, messageId: string) => Promise<void>;
  forwardMessage: (message: ChatMessage, targetChatIds: string[]) => Promise<void>;
  uploadAndSendMedia: (
    chatId: string,
    file: File | Blob,
    type: 'image' | 'video' | 'audio' | 'document',
    fileName?: string,
    replyTo?: ChatMessage['replyTo']
  ) => Promise<void>;
  setTyping: (chatId: string, isTyping: boolean) => void;

  // Actions
  navigate: (screen: ScreenId, chatId?: string) => void;
  goBack: () => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setTheme: (theme: AppTheme) => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: string) => void;
  setActiveChatId: (chatId: string) => void;
  sendMessage: (
    chatId: string,
    text: string,
    attachments?: ChatMessage['attachments'],
    replyTo?: ChatMessage['replyTo']
  ) => Promise<void>;
  sendAiPrompt: (prompt: string) => Promise<void>;
  sendUpiPayment: (
    recipientName: string,
    recipientUpi: string,
    amount: number,
    note: string,
    recipientAvatar?: string
  ) => Promise<void>;
  votePoll: (optionId: string) => void;
  addMessageReaction: (chatId: string, messageId: string, emoji: string) => void;
  toggleStarMessage: (chatId: string, messageId: string) => void;
  translateMessageText: (chatId: string, messageId: string, targetLangName: string) => void;
  startCall: (type: 'voice' | 'video' | 'group_video', name: string, avatar: string, peerUserId?: string) => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  declineIncomingCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMuteCall: () => void;
  toggleSpeakerCall: () => void;
  toggleVideoCall: () => void;
  switchCamera: () => Promise<void>;
  openStory: (story: StoryItem, index?: number) => void;
  closeStory: () => void;
  toggleGalleryModal: (open?: boolean) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addNewGroup: (name: string, members: string[], description?: string) => Promise<void>;
  createNewGroupWithAdmin: (
    name: string,
    description: string,
    avatar: string,
    selectedMembers: UserProfile[],
    permissions?: GroupPermissions
  ) => Promise<string>;
  updateGroupInfo: (
    chatId: string,
    updates: { name?: string; description?: string; topic?: string; avatar?: string }
  ) => Promise<void>;
  updateGroupPermissions: (chatId: string, newPermissions: GroupPermissions) => Promise<void>;
  addMembersToGroup: (chatId: string, newMembers: UserProfile[]) => Promise<void>;
  removeMemberFromGroup: (chatId: string, targetUserId: string, targetUserName: string) => Promise<void>;
  updateMemberRole: (chatId: string, targetUserId: string, targetUserName: string, newRole: GroupRole) => Promise<void>;
  toggleMuteMember: (chatId: string, targetUserId: string, targetUserName: string, isMuted: boolean) => Promise<void>;
  toggleBanMember: (chatId: string, targetUserId: string, targetUserName: string, isBanned: boolean) => Promise<void>;
  manageGroupInviteLink: (chatId: string, action: 'reset' | 'revoke') => Promise<string | null>;
  joinGroupByInviteCode: (inviteCode: string) => Promise<{ success: boolean; chatId?: string; message?: string }>;
  leaveGroup: (chatId: string) => Promise<void>;
  deleteGroup: (chatId: string) => Promise<void>;
  searchGroupMessages: (chatId: string, keyword: string) => Promise<ChatMessage[]>;
  
  // Phase 4 Channels
  createNewChannel: (params: CreateChannelParams) => Promise<string>;
  createNewChannelPost: (
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
    }
  ) => Promise<string>;
  subscribeToChannel: (channelId: string) => Promise<void>;
  unsubscribeFromChannel: (channelId: string) => Promise<void>;
  pinChannelPost: (channelId: string, postId: string, isPinned: boolean) => Promise<void>;
  deleteChannelPost: (channelId: string, postId: string) => Promise<void>;
  reactToChannelPost: (channelId: string, postId: string, emoji: string) => Promise<void>;
  searchPublicChannels: (queryStr: string) => Promise<ChatItem[]>;

  // Phase 5 Stories
  viewedStoryIds: Set<string>;
  createStory: (params: CreateStoryParams) => Promise<string>;
  deleteStory: (storyId: string) => Promise<void>;
  viewStorySlide: (storyId: string) => Promise<void>;
  reactToStory: (storyId: string, emoji: string) => Promise<void>;
  replyToStory: (storyId: string, text: string, slideData: StorySlide) => Promise<void>;
  reportStory: (storyId: string, reason: string, details?: string) => Promise<void>;

  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  triggerConfetti: () => void;
  
  // Real Firebase Auth Helpers
  handleSendOtp: (phoneNumber: string) => Promise<void>;
  handleVerifyOtp: (otpCode: string) => Promise<boolean>;
  handleSignOut: () => Promise<void>;
  setAuthError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('chat_list');
  const [previousScreen, setPreviousScreen] = useState<ScreenId | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [currentTheme, setTheme] = useState<AppTheme>('classic_saffron');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentLanguage, setLanguage] = useState<string>('English (Indian Standard)');
  
  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);

  // App Data State
  const [chats, setChats] = useState<ChatItem[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('chat_priya');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('bharat_viewed_stories');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [transactions, setTransactions] = useState<UpiTransaction[]>(INITIAL_TRANSACTIONS);
  const [liveStream, setLiveStream] = useState<LiveStreamData>(INITIAL_LIVE_STREAM);
  const [poll, setPoll] = useState<PollData>(INITIAL_POLL);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [isPeerTyping, setIsPeerTyping] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'BharatPay UPI Received',
      body: '₹1,450 successfully received from Priya Sundaram for Team Masala Dosa Treat.',
      timestamp: '10:32 AM',
      isRead: false,
      type: 'PAYMENT',
    },
    {
      id: 'notif_2',
      title: 'ISRO Official Broadcast 🛰️',
      body: 'LIVE: Gaganyaan Crew Module re-entry test concluded successfully in Bay of Bengal.',
      timestamp: '09:50 AM',
      isRead: false,
      type: 'CHANNEL',
    },
    {
      id: 'notif_3',
      title: 'BharatPKI Security Audit',
      body: 'Zero-knowledge cryptographic keys verified for current active session.',
      timestamp: 'Yesterday',
      isRead: true,
      type: 'SECURITY',
    },
  ]);

  const [callState, setCallState] = useState<{
    isActive: boolean;
    callType: 'voice' | 'video' | 'group_video' | null;
    participantName: string;
    participantAvatar: string;
    duration: number;
    isMuted: boolean;
    isSpeaker: boolean;
    isVideoOff: boolean;
    callStatus: CallStatus;
  }>({
    isActive: false,
    callType: null,
    participantName: 'Priya Sundaram',
    participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    duration: 0,
    isMuted: false,
    isSpeaker: true,
    isVideoOff: false,
    callStatus: 'idle',
  });

  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [activeCallSession, setActiveCallSession] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Incoming Calls Real-Time Listener
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = subscribeToIncomingCalls(currentUser.id, (call) => {
      setIncomingCall(call);
    });
    return () => unsub();
  }, [currentUser?.id]);

  // Call Duration Counter
  useEffect(() => {
    if (callStatus === 'connected' && callState.isActive) {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      callTimerRef.current = setInterval(() => {
        setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callStatus, callState.isActive]);

  // 1. Firebase Auth Observer
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setFirebaseUser(user);
      setIsAuthLoading(false);

      if (user) {
        // Load user profile from Firestore
        try {
          const profile = await getUserProfile(user.uid);
          if (profile && isMounted) {
            setCurrentUser(profile);
          } else if (isMounted) {
            // New user -> setup default profile
            const defaultUser: UserProfile = {
              id: user.uid,
              name: user.displayName || 'Bharat User',
              phone: user.phoneNumber || '',
              handle: `user_${user.uid.slice(0, 6)}`,
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              statusQuote: 'Building the digital future of Bharat 🇮🇳',
              isOnline: true,
              isVerified: true,
              upiId: `user_${user.uid.slice(0, 5)}@bharatpay`,
              locale: 'en',
              bio: '',
            };
            setCurrentUser(defaultUser);
          }
        } catch (err) {
          console.warn('Profile fetch note:', err);
        }
      } else {
        // Try establishing anonymous guest session if configured in Firebase
        try {
          await signInGuestUser();
        } catch {
          // Fallback seamlessly to client-side demo profile
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 2. Real-time Firestore Chat and Passbook Subscriptions
  useEffect(() => {
    if (!firebaseUser) return;

    // Listen to chats
    const unsubChats = subscribeToUserChats(firebaseUser.uid, (remoteChats) => {
      if (remoteChats.length > 0) {
        // Merge with system bot and channels
        const systemBots = INITIAL_CHATS.filter((c) => c.type === 'ai_bot' || c.type === 'channel');
        const merged = [...remoteChats];
        systemBots.forEach((b) => {
          if (!merged.some((m) => m.id === b.id)) {
            merged.push(b);
          }
        });
        setChats(merged);
      }
    });

    // Listen to transactions
    const unsubTx = subscribeToTransactions(firebaseUser.uid, (remoteTxs) => {
      if (remoteTxs.length > 0) {
        setTransactions(remoteTxs);
      }
    });

    // Listen to real-time active stories
    const unsubStories = subscribeToActiveStories(firebaseUser.uid, viewedStoryIds, (remoteStories) => {
      if (remoteStories.length > 0) {
        setStories(remoteStories);
      }
    });

    return () => {
      unsubChats();
      unsubTx();
      unsubStories();
    };
  }, [firebaseUser, viewedStoryIds]);

  // 3. Active Chat Message Subscription & Typing Indicator
  useEffect(() => {
    if (!firebaseUser || !activeChatId || activeChatId.startsWith('chat_')) return;

    const unsubMsg = subscribeToChatMessages(activeChatId, (remoteMessages) => {
      if (remoteMessages.length > 0) {
        setMessages((prev) => ({
          ...prev,
          [activeChatId]: remoteMessages,
        }));
      }
    });

    // Subscribe to peer typing indicator in this chat
    const unsubTyping = subscribeToChatTyping(
      activeChatId,
      firebaseUser.uid,
      (typing) => {
        setIsPeerTyping(typing);
      }
    );

    // Mark incoming messages as read
    markMessagesAsReadInDb(activeChatId, firebaseUser.uid);

    return () => {
      unsubMsg();
      unsubTyping();
    };
  }, [activeChatId, firebaseUser]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callState.isActive) {
      interval = setInterval(() => {
        setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.isActive]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#FFFFFF', '#10B981', '#0284C7'],
      });
    } catch {
      // Fallback
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const navigate = (screen: ScreenId, chatId?: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    if (chatId) {
      setActiveChatId(chatId);
    }
  };

  const goBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
    } else {
      setCurrentScreen('chat_list');
    }
  };

  // Search users across Firestore + Mock Directory
  const searchUsers = async (queryStr: string): Promise<UserProfile[]> => {
    if (!queryStr.trim()) return [];
    
    // 1. Search in Firestore
    const remoteUsers = await searchUsersInDb(queryStr, currentUser.id);

    // 2. Also search mock contacts for seamless offline/demo experience
    const localMatches: UserProfile[] = CONTACTS_DATA
      .filter((c) =>
        c.name.toLowerCase().includes(queryStr.toLowerCase()) ||
        c.phone.includes(queryStr) ||
        (c.upiId && c.upiId.toLowerCase().includes(queryStr.toLowerCase()))
      )
      .map((c) => ({
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
      }));

    // Merge distinct by ID
    const map = new Map<string, UserProfile>();
    remoteUsers.forEach((u) => map.set(u.id, u));
    localMatches.forEach((u) => {
      if (!map.has(u.id)) map.set(u.id, u);
    });

    return Array.from(map.values());
  };

  // Start / Open Direct Chat with any User
  const startDirectChatWithUser = async (targetUser: UserProfile): Promise<string> => {
    let targetChatId = `chat_${targetUser.handle || targetUser.id}`;

    if (firebaseUser) {
      try {
        targetChatId = await getOrCreatePrivateChatInDb(currentUser, targetUser);
      } catch (err) {
        console.warn('Fallback direct chat create:', err);
      }
    }

    // Ensure it exists in chat list state
    const existing = chats.find((c) => c.id === targetChatId);
    if (!existing) {
      const newChat: ChatItem = {
        id: targetChatId,
        type: 'direct',
        name: targetUser.name,
        avatar: targetUser.avatar,
        lastMessage: 'Tap to start conversing',
        lastMessageTime: 'Just now',
        lastMessageRaw: Date.now(),
        unreadCount: 0,
        isOnline: targetUser.isOnline,
        isVerified: targetUser.isVerified,
        topic: `@${targetUser.handle}`,
      };
      setChats((prev) => [newChat, ...prev]);
    }

    setActiveChatId(targetChatId);
    navigate('private_chat', targetChatId);
    return targetChatId;
  };

  // Firebase Phone Auth - Step 1: Send OTP
  const handleSendOtp = async (phoneNumber: string) => {
    setAuthError(null);
    try {
      await sendPhoneOtp(phoneNumber);
      navigate('otp_verify');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Failed to send OTP. Check phone number and reCAPTCHA.');
      throw err;
    }
  };

  // Firebase Phone Auth - Step 2: Verify OTP
  const handleVerifyOtp = async (otpCode: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const user = await verifyPhoneOtp(otpCode);
      triggerConfetti();

      // Check if user has existing profile in Firestore
      const existingProfile = await getUserProfile(user.uid);
      if (existingProfile) {
        setCurrentUser(existingProfile);
        navigate('chat_list');
        return true;
      } else {
        navigate('profile_setup');
        return false;
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Invalid or expired OTP code. Please try again.');
      throw err;
    }
  };

  // Firebase Sign Out
  const handleSignOut = async () => {
    try {
      await logoutFirebaseUser();
      navigate('phone_login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const sendMessage = async (
    chatId: string,
    text: string,
    attachments?: ChatMessage['attachments'],
    replyTo?: ChatMessage['replyTo']
  ) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeRaw = Date.now();

    const newMsg: ChatMessage = {
      id: 'msg_' + timeRaw,
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp,
      timeRaw,
      status: 'sent',
      attachments,
      replyTo,
    };

    // Optimistic Local State Update
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    // Update last message in chat list
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: text || (attachments ? `[${attachments[0].type}]` : 'Sent a message'),
              lastMessageTime: 'Just now',
              lastMessageRaw: timeRaw,
            }
          : c
      )
    );

    // Save to real Firestore if authenticated
    if (firebaseUser && chatId !== 'chat_ai') {
      try {
        await sendFirestoreMessage(chatId, {
          chatId,
          senderId: firebaseUser.uid,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          text,
          timestamp,
          timeRaw,
          status: 'sent',
          attachments,
          replyTo,
        });
      } catch (err) {
        console.warn('Saved optimistically; Firestore sync notice:', err);
      }
    }

    // Auto-reply for demo conversation
    if (chatId === 'chat_priya') {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: 'msg_reply_' + Date.now(),
          chatId,
          senderId: 'usr_priya',
          senderName: 'Priya Sundaram',
          senderAvatar:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          text: "Super cool! Real-time synchronization is working smoothly. 👍✨",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeRaw: Date.now(),
          status: 'read',
        };
        setMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), replyMsg],
        }));
      }, 1500);
    }
  };

  // Upload Media using Firebase Storage and send message
  const uploadAndSendMedia = async (
    chatId: string,
    file: File | Blob,
    type: 'image' | 'video' | 'audio' | 'document',
    fileName?: string,
    replyTo?: ChatMessage['replyTo']
  ) => {
    setUploadProgress(10);
    try {
      const name = fileName || (file instanceof File ? file.name : `file_${Date.now()}`);
      
      let uploadResult = {
        url: '',
        name,
        size: '1.2 MB',
        type,
      };

      try {
        uploadResult = await uploadChatMedia(
          chatId,
          file,
          name,
          type,
          (progress) => {
            setUploadProgress(progress);
          }
        );
      } catch (storageErr) {
        console.warn('Storage fallback url generation for preview:', storageErr);
        // Create local object URL if storage rules restrict
        uploadResult.url = URL.createObjectURL(file);
      }

      setUploadProgress(null);

      await sendMessage(
        chatId,
        '',
        [
          {
            type,
            url: uploadResult.url,
            name: uploadResult.name,
            size: uploadResult.size,
          },
        ],
        replyTo
      );
      triggerConfetti();
    } catch (err) {
      setUploadProgress(null);
      console.error('Failed to upload and send media:', err);
      throw err;
    }
  };

  // Edit an existing message
  const editMessage = async (chatId: string, messageId: string, newText: string) => {
    if (!newText.trim()) return;

    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) =>
          m.id === messageId ? { ...m, text: newText } : m
        ),
      };
    });

    if (firebaseUser && chatId !== 'chat_ai') {
      try {
        await editMessageInDb(chatId, messageId, newText);
      } catch (err) {
        console.error('Failed to edit message in Firestore:', err);
      }
    }
  };

  // Delete message
  const deleteMessage = async (chatId: string, messageId: string) => {
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, text: '🚫 This message was deleted', attachments: [] }
            : m
        ),
      };
    });

    if (firebaseUser && chatId !== 'chat_ai') {
      try {
        await deleteMessageInDb(chatId, messageId);
      } catch (err) {
        console.error('Failed to delete message in Firestore:', err);
      }
    }
  };

  // Pin/Unpin message
  const togglePinMessage = async (chatId: string, messageId: string) => {
    let currentPinned = false;
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) => {
          if (m.id === messageId) {
            currentPinned = !m.isPinned;
            return { ...m, isPinned: !m.isPinned };
          }
          return m;
        }),
      };
    });

    if (firebaseUser && chatId !== 'chat_ai') {
      await togglePinMessageInDb(chatId, messageId, !currentPinned);
    }
  };

  // Forward message to target conversations
  const forwardMessage = async (message: ChatMessage, targetChatIds: string[]) => {
    for (const tid of targetChatIds) {
      await sendMessage(tid, message.text, message.attachments);
    }
    triggerConfetti();
  };

  // Set typing status
  const setTyping = (chatId: string, isTyping: boolean) => {
    if (firebaseUser && chatId !== 'chat_ai') {
      setChatTypingInDb(chatId, firebaseUser.uid, isTyping);
    }
  };

  const sendAiPrompt = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMsgId = 'ai_user_' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      chatId: 'chat_ai',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeRaw: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      chat_ai: [...(prev['chat_ai'] || []), userMsg],
    }));

    // Generate intelligent Indic AI Response
    setTimeout(() => {
      let aiReply = '';
      const lower = prompt.toLowerCase();

      if (lower.includes('hindi') || lower.includes('translate') || lower.includes('अनुवाद')) {
        aiReply = `🇮🇳 **Bharat AI Multilingual Translation:**\n\n**Original:** "${prompt}"\n\n**हिन्दी (Hindi):** "नमस्ते! भारतचैट में आपका स्वागत है। हम सब मिलकर भारतीय तकनीक को वैश्विक स्तर पर ले जा रहे हैं।"\n\n**தமிழ் (Tamil):** "வணக்கம்! பாரத்சாட்டில் உங்களை அன்புடன் வரவேற்கிறோம்."\n\n**తెలుగు (Telugu):** "నమస్కారం! భారత్‌చాట్‌కి స్వాగతం."`;
      } else if (lower.includes('summary') || lower.includes('summarize') || lower.includes('meeting')) {
        aiReply = `📋 **Meeting & Chat Summary (Bharat AI)**\n\n1. **Key Decision:** Firebase Auth & Firestore backend operational.\n2. **Fintech Milestone:** UPI BharatPay peer-to-peer latency dropped to under 120ms.\n3. **Next Steps:** Verified zero-knowledge encryption & 10 Indic languages.\n\n*Confidence Score: 99.4% | Model: Gemini Indic Turbo*`;
      } else if (
        lower.includes('diwali') ||
        lower.includes('festival') ||
        lower.includes('greeting') ||
        lower.includes('wishes')
      ) {
        aiReply = `🪔 **Festive Greetings Generated for You:**\n\n**Option A (Warm & Traditional):**\n"दीपों का यह पावन पर्व आपके और आपके परिवार के जीवन में सुख, शांति, समृद्धि और अपार खुशियाँ लेकर आए। शुभ दीपावली! 🪔✨"\n\n**Option B (Professional Corporate):**\n"Wishing you and your esteemed organization a vibrant and prosperous Deepavali. May this season illuminate fruitful collaborations and shared success!"`;
      } else {
        aiReply = `🤖 **Bharat AI Response:**\n\nThank you for asking! In BharatChat, everything is designed for high-speed Indic communication, military-grade end-to-end encryption, and seamless peer-to-peer payments via BharatPay UPI.\n\n💡 *Pro-tip: You can ask me to summarize chat threads, translate across 10+ Indian languages, create custom polls, or format professional messages!*`;
      }

      const botMsg: ChatMessage = {
        id: 'ai_bot_' + Date.now(),
        chatId: 'chat_ai',
        senderId: 'bot_bharat',
        senderName: 'Bharat AI Copilot 🇮🇳',
        senderAvatar:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeRaw: Date.now(),
        status: 'read',
      };

      setMessages((prev) => ({
        ...prev,
        chat_ai: [...(prev['chat_ai'] || []), botMsg],
      }));
    }, 1000);
  };

  const sendUpiPayment = async (
    recipientName: string,
    recipientUpi: string,
    amount: number,
    note: string,
    recipientAvatar?: string
  ) => {
    const txId = `BHARAT/${new Date().getFullYear()}/${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newTx: UpiTransaction = {
      id: 'tx_' + Date.now(),
      txId,
      recipientName,
      recipientAvatar:
        recipientAvatar ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      recipientUpi,
      amount,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SUCCESS',
      note: note || 'Instant UPI Transfer',
      type: 'SENT',
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (activeChatId) {
      sendMessage(activeChatId, `₹${amount.toLocaleString('en-IN')} sent via BharatPay UPI`, [
        {
          type: 'upi_payment',
          amount,
          upiStatus: 'success',
          name: note || 'BharatPay Transfer',
        },
      ]);
    }

    triggerConfetti();

    if (firebaseUser) {
      try {
        await recordUpiTransaction(
          {
            txId,
            recipientName,
            recipientAvatar: newTx.recipientAvatar,
            recipientUpi,
            amount,
            timestamp: newTx.timestamp,
            status: 'SUCCESS',
            note: note || 'Instant UPI Transfer',
            type: 'SENT',
          },
          firebaseUser.uid
        );
      } catch (err) {
        console.warn('Firestore UPI log notice:', err);
      }
    }

    setNotifications((prev) => [
      {
        id: 'notif_' + Date.now(),
        title: 'BharatPay Transfer Successful',
        body: `₹${amount.toLocaleString('en-IN')} sent to ${recipientName}`,
        timestamp: 'Just now',
        isRead: false,
        type: 'PAYMENT',
      },
      ...prev,
    ]);
  };

  const votePoll = (optionId: string) => {
    setPoll((prev) => ({
      ...prev,
      hasVoted: true,
      totalVotes: prev.totalVotes + 1,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
    }));
    triggerConfetti();
  };

  const addMessageReaction = (chatId: string, messageId: string, emoji: string) => {
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) => {
          if (m.id !== messageId) return m;
          const currentReactions = m.reactions || [];
          const existing = currentReactions.find((r) => r.emoji === emoji);
          let updatedReactions;
          if (existing) {
            updatedReactions = currentReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            );
          } else {
            updatedReactions = [...currentReactions, { emoji, count: 1, users: [currentUser.id] }];
          }
          return { ...m, reactions: updatedReactions };
        }),
      };
    });

    if (firebaseUser && chatId !== 'chat_ai') {
      updateMessageReactionInDb(chatId, messageId, firebaseUser.uid, emoji);
    }
  };

  const toggleStarMessage = (chatId: string, messageId: string) => {
    let currentStarred = false;
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) => {
          if (m.id === messageId) {
            currentStarred = !!m.isStarred;
            return { ...m, isStarred: !m.isStarred };
          }
          return m;
        }),
      };
    });

    if (firebaseUser && chatId !== 'chat_ai') {
      toggleStarMessageInDb(chatId, messageId, currentStarred);
    }
  };

  const translateMessageText = (chatId: string, messageId: string, targetLangName: string) => {
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) => {
          if (m.id !== messageId) return m;
          return {
            ...m,
            translatedText: `[Translated to ${targetLangName}]: ` + m.text,
            translatedLanguage: targetLangName,
          };
        }),
      };
    });
  };

  const startCall = async (
    type: 'voice' | 'video' | 'group_video',
    name: string,
    avatar: string,
    peerUserId?: string
  ) => {
    try {
      callAudioTones.stop();
      let targetUserId = peerUserId;
      if (!targetUserId) {
        const directChat = chats.find((c) => c.id === activeChatId && c.type === 'direct');
        if (directChat) {
          if (directChat.memberIds && directChat.memberIds.length > 0) {
            const other = directChat.memberIds.find((id) => id !== currentUser.id);
            if (other) targetUserId = other;
          } else if (directChat.id.startsWith('direct_')) {
            const parts = directChat.id.replace('direct_', '').split('_');
            const other = parts.find((id) => id !== currentUser.id);
            if (other) targetUserId = other;
          }
          if (!targetUserId) {
            targetUserId = directChat.id.replace('chat_', 'usr_');
          }
        } else {
          targetUserId = 'usr_priya';
        }
      }

      setCallState({
        isActive: true,
        callType: type,
        participantName: name,
        participantAvatar: avatar,
        duration: 0,
        isMuted: false,
        isSpeaker: true,
        isVideoOff: false,
        callStatus: 'offering',
      });
      setCallStatus('offering');

      if (type === 'voice') navigate('voice_call');
      else if (type === 'video') navigate('video_call');
      else navigate('group_video_call');

      if (type === 'group_video') return;

      // Acquire real local media stream
      const stream = await getLocalUserMedia(type, cameraFacing);
      setLocalStream(stream);
      localStreamRef.current = stream;

      // Real Firestore WebRTC signaling if user is authenticated
      if (firebaseUser) {
        const { callId, peerConnection } = await initiateCallSession(
          {
            caller: currentUser,
            receiverId: targetUserId,
            receiverName: name,
            receiverAvatar: avatar,
            type,
          },
          stream,
          (remote) => setRemoteStream(remote),
          (newStatus) => {
            setCallStatus(newStatus);
            setCallState((prev) => ({ ...prev, callStatus: newStatus }));
            if (newStatus === 'ended' || newStatus === 'declined') {
              endCall();
            }
          }
        );

        peerConnectionRef.current = peerConnection;
        setActiveCallSession({
          id: callId,
          callerId: currentUser.id,
          callerName: currentUser.name,
          callerAvatar: currentUser.avatar,
          receiverId: targetUserId,
          receiverName: name,
          receiverAvatar: avatar,
          type,
          status: 'offering',
          createdAt: Date.now(),
        });
      } else {
        // Fallback for offline/preview test: connect after realistic dialtone
        setTimeout(() => {
          setCallStatus('connected');
          setCallState((prev) => ({ ...prev, callStatus: 'connected' }));
          callAudioTones.stop();
        }, 3000);
      }
    } catch (err) {
      console.error('Error starting call:', err);
    }
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;
    const callToAccept = incomingCall;
    setIncomingCall(null);
    callAudioTones.stop();

    try {
      setCallState({
        isActive: true,
        callType: callToAccept.type,
        participantName: callToAccept.callerName,
        participantAvatar: callToAccept.callerAvatar,
        duration: 0,
        isMuted: false,
        isSpeaker: true,
        isVideoOff: false,
        callStatus: 'connected',
      });
      setCallStatus('connected');
      setActiveCallSession(callToAccept);

      if (callToAccept.type === 'voice') navigate('voice_call');
      else navigate('video_call');

      const stream = await getLocalUserMedia(callToAccept.type, cameraFacing);
      setLocalStream(stream);
      localStreamRef.current = stream;

      const peerConnection = await answerCallSession(
        callToAccept,
        stream,
        (remote) => setRemoteStream(remote),
        (newStatus) => {
          setCallStatus(newStatus);
          setCallState((prev) => ({ ...prev, callStatus: newStatus }));
          if (newStatus === 'ended' || newStatus === 'declined') {
            endCall();
          }
        }
      );
      peerConnectionRef.current = peerConnection;
    } catch (err) {
      console.error('Error accepting incoming call:', err);
    }
  };

  const declineIncomingCall = async () => {
    if (!incomingCall) return;
    callAudioTones.stop();
    callAudioTones.playEndCallTone();
    try {
      await declineCallSession(incomingCall.id);
    } catch (err) {
      console.error('Error declining incoming call:', err);
    } finally {
      setIncomingCall(null);
    }
  };

  const endCall = async () => {
    callAudioTones.stop();
    callAudioTones.playEndCallTone();

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    if (activeCallSession) {
      endCallSession(activeCallSession.id, callState.duration).catch(() => {});
      setActiveCallSession(null);
    }

    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
    setCallStatus('idle');
    setCallState((prev) => ({
      ...prev,
      isActive: false,
      callType: null,
      duration: 0,
      callStatus: 'idle',
    }));
    goBack();
  };

  const toggleMuteCall = () => {
    const nextMuted = !callState.isMuted;
    setCallState((prev) => ({ ...prev, isMuted: nextMuted }));
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextMuted;
      });
    }
  };

  const toggleSpeakerCall = () => {
    setCallState((prev) => ({ ...prev, isSpeaker: !prev.isSpeaker }));
  };

  const toggleVideoCall = () => {
    const nextVideoOff = !callState.isVideoOff;
    setCallState((prev) => ({ ...prev, isVideoOff: nextVideoOff }));
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !nextVideoOff;
      });
    }
  };

  const switchCamera = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (localStreamRef.current) {
      const { newStream } = await switchVideoCamera(
        peerConnectionRef.current,
        localStreamRef.current,
        nextFacing
      );
      localStreamRef.current = newStream;
      setLocalStream(newStream);
    }
  };

  const openStory = (story: StoryItem, index = 0) => {
    setActiveStory(story);
    setActiveStoryIndex(index);
    navigate('story_viewer');
  };

  const closeStory = () => {
    setActiveStory(null);
    goBack();
  };

  // Phase 5 Story Handlers
  const createStory = async (params: CreateStoryParams): Promise<string> => {
    try {
      const storyId = await createStoryInDb(params);
      return storyId;
    } catch (err) {
      console.error('Error in createStory context action:', err);
      throw err;
    }
  };

  const deleteStory = async (storyId: string): Promise<void> => {
    try {
      await deleteStoryInDb(storyId);
      // Optimistically remove from state
      setStories((prev) =>
        prev
          .map((st) => ({
            ...st,
            slides: st.slides.filter((sl) => sl.id !== storyId),
          }))
          .filter((st) => st.slides.length > 0)
      );
    } catch (err) {
      console.error('Error deleting story in context action:', err);
      throw err;
    }
  };

  const viewStorySlide = async (storyId: string): Promise<void> => {
    try {
      // Update local viewed state & storage
      setViewedStoryIds((prev) => {
        const next = new Set(prev);
        next.add(storyId);
        try {
          localStorage.setItem('bharat_viewed_stories', JSON.stringify(Array.from(next)));
        } catch {}
        return next;
      });

      // Record to Firestore
      if (firebaseUser) {
        await recordStoryViewInDb(storyId, currentUser);
      }
    } catch (err) {
      console.warn('viewStorySlide warning:', err);
    }
  };

  const reactToStory = async (storyId: string, emoji: string): Promise<void> => {
    try {
      if (firebaseUser) {
        await reactToStoryInDb(storyId, currentUser, emoji);
      }
    } catch (err) {
      console.error('Error reacting to story in context action:', err);
      throw err;
    }
  };

  const replyToStory = async (
    storyId: string,
    text: string,
    slideData: StorySlide
  ): Promise<void> => {
    try {
      if (firebaseUser) {
        await replyToStoryInDb(slideData, currentUser, text);
      }
    } catch (err) {
      console.error('Error replying to story in context action:', err);
      throw err;
    }
  };

  const reportStory = async (
    storyId: string,
    reason: string,
    details?: string
  ): Promise<void> => {
    try {
      // Find slide data
      let targetSlide: StorySlide | undefined;
      for (const st of stories) {
        const found = st.slides.find((s) => s.id === storyId);
        if (found) {
          targetSlide = found;
          break;
        }
      }

      if (targetSlide) {
        await reportStoryInDb(targetSlide, currentUser, reason, details);
      }
    } catch (err) {
      console.error('Error reporting story in context action:', err);
      throw err;
    }
  };

  const toggleGalleryModal = (open?: boolean) => {
    setIsGalleryOpen((prev) => (open !== undefined ? open : !prev));
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    if (firebaseUser) {
      try {
        await saveUserProfile(firebaseUser.uid, {
          ...updates,
          phoneNumber: firebaseUser.phoneNumber || currentUser.phone,
        });
      } catch (err) {
        console.error('Error syncing profile to Firestore:', err);
      }
    }
  };

  const createNewGroupWithAdmin = async (
    name: string,
    description: string,
    avatar: string,
    selectedMembers: UserProfile[],
    permissions: GroupPermissions = DEFAULT_GROUP_PERMISSIONS
  ): Promise<string> => {
    try {
      let createdChatId = 'group_' + Date.now();

      if (firebaseUser) {
        createdChatId = await createGroupWithAdmin(
          name,
          description,
          avatar,
          currentUser,
          selectedMembers,
          permissions
        );
      } else {
        // Local fallback
        const allProfiles: Record<string, any> = {
          [currentUser.id]: {
            name: currentUser.name,
            avatar: currentUser.avatar,
            handle: currentUser.handle,
            role: 'owner',
            joinedAt: Date.now(),
          },
        };
        selectedMembers.forEach((m) => {
          allProfiles[m.id] = {
            name: m.name,
            avatar: m.avatar,
            handle: m.handle,
            role: 'member',
            joinedAt: Date.now(),
          };
        });

        const newGroupItem: ChatItem = {
          id: createdChatId,
          type: 'group',
          name: name.trim(),
          avatar:
            avatar ||
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
          lastMessage: `Group "${name}" created by you`,
          lastMessageTime: 'Just now',
          lastMessageRaw: Date.now(),
          unreadCount: 0,
          membersCount: selectedMembers.length + 1,
          topic: description.trim() || 'Welcome to our BharatChat community group!',
          description: description.trim() || 'BharatChat Community Group',
          role: 'owner',
          ownerId: currentUser.id,
          adminIds: [currentUser.id],
          moderatorIds: [],
          memberIds: [currentUser.id, ...selectedMembers.map((m) => m.id)],
          bannedUserIds: [],
          mutedUserIds: [],
          permissions,
          inviteCode: `bharat_${createdChatId.slice(0, 6)}_${Math.random().toString(36).substring(2, 6)}`,
          memberProfiles: allProfiles,
        };

        setChats((prev) => [newGroupItem, ...prev]);
      }

      setActiveChatId(createdChatId);
      navigate('group_chat', createdChatId);
      triggerConfetti();
      return createdChatId;
    } catch (error) {
      console.error('Error creating group with admin:', error);
      throw error;
    }
  };

  const updateGroupInfo = async (
    chatId: string,
    updates: { name?: string; description?: string; topic?: string; avatar?: string }
  ) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, ...updates } : c))
    );
    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await updateGroupInfoInDb(chatId, updates, currentUser);
      } catch (err) {
        console.error('Error updating group info:', err);
      }
    }
  };

  const updateGroupPermissions = async (
    chatId: string,
    newPermissions: GroupPermissions
  ) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, permissions: newPermissions } : c))
    );
    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await updateGroupPermissionsInDb(chatId, newPermissions, currentUser);
      } catch (err) {
        console.error('Error updating permissions:', err);
      }
    }
  };

  const addMembersToGroup = async (chatId: string, newMembers: UserProfile[]) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const currentMemberIds = c.memberIds || [];
        const newIds = newMembers.map((m) => m.id).filter((id) => !currentMemberIds.includes(id));
        const updatedProfiles = { ...(c.memberProfiles || {}) };
        newMembers.forEach((m) => {
          updatedProfiles[m.id] = {
            name: m.name,
            avatar: m.avatar,
            handle: m.handle,
            role: 'member',
            joinedAt: Date.now(),
          };
        });
        return {
          ...c,
          memberIds: [...currentMemberIds, ...newIds],
          membersCount: (c.membersCount || 1) + newIds.length,
          memberProfiles: updatedProfiles,
        };
      })
    );

    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await addMembersToGroupInDb(chatId, newMembers, currentUser);
      } catch (err) {
        console.error('Error adding members:', err);
      }
    }
  };

  const removeMemberFromGroup = async (
    chatId: string,
    targetUserId: string,
    targetUserName: string
  ) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const updatedProfiles = { ...(c.memberProfiles || {}) };
        delete updatedProfiles[targetUserId];
        return {
          ...c,
          memberIds: (c.memberIds || []).filter((id) => id !== targetUserId),
          adminIds: (c.adminIds || []).filter((id) => id !== targetUserId),
          moderatorIds: (c.moderatorIds || []).filter((id) => id !== targetUserId),
          membersCount: Math.max(1, (c.membersCount || 2) - 1),
          memberProfiles: updatedProfiles,
        };
      })
    );

    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await removeMemberFromGroupInDb(chatId, targetUserId, targetUserName, currentUser);
      } catch (err) {
        console.error('Error removing member:', err);
      }
    }
  };

  const updateMemberRole = async (
    chatId: string,
    targetUserId: string,
    targetUserName: string,
    newRole: GroupRole
  ) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const updatedProfiles = { ...(c.memberProfiles || {}) };
        if (updatedProfiles[targetUserId]) {
          updatedProfiles[targetUserId].role = newRole;
        }
        let updatedAdminIds = c.adminIds || [];
        let updatedModIds = c.moderatorIds || [];
        if (newRole === 'admin') {
          if (!updatedAdminIds.includes(targetUserId)) updatedAdminIds = [...updatedAdminIds, targetUserId];
          updatedModIds = updatedModIds.filter((id) => id !== targetUserId);
        } else if (newRole === 'moderator') {
          if (!updatedModIds.includes(targetUserId)) updatedModIds = [...updatedModIds, targetUserId];
          updatedAdminIds = updatedAdminIds.filter((id) => id !== targetUserId);
        } else if (newRole === 'member') {
          updatedAdminIds = updatedAdminIds.filter((id) => id !== targetUserId);
          updatedModIds = updatedModIds.filter((id) => id !== targetUserId);
        }
        return {
          ...c,
          adminIds: updatedAdminIds,
          moderatorIds: updatedModIds,
          memberProfiles: updatedProfiles,
        };
      })
    );

    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await updateMemberRoleInDb(chatId, targetUserId, targetUserName, newRole, currentUser);
      } catch (err) {
        console.error('Error updating member role:', err);
      }
    }
  };

  const toggleMuteMember = async (
    chatId: string,
    targetUserId: string,
    targetUserName: string,
    isMuted: boolean
  ) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const currentMuted = c.mutedUserIds || [];
        const updatedMuted = isMuted
          ? [...currentMuted, targetUserId]
          : currentMuted.filter((id) => id !== targetUserId);
        const updatedProfiles = { ...(c.memberProfiles || {}) };
        if (updatedProfiles[targetUserId]) {
          updatedProfiles[targetUserId].isMuted = isMuted;
        }
        return {
          ...c,
          mutedUserIds: updatedMuted,
          memberProfiles: updatedProfiles,
        };
      })
    );

    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await toggleMuteMemberInDb(chatId, targetUserId, targetUserName, isMuted, currentUser);
      } catch (err) {
        console.error('Error toggling member mute:', err);
      }
    }
  };

  const toggleBanMember = async (
    chatId: string,
    targetUserId: string,
    targetUserName: string,
    isBanned: boolean
  ) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const currentBanned = c.bannedUserIds || [];
        const updatedBanned = isBanned
          ? [...currentBanned, targetUserId]
          : currentBanned.filter((id) => id !== targetUserId);
        const updatedProfiles = { ...(c.memberProfiles || {}) };
        if (isBanned) delete updatedProfiles[targetUserId];

        return {
          ...c,
          bannedUserIds: updatedBanned,
          memberIds: isBanned ? (c.memberIds || []).filter((id) => id !== targetUserId) : c.memberIds,
          memberProfiles: updatedProfiles,
        };
      })
    );

    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await toggleBanMemberInDb(chatId, targetUserId, targetUserName, isBanned, currentUser);
      } catch (err) {
        console.error('Error toggling member ban:', err);
      }
    }
  };

  const manageGroupInviteLink = async (
    chatId: string,
    action: 'reset' | 'revoke'
  ): Promise<string | null> => {
    let newCode: string | null = null;
    if (action === 'reset') {
      newCode = `bharat_${chatId.slice(0, 6)}_${Math.random().toString(36).substring(2, 6)}`;
    }
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          inviteCode: action === 'reset' ? (newCode || c.inviteCode) : c.inviteCode,
          isInviteLinkRevoked: action === 'revoke',
        };
      })
    );

    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        return await manageGroupInviteLinkInDb(chatId, action, currentUser);
      } catch (err) {
        console.error('Error managing invite link:', err);
      }
    }
    return newCode;
  };

  const joinGroupByInviteCode = async (
    inviteCode: string
  ): Promise<{ success: boolean; chatId?: string; message?: string }> => {
    if (firebaseUser) {
      const result = await joinGroupByInviteCodeInDb(inviteCode, currentUser);
      if (result.success && result.chatId) {
        setActiveChatId(result.chatId);
        navigate('group_chat', result.chatId);
        triggerConfetti();
      }
      return result;
    } else {
      // Local fallback
      const matchingChat = chats.find(
        (c) => c.type === 'group' && c.inviteCode?.toLowerCase() === inviteCode.trim().toLowerCase()
      );
      if (matchingChat) {
        if (matchingChat.isInviteLinkRevoked) {
          return { success: false, message: 'This invite link has been revoked.' };
        }
        setActiveChatId(matchingChat.id);
        navigate('group_chat', matchingChat.id);
        triggerConfetti();
        return { success: true, chatId: matchingChat.id };
      }
      return { success: false, message: 'Group invite code not found.' };
    }
  };

  const leaveGroup = async (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    navigate('chat_list');

    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await leaveGroupInDb(chatId, currentUser);
      } catch (err) {
        console.error('Error leaving group:', err);
      }
    }
  };

  const deleteGroup = async (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    navigate('chat_list');

    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      try {
        await deleteGroupInDb(chatId);
      } catch (err) {
        console.error('Error deleting group:', err);
      }
    }
  };

  const searchGroupMessages = async (
    chatId: string,
    keyword: string
  ): Promise<ChatMessage[]> => {
    if (firebaseUser && !chatId.startsWith('group_mock_')) {
      return await searchGroupMessagesInDb(chatId, keyword);
    }
    const list = messages[chatId] || [];
    const query = keyword.toLowerCase();
    return list.filter(
      (m) =>
        m.text.toLowerCase().includes(query) ||
        m.senderName.toLowerCase().includes(query)
    );
  };

  const addNewGroup = async (name: string, members: string[], description?: string) => {
    const selectedProfiles: UserProfile[] = members.map((id) => {
      const contact = CONTACTS_DATA.find((c) => c.id === id);
      return {
        id,
        name: contact?.name || 'Group Member',
        handle: contact ? `@${contact.name.toLowerCase().replace(/\s+/g, '_')}` : `@user_${id.slice(0, 5)}`,
        avatar: contact?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: contact?.phone,
      };
    });
    await createNewGroupWithAdmin(name, description || '', '', selectedProfiles);
  };

  const createNewChannel = async (params: CreateChannelParams): Promise<string> => {
    try {
      let createdChannelId = 'channel_' + Date.now();
      if (firebaseUser) {
        createdChannelId = await createChannel(params, currentUser);
      } else {
        const newChat: ChatItem = {
          id: createdChannelId,
          type: 'channel',
          name: params.name,
          username: params.username,
          category: params.category,
          channelType: params.channelType,
          description: params.description,
          topic: params.description,
          rules: params.rules,
          isCommentsEnabled: params.isCommentsEnabled !== false,
          avatar: params.avatar || 'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80',
          lastMessage: `Channel created by ${currentUser.name}`,
          lastMessageTime: 'Just now',
          lastMessageRaw: Date.now(),
          unreadCount: 0,
          isVerified: true,
          ownerId: currentUser.id,
          adminIds: [currentUser.id],
          memberIds: [currentUser.id],
          subscribersCount: 1,
          membersCount: 1,
        };
        setChats((prev) => [newChat, ...prev]);
      }

      setActiveChatId(createdChannelId);
      navigate('channel_feed', createdChannelId);
      return createdChannelId;
    } catch (error) {
      console.error('Error in createNewChannel:', error);
      throw error;
    }
  };

  const createNewChannelPost = async (
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
    }
  ): Promise<string> => {
    if (firebaseUser && !channelId.startsWith('chat_')) {
      return await createChannelPost(channelId, postData, currentUser);
    }
    return 'post_' + Date.now();
  };

  const subscribeToChannel = async (channelId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        const currentMembers = c.memberIds || [];
        if (!currentMembers.includes(currentUser.id)) {
          return {
            ...c,
            memberIds: [...currentMembers, currentUser.id],
            subscribersCount: (c.subscribersCount || 1) + 1,
            membersCount: (c.membersCount || 1) + 1,
          };
        }
        return c;
      })
    );

    if (firebaseUser && !channelId.startsWith('chat_')) {
      try {
        await subscribeToChannelInDb(channelId, currentUser);
      } catch (err) {
        console.error('Error subscribing to channel:', err);
      }
    }
  };

  const unsubscribeFromChannel = async (channelId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) return c;
        return {
          ...c,
          memberIds: (c.memberIds || []).filter((id) => id !== currentUser.id),
          subscribersCount: Math.max(0, (c.subscribersCount || 1) - 1),
          membersCount: Math.max(0, (c.membersCount || 1) - 1),
        };
      })
    );

    if (firebaseUser && !channelId.startsWith('chat_')) {
      try {
        await unsubscribeFromChannelInDb(channelId, currentUser.id);
      } catch (err) {
        console.error('Error unsubscribing from channel:', err);
      }
    }
  };

  const pinChannelPost = async (channelId: string, postId: string, isPinned: boolean) => {
    if (firebaseUser && !channelId.startsWith('chat_')) {
      try {
        await pinChannelPostInDb(channelId, postId, isPinned);
      } catch (err) {
        console.error('Error pinning post:', err);
      }
    }
  };

  const deleteChannelPost = async (channelId: string, postId: string) => {
    if (firebaseUser && !channelId.startsWith('chat_')) {
      try {
        await deleteChannelPostInDb(channelId, postId);
      } catch (err) {
        console.error('Error deleting channel post:', err);
      }
    }
  };

  const reactToChannelPost = async (channelId: string, postId: string, emoji: string) => {
    if (firebaseUser && !channelId.startsWith('chat_')) {
      await reactToChannelPostInDb(channelId, postId, emoji, currentUser.id);
    }
  };

  const searchPublicChannels = async (queryStr: string): Promise<ChatItem[]> => {
    if (firebaseUser) {
      return await searchPublicChannelsInDb(queryStr);
    }
    const clean = queryStr.toLowerCase();
    return chats.filter(
      (c) =>
        c.type === 'channel' &&
        (c.name.toLowerCase().includes(clean) ||
          c.username?.toLowerCase().includes(clean) ||
          c.category?.toLowerCase().includes(clean))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        previousScreen,
        deviceMode,
        currentTheme,
        isDarkMode,
        currentLanguage,
        currentUser,
        firebaseUser,
        isAuthLoading,
        authError,
        chats,
        activeChatId,
        messages,
        stories,
        transactions,
        liveStream,
        poll,
        notifications,
        isGalleryOpen,
        activeStory,
        activeStoryIndex,
        callState,
        isPeerTyping,
        uploadProgress,
        searchQuery,
        setSearchQuery,
        searchUsers,
        startDirectChatWithUser,
        editMessage,
        deleteMessage,
        togglePinMessage,
        forwardMessage,
        uploadAndSendMedia,
        setTyping,
        navigate,
        goBack,
        setDeviceMode,
        setTheme,
        toggleDarkMode,
        setLanguage,
        setActiveChatId,
        sendMessage,
        sendAiPrompt,
        sendUpiPayment,
        votePoll,
        addMessageReaction,
        toggleStarMessage,
        translateMessageText,
        startCall,
        acceptIncomingCall,
        declineIncomingCall,
        endCall,
        toggleMuteCall,
        toggleSpeakerCall,
        toggleVideoCall,
        switchCamera,
        incomingCall,
        activeCallSession,
        localStream,
        remoteStream,
        cameraFacing,
        callStatus,
        openStory,
        closeStory,
        toggleGalleryModal,
        updateUserProfile,
        addNewGroup,
        createNewGroupWithAdmin,
        updateGroupInfo,
        updateGroupPermissions,
        addMembersToGroup,
        removeMemberFromGroup,
        updateMemberRole,
        toggleMuteMember,
        toggleBanMember,
        manageGroupInviteLink,
        joinGroupByInviteCode,
        leaveGroup,
        deleteGroup,
        searchGroupMessages,
        createNewChannel,
        createNewChannelPost,
        subscribeToChannel,
        unsubscribeFromChannel,
        pinChannelPost,
        deleteChannelPost,
        reactToChannelPost,
        searchPublicChannels,
        viewedStoryIds,
        createStory,
        deleteStory,
        viewStorySlide,
        reactToStory,
        replyToStory,
        reportStory,
        markNotificationRead,
        clearAllNotifications,
        triggerConfetti,
        handleSendOtp,
        handleVerifyOtp,
        handleSignOut,
        setAuthError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
