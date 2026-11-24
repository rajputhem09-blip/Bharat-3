import React, { useState, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Send,
  Image,
  Video,
  FileText,
  Mic,
  Pin,
  Radio,
  BarChart2,
  X,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { PollData } from '../../../types';
import { uploadChannelMedia } from '../../../services/storageService';

interface ChannelPostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
}

export const ChannelPostComposerModal: React.FC<ChannelPostComposerModalProps> = ({
  isOpen,
  onClose,
  channelId,
  channelName,
}) => {
  const { createNewChannelPost, triggerConfetti } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | 'audio' | 'none'>('none');
  const [mediaName, setMediaName] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isLiveSoon, setIsLiveSoon] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const uploadRes = await uploadChannelMedia(channelId, file, file.name, type);
      setMediaUrl(uploadRes.url);
      setMediaType(type);
      setMediaName(file.name);
    } catch (err: any) {
      console.warn('Storage upload note:', err);
      // Fallback local object URL for preview if offline
      const tempUrl = URL.createObjectURL(file);
      setMediaUrl(tempUrl);
      setMediaType(type);
      setMediaName(file.name);
    } finally {
      setIsUploading(false);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, val: string) => {
    const next = [...pollOptions];
    next[index] = val;
    setPollOptions(next);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() && !mediaUrl && !showPollCreator) {
      setErrorMsg('Please enter a message or attach media to broadcast.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let constructedPoll: PollData | undefined = undefined;
      if (showPollCreator && pollQuestion.trim()) {
        constructedPoll = {
          id: `poll_${Date.now()}`,
          question: pollQuestion.trim(),
          options: pollOptions.filter((opt) => opt.trim().length > 0).map((opt, idx) => ({
            id: `opt_${idx}`,
            text: opt.trim(),
            votes: 0,
            voters: [],
          })),
          totalVotes: 0,
          isAnonymous: true,
          allowMultiple: false,
          expiresAt: 'In 3 days',
        };
      }

      await createNewChannelPost(channelId, {
        title: title.trim() || undefined,
        body: body.trim() || (mediaType !== 'none' ? `Shared ${mediaType}` : 'Broadcast Update'),
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType,
        mediaName: mediaName || undefined,
        isLiveSoon,
        liveStreamUrl: liveStreamUrl.trim() || undefined,
        pollData: constructedPoll,
      });

      triggerConfetti();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Publish Broadcast</h3>
              <p className="text-[11px] text-sky-400 font-medium">{channelName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title (Optional) */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Headline / Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Major Launch Milestone Achieved 🚀"
              className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Post Body */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Post Content
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write your broadcast announcement, news updates, or release details here..."
              className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
            />
          </div>

          {/* Media Preview Box */}
          {mediaUrl && (
            <div className="relative p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                {mediaType === 'image' && (
                  <img src={mediaUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover" />
                )}
                {mediaType === 'video' && (
                  <div className="w-12 h-12 rounded-xl bg-sky-950 flex items-center justify-center text-sky-400">
                    <Video className="w-6 h-6" />
                  </div>
                )}
                {mediaType === 'document' && (
                  <div className="w-12 h-12 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                {mediaType === 'audio' && (
                  <div className="w-12 h-12 rounded-xl bg-amber-950 flex items-center justify-center text-amber-400">
                    <Mic className="w-6 h-6" />
                  </div>
                )}
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{mediaName || 'Attached Media'}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">{mediaType}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMediaUrl('');
                  setMediaType('none');
                  setMediaName('');
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Media Attach Bar */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attach Media</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'image/*';
                    fileInputRef.current.click();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 flex items-center space-x-1.5 cursor-pointer"
              >
                <Image className="w-3.5 h-3.5" />
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'video/*';
                    fileInputRef.current.click();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 flex items-center space-x-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = '.pdf,.doc,.docx,.zip,.txt';
                    fileInputRef.current.click();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 flex items-center space-x-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Doc/PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPollCreator(!showPollCreator)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer ${
                  showPollCreator ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Poll</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLiveSoon(!isLiveSoon)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer ${
                  isLiveSoon ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Live Broadcast</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const isVid = fileInputRef.current?.accept.includes('video');
                const isDoc = fileInputRef.current?.accept.includes('pdf');
                const type = isVid ? 'video' : isDoc ? 'document' : 'image';
                handleFileUpload(e, type);
              }}
              className="hidden"
            />
          </div>

          {/* Interactive Poll Creator Section */}
          {showPollCreator && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <BarChart2 className="w-4 h-4" />
                  <span>Channel Poll Question</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPollCreator(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Remove Poll
                </button>
              </div>

              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask your subscribers a question..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />

              <div className="space-y-2">
                {pollOptions.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center space-x-1 pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add another option</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Live Stream URL Section */}
          {isLiveSoon && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-2 animate-fade-in">
              <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                <Radio className="w-4 h-4" />
                <span>Live Stream Link or Telemetry URL</span>
              </span>
              <input
                type="text"
                value={liveStreamUrl}
                onChange={(e) => setLiveStreamUrl(e.target.value)}
                placeholder="https://isro.gov.in/live or https://youtube.com/live/..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-rose-400"
              />
            </div>
          )}

          {/* Pin Broadcast Immediately */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Pin className="w-4 h-4 text-amber-400" />
              <div>
                <h4 className="text-xs font-semibold text-white">Pin to top of channel</h4>
                <p className="text-[10px] text-slate-400">Keep this post highlighted for all new visitors</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 ${
                isPinned ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  isPinned ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-xs font-bold text-white shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Broadcast to Channel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
