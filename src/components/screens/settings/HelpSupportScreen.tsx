import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Headphones,
} from 'lucide-react';

export const HelpSupportScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does BharatChat protect my private messages?',
      a: 'BharatChat utilizes custom zero-knowledge BharatPKI with 256-bit elliptic-curve cryptography. Your messages are encrypted on your local device before transmission and can never be decrypted by intermediaries or telecommunication carriers.',
    },
    {
      q: 'How do in-chat UPI BharatPay payments work?',
      a: 'BharatPay is directly integrated with NPCI / Unified Payments Interface 2.0. When you tap the ₹ icon in any private or group chat, tokenized bank APIs process the transfer in sub-seconds with zero merchant fees.',
    },
    {
      q: 'Can I translate any incoming Indic language message?',
      a: 'Yes! Tap the "Translate" button beneath any message to instantly translate between Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, and Punjabi using our on-device neural model.',
    },
    {
      q: 'How do I sync verified documents from DigiLocker?',
      a: 'Navigate to the Document Vault under attachments or media to link your DigiLocker citizen account. Verified digital IDs (Aadhaar, PAN, Driving License) can be shared as timed single-use OTP links.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Help & DigiSahayak"
        subtitle="24/7 Citizen AI Assistant & FAQs"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('settings_hub')}
      />

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* DigiSahayak Support Card */}
        <div
          onClick={() => navigate('bharat_ai')}
          className="p-5 rounded-3xl bg-gradient-to-tr from-sky-950 via-indigo-950 to-slate-900 border border-sky-500/40 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-all shadow-xl"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1">
                <span>DigiSahayak AI Bot</span>
                <span className="text-amber-400 text-xs">✨</span>
              </h3>
              <p className="text-xs text-slate-300">Instant answers in 10+ Indic languages</p>
            </div>
          </div>

          <span className="text-xs font-bold text-sky-400">Ask AI →</span>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <FileQuestion className="w-4 h-4 text-sky-400" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-2">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;

              return (
                <div
                  key={i}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-850"
                  >
                    <span className="text-xs font-bold text-slate-200">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>

                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
