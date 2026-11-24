import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  X,
  MessageSquare,
  Send,
  Heart,
  Sparkles,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { ChannelPost, ChannelComment } from '../../../types';
import {
  subscribeToPostComments,
  addChannelComment,
} from '../../../services/channelService';

interface ChannelCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  post: ChannelPost | null;
}

export const ChannelCommentsModal: React.FC<ChannelCommentsModalProps> = ({
  isOpen,
  onClose,
  channelId,
  post,
}) => {
  const { currentUser } = useApp();
  const [comments, setComments] = useState<ChannelComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !channelId || !post?.id) return;

    const unsubscribe = subscribeToPostComments(channelId, post.id, (list) => {
      setComments(list);
    });

    return () => unsubscribe();
  }, [isOpen, channelId, post?.id]);

  useEffect(() => {
    if (isOpen) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isOpen]);

  if (!isOpen || !post) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const textToSend = commentText.trim();
    setCommentText('');

    try {
      await addChannelComment(channelId, post.id, textToSend, currentUser);
    } catch (error) {
      console.error('Error posting comment:', error);
      setCommentText(textToSend); // Restore on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = (commentId: string) => {
    if (likedCommentIds.includes(commentId)) {
      setLikedCommentIds(likedCommentIds.filter((id) => id !== commentId));
    } else {
      setLikedCommentIds([...likedCommentIds, commentId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg h-[80vh] sm:h-[650px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Post Discussion</h3>
              <p className="text-[10px] text-slate-400">
                {comments.length} comments • Real-time thread
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Post Snippet */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <img
              src={post.authorAvatar || 'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80'}
              alt={post.authorName}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-[11px] font-bold text-sky-400">{post.authorName}</span>
            <span className="text-[9px] text-slate-500">{post.createdAt}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
            {post.title ? `${post.title} — ` : ''}{post.body}
          </p>
        </div>

        {/* Comment Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-300">No comments yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Be the first subscriber to start the discussion under this broadcast!
              </p>
            </div>
          ) : (
            comments.map((c) => {
              const isLiked = likedCommentIds.includes(c.id);
              const isAuthor = c.userId === currentUser.id;

              return (
                <div
                  key={c.id}
                  className={`flex space-x-2.5 ${isAuthor ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <img
                    src={c.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={c.userName}
                    className="w-7 h-7 rounded-xl object-cover shrink-0 mt-0.5"
                  />
                  <div className="max-w-[80%] space-y-1">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isAuthor
                          ? 'bg-sky-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <span className={`text-[10px] font-bold ${isAuthor ? 'text-sky-100' : 'text-sky-400'}`}>
                          {c.userName}
                        </span>
                        <span className={`text-[9px] ${isAuthor ? 'text-sky-200' : 'text-slate-400'}`}>
                          {c.createdAt}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{c.text}</p>
                    </div>

                    <div className="flex items-center space-x-2 px-1">
                      <button
                        onClick={() => toggleLike(c.id)}
                        className={`flex items-center space-x-1 text-[10px] ${
                          isLiked ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-400' : ''}`} />
                        <span>{(c.likesCount || 0) + (isLiked ? 1 : 0)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment Composer */}
        <form onSubmit={handleSendComment} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment to the thread..."
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={() => setCommentText((prev) => prev + ' 🇮🇳')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              title="Add Flag"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="w-10 h-10 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
