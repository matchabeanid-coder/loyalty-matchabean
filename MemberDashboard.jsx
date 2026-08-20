import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import PromoSlider from './PromoSlider';
import { Award, LogOut, CheckCircle } from 'lucide-react';

export default function MemberDashboard({ member, settings, onLogout }) {
  const target = member.stampTarget || settings.stampTarget || 10;
  const currentStamps = member.stamps || 0;
  const isRewardReady = currentStamps >= target;
  const rewardTitle = settings.rewardName || "FREE MATCHA OG";
  const progressPercent = Math.min((currentStamps / target) * 100, 100);

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31]">
        <div className="flex items-center space-x-3">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-[#a3e635]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#a3e635] text-[#121d17] flex items-center justify-center font-black text-xl">M</div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">{member.name}</h2>
            <p className="text-xs text-gray-400">{member.phone}</p>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 text-gray-400 hover:text-white bg-[#121d17] rounded-xl border border-[#2b3f31]">
          <LogOut size={18} />
        </button>
      </div>

      {/* Loyalty Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1b2a20] via-[#233529] to-[#121d17] p-6 rounded-3xl border border-[#344d3c] shadow-2xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#a3e635] font-bold">Matchabean Club Card</span>
            <h3 className="text-xl font-black text-white">{settings.brandName || "MATCHABEAN"}</h3>
          </div>
          <span className="px-3 py-1 bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635] text-xs font-mono rounded-full font-bold">
            {member.memberCode}
          </span>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-inner">
          <QRCodeSVG value={member.memberCode} size={180} level="H" />
          <span className="text-xs font-mono font-bold text-gray-800 tracking-widest">{member.memberCode}</span>
        </div>

        {/* Stamps Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-2xl font-black text-[#a3e635]">{currentStamps}</span>
              <span className="text-sm font-bold text-gray-400"> / {target} STAMPS</span>
            </div>
            {isRewardReady && (
              <span className="flex items-center space-x-1 text-xs font-bold bg-[#a3e635] text-[#121d17] px-2.5 py-1 rounded-full animate-bounce">
                <Award size={14} />
                <span>REWARD READY</span>
              </span>
            )}
          </div>

          <div className="w-full bg-[#121d17] h-3 rounded-full overflow-hidden border border-[#2b3f31]">
            <div className="bg-gradient-to-r from-[#82c427] to-[#a3e635] h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>

          <div className="text-xs text-center text-gray-300 bg-[#121d17]/50 p-2 rounded-xl border border-[#2b3f31]/50">
            {isRewardReady ? (
              <p className="font-bold text-[#a3e635]">🎉 Klaim gratis {rewardTitle} di kasir!</p>
            ) : (
              <p>{target - currentStamps} stamp lagi untuk mendapatkan <span className="font-bold text-white">{rewardTitle}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Promos */}
      <PromoSlider />
    </div>
  );
}
