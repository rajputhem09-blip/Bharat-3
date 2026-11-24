import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  X,
  Heart,
  Flame,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
  Share2,
  Trash2,
  Flag,
  Volume2,
  VolumeX,
  ExternalLink,
  Pause,
  Play,
  Check,
  Clock,
  AlertTriangle,
  MoreVertical,
} from 'lucide-react';
import { StorySlide, StoryViewItem } from '../../../types';
import { subscribeToStoryViews } from '../../../services/storyService';

export const StoryViewerScreen: React.FC = () => {
  const {
    stories,
    activeStory,
    activeStoryIndex,
    openStory,
    closeStory,
    currentUser,
    viewStorySlide,
    reactToStory,
    replyToStory,
    deleteStory,
    reportStory,
    triggerConfetti,
  } = useApp();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  
  // Modals & Sheets
  const [showViewersSheet, setShowViewersSheet] = useState(false);
  const [viewersList, setViewersList] = useState<StoryViewItem[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const slides: StorySlide[] = activeStory?.slides?.length ? activeStory.slides : [
    {
      id: 'default_1',
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: 'text',
      bgColor: 'from-amber-600 via-rose-600 to-sky-700',
      caption: 'Welcome to Bharat Stories 🇮🇳✨',
      duration: 5,
      timestamp: 'Just now',
      createdAt: null,
      expiresAt: Date.now() + 86400000,
      privacy: 'everyone',
      viewsCount: 0,
      reactionsCount: 0,
    },
  ];

  const currentSlide = slides[currentSlideIndex] || slides[0];
  const isOwner = currentSlide.userId === currentUser.id;

  // 1. Record view of the current slide
  useEffect(() => {
    if (currentSlide?.id && !isOwner) {
      viewStorySlide(currentSlide.id);
    }
  }, [currentSlide?.id, isOwner]);

  // 2. Subscribe to real-time viewers list if owner
  useEffect(() => {
    if (isOwner && currentSlide?.id) {
      const unsub = subscribeToStoryViews(currentSlide.id, (viewers) => {
        setViewersList(viewers);
      });
      return () => unsub();
    } else {
      setViewersList([]);
    }
  }, [isOwner, currentSlide?.id]);

  // 3. Auto-progress timer
  useEffect(() => {
    if (isPaused || showViewersSheet || showReportModal || showDeleteConfirm) return;

    setProgress(0);
    const duration = (currentSlide.duration || 5) * 1000;
    const intervalTime = 50;
    const incrementStep = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + incrementStep;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentSlideIndex, isPaused, showViewersSheet, showReportModal, showDeleteConfirm, slides.length]);

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Advance to next user's story
      const nextUserIndex = activeStoryIndex + 1;
      if (nextUserIndex < stories.length) {
        openStory(stories[nextUserIndex], nextUserIndex);
        setCurrentSlideIndex(0);
        setProgress(0);
      } else {
        closeStory();
      }
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      // Go back to previous user's story
      const prevUserIndex = activeStoryIndex - 1;
      if (prevUserIndex >= 0) {
        openStory(stories[prevUserIndex], prevUserIndex);
        setCurrentSlideIndex(0);
        setProgress(0);
      }
    }
  };

  // Hold to pause handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
    pressTimerRef.current = setTimeout(() => {
      setIsPaused(true);
      if (videoRef.current) videoRef.current.pause();
    }, 200);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    setIsPaused(false);
    if (videoRef.current) videoRef.current.play();

    // Check swipe gesture
    if ('changedTouches' in e && touchStartXRef.current !== null && touchStartYRef.current !== null) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

      // Swipe down to close
      if (deltaY > 100 && Math.abs(deltaX) < 80) {
        closeStory();
        return;
      }
      // Swipe left -> next user
      if (deltaX < -80 && Math.abs(deltaY) < 60) {
        const nextUserIndex = activeStoryIndex + 1;
        if (nextUserIndex < stories.length) {
          openStory(stories[nextUserIndex], nextUserIndex);
          setCurrentSlideIndex(0);
        } else {
          closeStory();
        }
        return;
      }
      // Swipe right -> prev user
      if (deltaX > 80 && Math.abs(deltaY) < 60) {
        const prevUserIndex = activeStoryIndex - 1;
        if (prevUserIndex >= 0) {
          openStory(stories[prevUserIndex], prevUserIndex);
          setCurrentSlideIndex(0);
        }
        return;
      }
    }
  };

  const handleQuickReaction = async (emoji: string) => {
    triggerConfetti();
    try {
      await reactToStory(currentSlide.id, emoji);
    } catch (err) {
      console.warn('Reaction error:', err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const messageText = replyText;
    setReplyText('');
    triggerConfetti();

    try {
      await replyToStory(currentSlide.id, messageText, currentSlide);
    } catch (err) {
      console.warn('Reply error:', err);
    }
  };

  const handleDeleteCurrentSlide = async () => {
    try {
      await deleteStory(currentSlide.id);
      setShowDeleteConfirm(false);
      if (slides.length > 1) {
        handleNextSlide();
      } else {
        closeStory();
      }
    } catch (err) {
      console.error('Failed to delete story slide:', err);
    }
  };

  const handleSubmitReport = async () => {
    try {
      await reportStory(currentSlide.id, reportReason, reportDetails);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to report story:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between select-none overflow-hidden"
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header & Segmented Progress Bars */}
      <div className="relative z-30 p-3 pt-4 space-y-2 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
        {/* Progress Bars */}
        <div className="flex items-center space-x-1.5">
          {slides.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width:
                    idx === currentSlideIndex
                      ? `${progress}%`
                      : idx < currentSlideIndex
                      ? '100%'
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2.5">
            <img
              src={activeStory?.userAvatar || currentSlide.userAvatar}
              alt={activeStory?.userName || currentSlide.userName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="text-xs font-bold text-white leading-none">
                  {activeStory?.userName || currentSlide.userName}
                </h4>
                {isOwner && (
                  <span className="text-[10px] bg-sky-500/30 text-sky-300 px-1.5 py-0.5 rounded-full font-semibold">
                    You
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/75 mt-0.5">{currentSlide.timestamp}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Video Mute Toggle */}
            {currentSlide.type === 'video' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/80"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {/* Owner Delete Button */}
            {isOwner ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 rounded-full bg-black/50 backdrop-blur text-rose-400 hover:bg-rose-950"
                title="Delete this slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              /* Viewer Report Button */
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReportModal(true);
                }}
                className="p-1.5 rounded-full bg-black/50 backdrop-blur text-slate-300 hover:text-amber-400"
                title="Report story"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}

            {/* Close Story Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeStory();
              }}
              className="p-1.5 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Media Content */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {currentSlide.type === 'image' && (currentSlide.mediaUrl || currentSlide.url) ? (
          <img
            src={currentSlide.mediaUrl || currentSlide.url}
            alt="Story Slide"
            className="w-full h-full object-cover"
          />
        ) : currentSlide.type === 'video' && (currentSlide.mediaUrl || currentSlide.url) ? (
          <video
            ref={videoRef}
            src={currentSlide.mediaUrl || currentSlide.url}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${
              currentSlide.bgColor || 'from-amber-600 via-rose-600 to-sky-700'
            } p-8 flex flex-col items-center justify-center text-center`}
          >
            <p className="text-2xl md:text-3xl font-bold text-white font-serif leading-relaxed drop-shadow-md">
              {currentSlide.caption}
            </p>
          </div>
        )}

        {/* Floating Stickers on Slide */}
        {currentSlide.stickers?.map((st, i) => (
          <div
            key={i}
            className="absolute z-10 text-5xl pointer-events-none drop-shadow-lg"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {st.emoji}
          </div>
        ))}

        {/* Tap areas for left / right navigation */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevSlide();
            }}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNextSlide();
            }}
          />
        </div>
      </div>

      {/* Center Link Attachment Pill */}
      {currentSlide.linkUrl && (
        <div className="relative z-20 flex justify-center pb-2">
          <a
            href={currentSlide.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs font-bold shadow-xl hover:bg-white/30 transition active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{currentSlide.linkText || 'Open Link'}</span>
          </a>
        </div>
      )}

      {/* Slide Caption Banner (if image or video) */}
      {(currentSlide.type === 'image' || currentSlide.type === 'video') && currentSlide.caption && (
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-center">
          <p className="text-sm font-semibold text-white drop-shadow">
            {currentSlide.caption}
          </p>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="relative z-30 p-3 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent">
        {isOwner ? (
          /* Story Owner Analytics & Views Button */
          <div className="flex items-center justify-between py-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowViewersSheet(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>
                {currentSlide.viewsCount || viewersList.length || 0}{' '}
                {(currentSlide.viewsCount || viewersList.length) === 1 ? 'View' : 'Views'}
              </span>
            </button>

            <span className="text-[11px] text-white/60">
              Tap views to see who watched
            </span>
          </div>
        ) : (
          /* Viewer Quick Reactions & Message Reply Form */
          <div className="space-y-2">
            {/* Quick Reactions */}
            <div className="flex items-center justify-around pb-1 text-2xl">
              {['❤️', '😂', '😮', '😢', '🔥', '👍', '🙏', '🇮🇳'].map((emoji, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickReaction(emoji);
                  }}
                  className="hover:scale-135 transition-transform active:scale-95 p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="flex items-center space-x-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={`Reply to ${activeStory?.userName || currentSlide.userName}...`}
                className="flex-1 py-2.5 px-4 rounded-full bg-white/20 backdrop-blur text-xs text-white placeholder-white/70 border border-white/30 focus:outline-none focus:bg-white/30"
              />
              <button
                type="submit"
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-lg transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Story Viewers Bottom Sheet Modal (for owner) */}
      {showViewersSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end"
          onClick={(e) => {
            e.stopPropagation();
            setShowViewersSheet(false);
          }}
        >
          <div
            className="w-full max-h-[70vh] bg-slate-900 rounded-t-3xl border-t border-slate-800 p-5 space-y-4 overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">
                  Story Viewers ({viewersList.length})
                </h3>
              </div>
              <button
                onClick={() => setShowViewersSheet(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {viewersList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No views yet. Friends who open your status update will appear here in real-time.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {viewersList.map((viewer) => (
                  <div
                    key={viewer.viewerId}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={viewer.viewerAvatar}
                        alt={viewer.viewerName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-white">
                          {viewer.viewerName}
                        </h4>
                        <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {new Date(viewer.viewedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800">
                      Viewed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
        >
          <div
            className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Delete this story slide?</h4>
            <p className="text-xs text-slate-400">
              This will remove this update permanently for all viewers.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCurrentSlide}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Story Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowReportModal(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Report Story</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-white">Report Submitted</h4>
                <p className="text-[11px] text-slate-400">
                  Thank you for keeping BharatChat safe. Our moderation team will review this story.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  Select a reason for reporting this content:
                </p>

                <div className="space-y-1.5">
                  {[
                    'Inappropriate Content',
                    'Spam or Scam',
                    'Hate Speech or Violence',
                    'False Information',
                    'Harassment or Bullying',
                  ].map((r) => (
                    <div
                      key={r}
                      onClick={() => setReportReason(r)}
                      className={`p-2.5 rounded-xl text-xs font-medium cursor-pointer flex items-center justify-between ${
                        reportReason === r
                          ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <span>{r}</span>
                      {reportReason === r && <Check className="w-3.5 h-3.5" />}
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Additional context (optional)..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-500"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
