import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { DOCUMENTS_VAULT } from '../../../data/mockData';
import {
  ShieldCheck,
  FileCheck,
  Lock,
  Share2,
  Download,
  Plus,
  Key,
  QrCode,
} from 'lucide-react';

export const DocumentVaultScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="DigiLocker Vault"
        subtitle="Cryptographically verified Govt ID credentials"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('chat_list')}
      />

      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>DigiLocker Govt API Connected</span>
        </div>
        <button
          onClick={() => {
            triggerConfetti();
            alert('Opening Govt DigiLocker OAuth Sync...');
          }}
          className="text-sky-400 font-semibold hover:underline flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Fetch New ID</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {DOCUMENTS_VAULT.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
            className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-3 ${
              selectedDoc === doc.id
                ? 'bg-sky-950/40 border-sky-500 shadow-xl'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  🪪
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                    {doc.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {doc.issuer} • {doc.size}
                  </p>
                  <div className="inline-flex items-center space-x-1 mt-1 text-[9px] font-bold text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Digitally Signed & Validated</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedDoc === doc.id && (
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs animate-in slide-in-from-top duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerConfetti();
                    navigate('private_chat');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-semibold flex items-center space-x-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share in Chat</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Generating single-use 10-minute secure viewer OTP...');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold flex items-center space-x-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Timed OTP Link</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
