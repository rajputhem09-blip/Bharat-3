import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, Link as LinkIcon, Users, ArrowRight, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose }) => {
  const { joinGroupByInviteCode, triggerConfetti } = useApp();
  const [inviteInput, setInviteInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    // Extract code if user pasted a full URL
    let code = inviteInput.trim();
    if (code.includes('/join/')) {
      code = code.split('/join/')[1];
    }

    try {
      const result = await joinGroupByInviteCode(code);
      if (result.success) {
        triggerConfetti();
        onClose();
      } else {
        setErrorMsg(result.message || 'Failed to join group with this link.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not join group.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Join via Invite Link</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Enter or paste the group invite link or invite code shared by an admin to join the group conversation.
        </p>

        <form onSubmit={handleJoin} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase">
              Invite Link or Code
            </label>
            <input
              type="text"
              value={inviteInput}
              onChange={(e) => {
                setInviteInput(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="e.g. bharat_abc123 or https://bharatchat.in/join/..."
              className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !inviteInput.trim()}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Verifying...' : 'Join Group'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
