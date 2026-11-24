import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  Shield,
  Lock,
  Eye,
  Key,
  Smartphone,
  Check,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';

export const PrivacySecurityScreen: React.FC = () => {
  const { navigate, triggerConfetti } = useApp();
  const [appLock, setAppLock] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState('My Contacts');
  const [twoStepAuth, setTwoStepAuth] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="Privacy & Security"
        subtitle="Zero-knowledge BharatPKI encryption settings"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('settings_hub')}
      />

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Security Health Score Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
              <Shield className="w-4 h-4 mr-1.5" /> Security Rating: Optimal (100%)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              E2E ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Your chats, UPI transfers, and voice data are shielded with post-quantum 256-bit cryptography.
          </p>
        </div>

        {/* Biometrics & App Lock */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 p-2 text-xs">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <Fingerprint className="w-5 h-5 text-sky-400" />
              <div>
                <div className="font-semibold text-white">Biometric App Lock</div>
                <div className="text-[11px] text-slate-400">Unlock with Fingerprint / Face ID</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={appLock}
              onChange={(e) => setAppLock(e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-semibold text-white">Two-Step PIN Verification</div>
                <div className="text-[11px] text-slate-400">Extra security layer for SIM swaps</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={twoStepAuth}
              onChange={(e) => setTwoStepAuth(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 p-2 text-xs">
          <div className="flex items-center justify-between p-3">
            <div>
              <div className="font-semibold text-white">Read Receipts (Blue Checks)</div>
              <div className="text-[11px] text-slate-400">Let others know when you read their text</div>
            </div>
            <input
              type="checkbox"
              checked={readReceipts}
              onChange={(e) => setReadReceipts(e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div>
              <div className="font-semibold text-white">Who can see Last Seen & Online</div>
              <div className="text-[11px] text-slate-400">{lastSeen}</div>
            </div>
            <select
              value={lastSeen}
              onChange={(e) => setLastSeen(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option>Everyone</option>
              <option>My Contacts</option>
              <option>Nobody</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
