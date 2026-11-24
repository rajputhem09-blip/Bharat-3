import React, { useState, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Radio,
  X,
  Camera,
  Globe,
  Lock,
  MessageSquare,
  Sparkles,
  Check,
  AlertCircle,
  Hash,
  ShieldCheck,
} from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createNewChannel, triggerConfetti } = useApp();

  const [channelName, setChannelName] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology & Startups');
  const [channelType, setChannelType] = useState<'public' | 'private'>('public');
  const [rules, setRules] = useState('Be respectful, no spam, verified updates only.');
  const [isCommentsEnabled, setIsCommentsEnabled] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories = [
    'Technology & Startups',
    'Space & Defense 🚀',
    'National News & Policy',
    'Finance & BharatPay 💸',
    'Sports & Cricket 🏏',
    'Education & Exams',
    'Entertainment & Cinema',
    'Spiritual & Culture 🪔',
    'Govt Services & Schemes',
  ];

  const presetAvatars = [
    'https://images.unsplash.com/photo-1517976487582-7f722a46c1f1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
  ];

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setAvatarUrl(tempUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) {
      setErrorMsg('Please enter a channel name.');
      return;
    }

    if (channelType === 'public' && !username.trim()) {
      setErrorMsg('Public channels require a unique @handle.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createNewChannel({
        name: channelName.trim(),
        username: username.trim(),
        description: description.trim(),
        category,
        channelType,
        avatar: avatarUrl,
        rules: rules.trim(),
        isCommentsEnabled,
      });

      triggerConfetti();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create channel.');
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
              <h2 className="text-base font-bold text-white leading-tight">Create Channel</h2>
              <p className="text-[11px] text-slate-400">Broadcast updates to unlimited subscribers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Logo & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt="Channel logo"
                className="w-20 h-20 rounded-3xl object-cover ring-2 ring-sky-500/40 shadow-xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-3xl bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-semibold mt-1">Change</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </div>

            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Channel Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g. ISRO Space Operations 🚀"
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              {/* Preset Avatar Selector */}
              <div>
                <span className="text-[10px] text-slate-400">Or choose a preset logo:</span>
                <div className="flex space-x-2 mt-1.5 overflow-x-auto pb-1">
                  {presetAvatars.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt="Preset"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-8 h-8 rounded-xl object-cover cursor-pointer transition-all ${
                        avatarUrl === preset ? 'ring-2 ring-sky-400 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Channel Type Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Channel Type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setChannelType('public')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  channelType === 'public'
                    ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">Public Channel</span>
                  </div>
                  {channelType === 'public' && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Searchable by anyone via @handle in Global Search & Explore.
                </p>
              </div>

              <div
                onClick={() => setChannelType('private')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  channelType === 'private'
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Private Channel</span>
                  </div>
                  {channelType === 'private' && <Check className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Only accessible through invite links. Hidden from global search.
                </p>
              </div>
            </div>
          </div>

          {/* Username / Handle (for public channels) */}
          {channelType === 'public' && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Public Handle / Link
                </label>
                <span className="text-[10px] text-sky-400 font-mono">bharatchat.in/@{username || 'handle'}</span>
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="bharat_space_updates"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Letters, numbers and underscores only. This handle will be permanent.
              </p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Description / Bio
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this channel about? Official announcements, links, mission updates..."
              className="w-full mt-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Channel Rules */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Channel Rules / About
            </label>
            <input
              type="text"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. No promotional spam, adhere to community guidelines"
              className="w-full mt-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Comments / Discussion Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Subscriber Comments & Discussions</h4>
                <p className="text-[10px] text-slate-400">Allow followers to comment under each post</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCommentsEnabled(!isCommentsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                isCommentsEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isCommentsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting || !channelName.trim()}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-xs font-bold text-white shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Channel...' : 'Launch Channel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
