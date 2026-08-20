import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import MemberApp from './MemberApp.jsx';
import AdminDashboard from './AdminDashboard.jsx';
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
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (err) {
        console.error("Gagal mengambil pengaturan:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      alert("Login gagal: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#121d17] text-[#f7f5f0] font-sans">
      {/* Switcher Header Mode (Member vs Admin) */}
      <div className="flex justify-between items-center p-4 bg-[#1a2921] border-b border-emerald-800/30">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-emerald-400">{settings.brandName}</span>
        </div>
        <button
          onClick={() => setMode(mode === 'member' ? 'admin' : 'member')}
          className="flex items-center gap-2 text-xs bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-700/50 hover:bg-emerald-900 transition"
        >
          {mode === 'member' ? (
            <>
              <Shield className="w-3.5 h-3.5" /> Portal Admin
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" /> Portal Member
            </>
          )}
        </button>
      </div>

      {/* Main Content Render */}
      {mode === 'member' ? (
        <MemberApp settings={settings} />
      ) : (
        <div className="p-4 max-w-4xl mx-auto">
          {adminUser ? (
            <AdminDashboard settings={settings} setSettings={setSettings} />
          ) : (
            <div className="max-w-sm mx-auto my-12 p-6 bg-[#1a2921] rounded-2xl border border-emerald-800/40 shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-center text-emerald-400">Login Admin</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-emerald-200/70 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-sm text-white w-full focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-emerald-200/70 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-sm text-white w-full focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-[#121d17] font-bold py-2.5 rounded-xl hover:bg-emerald-400 transition"
                >
                  Masuk
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
