export type ScreenId =
  // Onboarding (5)
  | 'splash'
  | 'welcome'
  | 'phone_login'
  | 'otp_verify'
  | 'profile_setup'
  // Core Messaging (8)
  | 'chat_list'
  | 'private_chat'
  | 'group_chat'
  | 'channel_feed'
  | 'channel_detail'
  | 'create_group'
  | 'starred_messages'
  | 'archived_chats'
  // Audio, Video & Live Broadcasting (5)
  | 'voice_call'
  | 'video_call'
  | 'group_video_call'
  | 'live_stream_viewer'
  | 'live_stream_studio'
  // Stories, Media & Fintech BharatPay (6)
  | 'status_stories'
  | 'story_viewer'
  | 'media_gallery'
  | 'upi_payment'
  | 'passbook'
  | 'document_vault'
  // AI & Smart Tools (4)
  | 'bharat_ai'
  | 'poll_quiz'
  | 'live_location'
  | 'sticker_hub'
  // Search, Discovery & Contacts (5)
  | 'global_search'
  | 'explore_hub'
  | 'contacts'
  | 'qr_scanner'
  | 'notifications'
  // Settings, Privacy & Customization (9)
  | 'settings_hub'
  | 'user_profile'
  | 'privacy_security'
  | 'indic_language'
  | 'theme_customizer'
  | 'data_storage'
  | 'blocked_users'
  | 'admin_dashboard'
  | 'help_support';

export type DeviceMode = 'mobile' | 'tablet' | 'desktop' | 'gallery';

export type AppTheme =
  | 'classic_saffron'
  | 'bengaluru_tech'
  | 'kerala_emerald'
  | 'jaipur_pink'
  | 'himalayan_snow';

export type ThemeMode = AppTheme;

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'ta'
  | 'te'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa';

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  handle?: string;
  avatar: string;
  statusQuote?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  upiId?: string;
  locale?: LanguageCode;
  bio?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageAttachment {
  type: 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker' | 'upi_payment';
  url?: string;
  name?: string;
  size?: string;
  duration?: number;
  waveform?: number[];
  amount?: number;
  upiStatus?: 'success' | 'pending' | 'failed';
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  translatedText?: string;
  translatedLanguage?: string;
  timestamp: string;
  timeRaw: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isStarred?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  isPinned?: boolean;
  isDeleted?: boolean;
  disappearingIn?: number;
}

export type GroupRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface GroupPermissions {
  sendMessages: 'all' | 'admins_only';
  sendMedia: 'all' | 'admins_only';
  sendFiles: 'all' | 'admins_only';
  sendVoice: 'all' | 'admins_only';
  addMembers: 'all' | 'admins_only';
  pinMessages: 'all' | 'admins_only';
  editGroupInfo: 'all' | 'admins_only';
}

export interface GroupMember {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  phone?: string;
  role: GroupRole;
  joinedAt?: number;
  isOnline?: boolean;
  isMuted?: boolean;
  isBanned?: boolean;
}

export interface ChatItem {
  id: string;
  type: 'direct' | 'group' | 'channel' | 'ai_bot';
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageRaw: number;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  isOnline?: boolean;
  isVerified?: boolean;
  membersCount?: number;
  topic?: string;
  description?: string;
  role?: GroupRole;
  disappearingTimer?: number;
  // Group Admin & RBAC fields
  createdBy?: string;
  ownerId?: string;
  adminIds?: string[];
  moderatorIds?: string[];
  memberIds?: string[];
  bannedUserIds?: string[];
  mutedUserIds?: string[];
  permissions?: GroupPermissions;
  inviteCode?: string;
  isInviteLinkRevoked?: boolean;
  // Channel specific properties
  username?: string;
  channelType?: 'public' | 'private';
  category?: string;
  subscribersCount?: number;
  isCommentsEnabled?: boolean;
  rules?: string;
  adminPermissions?: Record<
    string,
    {
      canPost: boolean;
      canEditInfo: boolean;
      canDeletePosts: boolean;
      canManageInvites: boolean;
    }
  >;
  memberProfiles?: Record<
    string,
    {
      name: string;
      avatar: string;
      handle: string;
      phone?: string;
      role?: GroupRole;
      isMuted?: boolean;
      joinedAt?: number;
    }
  >;
}

export interface ChannelPost {
  id: string;
  channelId: string;
  title?: string;
  body: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'audio' | 'none';
  mediaName?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: any;
  createdAtRaw?: number;
  updatedAt?: any;
  viewsCount: number;
  forwardsCount: number;
  reactions: Record<string, number>;
  userReactions?: Record<string, string[]>;
  isPinned?: boolean;
  commentsCount: number;
  isLiveSoon?: boolean;
  liveStreamUrl?: string;
  pollData?: PollData;
  isDeleted?: boolean;
}

export interface ChannelComment {
  id: string;
  postId: string;
  channelId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: any;
  likesCount?: number;
}

export type StoryPrivacy = 'everyone' | 'contacts' | 'close_friends' | 'selected' | 'exclude';

export interface StorySlide {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'image' | 'video' | 'text';
  url?: string;
  mediaUrl?: string;
  caption?: string;
  bgColor?: string;
  stickers?: { emoji: string; x: number; y: number }[];
  linkUrl?: string;
  linkText?: string;
  duration: number;
  timestamp: string;
  createdAt: any;
  createdAtRaw?: number;
  expiresAt: number;
  privacy: StoryPrivacy;
  allowedUserIds?: string[];
  excludedUserIds?: string[];
  viewsCount: number;
  reactionsCount: number;
  isDeleted?: boolean;
}

export interface StoryViewItem {
  viewerId: string;
  viewerName: string;
  viewerAvatar: string;
  viewedAt: number;
}

export interface StoryReactionItem {
  id?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  emoji: string;
  createdAt: number;
}

export interface StoryReportItem {
  id?: string;
  storyId: string;
  storyAuthorId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details?: string;
  createdAt: any;
}

export interface StoryItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  hasUnseen: boolean;
  timestamp: string;
  slides: StorySlide[];
}

export interface UpiTransaction {
  id: string;
  txId: string;
  recipientName: string;
  recipientAvatar: string;
  recipientUpi: string;
  amount: number;
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  note: string;
  type: 'SENT' | 'RECEIVED' | 'SPLIT_BILL';
}

export interface LiveStreamData {
  id: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  category: string;
  viewerCount: number;
  likesCount: number;
  comments: {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    isSuperChat?: boolean;
    superChatAmount?: number;
    timestamp: string;
  }[];
}

export interface PollData {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
    voters: string[];
  }[];
  totalVotes: number;
  isAnonymous: boolean;
  allowMultiple: boolean;
  expiresAt: string;
  hasVoted?: boolean;
}

export interface ContactItem {
  id: string;
  chatId: string;
  name: string;
  phone: string;
  upiId: string;
  avatar: string;
  status: string;
  isOnline: boolean;
}

export interface IndicLanguageItem {
  code: string;
  name: string;
  nativeScript: string;
  region: string;
}

export interface StickerPackItem {
  id: string;
  name: string;
  category: string;
  author: string;
  items: string[];
}

export type CallType = 'voice' | 'video' | 'group_video';
export type CallStatus =
  | 'idle'
  | 'offering'
  | 'ringing'
  | 'connected'
  | 'ended'
  | 'declined'
  | 'busy'
  | 'missed'
  | 'reconnecting';

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: 'voice' | 'video';
  status: CallStatus;
  offer?: { type: string; sdp: string } | null;
  answer?: { type: string; sdp: string } | null;
  createdAt: number;
  connectedAt?: number | null;
  endedAt?: number | null;
  durationSec?: number;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export interface CallCandidate {
  id?: string;
  candidate: RTCIceCandidateInit;
  timestamp: number;
}

