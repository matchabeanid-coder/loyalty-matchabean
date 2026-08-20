import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import MemberManager from './MemberManager';
import PromoManager from './PromoManager';
import SettingManager from './SettingManager';
import TransactionList from './TransactionList';
import { Users, Tag, Settings, Receipt, LogOut } from 'lucide-react';

export default function AdminDashboard({ settings, setSettings }) {
  const [activeTab, setActiveTab] = useState('members');

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1a2921] p-4 rounded-2xl border border-emerald-800/40">
        <h1 className="text-lg font-bold text-emerald-400">Dashboard Admin</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs bg-red-950/50 text-red-400 border border-red-800/40 px-3 py-2 rounded-xl hover:bg-red-900/50 transition"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-2 bg-[#1a2921] p-1.5 rounded-2xl border border-emerald-800/40">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'members' ? 'bg-emerald-500 text-[#121d17]' : 'text-emerald-200/60 hover:text-emerald-100'
          }`}
        >
          <Users className="w-4 h-4" /> Member
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'transactions' ? 'bg-emerald-500 text-[#121d17]' : 'text-emerald-200/60 hover:text-emerald-100'
          }`}
        >
          <Receipt className="w-4 h-4" /> Transaksi
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'promos' ? 'bg-emerald-500 text-[#121d17]' : 'text-emerald-200/60 hover:text-emerald-100'
          }`}
        >
          <Tag className="w-4 h-4" /> Promo
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'settings' ? 'bg-emerald-500 text-[#121d17]' : 'text-emerald-200/60 hover:text-emerald-100'
          }`}
        >
          <Settings className="w-4 h-4" /> Pengaturan
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'members' && <MemberManager settings={settings} />}
      {activeTab === 'transactions' && <TransactionList />}
      {activeTab === 'promos' && <PromoManager />}
      {activeTab === 'settings' && <SettingManager settings={settings} setSettings={setSettings} />}
    </div>
  );
}
