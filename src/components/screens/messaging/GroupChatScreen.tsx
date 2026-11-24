import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  Users,
  Send,
  Paperclip,
  BarChart2,
  Sparkles,
  Phone,
  Video,
  Shield,
  Crown,
  Star,
  Pin,
  Smile,
  IndianRupee,
  MoreVertical,
  X,
  Share2,
  Edit2,
  Trash2,
  CornerUpLeft,
  Image as ImageIcon,
  Film,
  FileUp,
  Download,
  AlertCircle,
  Square,
  Mic,
  Search,
  Check,
  CheckCheck,
  Play,
  Pause,
  Lock,
  Globe,
  Settings,
  UserPlus,
} from 'lucide-react';
import { ChatMessage, ChatItem, GroupRole } from '../../../types';
import { GroupInfoModal } from './GroupInfoModal';

export const GroupChatScreen: React.FC = () => {
  const {
    chats,
    activeChatId,
    messages,
    sendMessage,
    currentUser,
    navigate,
    poll,
    votePoll,
    startCall,
    addMessageReaction,
    toggleStarMessage,
    translateMessageText,
    editMessage,
    deleteMessage,
    togglePinMessage,
    forwardMessage,
    uploadAndSendMedia,
    uploadProgress,
    isPeerTyping,
    setTyping,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(40);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Message actions state
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<ChatMessage | null>(null);
  const [selectedForwardChats, setSelectedForwardChats] = useState<string[]>([]);
  const [showIndicLangs, setShowIndicLangs] = useState<string | null>(null);

  // Hidden File Inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat =
    chats.find((c) => c.id === activeChatId) ||
    chats.find((c) => c.type === 'group') ||
    chats[2] || {
      id: activeChatId,
      name: 'Tech Founders & Builders',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
      type: 'group',
      isOnline: true,
      lastMessage: '',
      lastMessageTime: 'Just now',
      lastMessageRaw: Date.now(),
      membersCount: 1420,
      topic: 'Welcome builders! Please follow community guidelines.',
      role: 'admin',
    };

  const groupMessages = messages[activeChat.id] || [];
  const pinnedMessage = groupMessages.find((m) => m.isPinned);

  // Role checks
  const isOwner = activeChat.ownerId === currentUser.id || activeChat.createdBy === currentUser.id;
  const isAdmin = isOwner || (activeChat.adminIds && activeChat.adminIds.includes(currentUser.id));
  const isMod = isAdmin || (activeChat.moderatorIds && activeChat.moderatorIds.includes(currentUser.id));
  const isMuted = activeChat.mutedUserIds && activeChat.mutedUserIds.includes(currentUser.id);

  const permissions = activeChat.permissions || {
    sendMessages: 'all',
    sendMedia: 'all',
    sendFiles: 'all',
    sendVoice: 'all',
    addMembers: 'all',
    pinMessages: 'all',
    editGroupInfo: 'admins_only',
  };

  const canSendMessages = !isMuted && (permissions.sendMessages === 'all' || isAdmin);
  const canSendMedia = !isMuted && (permissions.sendMedia === 'all' || isAdmin);
  const canSendFiles = !isMuted && (permissions.sendFiles === 'all' || isAdmin);
  const canSendVoice = !isMuted && (permissions.sendVoice === 'all' || isAdmin);
  const canPinMessages = permissions.pinMessages === 'all' || isAdmin;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages, isPeerTyping]);

  // Handle typing debounce
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    setTyping(activeChat.id, true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setTyping(activeChat.id, false);
    }, 2000);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || !canSendMessages) return;

    if (editingMsg) {
      editMessage(activeChat.id, editingMsg.id, inputVal.trim());
      setEditingMsg(null);
      setInputVal('');
      return;
    }

    sendMessage(
      activeChat.id,
      inputVal.trim(),
      undefined,
      replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text || '[Media]',
            senderName: replyingTo.senderName,
          }
        : undefined
    );

    setInputVal('');
    setReplyingTo(null);
    setTyping(activeChat.id, false);
  };

  // Voice recording handlers
  const startVoiceRecording = async () => {
    if (!canSendVoice) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (recordSeconds > 0) {
          await uploadAndSendMedia(
            activeChat.id,
            audioBlob,
            'audio',
            `VoiceNote_${new Date().toISOString().slice(0, 10)}.webm`,
            replyingTo
              ? {
                  id: replyingTo.id,
                  text: replyingTo.text || '[Media]',
                  senderName: replyingTo.senderName,
                }
              : undefined
          );
        }
        stream.getTracks().forEach((track) => track.stop());
        setIsRecordingVoice(false);
        setRecordSeconds(0);
        setReplyingTo(null);
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission fallback:', err);
      // Mock voice note upload
      await sendMessage(activeChat.id, '', [
        {
          type: 'audio',
          url: 'https://example.com/mock_audio.mp3',
          duration: '0:14',
          name: 'Group Voice Note',
        },
      ]);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      setRecordSeconds(0);
      setIsRecordingVoice(false);
    }
  };

  // Media File Selection
  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video' | 'document'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);

    await uploadAndSendMedia(
      activeChat.id,
      file,
      type,
      file.name,
      replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text || '[Media]',
            senderName: replyingTo.senderName,
          }
        : undefined
    );
    setReplyingTo(null);
  };

  const handleForward = () => {
    if (!forwardingMsg || selectedForwardChats.length === 0) return;
    selectedForwardChats.forEach((targetChatId) => {
      forwardMessage(forwardingMsg, targetChatId);
    });
    setForwardingMsg(null);
    setSelectedForwardChats([]);
  };

  const indicLanguages = [
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  ];

  const filteredGroupMessages = searchQuery.trim()
    ? groupMessages.filter(
        (m) =>
          m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groupMessages;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      {/* Group Header */}
      <Header
        title={activeChat.name}
        subtitle={`${activeChat.membersCount || activeChat.memberIds?.length || 120} members • 84 online`}
        avatar={activeChat.avatar}
        showBack={true}
        showSearch={false}
        showCallButtons={true}
        onBackClick={() => navigate('chat_list')}
        onAvatarClick={() => setIsGroupInfoOpen(true)}
        rightAction={
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
              title="Search in Group"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGroupInfoOpen(true)}
              className="p-2 text-sky-400 hover:bg-sky-950/40 rounded-full transition-colors"
              title="Group Administration & Info"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* In-Group Search Bar (Toggleable) */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center space-x-2 animate-fade-in">
          <Search className="w-4 h-4 text-sky-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages in this group..."
            className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-slate-500"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pinned Topic Banner */}
      <div className="px-4 py-2 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2 truncate">
          <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            <strong>Topic:</strong> {activeChat.topic || activeChat.description || 'Welcome builders! Please follow community guidelines.'}
          </span>
        </div>
        <button
          onClick={() => navigate('poll_quiz')}
          className="text-[10px] font-semibold text-sky-400 hover:underline shrink-0 ml-2"
        >
          View Polls
        </button>
      </div>

      {/* Pinned Message Alert if present */}
      {pinnedMessage && (
        <div className="px-4 py-1.5 bg-amber-950/40 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2 truncate">
            <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Pinned by Admin:</strong> {pinnedMessage.text}
            </span>
          </div>
          {canPinMessages && (
            <button
              onClick={() => togglePinMessage(activeChat.id, pinnedMessage.id)}
              className="text-[10px] text-amber-400 hover:text-white shrink-0 ml-2"
            >
              Unpin
            </button>
          )}
        </div>
      )}

      {/* Media Upload Progress Indicator */}
      {uploadProgress !== null && (
        <div className="px-4 py-2 bg-sky-950/80 border-b border-sky-500/30 flex items-center justify-between text-xs text-sky-300 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>Uploading to Firebase Storage ({uploadProgress}%)...</span>
          </div>
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Interactive Group Poll Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 flex items-center">
              <BarChart2 className="w-3.5 h-3.5 mr-1" /> Live Group Poll
            </span>
            <span className="text-[10px] text-slate-400">{poll.expiresAt}</span>
          </div>
          <h4 className="text-sm font-semibold text-white">{poll.question}</h4>

          <div className="space-y-2 pt-1">
            {poll.options.map((opt) => {
              const pct = Math.round((opt.votes / poll.totalVotes) * 100) || 0;
              return (
                <div
                  key={opt.id}
                  onClick={() => votePoll(opt.id)}
                  className="relative p-2.5 rounded-xl border border-slate-700 bg-slate-950/60 hover:border-sky-500 cursor-pointer overflow-hidden transition-all group"
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-sky-900/40 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between text-xs z-10">
                    <span className="font-medium text-slate-200 group-hover:text-white">
                      {opt.text}
                    </span>
                    <span className="font-bold text-sky-400">{pct}% ({opt.votes})</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-500 text-right">
            Total {poll.totalVotes} votes submitted • Tap any option to vote
          </div>
        </div>

        {/* Group Chat Messages */}
        {filteredGroupMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isMsgOwner =
            activeChat.ownerId === msg.senderId || activeChat.createdBy === msg.senderId;
          const isMsgAdmin = isMsgOwner || activeChat.adminIds?.includes(msg.senderId);
          const isMsgMod = !isMsgAdmin && activeChat.moderatorIds?.includes(msg.senderId);

          if (msg.isSystemMessage) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 text-center shadow">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 group relative ${
                isMe ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {!isMe && (
                <img
                  src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 ring-1 ring-white/10"
                />
              )}

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-md relative ${
                  isMe
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : 'bg-slate-850 text-slate-100 border border-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Sender Name & Role Badges in Group */}
                {!isMe && (
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-[11px] font-bold text-sky-400 truncate">
                      {msg.senderName}
                    </span>
                    {isMsgOwner && (
                      <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded flex items-center font-semibold">
                        <Crown className="w-2.5 h-2.5 mr-0.5 fill-current" /> Owner
                      </span>
                    )}
                    {isMsgAdmin && !isMsgOwner && (
                      <span className="text-[9px] px-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded flex items-center font-semibold">
                        <Shield className="w-2.5 h-2.5 mr-0.5" /> Admin
                      </span>
                    )}
                    {isMsgMod && (
                      <span className="text-[9px] px-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded flex items-center font-semibold">
                        <Star className="w-2.5 h-2.5 mr-0.5" /> Mod
                      </span>
                    )}
                  </div>
                )}

                {/* Quoted Reply Banner */}
                {msg.replyTo && (
                  <div className="mb-2 p-2 rounded-xl bg-black/25 border-l-2 border-amber-400 text-xs text-white/90">
                    <p className="font-bold text-[10px] text-amber-300">{msg.replyTo.senderName}</p>
                    <p className="truncate text-[11px] opacity-80">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* Media Attachments */}
                {msg.attachments?.map((att, i) => (
                  <div key={i} className="my-1.5 rounded-xl overflow-hidden border border-white/10">
                    {att.type === 'image' && (
                      <img src={att.url} alt="attachment" className="w-full max-h-60 object-cover" />
                    )}

                    {att.type === 'video' && (
                      <div className="relative group/video">
                        <video src={att.url} controls className="w-full max-h-60 rounded-xl bg-black" />
                      </div>
                    )}

                    {att.type === 'audio' && (
                      <div className="flex items-center space-x-3 p-2 bg-slate-900/60 rounded-xl">
                        <button
                          onClick={() =>
                            setIsPlayingAudio(isPlayingAudio === msg.id ? null : msg.id)
                          }
                          className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow"
                        >
                          {isPlayingAudio === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-400"
                              style={{ width: isPlayingAudio === msg.id ? `${audioProgress}%` : '0%' }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-white/60 mt-1">
                            <span>0:14</span>
                            <span className="font-mono">Voice Note</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {att.type === 'document' && (
                      <div className="flex items-center space-x-3 p-2.5 bg-slate-900/80 rounded-xl border border-white/10">
                        <FileUp className="w-6 h-6 text-sky-400 shrink-0" />
                        <div className="flex-1 truncate">
                          <p className="text-xs font-semibold text-white truncate">{att.name || 'Document'}</p>
                          <p className="text-[10px] text-slate-400">{att.size || 'PDF • 1.4 MB'}</p>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {att.type === 'upi_payment' && (
                      <div className="p-3 bg-gradient-to-tr from-emerald-900/80 to-teal-950 rounded-xl border border-emerald-500/40 text-emerald-100 space-y-1">
                        <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                          <IndianRupee className="w-4 h-4" />
                          <span>BharatPay UPI Transfer</span>
                        </div>
                        <div className="text-lg font-extrabold text-white">
                          ₹{att.amount?.toLocaleString('en-IN')}
                        </div>
                        <p className="text-[10px] text-emerald-300">{att.name}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Message Text & Translation */}
                {msg.text && (
                  <p className={`text-xs sm:text-sm leading-relaxed ${msg.isDeleted ? 'italic opacity-60' : ''}`}>
                    {msg.text}
                  </p>
                )}

                {msg.translatedText && (
                  <div className="mt-1.5 pt-1.5 border-t border-white/10 text-xs text-sky-300 italic">
                    <p className="text-[10px] font-bold uppercase not-italic text-sky-400">
                      Translated ({msg.translatedLanguage}):
                    </p>
                    <p>{msg.translatedText}</p>
                  </div>
                )}

                {/* Footer details: time, edited tag, status */}
                <div className="flex items-center justify-end space-x-1.5 text-[10px] text-white/70 mt-1">
                  {msg.isPinned && <Pin className="w-2.5 h-2.5 text-amber-400" />}
                  {msg.isStarred && <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />}
                  {msg.isEdited && <span className="italic text-[9px] opacity-75">edited</span>}
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span className="text-sky-200">
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                      ) : (
                        <Check className="w-3.5 h-3.5 opacity-80" />
                      )}
                    </span>
                  )}
                </div>

                {/* Message Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 -mb-1">
                    {msg.reactions.map((r, i) => (
                      <span
                        key={i}
                        onClick={() => addMessageReaction(activeChat.id, msg.id, r.emoji)}
                        className="px-1.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[11px] flex items-center space-x-1 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <span>{r.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-300">{r.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Context Action Trigger */}
              <div className="relative opacity-0 group-hover:opacity-100 transition-opacity self-center">
                <button
                  onClick={() =>
                    setActiveMenuMsgId(activeMenuMsgId === msg.id ? null : msg.id)
                  }
                  className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white shadow"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Floating Action Menu */}
                {activeMenuMsgId === msg.id && (
                  <div
                    className={`absolute z-30 w-44 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1 space-y-0.5 text-xs text-slate-200 ${
                      isMe ? 'right-0 top-6' : 'left-0 top-6'
                    }`}
                  >
                    {/* Emoji reaction strip */}
                    <div className="flex items-center justify-around py-1.5 px-1 border-b border-slate-800">
                      {['👍', '❤️', '🔥', '😂', '🙏', '🎉'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            addMessageReaction(activeChat.id, msg.id, emoji);
                            setActiveMenuMsgId(null);
                          }}
                          className="hover:scale-125 transition-transform text-sm"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setReplyingTo(msg);
                        setActiveMenuMsgId(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5 text-sky-400" />
                      <span>Reply</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleStarMessage(activeChat.id, msg.id);
                        setActiveMenuMsgId(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>{msg.isStarred ? 'Unstar' : 'Star Message'}</span>
                    </button>

                    {canPinMessages && (
                      <button
                        onClick={() => {
                          togglePinMessage(activeChat.id, msg.id);
                          setActiveMenuMsgId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2"
                      >
                        <Pin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{msg.isPinned ? 'Unpin' : 'Pin in Group'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setForwardingMsg(msg);
                        setActiveMenuMsgId(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Forward</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowIndicLangs(showIndicLangs === msg.id ? null : msg.id);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Translate Indic</span>
                    </button>

                    {showIndicLangs === msg.id && (
                      <div className="p-1 bg-slate-950 rounded-xl space-y-0.5 max-h-36 overflow-y-auto">
                        {indicLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              translateMessageText(activeChat.id, msg.id, lang.name);
                              setShowIndicLangs(null);
                              setActiveMenuMsgId(null);
                            }}
                            className="w-full text-left px-2 py-1 rounded text-[11px] hover:bg-slate-800 text-slate-300 truncate"
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {isMe && !msg.isDeleted && (
                      <button
                        onClick={() => {
                          setEditingMsg(msg);
                          setInputVal(msg.text);
                          setActiveMenuMsgId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Edit Text</span>
                      </button>
                    )}

                    {(isMe || isAdmin) && (
                      <button
                        onClick={() => {
                          deleteMessage(activeChat.id, msg.id);
                          setActiveMenuMsgId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-950 text-rose-400 flex items-center space-x-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isMe ? 'Delete for Everyone' : 'Delete as Admin'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isPeerTyping && (
          <div className="flex items-center space-x-2 text-xs text-sky-400 italic">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>Someone in group is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Replying Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            <CornerUpLeft className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-white">{replyingTo.senderName}</span>
              <p className="text-slate-400 truncate text-[11px]">{replyingTo.text || '[Media]'}</p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMsg && (
        <div className="px-4 py-2 bg-teal-950/80 border-t border-teal-500/40 flex items-center justify-between text-xs text-teal-200">
          <div className="flex items-center space-x-2 truncate">
            <Edit2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="truncate">Editing message...</span>
          </div>
          <button
            onClick={() => {
              setEditingMsg(null);
              setInputVal('');
            }}
            className="p-1 rounded-full hover:bg-teal-900 text-teal-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Permission Restriction Banner if User cannot send messages */}
      {!canSendMessages ? (
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>
            {isMuted
              ? 'You have been muted by a group administrator.'
              : 'Only group administrators can send messages to this group.'}
          </span>
        </div>
      ) : (
        /* Input Toolbar */
        <form
          onSubmit={handleSend}
          className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 relative"
        >
          {/* Attachment button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
              title="Attach media or file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Hidden inputs */}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelected(e, 'image')}
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileSelected(e, 'video')}
            />
            <input
              type="file"
              ref={docInputRef}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
              className="hidden"
              onChange={(e) => handleFileSelected(e, 'document')}
            />

            {/* Attachment popover */}
            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 z-40 w-52 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 space-y-1 text-xs animate-scale-up">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={!canSendMedia}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-800 text-slate-200 disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>Photo & Gallery</span>
                </button>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={!canSendMedia}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-800 text-slate-200 disabled:opacity-50"
                >
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>Video Clip</span>
                </button>

                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={!canSendFiles}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-800 text-slate-200 disabled:opacity-50"
                >
                  <FileUp className="w-4 h-4 text-emerald-400" />
                  <span>Document / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    navigate('upi_payment');
                  }}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-800 text-slate-200"
                >
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  <span>BharatPay UPI Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    navigate('poll_quiz');
                  }}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-800 text-slate-200"
                >
                  <BarChart2 className="w-4 h-4 text-sky-400" />
                  <span>Create Live Poll</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('poll_quiz')}
            className="p-2 text-slate-400 hover:text-amber-400 rounded-full"
            title="Add Poll"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          {/* Voice Note Recording Strip */}
          {isRecordingVoice ? (
            <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-rose-950/60 border border-rose-500/40 rounded-2xl animate-pulse">
              <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Recording {recordSeconds}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              placeholder="Message group (@to mention)..."
              className="flex-1 py-2 px-3.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl text-xs sm:text-sm text-white focus:outline-none placeholder-slate-500"
            />
          )}

          {/* Mic / Send Button */}
          {!inputVal.trim() && !isRecordingVoice && canSendVoice ? (
            <button
              type="button"
              onClick={startVoiceRecording}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-full transition-all"
              title="Record voice note"
            >
              <Mic className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-group-send"
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-full transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      )}

      {/* Forward Modal */}
      {forwardingMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Forward Message</h3>
              <button onClick={() => setForwardingMsg(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">Select chats to forward to:</p>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 rounded-xl bg-slate-950">
              {chats.map((c) => {
                const isSelected = selectedForwardChats.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedForwardChats(selectedForwardChats.filter((id) => id !== c.id));
                      } else {
                        setSelectedForwardChats([...selectedForwardChats, c.id]);
                      }
                    }}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-800 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs text-white truncate">{c.name}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleForward}
              disabled={selectedForwardChats.length === 0}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
            >
              Forward to {selectedForwardChats.length} Chats
            </button>
          </div>
        </div>
      )}

      {/* Group Info & Administration Modal */}
      <GroupInfoModal
        isOpen={isGroupInfoOpen}
        onClose={() => setIsGroupInfoOpen(false)}
        group={activeChat}
      />
    </div>
  );
};
