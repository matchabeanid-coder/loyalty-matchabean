import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import QRScanner from '../../QRScanner.jsx';
import PromoSlider from '../../PromoSlider.jsx';

export default function MemberApp({ settings }) {
  const [member, setMember] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'members'), where('phone', '==', searchPhone));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setMember({ id: querySnapshot.docs[0].id, ...docData });
      } else {
        alert('Member tidak ditemukan!');
        setMember(null);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data member');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <div className="bg-[#1a2921] p-6 rounded-3xl border border-emerald-800/40 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-emerald-400 mb-1">{settings?.brandName || 'MATCHABEAN'}</h1>
        <p className="text-xs text-emerald-200/60 mb-6">{settings?.tagline || 'Balance in every cup'}</p>

        <form onSubmit={handleSearch} className="space-y-3">
          <input
            type="tel"
            placeholder="Masukkan No. WhatsApp"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full bg-[#121d17] border border-emerald-800/60 rounded-2xl p-3 text-center text-emerald-100 placeholder-emerald-800 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-[#121d17] font-bold py-3 rounded-2xl hover:bg-emerald-400 transition"
          >
            {loading ? 'Mencari...' : 'Cek Stamp Saya'}
          </button>
        </form>
      </div>

      {member && (
        <div className="bg-[#1a2921] p-6 rounded-3xl border border-emerald-800/40 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-emerald-100">{member.name}</h3>
              <p className="text-xs text-emerald-200/60">{member.phone}</p>
            </div>
            <div className="bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/50 text-xs text-emerald-300 font-bold">
              {member.stamps || 0} / {settings?.stampTarget || 10} Stamp
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 py-4">
            {Array.from({ length: settings?.stampTarget || 10 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl flex items-center justify-center font-bold text-sm border ${
                  i < (member.stamps || 0)
                    ? 'bg-emerald-500 text-[#121d17] border-emerald-400'
                    : 'bg-[#121d17] text-emerald-800 border-emerald-900'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      <PromoSlider />
    </div>
  );
}
