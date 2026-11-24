/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/common/DeviceFrame';

// Onboarding & Auth Screens
import { SplashScreen } from './components/screens/onboarding/SplashScreen';
import { WelcomeScreen } from './components/screens/onboarding/WelcomeScreen';
import { PhoneLoginScreen } from './components/screens/onboarding/PhoneLoginScreen';
import { OtpVerifyScreen } from './components/screens/onboarding/OtpVerifyScreen';
import { ProfileSetupScreen } from './components/screens/onboarding/ProfileSetupScreen';

// Messaging & Feeds
import { ChatListScreen } from './components/screens/messaging/ChatListScreen';
import { PrivateChatScreen } from './components/screens/messaging/PrivateChatScreen';
import { GroupChatScreen } from './components/screens/messaging/GroupChatScreen';
import { ChannelFeedScreen } from './components/screens/messaging/ChannelFeedScreen';
import { ChannelDetailScreen } from './components/screens/messaging/ChannelDetailScreen';
import { CreateGroupScreen } from './components/screens/messaging/CreateGroupScreen';
import { StarredMessagesScreen } from './components/screens/messaging/StarredMessagesScreen';
import { ArchivedChatsScreen } from './components/screens/messaging/ArchivedChatsScreen';

// Audio / Video / Live Broadcasting
import { VoiceCallScreen } from './components/screens/calls/VoiceCallScreen';
import { VideoCallScreen } from './components/screens/calls/VideoCallScreen';
import { GroupVideoCallScreen } from './components/screens/calls/GroupVideoCallScreen';
import { LiveStreamViewerScreen } from './components/screens/calls/LiveStreamViewerScreen';
import { LiveStreamStudioScreen } from './components/screens/calls/LiveStreamStudioScreen';
import { IncomingCallOverlay } from './components/screens/calls/IncomingCallOverlay';

// Media, Stories & Fintech (BharatPay)
import { StatusStoriesScreen } from './components/screens/media/StatusStoriesScreen';
import { StoryViewerScreen } from './components/screens/media/StoryViewerScreen';
import { MediaGalleryScreen } from './components/screens/media/MediaGalleryScreen';
import { UpiPaymentScreen } from './components/screens/media/UpiPaymentScreen';
import { PassbookScreen } from './components/screens/media/PassbookScreen';
import { DocumentVaultScreen } from './components/screens/media/DocumentVaultScreen';

// AI & Smart Productivity Tools
import { BharatAiScreen } from './components/screens/ai_tools/BharatAiScreen';
import { PollQuizScreen } from './components/screens/ai_tools/PollQuizScreen';
import { LiveLocationScreen } from './components/screens/ai_tools/LiveLocationScreen';
import { StickerHubScreen } from './components/screens/ai_tools/StickerHubScreen';

// Discovery, Contacts & Search
import { GlobalSearchScreen } from './components/screens/discovery/GlobalSearchScreen';
import { ExploreHubScreen } from './components/screens/discovery/ExploreHubScreen';
import { ContactsScreen } from './components/screens/discovery/ContactsScreen';
import { QrScannerScreen } from './components/screens/discovery/QrScannerScreen';
import { NotificationsScreen } from './components/screens/discovery/NotificationsScreen';

// Settings, Privacy & Customization
import { SettingsHubScreen } from './components/screens/settings/SettingsHubScreen';
import { UserProfileScreen } from './components/screens/settings/UserProfileScreen';
import { PrivacySecurityScreen } from './components/screens/settings/PrivacySecurityScreen';
import { IndicLanguageScreen } from './components/screens/settings/IndicLanguageScreen';
import { ThemeCustomizerScreen } from './components/screens/settings/ThemeCustomizerScreen';
import { DataStorageScreen } from './components/screens/settings/DataStorageScreen';
import { BlockedUsersScreen } from './components/screens/settings/BlockedUsersScreen';
import { AdminDashboardScreen } from './components/screens/settings/AdminDashboardScreen';
import { HelpSupportScreen } from './components/screens/settings/HelpSupportScreen';

const ScreenRouter: React.FC = () => {
  const { currentScreen, activeStory, callState } = useApp();

  const renderScreen = () => {
    // If a story is active, open story viewer overlay
    if (activeStory) {
      return <StoryViewerScreen />;
    }

    // Active call modal override if user is in call
    if (callState.isActive) {
      if (callState.callType === 'group_video') return <GroupVideoCallScreen />;
      if (callState.callType === 'video') return <VideoCallScreen />;
      return <VoiceCallScreen />;
    }

    switch (currentScreen) {
      // 1. Onboarding
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'phone_login':
        return <PhoneLoginScreen />;
      case 'otp_verify':
        return <OtpVerifyScreen />;
      case 'profile_setup':
        return <ProfileSetupScreen />;

      // 2. Messaging
      case 'chat_list':
        return <ChatListScreen />;
      case 'private_chat':
        return <PrivateChatScreen />;
      case 'group_chat':
        return <GroupChatScreen />;
      case 'channel_feed':
        return <ChannelFeedScreen />;
      case 'channel_detail':
        return <ChannelDetailScreen />;
      case 'create_group':
        return <CreateGroupScreen />;
      case 'starred_messages':
        return <StarredMessagesScreen />;
      case 'archived_chats':
        return <ArchivedChatsScreen />;

      // 3. Audio & Video Calls
      case 'voice_call':
        return <VoiceCallScreen />;
      case 'video_call':
        return <VideoCallScreen />;
      case 'group_video_call':
        return <GroupVideoCallScreen />;
      case 'live_stream_viewer':
        return <LiveStreamViewerScreen />;
      case 'live_stream_studio':
        return <LiveStreamStudioScreen />;

      // 4. Stories & Media & Fintech
      case 'status_stories':
        return <StatusStoriesScreen />;
      case 'story_viewer':
        return <StoryViewerScreen />;
      case 'media_gallery':
        return <MediaGalleryScreen />;
      case 'upi_payment':
        return <UpiPaymentScreen />;
      case 'passbook':
        return <PassbookScreen />;
      case 'document_vault':
        return <DocumentVaultScreen />;

      // 5. Bharat AI & Smart Tools
      case 'bharat_ai':
        return <BharatAiScreen />;
      case 'poll_quiz':
        return <PollQuizScreen />;
      case 'live_location':
        return <LiveLocationScreen />;
      case 'sticker_hub':
        return <StickerHubScreen />;

      // 6. Search, Discovery & Contacts
      case 'global_search':
        return <GlobalSearchScreen />;
      case 'explore_hub':
        return <ExploreHubScreen />;
      case 'contacts':
        return <ContactsScreen />;
      case 'qr_scanner':
        return <QrScannerScreen />;
      case 'notifications':
        return <NotificationsScreen />;

      // 7. Settings, Privacy & Customization
      case 'settings_hub':
        return <SettingsHubScreen />;
      case 'user_profile':
        return <UserProfileScreen />;
      case 'privacy_security':
        return <PrivacySecurityScreen />;
      case 'indic_language':
        return <IndicLanguageScreen />;
      case 'theme_customizer':
        return <ThemeCustomizerScreen />;
      case 'data_storage':
        return <DataStorageScreen />;
      case 'blocked_users':
        return <BlockedUsersScreen />;
      case 'admin_dashboard':
        return <AdminDashboardScreen />;
      case 'help_support':
        return <HelpSupportScreen />;

      default:
        return <ChatListScreen />;
    }
  };

  return (
    <>
      <IncomingCallOverlay />
      {renderScreen()}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DeviceFrame>
        <ScreenRouter />
      </DeviceFrame>
    </AppProvider>
  );
}
