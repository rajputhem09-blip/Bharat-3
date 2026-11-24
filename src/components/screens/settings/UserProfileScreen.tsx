import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  User,
  Camera,
  ShieldCheck,
  Check,
  QrCode,
  IndianRupee,
  Lock,
  Sparkles,
} from 'lucide-react';

export const UserProfileScreen: React.FC = () => {
  const { currentUser, updateUserProfile, navigate, triggerConfetti } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [handle, setHandle] = useState(currentUser.handle);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, bio, handle });
    setIsSaved(true);
    triggerConfetti();
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Profile & Bio"
        subtitle="Manage your public identity on BharatChat"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('settings_hub')}
      />

      <form onSubmit={handleSave} className="p-4 space-y-6 max-w-sm mx-auto w-full">
        {/* Avatar Upload Container */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-sky-500/30 shadow-2xl"
            />
            <button
              type="button"
              onClick={() => alert('Camera selector simulated')}
              className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-sky-600 text-white shadow-lg hover:bg-sky-500"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>DigiLocker Verified Citizen</span>
            </div>
          </div>
        </div>

        {/* Edit Fields */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Bharat Handle (@)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Bio / Status
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Linked UPI VPA
            </label>
            <input
              type="text"
              value={currentUser.upiId}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-emerald-400 font-mono opacity-80"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <span>Save Profile Updates</span>
          )}
        </button>
      </form>
    </div>
  );
};
