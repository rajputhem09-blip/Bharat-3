import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Camera, Sparkles, Check, ArrowRight, User, Loader2 } from 'lucide-react';

export const ProfileSetupScreen: React.FC = () => {
  const { currentUser, updateUserProfile, navigate, triggerConfetti } = useApp();
  const [name, setName] = useState(currentUser.name || 'Bharat User');
  const [username, setUsername] = useState(currentUser.handle || (currentUser as any).username || '');
  const [statusQuote, setStatusQuote] = useState(currentUser.statusQuote || 'Building the digital future of Bharat 🇮🇳');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
  const [isSaving, setIsSaving] = useState(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  ];

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanHandle = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`;
      await updateUserProfile({
        name: name.trim() || 'Bharat User',
        handle: cleanHandle,
        statusQuote: statusQuote.trim(),
        avatar: selectedAvatar,
      });
      triggerConfetti();
      navigate('chat_list');
    } catch (err) {
      console.error('Error in profile setup:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950 text-white select-none overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('otp_verify')}
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <span className="text-xs font-mono text-sky-400">Step 3 of 3</span>
      </div>

      <div className="my-auto space-y-6 max-w-sm mx-auto w-full py-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Create your Identity
          </h2>
          <p className="text-xs text-slate-400">
            Set up your public persona and verified handle on BharatChat.
          </p>
        </div>

        {/* Avatar Picker with Festive Border Ring */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-sky-500 shadow-xl">
              <img
                src={selectedAvatar}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-slate-950"
              />
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-500 active:scale-95 transition-all"
              title="Upload photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            {sampleAvatars.map((av, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                  selectedAvatar === av ? 'border-sky-400 scale-110' : 'border-slate-700 opacity-60'
                }`}
              >
                <img src={av} alt="option" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleFinish} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 text-sm text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Unique Handle (@username)
            </label>
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 focus-within:border-sky-500 overflow-hidden">
              <span className="px-3 py-3 text-slate-500 text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="aarav_sharma"
                className="flex-1 px-1 py-3 bg-transparent text-sm text-white focus:outline-none font-mono"
                required
              />
              <span className="px-3 py-3 text-emerald-400 text-xs flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Available
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Status & Bio Quote
            </label>
            <input
              type="text"
              value={statusQuote}
              onChange={(e) => setStatusQuote(e.target.value)}
              placeholder="Building the digital future of Bharat 🇮🇳"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              id="btn-profile-finish"
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Profile to Bharat Registry...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup & Enter BharatChat</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center pb-2 text-[11px] text-slate-500">
        Free forever • Made with pride for Bharat 🇮🇳
      </div>
    </div>
  );
};
