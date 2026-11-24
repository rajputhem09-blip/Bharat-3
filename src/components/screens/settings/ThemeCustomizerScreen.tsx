import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { Palette, Sun, Moon, Check, Sparkles } from 'lucide-react';
import { AppTheme } from '../../../types';

export const ThemeCustomizerScreen: React.FC = () => {
  const { currentTheme, setTheme, isDarkMode, toggleDarkMode, navigate, triggerConfetti } = useApp();

  const themes: { id: AppTheme; label: string; preview: string; desc: string }[] = [
    { id: 'classic_saffron', label: 'Vedic Saffron & Gold', preview: 'from-amber-500 to-orange-600', desc: 'Inspired by traditional brass and sunlit terracotta' },
    { id: 'bengaluru_tech', label: 'Bengaluru Tech Blue', preview: 'from-sky-500 to-indigo-600', desc: 'Futuristic silicon blue with crisp contrast' },
    { id: 'kerala_emerald', label: 'Kerala Emerald', preview: 'from-emerald-500 to-teal-600', desc: 'Lush tropical greenery & clean natural tones' },
    { id: 'jaipur_pink', label: 'Jaipur Royal Pink', preview: 'from-rose-500 to-pink-600', desc: 'Heritage pink sandstone and palace elegance' },
    { id: 'himalayan_snow', label: 'Himalayan Mist', preview: 'from-slate-400 to-zinc-600', desc: 'High altitude monochrome and subtle slate' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Theme & Customization"
        subtitle="Regional color palettes & Dark/Light mode"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('settings_hub')}
      />

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Dark / Light Toggle */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Color Mode</h3>
              <p className="text-[11px] text-slate-400">{isDarkMode ? 'AMOLED Dark Canvas' : 'Sunlit Crisp Light'}</p>
            </div>
          </div>

          <button
            onClick={() => {
              toggleDarkMode();
              triggerConfetti();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isDarkMode ? 'bg-sky-600 text-white' : 'bg-amber-400 text-slate-950'
            }`}
          >
            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>

        {/* Palettes */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Curated Indic Archetypes
          </div>

          <div className="space-y-2.5">
            {themes.map((t) => {
              const isSelected = currentTheme === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    triggerConfetti();
                  }}
                  className={`p-4 rounded-3xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-sky-500 ring-1 ring-sky-500 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${t.preview} shadow-md shrink-0`} />
                    <div>
                      <h4 className="text-xs font-bold text-white">{t.label}</h4>
                      <p className="text-[10px] text-slate-400 leading-snug">{t.desc}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
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
