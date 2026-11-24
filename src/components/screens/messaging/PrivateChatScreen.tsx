import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  IndianRupee,
  Lock,
  Globe,
  Star,
  Check,
  CheckCheck,
  Play,
  Pause,
  Clock,
  FileText,
  MapPin,
  Sparkles,
  MoreVertical,
  X,
  Pin,
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
} from 'lucide-react';
import { ChatMessage, ChatItem } from '../../../types';

export const PrivateChatScreen: React.FC = () => {
  const {
    chats,
    activeChatId,
    messages,
    sendMessage,
    currentUser,
    navigate,
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
  const [audioProgress, setAudioProgress] = useState(35);
  
  // Voice Recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Message Actions state
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

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[1] || {
    id: activeChatId,
    name: 'BharatChat Member',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    type: 'direct',
    isOnline: true,
    lastMessage: '',
    lastMessageTime: 'Just now',
    lastMessageRaw: Date.now(),
  };

  const chatMessages = messages[activeChat.id] || [];
  const pinnedMessage = chatMessages.find((m) => m.isPinned);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isPeerTyping]);

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
    if (!inputVal.trim()) return;

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Send audio note
        if (recordSeconds > 1) {
          await uploadAndSendMedia(
            activeChat.id,
            audioBlob,
            'audio',
            `voice_note_${Date.now()}.webm`,
            replyingTo
              ? {
                  id: replyingTo.id,
                  text: replyingTo.text || '[Media]',
                  senderName: replyingTo.senderName,
                }
              : undefined
          );
        }
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access fallback, using simulated voice note:', err);
      // Fallback voice note for environments without mic hardware
      sendMessage(activeChat.id, '🎤 Indic Voice note (0:12)', [
        {
          type: 'audio',
          duration: 12,
          name: 'voice_note.webm',
          waveform: [30, 60, 90, 45, 80, 100, 70, 50, 85, 40, 65, 30],
        },
      ]);
    }
  };

  const stopVoiceRecording = (cancel = false) => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecordingVoice(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (cancel) {
        audioChunksRef.current = [];
      }
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = async (
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
    e.target.value = '';
  };

  const indicLanguages = [
    'Hindi (हिन्दी)',
    'Tamil (தமிழ்)',
    'Telugu (తెలుగు)',
    'Bengali (বাংলা)',
    'Marathi (मराठी)',
    'Kannada (ಕನ್ನಡ)',
    'Gujarati (ગુજરાતી)',
    'Malayalam (മലയാളം)',
    'Punjabi (ਪੰਜਾਬੀ)',
    'Odia (ଓଡ଼ିଆ)',
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'image')}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'video')}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.zip"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'document')}
      />

      {/* Top Bar with user info & call triggers */}
      <Header
        title={activeChat.name}
        subtitle={
          isPeerTyping
            ? 'typing in Indic...'
            : activeChat.isOnline
            ? 'Online • E2E Secured'
            : 'Last seen recently'
        }
        avatar={activeChat.avatar}
        isOnline={activeChat.isOnline}
        showBack={true}
        showSearch={false}
        showCallButtons={true}
        onBackClick={() => navigate('chat_list')}
        rightAction={
          <button
            onClick={() => navigate('user_profile')}
            className="p-2 text-slate-400 hover:text-white rounded-full"
            title="Contact Info"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        }
      />

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div
          onClick={() => {
            const el = document.getElementById(`msg-${pinnedMessage.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="px-4 py-2 bg-slate-900/95 border-b border-amber-500/30 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-850 transition-colors"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-amber-300 mr-1.5">Pinned Message:</span>
              <span className="text-slate-300 text-[11px] truncate">
                {pinnedMessage.text || '[Attachment]'}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinMessage(activeChat.id, pinnedMessage.id);
            }}
            className="text-slate-500 hover:text-white p-1"
            title="Unpin"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Disappearing Messages & E2E Security Notice */}
      <div className="px-4 py-1.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>E2E Encrypted with BharatPKI</span>
        </div>
        <div className="flex items-center space-x-1 text-sky-400">
          <Clock className="w-3 h-3" />
          <span>24h Auto-destruct</span>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploadProgress !== null && (
        <div className="bg-sky-950 border-b border-sky-800 px-4 py-1.5 flex items-center justify-between text-xs text-sky-300 animate-pulse">
          <div className="flex items-center space-x-2">
            <FileUp className="w-4 h-4 animate-bounce" />
            <span>Uploading media to Firebase Storage...</span>
          </div>
          <span className="font-mono font-bold">{uploadProgress}%</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2 opacity-60">
            <Sparkles className="w-8 h-8 text-sky-400" />
            <h4 className="text-sm font-semibold text-slate-300">No messages yet</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              Say namaste! Messages are encrypted with peer-to-peer BharatPKI.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                id={`msg-${msg.id}`}
                key={msg.id}
                className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Replying To Quote Banner */}
                {msg.replyTo && (
                  <div
                    className={`text-[10px] mb-1 px-3 py-1 rounded-t-xl max-w-[82%] sm:max-w-[72%] border-l-2 border-sky-400 bg-slate-900/90 text-slate-400 ${
                      isMe ? 'self-end' : 'self-start'
                    }`}
                  >
                    <span className="font-semibold text-sky-300 mr-1">{msg.replyTo.senderName}:</span>
                    <span className="truncate">{msg.replyTo.text}</span>
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-md transition-all ${
                    msg.isDeleted
                      ? 'bg-slate-900/60 text-slate-500 italic border border-slate-800'
                      : isMe
                      ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-850 text-slate-100 border border-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Pinned Marker Badge */}
                  {msg.isPinned && (
                    <div className="flex items-center space-x-1 text-[10px] text-amber-300 font-semibold mb-1">
                      <Pin className="w-3 h-3 fill-amber-300" />
                      <span>Pinned</span>
                    </div>
                  )}

                  {/* Image Attachment */}
                  {msg.attachments?.filter((a) => a.type === 'image').map((att, i) => (
                    <div key={i} className="my-1 rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={att.url}
                        alt={att.name || 'Photo'}
                        className="max-h-60 w-full object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(att.url, '_blank')}
                      />
                    </div>
                  ))}

                  {/* Video Attachment */}
                  {msg.attachments?.filter((a) => a.type === 'video').map((att, i) => (
                    <div key={i} className="my-1 rounded-xl overflow-hidden border border-white/10 bg-black">
                      <video
                        src={att.url}
                        controls
                        className="max-h-60 w-full rounded-xl"
                      />
                    </div>
                  ))}

                  {/* Document Attachment */}
                  {msg.attachments?.filter((a) => a.type === 'document').map((att, i) => (
                    <div
                      key={i}
                      onClick={() => att.url && window.open(att.url, '_blank')}
                      className="flex items-center space-x-3 p-2.5 my-1 rounded-xl bg-black/25 border border-white/10 hover:bg-black/40 cursor-pointer transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-white">{att.name || 'Document'}</p>
                        <span className="text-[10px] text-slate-300">{att.size || 'PDF / File'}</span>
                      </div>
                      <Download className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}

                  {/* Voice Note Waveform Attachment */}
                  {msg.attachments?.some((a) => a.type === 'audio') && (
                    <div className="flex items-center space-x-3 py-1 min-w-[200px]">
                      <button
                        onClick={() =>
                          setIsPlayingAudio(isPlayingAudio === msg.id ? null : msg.id)
                        }
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white shrink-0 transition-transform active:scale-95"
                      >
                        {isPlayingAudio === msg.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-1 h-6">
                          {[40, 80, 50, 90, 70, 30, 85, 100, 60, 45, 75, 55, 35].map((h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full ${
                                isPlayingAudio === msg.id && i * 7 < audioProgress
                                  ? 'bg-amber-400'
                                  : 'bg-white/40'
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-white/70 font-mono">
                          <span>0:14</span>
                          <span>0:18</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Payment Attachment Chip */}
                  {msg.attachments?.some((a) => a.type === 'upi_payment') && (
                    <div className="p-3 my-1 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center">
                          <IndianRupee className="w-3 h-3 mr-0.5" /> BharatPay UPI
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded">
                          SUCCESS
                        </span>
                      </div>
                      <div className="text-xl font-extrabold text-white">
                        ₹{msg.attachments.find((a) => a.type === 'upi_payment')?.amount?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-slate-300">
                        {msg.attachments.find((a) => a.type === 'upi_payment')?.name || 'Payment completed'}
                      </div>
                    </div>
                  )}

                  {/* Main Text Content */}
                  {msg.text && (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}

                  {/* Indic Translated Bubble Preview if available */}
                  {msg.translatedText && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-xs bg-black/20 p-2 rounded-lg space-y-1">
                      <div className="flex items-center space-x-1 text-[10px] text-amber-300 font-semibold">
                        <Globe className="w-3 h-3" />
                        <span>{msg.translatedLanguage || 'Translated'}</span>
                      </div>
                      <p className="text-xs italic text-slate-200">{msg.translatedText}</p>
                    </div>
                  )}

                  {/* Timestamp & Status ticks */}
                  <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-white/60">
                    {msg.isStarred && <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300 mr-0.5" />}
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-sky-200" title="Read" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-slate-400" title="Delivered" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-400" title="Sent" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Reaction badge floating on bubble */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="absolute -bottom-2.5 right-2 flex items-center space-x-0.5 bg-slate-800 border border-slate-700 rounded-full px-1.5 py-0.5 text-[10px] shadow">
                      {msg.reactions.map((r, i) => (
                        <span key={i}>
                          {r.emoji} {r.count > 1 ? r.count : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contextual Action Bar on Message Hover / Focus */}
                {!msg.isDeleted && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 text-[11px] text-slate-400 mt-1 transition-opacity bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-full shadow-md">
                    {/* Quick Reactions */}
                    {['❤️', '🔥', '🙏', '👍', '😂', '🇮🇳'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addMessageReaction(activeChat.id, msg.id, emoji)}
                        className="hover:scale-125 transition-transform px-0.5"
                      >
                        {emoji}
                      </button>
                    ))}

                    <span className="w-px h-3 bg-slate-700 mx-1" />

                    {/* Reply */}
                    <button
                      onClick={() => {
                        setReplyingTo(msg);
                        setEditingMsg(null);
                      }}
                      className="p-1 hover:text-sky-400 transition-colors"
                      title="Reply"
                    >
                      <CornerUpLeft className="w-3 h-3" />
                    </button>

                    {/* Pin */}
                    <button
                      onClick={() => togglePinMessage(activeChat.id, msg.id)}
                      className={`p-1 hover:text-amber-400 transition-colors ${msg.isPinned ? 'text-amber-400' : ''}`}
                      title={msg.isPinned ? 'Unpin' : 'Pin message'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>

                    {/* Star */}
                    <button
                      onClick={() => toggleStarMessage(activeChat.id, msg.id)}
                      className={`p-1 hover:text-amber-400 transition-colors ${msg.isStarred ? 'text-amber-400 fill-amber-400' : ''}`}
                      title="Star message"
                    >
                      <Star className="w-3 h-3" />
                    </button>

                    {/* Forward */}
                    <button
                      onClick={() => {
                        setForwardingMsg(msg);
                        setSelectedForwardChats([]);
                      }}
                      className="p-1 hover:text-sky-400 transition-colors"
                      title="Forward message"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>

                    {/* Indic Translate Trigger */}
                    <button
                      onClick={() =>
                        setShowIndicLangs(showIndicLangs === msg.id ? null : msg.id)
                      }
                      className="p-1 hover:text-sky-400 text-[10px] flex items-center"
                      title="Translate into 10+ Indic Languages"
                    >
                      <Globe className="w-3 h-3 mr-0.5" />
                    </button>

                    {/* Edit (only own text messages) */}
                    {isMe && msg.text && (
                      <button
                        onClick={() => {
                          setEditingMsg(msg);
                          setInputVal(msg.text);
                          setReplyingTo(null);
                        }}
                        className="p-1 hover:text-sky-400 transition-colors"
                        title="Edit message"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete for everyone (only sender) */}
                    {isMe && (
                      <button
                        onClick={() => deleteMessage(activeChat.id, msg.id)}
                        className="p-1 hover:text-rose-400 transition-colors"
                        title="Delete for everyone"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Multilingual Indic Language Selector Dropdown */}
                {showIndicLangs === msg.id && (
                  <div className="mt-1 p-2 bg-slate-900 border border-slate-700 rounded-2xl grid grid-cols-2 gap-1 z-30 shadow-xl max-w-xs animate-in fade-in zoom-in duration-150">
                    {indicLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          translateMessageText(activeChat.id, msg.id, lang.split(' ')[0]);
                          setShowIndicLangs(null);
                        }}
                        className="text-[10px] text-left p-1.5 rounded-lg hover:bg-sky-950 hover:text-sky-300 text-slate-300 transition-colors"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live Peer Typing Animation */}
        {isPeerTyping && (
          <div className="flex items-center space-x-1.5 p-2 bg-slate-900/80 border border-slate-800 rounded-2xl w-24">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce delay-200" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Forwarding Modal */}
      {forwardingMsg && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center">
                <Share2 className="w-4 h-4 mr-1.5 text-sky-400" /> Forward Message
              </h4>
              <button
                onClick={() => setForwardingMsg(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-400 italic bg-slate-950 p-2 rounded-xl border border-slate-800 max-h-16 overflow-hidden">
              "{forwardingMsg.text || '[Media]'}"
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 divide-y divide-slate-800/60">
              {chats.map((c) => {
                const isSelected = selectedForwardChats.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedForwardChats((prev) =>
                        isSelected ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                      );
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-950/60 border border-sky-800' : 'hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-white">{c.name}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              disabled={selectedForwardChats.length === 0}
              onClick={() => {
                forwardMessage(forwardingMsg, selectedForwardChats);
                setForwardingMsg(null);
              }}
              className="w-full py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 font-bold text-xs text-white shadow-lg transition-all"
            >
              Forward to {selectedForwardChats.length} Chat{selectedForwardChats.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Attachment Bottom Drawer */}
      {showAttachMenu && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 grid grid-cols-4 sm:grid-cols-7 gap-2 animate-in slide-in-from-bottom duration-200">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex flex-col items-center p-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-400 hover:bg-purple-900/60 transition-colors"
          >
            <ImageIcon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Photos</span>
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="flex flex-col items-center p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-800 text-indigo-400 hover:bg-indigo-900/60 transition-colors"
          >
            <Film className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Videos</span>
          </button>
          <button
            onClick={() => docInputRef.current?.click()}
            className="flex flex-col items-center p-2.5 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-400 hover:bg-blue-900/60 transition-colors"
          >
            <FileUp className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Documents</span>
          </button>
          <button
            onClick={() => {
              navigate('upi_payment');
              setShowAttachMenu(false);
            }}
            className="flex flex-col items-center p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/60 transition-colors"
          >
            <IndianRupee className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">BharatPay</span>
          </button>
          <button
            onClick={() => {
              navigate('document_vault');
              setShowAttachMenu(false);
            }}
            className="flex flex-col items-center p-2.5 rounded-xl bg-sky-950/60 border border-sky-800 text-sky-400 hover:bg-sky-900/60 transition-colors"
          >
            <FileText className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">DigiLocker</span>
          </button>
          <button
            onClick={() => {
              navigate('live_location');
              setShowAttachMenu(false);
            }}
            className="flex flex-col items-center p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400 hover:bg-rose-900/60 transition-colors"
          >
            <MapPin className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Location</span>
          </button>
          <button
            onClick={() => {
              navigate('sticker_hub');
              setShowAttachMenu(false);
            }}
            className="flex flex-col items-center p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400 hover:bg-amber-900/60 transition-colors"
          >
            <Smile className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Stickers</span>
          </button>
        </div>
      )}

      {/* Reply Banner Above Input */}
      {replyingTo && (
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2 border-l-2 border-sky-400 pl-2">
            <CornerUpLeft className="w-3.5 h-3.5 text-sky-400" />
            <div>
              <span className="font-semibold text-sky-300 text-[11px] mr-1">Replying to {replyingTo.senderName}:</span>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{replyingTo.text || '[Attachment]'}</p>
            </div>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Edit Banner Above Input */}
      {editingMsg && (
        <div className="p-2.5 bg-slate-900 border-t border-amber-600/40 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center space-x-2 border-l-2 border-amber-400 pl-2">
            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <span className="font-semibold text-[11px] mr-1">Editing Message:</span>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{editingMsg.text}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingMsg(null);
              setInputVal('');
            }}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Message Input Toolbar */}
      {isRecordingVoice ? (
        <div className="p-3 bg-slate-900/95 border-t border-rose-800/80 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span>Recording Indic Voice Note... 00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => stopVoiceRecording(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => stopVoiceRecording(false)}
              className="p-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
              title="Finish and send voice note"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSend}
          className="p-2.5 bg-slate-900/95 border-t border-slate-800/80 flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-full transition-colors"
            title="Attachments"
          >
            {showAttachMenu ? <X className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => navigate('upi_payment')}
            className="p-2 text-emerald-400 hover:bg-emerald-950/50 rounded-full transition-colors"
            title="Send UPI Money"
          >
            <IndianRupee className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder={
              editingMsg
                ? 'Edit your message...'
                : 'Type message in any Indic language (हिन्दी, தமிழ், বাংলা...)'
            }
            className="flex-1 py-2 px-3.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl text-xs sm:text-sm text-white focus:outline-none placeholder-slate-500"
          />

          {inputVal.trim() ? (
            <button
              id="btn-send-message"
              type="submit"
              className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-md shadow-sky-600/20 active:scale-95 transition-all"
            >
              {editingMsg ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceRecording}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-full transition-colors"
              title="Hold to Record Indic Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};
