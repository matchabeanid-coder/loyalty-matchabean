import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import QRScanner from './QRScanner';
import MemberManager from './MemberManager';
import PromoManager from './PromoManager';
import TransactionList from './TransactionList';
import SettingsManager from './SettingsManager';
import { Users, QrCode, Receipt, Image, Settings, LogOut, CheckCircle } from 'lucide-react';

export default function AdminDashboard({ settings, setSettings, adminUser }) {
  const [tab, setTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [scannedMember, setScannedMember] = useState(null);
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'members'), (snap) => {
      setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleScanSuccess = async (scannedCode) => {
    const found = members.find(m => m.memberCode === scannedCode);
    if (found) {
      setScannedMember(found);
    } else {
      alert(`Member dengan ID ${scannedCode} tidak ditemukan!`);
    }
  };

  const addStampFromScan = async () => {
    if (!scannedMember) return;
    const target = scannedMember.stampTarget || settings.stampTarget || 10;
    const newStamp = (scannedMember.stamps || 0) + 1;

    try {
      await updateDoc(doc(db, 'members', scannedMember.id), {
        stamps: newStamp,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'transactions'), {
        memberId: scannedMember.id,
        memberCode: scannedMember.memberCode,
        memberName: scannedMember.name,
        phone: scannedMember.phone,
        stampDelta: 1,
        stampAfter: newStamp,
        type: 'ADD_STAMP_SCAN',
        adminId: adminUser.uid,
        createdAt: serverTimestamp()
      });

      fetch('/.netlify/functions/whatsapp', {
        method: 'POST',
        body: JSON.stringify({
          phone: scannedMember.phone,
          memberName: scannedMember.name,
          memberCode: scannedMember.memberCode,
          stamps: newStamp,
          stampTarget: target,
          rewardReady: newStamp >= target,
          rewardName: settings.rewardName || "FREE MATCHA OG"
        })
      }).catch(err => console.error("WA Error", err));

      setScanMessage("Stamp berhasil ditambahkan!");
      setScannedMember(null);
      setTimeout(() => setScanMessage(''), 3000);
    } catch (err) {
      alert("Gagal update stamp: " + err.message);
    }
  };

  const totalMembers = members.length;
  const totalStamps = members.reduce((acc, curr) => acc + (curr.stamps || 0), 0);
  const rewardReadyCount = members.filter(m => (m.stamps || 0) >= (m.stampTarget || settings.stampTarget || 10)).length;

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 pb-24">
      {/* Admin Topbar */}
      <div className="flex justify-between items-center bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31]">
        <div>
          <h2 className="font-bold text-white text-base">Matchabean Admin Panel</h2>
          <p className="text-xs text-[#a3e635]">{adminUser.email}</p>
        </div>
        <button onClick={() => auth.signOut()} className="p-2 bg-[#121d17] border border-[#2b3f31] rounded-xl text-gray-400">
          <LogOut size={18} />
        </button>
      </div>

      {scanMessage && (
        <div className="bg-[#a3e635] text-[#121d17] p-3 rounded-xl font-bold text-xs flex items-center space-x-2">
          <CheckCircle size={16} />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Main Tabs View */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31]">
              <span className="text-xs text-gray-400 block">Total Member</span>
              <span className="text-2xl font-black text-white">{totalMembers}</span>
            </div>
            <div className="bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31]">
              <span className="text-xs text-gray-400 block">Total Stamp Issued</span>
              <span className="text-2xl font-black text-[#a3e635]">{totalStamps}</span>
            </div>
            <div className="bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31] col-span-2">
              <span className="text-xs text-gray-400 block">Member Ready Reward</span>
              <span className="text-2xl font-black text-amber-400">{rewardReadyCount} Member</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'scan' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Scan QR Member</h3>
          {!scannedMember ? (
            <QRScanner onScanSuccess={handleScanSuccess} />
          ) : (
            <div className="bg-[#1b2a20] p-4 rounded-2xl border border-[#a3e635] space-y-4 text-center">
              <h4 className="font-bold text-white text-lg">{scannedMember.name}</h4>
              <p className="text-xs text-gray-400">{scannedMember.phone} • {scannedMember.memberCode}</p>
              <div className="bg-[#121d17] p-3 rounded-xl border border-[#2b3f31]">
                <span className="text-xs text-gray-400 block">Current Stamps</span>
                <span className="text-xl font-black text-[#a3e635]">{scannedMember.stamps || 0} / {scannedMember.stampTarget || settings.stampTarget || 10}</span>
              </div>
              <button onClick={addStampFromScan} className="w-full bg-[#a3e635] text-[#121d17] font-bold py-3 rounded-xl text-sm">
                +1 STAMP NOW
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'members' && <MemberManager members={members} settings={settings} adminUser={adminUser} />}
      {tab === 'tx' && <TransactionList />}
      {tab === 'promo' && <PromoManager />}
      {tab === 'settings' && <SettingsManager settings={settings} setSettings={setSettings} />}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121d17]/95 backdrop-blur-md border-t border-[#2b3f31] p-2 flex justify-around items-center max-w-md mx-auto z-50">
        <button onClick={() => setTab('dashboard')} className={`p-2 rounded-xl flex flex-col items-center ${tab === 'dashboard' ? 'text-[#a3e635]' : 'text-gray-500'}`}>
          <Users size={20} />
          <span className="text-[10px] mt-1">Home</span>
        </button>
        <button onClick={() => setTab('scan')} className={`p-2 rounded-xl flex flex-col items-center ${tab === 'scan' ? 'text-[#a3e635]' : 'text-gray-500'}`}>
          <QrCode size={20} />
          <span className="text-[10px] mt-1">Scan</span>
        </button>
        <button onClick={() => setTab('members')} className={`p-2 rounded-xl flex flex-col items-center ${tab === 'members' ? 'text-[#a3e635]' : 'text-gray-500'}`}>
          <Users size={20} />
          <span className="text-[10px] mt-1">Member</span>
        </button>
        <button onClick={() => setTab('tx')} className={`p-2 rounded-xl flex flex-col items-center ${tab === 'tx' ? 'text-[#a3e635]' : 'text-gray-500'}`}>
          <Receipt size={20} />
          <span className="text-[10px] mt-1">Tx</span>
        </button>
        <button onClick={() => setTab('promo')} className={`p-2 rounded-xl flex flex-col items-center ${tab === 'promo' ? 'text-[#a3e635]' : 'text-gray-500'}`}>
          <Image size={20} />
          <span className="text-[10px] mt-1">Promo</span>
        </button>
        <button onClick={() => setTab('settings')} className={`p-2 rounded-xl flex flex-col items-center ${tab === 'settings' ? 'text-[#a3e635]' : 'text-gray-500'}`}>
          <Settings size={20} />
          <span className="text-[10px] mt-1">Set</span>
        </button>
      </div>
    </div>
  );
}
