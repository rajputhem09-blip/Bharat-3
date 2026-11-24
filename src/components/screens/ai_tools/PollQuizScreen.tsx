import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  BarChart2,
  Plus,
  Trash2,
  CheckSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const PollQuizScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [question, setQuestion] = useState('Where should we plan our Bharat Builders retreat? 🇮🇳');
  const [options, setOptions] = useState(['Goa Beaches 🏖️', 'Manali Hills 🏔️', 'Udaipur Palace 🏰', 'Mysuru Heritage 🛕']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const updateOption = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    triggerConfetti();
    navigate('group_chat');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Poll & Live Quiz Creator"
        subtitle="Interactive voting for Groups & Channels"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('group_chat')}
      />

      <form onSubmit={handleCreate} className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Question Card */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Poll Question / Quiz Prompt
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 resize-none"
            placeholder="Ask a question..."
            required
          />
        </div>

        {/* Options List */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Voting Options ({options.length}/6)
            </span>
          </div>

          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-5 text-xs text-slate-500 font-mono text-center">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="w-full py-2 border border-dashed border-slate-700 hover:border-sky-500 rounded-xl text-xs text-sky-400 font-semibold flex items-center justify-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Option</span>
            </button>
          )}
        </div>

        {/* Settings Toggles */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 p-2 text-xs">
          <div className="flex items-center justify-between p-3">
            <div>
              <div className="font-semibold text-white">Anonymous Voting</div>
              <div className="text-[11px] text-slate-400">Keep individual voter names hidden</div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div>
              <div className="font-semibold text-white">Quiz Mode with Right Answer</div>
              <div className="text-[11px] text-slate-400">Award points for correct answers</div>
            </div>
            <input
              type="checkbox"
              checked={isQuizMode}
              onChange={(e) => setIsQuizMode(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
        >
          <span>Broadcast Poll to Group</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
