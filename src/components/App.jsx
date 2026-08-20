import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import MemberApp from './components/MemberApp';
import AdminDashboard from './components/AdminDashboard';
import { Shield, Smartphone } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState('member'); // 'member' | 'admin'
  const [adminUser, setAdminUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState({
    brandName: "MATCHABEAN",
    tagline: "Balance in every cup",
    stampTarget: 10,
    rewardName: "FREE MATCHA OG",
    adminPhone: "6281234567890",
    logoUrl: ""
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
    });

    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'app'));
        if (snap.exists()) {
          setSettings(snap.data());
        }
      } catch (err) {
        console.error("Settings load error", err);
      }
    };
    fetchSettings();

    return () => unsub();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Login Kasir Gagal: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#121d17] text-[#f7f5f0] flex flex-col">
      {/* Switcher Header */}
      <div className="p-2 bg-[#1b2a20] border-b border-[#2b3f31] flex justify-between items-center px-4 max-w-md mx-auto w-full">
        <div className="flex items-center space-x-2">
          {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="w-6 h-6 rounded-full" />}
          <span className="text-xs font-bold text-white tracking-widest">{settings.brandName || "MATCHABEAN"}</span>
        </div>
        <button 
          onClick={() => setMode(mode === 'member' ? 'admin' : 'member')}
          className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#2b3f31] text-[#a3e635] flex items-center space-x-1"
        >
          {mode === 'member' ? <Shield size={12} /> : <Smartphone size={12} />}
          <span>{mode === 'member' ? 'Akses Kasir' : 'Tampilan Member'}</span>
        </button>
      </div>

      {/* Main Body Routing */}
      {mode === 'member' ? (
        <MemberApp settings={settings} />
      ) : (
        <div className="flex-1">
          {!adminUser ? (
            <div className="max-w-md mx-auto p-6 pt-12 space-y-6">
              <div className="bg-[#1b2a20] p-6 rounded-3xl border border-[#2b3f31] space-y-4 text-center">
                <h2 className="text-xl font-bold text-white">Login Outlet/Kasir</h2>
                <form onSubmit={handleAdminLogin} className="space-y-3 text-left">
                  <div>
                    <label className="text-xs text-gray-400">Email Admin</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] p-3 rounded-xl text-sm text-white focus:outline-none focus:border-[#a3e635]" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] p-3 rounded-xl text-sm text-white focus:outline-none focus:border-[#a3e635]" required />
                  </div>
                  <button type="submit" className="w-full bg-[#a3e635] text-[#121d17] font-bold py-3 rounded-xl text-sm mt-2">
                    MASUK ADMIN
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <AdminDashboard settings={settings} setSettings={setSettings} adminUser={adminUser} />
          )}
        </div>
      )}
    </div>
  );
}
