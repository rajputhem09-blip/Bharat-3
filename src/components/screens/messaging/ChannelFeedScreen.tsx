import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  Radio,
  Share2,
  Bell,
  BellOff,
  Heart,
  Eye,
  MessageCircle,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Flame,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  MoreVertical,
  Plus,
  Send,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  BarChart2,
  Users,
  Check,
} from 'lucide-react';
import { ChannelPost, ChatItem } from '../../../types';
import {
  subscribeToChannelDetails,
  subscribeToChannelPosts,
  incrementChannelPostView,
} from '../../../services/channelService';
import { ChannelPostComposerModal } from './ChannelPostComposerModal';
import { ChannelCommentsModal } from './ChannelCommentsModal';
import { ChannelAdminModal } from './ChannelAdminModal';

export const ChannelFeedScreen: React.FC = () => {
  const {
    chats,
    activeChatId,
    navigate,
    currentUser,
    subscribeToChannel,
    unsubscribeFromChannel,
    reactToChannelPost,
    pinChannelPost,
    deleteChannelPost,
    triggerConfetti,
  } = useApp();

  // Find local or context channel
  const fallbackChannel =
    chats.find((c) => c.type === 'channel' && c.id === activeChatId) ||
    chats.find((c) => c.type === 'channel') ||
    chats[3];

  const [channelData, setChannelData] = useState<ChatItem>(fallbackChannel);
  const [posts, setPosts] = useState<ChannelPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<ChannelPost | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [postMenuId, setPostMenuId] = useState<string | null>(null);

  // Poll votes local tracking
  const [votedPollOptionIds, setVotedPollOptionIds] = useState<Record<string, string>>({});

  const isRealChannel = activeChatId && !activeChatId.startsWith('chat_');

  // Real-time channel listener
  useEffect(() => {
    if (!activeChatId) return;

    if (isRealChannel) {
      const unsubChannel = subscribeToChannelDetails(activeChatId, (ch) => {
        if (ch) {
          setChannelData(ch);
        }
      });

      const unsubPosts = subscribeToChannelPosts(activeChatId, (fetchedPosts) => {
        setPosts(fetchedPosts);
        setIsLoading(false);

        // Increment views for recent posts
        fetchedPosts.slice(0, 3).forEach((p) => {
          incrementChannelPostView(activeChatId, p.id);
        });
      });

      return () => {
        unsubChannel();
        unsubPosts();
      };
    } else {
      // Mock channel fallback data
      setChannelData(fallbackChannel);
      setPosts([
        {
          id: 'p1',
          channelId: activeChatId,
          title: 'Mission Update: Gaganyaan Orbital Module Successfully Tested! 🛰️🇮🇳',
          body: 'The Indian Space Research Organisation has achieved another historic milestone. The Crew Module completed its high-altitude descent sequence and splashdown recovery simulations in the Bay of Bengal with zero telemetry error.\n\nKey Highlights:\n• Drogue parachute deployment: Nominal\n• Apex cover separation: Nominal\n• Sea recovery transponder signal: 100% Locked',
          mediaUrl: 'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
          authorId: 'isro_hq',
          authorName: 'ISRO Operations HQ',
          authorAvatar: fallbackChannel.avatar,
          createdAt: '09:50 AM',
          viewsCount: 842000,
          forwardsCount: 18400,
          commentsCount: 342,
          isPinned: true,
          reactions: { '🇮🇳': 45000, '🚀': 28900, '❤️': 14200, '🔥': 19500, '👏': 9800 },
        },
        {
          id: 'p2',
          channelId: activeChatId,
          title: 'Join ISRO Live Stream: Technical Briefing with Space Scientists',
          body: 'Watch the live technical telemetry feed and scientist Q&A session today at 4:00 PM IST on BharatChat Live Broadcasting channel.',
          authorId: 'isro_hq',
          authorName: 'ISRO Operations HQ',
          authorAvatar: fallbackChannel.avatar,
          createdAt: '08:15 AM',
          viewsCount: 610000,
          forwardsCount: 9200,
          commentsCount: 154,
          isLiveSoon: true,
          liveStreamUrl: 'https://isro.gov.in/live',
          reactions: { '🇮🇳': 32000, '🚀': 15400, '❤️': 8900, '🔥': 12300, '👏': 5600 },
        },
      ]);
      setIsLoading(false);
    }
  }, [activeChatId, isRealChannel]);

  const isOwner = channelData.ownerId === currentUser.id || channelData.createdBy === currentUser.id;
  const isAdmin = isOwner || channelData.adminIds?.includes(currentUser.id) || channelData.moderatorIds?.includes(currentUser.id);
  const isSubscribed = channelData.memberIds?.includes(currentUser.id) ?? true;

  const pinnedPost = posts.find((p) => p.isPinned);

  const handleToggleSubscribe = async () => {
    if (isSubscribed) {
      await unsubscribeFromChannel(channelData.id);
    } else {
      await subscribeToChannel(channelData.id);
      triggerConfetti();
    }
  };

  const handleReaction = async (postId: string, emoji: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const reactions = { ...(p.reactions || {}) };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...p, reactions };
      })
    );

    triggerConfetti();
    await reactToChannelPost(channelData.id, postId, emoji);
  };

  const handlePinToggle = async (postId: string, currentPinned: boolean) => {
    setPostMenuId(null);
    await pinChannelPost(channelData.id, postId, !currentPinned);
  };

  const handleDeletePost = async (postId: string) => {
    setPostMenuId(null);
    if (confirm('Delete this broadcast post?')) {
      await deleteChannelPost(channelData.id, postId);
    }
  };

  const handlePollVote = (postId: string, optionId: string) => {
    setVotedPollOptionIds((prev) => ({ ...prev, [postId]: optionId }));
    triggerConfetti();
  };

  const formatCount = (count: number) => {
    if (!count) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Header */}
      <Header
        title={channelData.name}
        subtitle={`${formatCount(channelData.subscribersCount || channelData.membersCount || 845000)} Subscribers ${
          channelData.username ? `• @${channelData.username}` : ''
        }`}
        avatar={channelData.avatar || channelData.photo}
        showBack={true}
        showSearch={true}
        onBackClick={() => navigate('chat_list')}
        rightAction={
          <div className="flex items-center space-x-1">
            {isAdmin && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="p-2 text-slate-400 hover:text-sky-400 rounded-full hover:bg-slate-800 transition-colors"
                title="Channel Settings & Admins"
              >
                <Radio className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => navigate('channel_detail')}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              title="Channel Info"
            >
              <Users className="w-5 h-5 text-sky-400" />
            </button>
          </div>
        }
      />

      {/* Pinned Broadcast Banner */}
      {pinnedPost && (
        <div
          onClick={() => {
            const el = document.getElementById(`post-${pinnedPost.id}`);
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border-b border-sky-500/30 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Pinned Broadcast
              </span>
              <p className="text-xs text-slate-200 truncate">
                {pinnedPost.title || pinnedPost.body}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-sky-400 font-semibold shrink-0 ml-2">Jump →</span>
        </div>
      )}

      {/* Broadcast Feed Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {isLoading ? (
          <div className="space-y-4 py-8">
            {[1, 2].map((i) => (
              <div key={i} className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-24 bg-slate-800 rounded-2xl"></div>
                <div className="h-3 bg-slate-800 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-sky-500/10 text-sky-400 flex items-center justify-center shadow-xl">
              <Radio className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">No Broadcasts Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {isAdmin
                ? 'You are an administrator of this channel. Click "Broadcast Post" below to publish the first update to your subscribers.'
                : 'Stay tuned! The administrators have not published any broadcasts to this channel yet.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsComposerOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish First Post</span>
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => {
            const hasUserVotedPoll = votedPollOptionIds[post.id];

            return (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5 relative hover:border-slate-700/80 transition-all"
              >
                {/* Post Author / Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={post.authorAvatar || channelData.avatar || 'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80'}
                      alt={post.authorName}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-sky-500/30"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-white">{post.authorName}</span>
                        <span className="text-sky-400 text-xs">✓</span>
                        {post.isPinned && (
                          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            <Pin className="w-2.5 h-2.5" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="relative">
                      <button
                        onClick={() => setPostMenuId(postMenuId === post.id ? null : post.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {postMenuId === post.id && (
                        <div className="absolute right-0 top-8 z-30 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-1 min-w-[140px] animate-scale-up">
                          <button
                            onClick={() => handlePinToggle(post.id, !!post.isPinned)}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-700 text-xs text-white"
                          >
                            {post.isPinned ? <PinOff className="w-3.5 h-3.5 text-amber-400" /> : <Pin className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{post.isPinned ? 'Unpin Post' : 'Pin Post'}</span>
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-rose-950 text-xs text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Media Presentation */}
                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950">
                    {post.mediaType === 'image' && (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full max-h-96 object-cover"
                      />
                    )}
                    {post.mediaType === 'video' && (
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-full max-h-80 object-cover bg-black"
                      />
                    )}
                    {post.mediaType === 'audio' && (
                      <div className="p-4 flex items-center space-x-3 bg-slate-950">
                        <audio src={post.mediaUrl} controls className="w-full" />
                      </div>
                    )}
                    {post.mediaType === 'document' && (
                      <div className="p-4 flex items-center justify-between bg-slate-950">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{post.mediaName || 'Document.pdf'}</div>
                            <span className="text-[10px] text-slate-400">PDF • Official Attachment</span>
                          </div>
                        </div>
                        <a
                          href={post.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-sky-600/20 text-sky-400 hover:bg-sky-600 hover:text-white text-xs font-semibold"
                        >
                          View
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Post Content */}
                <div className="space-y-1.5">
                  {post.title && (
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      {post.title}
                    </h3>
                  )}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {post.body}
                  </p>
                </div>

                {/* Poll Rendering */}
                {post.pollData && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <BarChart2 className="w-4 h-4 text-amber-400" />
                        <span>{post.pollData.question}</span>
                      </h4>
                      <span className="text-[10px] text-slate-400">Anonymous Poll</span>
                    </div>

                    <div className="space-y-2">
                      {post.pollData.options.map((opt) => {
                        const isSelected = hasUserVotedPoll === opt.id;
                        const totalVotes = (post.pollData?.totalVotes || 0) + (hasUserVotedPoll ? 1 : 0);
                        const optVotes = opt.votes + (isSelected ? 1 : 0);
                        const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

                        return (
                          <div
                            key={opt.id}
                            onClick={() => handlePollVote(post.id, opt.id)}
                            className={`p-3 rounded-xl border relative overflow-hidden cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-950/40 border-amber-500'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-amber-500/15 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative z-10 flex items-center justify-between text-xs">
                              <span className={`font-semibold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                                {opt.text}
                              </span>
                              <span className="text-[11px] font-mono text-slate-300 font-bold">
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Live Stream Call to Action */}
                {post.isLiveSoon && (
                  <button
                    onClick={() => {
                      if (post.liveStreamUrl) {
                        window.open(post.liveStreamUrl, '_blank');
                      } else {
                        navigate('live_stream_viewer');
                      }
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>Watch Official Live Broadcast & Telemetry</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Reactions & Footer Metrics */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Emoji Reactions Bar */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['🇮🇳', '🚀', '❤️', '🔥', '👏'].map((emoji) => {
                      const count = post.reactions?.[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(post.id, emoji)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs flex items-center space-x-1.5 transition-all active:scale-110 cursor-pointer border border-slate-700/50"
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] font-mono font-semibold text-slate-300">
                            {formatCount(count)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Discussion & Stats */}
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <button
                      onClick={() => setSelectedPostForComments(post)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-sky-600/15 hover:bg-sky-600/25 text-sky-400 border border-sky-600/30 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">
                        {post.commentsCount > 0 ? `${post.commentsCount} Comments` : 'Discuss'}
                      </span>
                    </button>

                    <span className="flex items-center space-x-1 text-[11px] font-mono text-slate-400">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatCount(post.viewsCount || 1)}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Bar (Subscribe / Mute / Broadcast Controls) */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between space-x-2">
        {isAdmin ? (
          <div className="flex-1 flex items-center space-x-2">
            <button
              onClick={() => setIsComposerOpen(true)}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/25 transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast New Post</span>
            </button>

            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Channel Settings"
            >
              <Radio className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center space-x-2">
            <button
              onClick={handleToggleSubscribe}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isSubscribed
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/25'
              }`}
            >
              {isSubscribed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed (Mute Updates)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ Join & Subscribe to Channel</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Sub-Modals */}
      <ChannelPostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        channelId={channelData.id}
        channelName={channelData.name}
      />

      <ChannelCommentsModal
        isOpen={!!selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
        channelId={channelData.id}
        post={selectedPostForComments}
      />

      <ChannelAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        channel={channelData}
      />
    </div>
  );
};
