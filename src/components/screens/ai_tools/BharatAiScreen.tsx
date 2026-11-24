import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { BottomNav } from '../../common/BottomNav';
import {
  Sparkles,
  Send,
  Globe,
  FileText,
  Copy,
  Check,
  Share2,
  Zap,
  Code,
  Languages,
} from 'lucide-react';

export const BharatAiScreen: React.FC = () => {
  const { messages, sendAiPrompt, navigate, triggerConfetti } = useApp();
  const [promptInput, setPromptInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const aiMessages = messages['chat_ai'] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || promptInput;
    if (!text.trim()) return;
    setPromptInput('');
    setIsTyping(true);
    await sendAiPrompt(text);
    setIsTyping(false);
  };

  const samplePrompts = [
    { label: '🪔 Diwali Greeting (Hindi & English)', text: 'Generate professional Diwali wishes in Hindi and English for business partners.' },
    { label: '🌐 Translate to Tamil & Telugu', text: 'Translate "Welcome to BharatChat, where privacy meets high-speed innovation" to Tamil and Telugu.' },
    { label: '📋 Summarize Group Discussion', text: 'Summarize the top 3 decisions from our tech startup product sync meeting.' },
    { label: '💡 Explain Section 80C Tax', text: 'Briefly explain Section 80C tax deduction investments in simple everyday terms.' },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerConfetti();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Bharat AI Copilot"
        subtitle="Indic NLP • Powered by Gemini 2.5 Turbo"
        showBack={false}
        showSearch={false}
        showAiBadge={true}
      />

      {/* Suggested Quick Prompt Pills */}
      <div className="px-3 py-2 bg-slate-900/70 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.text)}
            className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700/60 whitespace-nowrap transition-all active:scale-95 shrink-0"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {aiMessages.map((msg) => {
          const isMe = msg.senderId === 'usr_me';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                  isMe
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs'
                }`}
              >
                <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {!isMe && (
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Bharat AI Indic Engine</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-white flex items-center space-x-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => navigate('private_chat')}
                        className="hover:text-sky-400 flex items-center space-x-1"
                        title="Share to chat"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Send to Chat</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-medium animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Bharat AI is analyzing and generating Indic context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Ask Bharat AI anything in English or Hindi..."
          className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs sm:text-sm text-white focus:outline-none placeholder-slate-500"
        />

        <button
          id="btn-ai-submit"
          type="submit"
          disabled={!promptInput.trim()}
          className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold disabled:opacity-40 transition-all shadow-md shadow-amber-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <BottomNav />
    </div>
  );
};
