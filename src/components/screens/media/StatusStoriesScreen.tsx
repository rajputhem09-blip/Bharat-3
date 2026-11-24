import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { BottomNav } from '../../common/BottomNav';
import {
  Camera,
  PenTool,
  Eye,
  Plus,
  Clock,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';
import { CreateStoryModal } from './CreateStoryModal';

export const StatusStoriesScreen: React.FC = () => {
  const { stories, openStory, currentUser } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<'media' | 'text'>('media');
  const [showViewedUpdates, setShowViewedUpdates] = useState(true);

  // Find current user's story and friend stories
  const myStory = stories.find((s) => s.userId === currentUser.id);
  const otherStories = stories.filter((s) => s.userId !== currentUser.id);

  const unseenStories = otherStories.filter((s) => s.hasUnseen);
  const seenStories = otherStories.filter((s) => !s.hasUnseen);

  const handleOpenCreateStory = (mode: 'media' | 'text') => {
    setCreateMode(mode);
    setShowCreateModal(true);
  };

  const totalMyViews = myStory
    ? myStory.slides.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0)
    : 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Bharat Stories"
        subtitle="24-hour ephemeral status updates"
        showBack={false}
        showSearch={false}
        rightAction={
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleOpenCreateStory('text')}
              className="p-2 text-slate-300 hover:text-amber-400 rounded-full transition"
              title="Create Text Story"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenCreateStory('media')}
              className="p-2 text-slate-300 hover:text-sky-400 rounded-full transition"
              title="Camera status"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 1. My Status Section */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            My Status
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-colors">
            <div
              onClick={() => (myStory ? openStory(myStory, 0) : handleOpenCreateStory('media'))}
              className="flex items-center space-x-3.5 flex-1 cursor-pointer"
            >
              <div className="relative">
                <div
                  className={`p-0.5 rounded-full ${
                    myStory
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-sky-500 ring-2 ring-sky-500/30'
                      : 'border border-dashed border-slate-700'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt="My Status"
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-950"
                  />
                </div>

                {!myStory && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold border border-slate-900 shadow">
                    +
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white flex items-center space-x-1.5">
                  <span>My Status</span>
                  {myStory && (
                    <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full font-bold">
                      {myStory.slides.length} {myStory.slides.length === 1 ? 'slide' : 'slides'}
                    </span>
                  )}
                </h4>

                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  {myStory ? (
                    <span className="flex items-center space-x-1.5 text-slate-300">
                      <span>{myStory.timestamp}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-0.5 text-sky-400">
                        <Eye className="w-3 h-3" />
                        <span>{totalMyViews} {totalMyViews === 1 ? 'view' : 'views'}</span>
                      </span>
                    </span>
                  ) : (
                    <span>Tap to add photo, video, or thoughts</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick action buttons for My Status */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleOpenCreateStory('media')}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Add to story"
              >
                <Plus className="w-4 h-4" />
              </button>
              {myStory && (
                <button
                  onClick={() => openStory(myStory, 0)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-400 text-xs font-semibold hover:bg-sky-600/30 transition"
                >
                  View
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Recent Updates (Unseen) */}
        {unseenStories.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Recent Updates</span>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
              {unseenStories.map((st) => {
                const storyIndex = stories.findIndex((s) => s.id === st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => openStory(st, storyIndex)}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-850 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-sky-500 shadow-md ring-1 ring-white/20">
                        <img
                          src={st.userAvatar}
                          alt={st.userName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-950"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{st.userName}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{st.timestamp}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-full">
                      {st.slides.length} {st.slides.length === 1 ? 'story' : 'stories'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Viewed Updates (Seen) */}
        {seenStories.length > 0 && (
          <div className="space-y-2">
            <div
              onClick={() => setShowViewedUpdates(!showViewedUpdates)}
              className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer"
            >
              <span>Viewed Updates ({seenStories.length})</span>
              {showViewedUpdates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>

            {showViewedUpdates && (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
                {seenStories.map((st) => {
                  const storyIndex = stories.findIndex((s) => s.id === st.id);
                  return (
                    <div
                      key={st.id}
                      onClick={() => openStory(st, storyIndex)}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-850 cursor-pointer transition-colors opacity-75 hover:opacity-100"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="p-0.5 rounded-full bg-slate-700">
                          <img
                            src={st.userAvatar}
                            alt={st.userName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-950"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200">{st.userName}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span>{st.timestamp}</span>
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-500 font-medium">
                        {st.slides.length} {st.slides.length === 1 ? 'story' : 'stories'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State if no friend stories */}
        {otherStories.length === 0 && (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-950/60 border border-sky-800 flex items-center justify-center text-sky-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white">No active stories</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              When your contacts share status updates or photos, they will appear here for 24 hours.
            </p>
            <button
              onClick={() => handleOpenCreateStory('text')}
              className="mt-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition"
            >
              Post First Story
            </button>
          </div>
        )}

        {/* Security & TTL Banner */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Status updates are E2E encrypted and automatically disappear after 24 hours.</span>
        </div>
      </div>

      {/* Floating Action Buttons for quick creation */}
      <div className="fixed bottom-20 right-4 flex flex-col space-y-2 z-20">
        <button
          onClick={() => handleOpenCreateStory('text')}
          className="p-3 rounded-full bg-slate-800 text-amber-400 border border-slate-700 shadow-xl hover:scale-110 active:scale-95 transition"
          title="Compose text status"
        >
          <PenTool className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleOpenCreateStory('media')}
          className="p-3.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-sky-500 text-white shadow-xl hover:scale-110 active:scale-95 transition"
          title="Capture photo or video"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      <BottomNav />

      {/* Story Creator Modal */}
      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialMode={createMode}
      />
    </div>
  );
};
