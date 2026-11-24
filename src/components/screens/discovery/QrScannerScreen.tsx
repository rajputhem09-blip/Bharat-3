import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Header } from '../../common/Header';
import {
  QrCode,
  Camera,
  Share2,
  Download,
  IndianRupee,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const QrScannerScreen: React.FC = () => {
  const { currentUser, navigate, triggerConfetti } = useApp();
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan'>('my_qr');

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-y-auto">
      <Header
        title="QR Hub & Scanner"
        subtitle="Contact cards & BharatPay UPI scanning"
        showBack={true}
        showSearch={false}
        onBackClick={() => navigate('contacts')}
      />

      {/* Tabs */}
      <div className="flex items-center justify-around bg-slate-900 border-b border-slate-800 text-xs font-semibold p-1">
        <button
          onClick={() => setActiveTab('my_qr')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'my_qr' ? 'bg-sky-600 text-white shadow' : 'text-slate-400'
          }`}
        >
          My BharatCard QR
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'scan' ? 'bg-sky-600 text-white shadow' : 'text-slate-400'
          }`}
        >
          Scan Camera
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6 max-w-sm mx-auto w-full">
        {activeTab === 'my_qr' ? (
          <div className="w-full space-y-4">
            {/* Styled BharatCard */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-500/40 shadow-2xl flex flex-col items-center text-center space-y-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-400 shadow-md"
              />
              <div>
                <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
                <p className="text-xs text-sky-400 font-mono">@{currentUser.handle}</p>
                <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{currentUser.upiId}</p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=aarav@okaxis&pn=Aarav%20Sharma"
                  alt="QR Code"
                  className="w-40 h-40 object-contain"
                />
              </div>

              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scan with any UPI app or BharatChat scanner</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  triggerConfetti();
                  alert('QR Card saved to your gallery!');
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Save Card</span>
              </button>
              <button
                onClick={() => {
                  triggerConfetti();
                  alert('Link copied to clipboard!');
                }}
                className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-md shadow-sky-600/20 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share QR</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4 text-center">
            {/* Camera Viewfinder */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-900 border-2 border-dashed border-sky-400 flex items-center justify-center shadow-2xl">
              <div className="absolute inset-4 border-2 border-sky-400/60 rounded-2xl animate-pulse pointer-events-none"></div>
              <Camera className="w-12 h-12 text-slate-700" />
              <div className="absolute bottom-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-[11px] text-white font-mono">
                Align QR Code inside frame
              </div>
            </div>

            <button
              onClick={() => {
                triggerConfetti();
                navigate('upi_payment');
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25"
            >
              Simulate Scan & Pay ₹1,450
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
