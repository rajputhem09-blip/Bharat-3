import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { INDIC_LANGUAGES } from '../../../data/mockData';
import { Check, Globe, Sparkles } from 'lucide-react';

export const IndicLanguageScreen: React.FC = () => {
  const { currentLanguage, setLanguage, navigate, triggerConfetti } = useApp();

  const handleSelect = (name: string) => {
    setLanguage(name);
    triggerConfetti();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="Official Indic Languages"
        subtitle="10+ Supported Languages with 1-Tap Translation"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('settings_hub')}
      />

      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center space-x-2 text-xs text-sky-400">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>
          Instant AI real-time message translation will default to your chosen Indic dialect.
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70 p-2">
        {INDIC_LANGUAGES.map((lang) => {
          const isSelected = currentLanguage === lang.name;

          return (
            <div
              key={lang.code}
              onClick={() => handleSelect(lang.name)}
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${
                isSelected ? 'bg-sky-950/40 border border-sky-500/40' : 'hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
                  {lang.nativeScript.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{lang.name}</h4>
                  <p className="text-[11px] text-slate-400 font-serif">{lang.nativeScript}</p>
                </div>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
