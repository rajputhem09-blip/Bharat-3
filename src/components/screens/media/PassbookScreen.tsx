import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import { BottomNav } from '../../common/BottomNav';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Sparkles,
  Gift,
  ShieldCheck,
  Split,
  Plus,
} from 'lucide-react';

export const PassbookScreen: React.FC = () => {
  const { transactions, navigate, triggerConfetti } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');

  const totalSent = transactions
    .filter((t) => t.type === 'SENT')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.type === 'RECEIVED')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredTxs = transactions.filter((t) => {
    if (activeTab === 'sent') return t.type === 'SENT';
    if (activeTab === 'received') return t.type === 'RECEIVED';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      <Header
        title="BharatPay Ledger"
        subtitle="UPI Transactions & Cashback Rewards"
        showBack={false}
        showSearch={false}
        rightAction={
          <button
            onClick={() => navigate('upi_payment')}
            className="p-2 text-emerald-400 hover:bg-emerald-950/40 rounded-full"
            title="Scan QR"
          >
            <QrCode className="w-5 h-5" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Modern BharatPass Holographic Card */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-sky-900 via-indigo-900 to-slate-950 border border-sky-500/30 shadow-2xl overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 p-8 opacity-10 font-mono font-black text-6xl text-white select-none">
            UPI
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center font-bold text-white">
                🇮🇳
              </div>
              <span className="text-xs font-bold text-white tracking-wider uppercase">
                BharatPay Smart Passbook
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Active • Zero Fees
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400">Total Monthly Volume</span>
            <h2 className="text-3xl font-extrabold text-white font-mono tracking-tight">
              ₹{(totalSent + totalReceived).toLocaleString('en-IN')}
            </h2>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Sent Out</span>
              <span className="font-semibold text-rose-400 font-mono">₹{totalSent.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Received</span>
              <span className="font-semibold text-emerald-400 font-mono">₹{totalReceived.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Rewards Earned</span>
              <span className="font-semibold text-amber-400 font-mono">₹380 🎁</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('upi_payment')}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 flex items-center space-x-2.5 text-left transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Pay Contact</div>
              <div className="text-[10px] text-slate-400">Instant UPI Transfer</div>
            </div>
          </button>

          <button
            onClick={() => {
              triggerConfetti();
              navigate('upi_payment');
            }}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500 flex items-center space-x-2.5 text-left transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-950 flex items-center justify-center text-sky-400">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Split Group Bill</div>
              <div className="text-[10px] text-slate-400">Auto-calculate per head</div>
            </div>
          </button>
        </div>

        {/* Transaction History Filter */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Transactions
            </h3>
            <div className="flex items-center space-x-1">
              {(['all', 'sent', 'received'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase transition-all ${
                    activeTab === tab
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
            {filteredTxs.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-850 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      tx.type === 'SENT'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    }`}
                  >
                    {tx.type === 'SENT' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{tx.recipientName}</h4>
                    <p className="text-[10px] text-slate-400">{tx.note}</p>
                    <span className="text-[9px] font-mono text-slate-500">{tx.timestamp}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-extrabold font-mono ${
                      tx.type === 'SENT' ? 'text-slate-200' : 'text-emerald-400'
                    }`}
                  >
                    {tx.type === 'SENT' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
