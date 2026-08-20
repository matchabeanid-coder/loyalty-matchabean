import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import MemberDashboard from './MemberDashboard';
import { UserPlus, QrCode } from 'lucide-react';

export default function MemberApp({ settings }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [activeMember, setActiveMember] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckPhone = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setNotFound(false);

    try {
      let cleanPhone = phone.trim();
      const q = query(collection(db, 'members'), where('phone', '==', cleanPhone));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docData = snap.docs[0].data();
        setActiveMember({ id: snap.docs[0].id, ...docData });
      } else {
        setNotFound(true);
      }
    } catch (err) {
      alert('Gagal mengecek nomor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfRegister = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    setLoading(true);

    try {
      const snap = await getDocs(collection(db, 'members'));
      const count = snap.size + 1;
      const memberCode = `MB-${String(count).padStart(6, '0')}`;

      const newMember = {
        name: name.trim(),
        phone: phone.trim(),
        memberCode: memberCode,
        stamps: 0,
        stampTarget: settings.stampTarget || 10,
        reward: settings.rewardName || "FREE MATCHA OG",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'members'), newMember);
      setActiveMember({ id: docRef.id, ...newMember });
    } catch (err) {
      alert("Gagal mendaftar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (activeMember) {
    return <MemberDashboard member={activeMember} settings={settings} onLogout={() => setActiveMember(null)} />;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 min-h-screen flex flex-col justify-center items-center">
      <div className="w-full bg-[#1b2a20] p-8 rounded-3xl border border-[#2b3f31] text-center space-y-6 shadow-2xl">
        <div className="flex flex-col items-center space-y-2">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Matchabean" className="w-20 h-20 rounded-full object-cover border-2 border-[#a3e635]" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#a3e635] text-[#121d17] flex items-center justify-center text-3xl font-black">M</div>
          )}
          <h1 className="text-2xl font-black text-white">{settings.brandName || "MATCHABEAN CLUB"}</h1>
          <p className="text-xs text-[#a3e635] font-medium tracking-wide">"{settings.tagline || "Balance in every cup"}"</p>
        </div>

        {!isRegistering ? (
          <form onSubmit={handleCheckPhone} className="space-y-4">
            <input 
              type="tel" 
              placeholder="Masukkan Nomor WhatsApp (08xxx)" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#121d17] border border-[#2b3f31] text-white p-3.5 rounded-xl text-center text-sm focus:outline-none focus:border-[#a3e635]"
              required
            />
            <button type="submit" disabled={loading} className="w-full bg-[#a3e635] text-[#121d17] font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition">
              {loading ? "Mengecek..." : "MASUK / CEK MEMBER"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSelfRegister} className="space-y-4 text-left">
            <div>
              <label className="text-xs text-gray-400">Nama Lengkap</label>
              <input type="text" placeholder="Contoh: Fikri" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] text-white p-3 rounded-xl text-sm focus:outline-none focus:border-[#a3e635]" required />
            </div>
            <div>
              <label className="text-xs text-gray-400">Nomor WhatsApp</label>
              <input type="tel" placeholder="081234567890" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] text-white p-3 rounded-xl text-sm focus:outline-none focus:border-[#a3e635]" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#a3e635] text-[#121d17] font-bold py-3.5 rounded-xl text-sm">
              {loading ? "Mendaftarkan..." : "BUAT MEMBER ID & QR"}
            </button>
            <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-xs text-gray-400 text-center block pt-2">
              Kembali ke Login
            </button>
          </form>
        )}

        {notFound && !isRegistering && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-red-400 font-semibold">Member belum ditemukan.</p>
            <div className="flex flex-col space-y-2">
              <button onClick={() => setIsRegistering(true)} className="w-full bg-[#121d17] border border-[#a3e635] text-[#a3e635] font-bold py-3 rounded-xl text-xs flex justify-center items-center space-x-2">
                <QrCode size={16} />
                <span>DAFTAR MANDIRI LANGSUNG</span>
              </button>
              <a 
                href={`https://wa.me/${settings.adminPhone || '6281234567890'}?text=Halo%20Matchabean%20%F0%9F%90%8B%0ASaya%20ingin%20mendaftar%20Matchabean%20Club.%0ANomor%20WhatsApp:%20${phone}`}
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center space-x-2"
              >
                <UserPlus size={16} />
                <span>DAFTAR VIA WHATSAPP ADMIN</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
