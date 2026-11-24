import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Video,
  PenTool,
  Smile,
  Link2,
  Lock,
  Globe,
  Users,
  Star,
  UserX,
  UserCheck,
  Check,
  Upload,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StoryPrivacy } from '../../../types';
import { uploadStoryMedia } from '../../../services/storageService';
import { CONTACTS_DATA } from '../../../data/mockData';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'media' | 'text';
}

const GRADIENT_PRESETS = [
  { id: 'saffron', name: 'Saffron Sunset', class: 'from-amber-500 via-orange-600 to-rose-600' },
  { id: 'peacock', name: 'Peacock Blue', class: 'from-sky-600 via-indigo-600 to-teal-700' },
  { id: 'gulal', name: 'Holi Gulal', class: 'from-rose-500 via-fuchsia-600 to-purple-800' },
  { id: 'varanasi', name: 'Ghat Twilight', class: 'from-violet-900 via-slate-900 to-amber-900' },
  { id: 'emerald', name: 'Kerala Emerald', class: 'from-emerald-600 via-teal-700 to-slate-900' },
  { id: 'gold', name: 'Sandalwood Gold', class: 'from-yellow-600 via-amber-700 to-orange-900' },
];

const EMOJI_STICKERS = ['🇮🇳', '❤️', '🔥', '🎉', '🚀', '🕉️', '✨', '🪔', '🌸', '☕', '💯', '🙏', '👏', '⭐', '🤝', '⚡'];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'media',
}) => {
  const { currentUser, createStory, triggerConfetti } = useApp();
  const [activeMode, setActiveMode] = useState<'media' | 'text'>(initialMode);
  
  // Media State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  
  // Text Story State
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].class);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  
  // General Story Fields
  const [caption, setCaption] = useState('');
  const [selectedStickers, setSelectedStickers] = useState<{ emoji: string; x: number; y: number }[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  // Privacy State
  const [privacy, setPrivacy] = useState<StoryPrivacy>('everyone');
  const [showPrivacyPicker, setShowPrivacyPicker] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
  
  // Upload & Submission State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setSelectedFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const handleAddSticker = (emoji: string) => {
    // Add sticker at center offset
    const randomOffset = (Math.random() - 0.5) * 40;
    setSelectedStickers((prev) => [
      ...prev,
      { emoji, x: 50 + randomOffset, y: 50 + randomOffset },
    ]);
    setShowEmojiPicker(false);
  };

  const handleRemoveSticker = (index: number) => {
    setSelectedStickers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleUserSelection = (userId: string) => {
    if (privacy === 'selected' || privacy === 'close_friends') {
      setSelectedUserIds((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    } else if (privacy === 'exclude') {
      setExcludedUserIds((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    }
  };

  const handlePublish = async () => {
    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      let uploadedUrl: string | undefined = undefined;

      // If Media mode, upload file to Firebase Storage
      if (activeMode === 'media') {
        if (!selectedFile) {
          setErrorMessage('Please select a photo or video to share.');
          setIsUploading(false);
          return;
        }

        const tempStoryId = `story_${Date.now()}`;
        const uploadResult = await uploadStoryMedia(
          currentUser.id,
          tempStoryId,
          selectedFile,
          selectedFile.name,
          mediaType,
          (progress) => setUploadProgress(progress)
        );
        uploadedUrl = uploadResult.url;
      } else {
        if (!textContent.trim()) {
          setErrorMessage('Please type a message for your text story.');
          setIsUploading(false);
          return;
        }
        setUploadProgress(70);
      }

      // Create story document in Firestore
      await createStory({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        type: activeMode === 'media' ? mediaType : 'text',
        mediaUrl: uploadedUrl,
        caption: activeMode === 'media' ? caption.trim() : textContent.trim(),
        bgColor: activeMode === 'text' ? selectedGradient : undefined,
        stickers: selectedStickers,
        linkUrl: linkUrl.trim() || undefined,
        linkText: linkText.trim() || undefined,
        duration: activeMode === 'media' && mediaType === 'video' ? 15 : 5,
        privacy,
        allowedUserIds: selectedUserIds,
        excludedUserIds: excludedUserIds,
      });

      setUploadProgress(100);
      triggerConfetti();
      onClose();
    } catch (err: any) {
      console.error('Failed to create story:', err);
      setErrorMessage(err.message || 'Failed to publish story. Please check connection.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none overflow-y-auto">
      {/* Top Header Controls */}
      <div className="w-full max-w-lg flex items-center justify-between z-20 pb-2">
        <button
          onClick={onClose}
          disabled={isUploading}
          className="p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-900/90 rounded-full p-1 border border-slate-800">
          <button
            onClick={() => setActiveMode('media')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'media'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo / Video</span>
          </button>
          <button
            onClick={() => setActiveMode('text')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeMode === 'text'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Text Story</span>
          </button>
        </div>

        {/* Privacy Pill */}
        <button
          onClick={() => setShowPrivacyPicker(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-sky-400 hover:bg-slate-700"
        >
          {privacy === 'everyone' && <Globe className="w-3.5 h-3.5" />}
          {privacy === 'contacts' && <Users className="w-3.5 h-3.5" />}
          {privacy === 'close_friends' && <Star className="w-3.5 h-3.5 text-amber-400" />}
          {privacy === 'selected' && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
          {privacy === 'exclude' && <UserX className="w-3.5 h-3.5 text-rose-400" />}
          <span className="capitalize">{privacy.replace('_', ' ')}</span>
        </button>
      </div>

      {/* Main Canvas / Preview Stage */}
      <div className="w-full max-w-md aspect-[9/16] max-h-[68vh] rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col justify-between">
        {activeMode === 'media' ? (
          /* Media Mode Canvas */
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative">
            {mediaPreview ? (
              <>
                {mediaType === 'video' ? (
                  <video
                    src={mediaPreview}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Story Preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Remove / Change photo button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-4 left-4 p-2 rounded-full bg-black/60 backdrop-blur text-white text-xs hover:bg-black/80 flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 rounded-3xl bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 shadow-lg">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Select Photo or Video</h4>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  High quality photos, short videos, clips up to 24 hours
                </p>
                <span className="mt-4 px-4 py-2 rounded-full bg-sky-600 text-white text-xs font-semibold shadow">
                  Browse Device
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          /* Text Story Mode Canvas */
          <div
            className={`w-full h-full bg-gradient-to-br ${selectedGradient} p-8 flex flex-col items-center justify-center text-center relative transition-all duration-300`}
          >
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Type your story, thoughts, or festival wishes here..."
              rows={5}
              maxLength={300}
              className={`w-full bg-transparent text-white placeholder-white/60 text-xl md:text-2xl font-bold resize-none focus:outline-none text-center ${
                fontFamily === 'serif'
                  ? 'font-serif'
                  : fontFamily === 'mono'
                  ? 'font-mono'
                  : 'font-sans'
              }`}
            />
            <div className="absolute bottom-4 right-4 text-[10px] text-white/60">
              {textContent.length}/300
            </div>
          </div>
        )}

        {/* Floating Stickers Overlays */}
        {selectedStickers.map((sticker, idx) => (
          <div
            key={idx}
            onClick={() => handleRemoveSticker(idx)}
            className="absolute z-20 text-4xl cursor-pointer hover:scale-125 transition-transform drop-shadow-md select-none"
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title="Tap to remove sticker"
          >
            {sticker.emoji}
          </div>
        ))}

        {/* Story Link Preview Pill on Canvas */}
        {linkUrl && (
          <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/20 text-xs text-sky-300 flex items-center space-x-1.5">
            <Link2 className="w-3.5 h-3.5" />
            <span className="font-semibold truncate max-w-[120px]">
              {linkText || 'Visit Link'}
            </span>
          </div>
        )}

        {/* Bottom Floating Canvas Tools */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {/* Sticker Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition"
              title="Add Sticker / Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Link Button */}
            <button
              onClick={() => setShowLinkInput(!showLinkInput)}
              className={`p-2.5 rounded-full backdrop-blur transition ${
                linkUrl
                  ? 'bg-sky-600 text-white'
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title="Attach Link"
            >
              <Link2 className="w-4 h-4" />
            </button>

            {/* Font Style Toggle (for text story) */}
            {activeMode === 'text' && (
              <button
                onClick={() =>
                  setFontFamily((prev) =>
                    prev === 'sans' ? 'serif' : prev === 'serif' ? 'mono' : 'sans'
                  )
                }
                className="px-3 py-2 rounded-full bg-black/60 backdrop-blur text-white text-xs font-bold uppercase hover:bg-black/80"
              >
                {fontFamily}
              </button>
            )}
          </div>

          {/* Quick Gradients (for text story) */}
          {activeMode === 'text' && (
            <div className="flex items-center space-x-1 bg-black/60 backdrop-blur p-1 rounded-full">
              {GRADIENT_PRESETS.slice(0, 4).map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGradient(g.class)}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${g.class} transition-transform ${
                    selectedGradient === g.class ? 'scale-125 ring-2 ring-white' : 'opacity-80'
                  }`}
                  title={g.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emoji / Sticker Picker Drawer */}
      {showEmojiPicker && (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-3 z-30 shadow-2xl mt-2 animate-in fade-in slide-in-from-bottom duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Tap sticker to place:</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-xs text-slate-500 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2 text-2xl text-center">
            {EMOJI_STICKERS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleAddSticker(emoji)}
                className="hover:scale-130 transition active:scale-95 p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Link Input Drawer */}
      {showLinkInput && (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-3 z-30 shadow-2xl mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400 flex items-center space-x-1">
              <Link2 className="w-3.5 h-3.5" />
              <span>Attach Swipe-Up / Tap Link</span>
            </span>
            <button
              onClick={() => setShowLinkInput(false)}
              className="text-xs text-slate-500 hover:text-white"
            >
              Done
            </button>
          </div>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com or UPI payment link"
            className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Button label (e.g. Visit Store, Support ISRO)"
            className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      )}

      {/* Media Caption Input (if in media mode) */}
      {activeMode === 'media' && (
        <div className="w-full max-w-md mt-2">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption to your story..."
            maxLength={140}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="w-full max-w-md mt-2 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => handlePublish()}
            className="px-2.5 py-1 bg-rose-700 text-white rounded-lg font-semibold hover:bg-rose-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="w-full max-w-md mt-2 space-y-1">
          <div className="flex justify-between text-[11px] text-sky-400 font-semibold">
            <span>Uploading encrypted story to Firebase...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Publish Bar */}
      <div className="w-full max-w-md flex items-center justify-between pt-3">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Disappears in 24 hours</span>
        </div>

        <button
          onClick={handlePublish}
          disabled={isUploading}
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-sky-600 text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Share to My Status</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy Selector Modal */}
      {showPrivacyPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Story Privacy</h3>
              <button
                onClick={() => setShowPrivacyPicker(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Control who can view your Bharat Story update for the next 24 hours.
            </p>

            <div className="space-y-2">
              {[
                {
                  id: 'everyone',
                  title: 'Everyone',
                  desc: 'All BharatChat users can discover your story',
                  icon: Globe,
                },
                {
                  id: 'contacts',
                  title: 'My Contacts',
                  desc: 'Only saved address book contacts',
                  icon: Users,
                },
                {
                  id: 'close_friends',
                  title: 'Close Friends',
                  desc: 'Only chosen close friends list',
                  icon: Star,
                },
                {
                  id: 'selected',
                  title: 'Selected Users',
                  desc: 'Share only with specified people',
                  icon: UserCheck,
                },
                {
                  id: 'exclude',
                  title: 'Hide Story From',
                  desc: 'Exclude specific users from viewing',
                  icon: UserX,
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = privacy === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPrivacy(opt.id as StoryPrivacy)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold">{opt.title}</h4>
                        <p className="text-[10px] text-slate-400">{opt.desc}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                );
              })}
            </div>

            {/* If Selected or Exclude, show user multi-select checklist */}
            {(privacy === 'selected' || privacy === 'close_friends' || privacy === 'exclude') && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-300">
                  {privacy === 'exclude' ? 'Select users to hide from:' : 'Select authorized users:'}
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {CONTACTS_DATA.map((c) => {
                    const isChecked =
                      privacy === 'exclude'
                        ? excludedUserIds.includes(c.id)
                        : selectedUserIds.includes(c.id);

                    return (
                      <div
                        key={c.id}
                        onClick={() => handleToggleUserSelection(c.id)}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:bg-slate-850"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-xs text-white">{c.name}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowPrivacyPicker(false)}
              className="w-full py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
