import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export default function MemberApp({ settings }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Login / Cek Member
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const q = query(collection(db, 'members'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setMember({ id: querySnapshot.docs[0].id, ...docData });
      } else {
        setErrorMsg('Member tidak ditemukan. Silakan daftar terlebih dahulu.');
        setMember(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal mengambil data.');
    }
    setLoading(false);
  };

  // Handle Registrasi Member Baru
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !phone || !pin) {
      setErrorMsg('Gagal: Harap isi semua kolom!');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      // Cek apakah nomor HP sudah terdaftar
      const q = query(collection(db, 'members'), where('phone', '==', phone));
      const existing = await getDocs(q);
      if (!existing.empty) {
        setErrorMsg('Gagal: Nomor WhatsApp sudah terdaftar!');
        setLoading(false);
        return;
      }

      const newMember = {
        name,
        phone,
        pin,
        stamps: 0,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'members'), newMember);
      setMember({ id: docRef.id, ...newMember });
      setIsRegister(false);
      setName('');
      setPhone('');
      setPin('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal mendaftar.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1a2921] p-4 flex flex-col items-center justify-center font-sans text-[#1a2921]">
      <div className="w-full max-w-md bg-[#f5f2e9] rounded-[32px] p-6 shadow-2xl space-y-6 text-center border border-[#e2ddd0]">
        
        {/* Header Logo / Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-wider uppercase text-[#1a2921]">
            {settings?.brandName || 'MATCHABEAN CLUB'}
          </h1>
          <p className="text-xs text-[#5a6b5c] font-medium">
            {settings?.tagline || 'Balance in every cup'}
          </p>
        </div>

        {/* Dynamic Section: Registered Member Stamp View */}
        {member ? (
          <div className="space-y-5 text-left pt-2">
            <div className="bg-[#eae5d8] p-4 rounded-2xl flex justify-between items-center border border-[#d8d2c2]">
              <div>
                <h3 className="font-bold text-lg text-[#1a2921]">{member.name}</h3>
                <p className="text-xs text-[#5a6b5c]">{member.phone}</p>
              </div>
              <div className="bg-[#1a2921] text-[#f5f2e9] px-3 py-1.5 rounded-full text-xs font-bold">
                {member.stamps || 0} / {settings?.stampTarget || 10} Stamp
              </div>
            </div>

            {/* Stamp Grid */}
            <div className="grid grid-cols-5 gap-2.5 py-2">
              {Array.from({ length: settings?.stampTarget || 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-2xl flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    i < (member.stamps || 0)
                      ? 'bg-[#1a2921] text-[#f5f2e9] border-[#1a2921]'
                      : 'bg-[#f5f2e9] text-[#b0a898] border-[#d8d2c2]'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <button
              onClick={() => setMember(null)}
              className="w-full text-xs text-[#5a6b5c] underline font-semibold text-center pt-2"
            >
              Keluar / Gunakan Nomor Lain
            </button>
          </div>
        ) : (
          /* Form Section: Login vs Register */
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1a2921]">
                {isRegister ? 'Daftar Member' : 'Cek Stamp Member'}
              </h2>
              <p className="text-xs text-[#6b7c6d] leading-relaxed max-w-xs mx-auto">
                {isRegister
                  ? 'Scan QR pendaftaran Matchabean dari booth, lalu isi data di bawah.'
                  : 'Masukkan nomor WhatsApp terdaftar untuk melihat perolehan stamp kamu.'}
              </p>
            </div>

            {isRegister ? (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#d8d2c2] rounded-2xl px-4 py-3 text-sm text-[#1a2921] focus:outline-none focus:border-[#1a2921] transition"
                  required
                />
                <input
                  type="tel"
                  placeholder="Nomor WhatsApp (misal: 08123456789)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#d8d2c2] rounded-2xl px-4 py-3 text-sm text-[#1a2921] focus:outline-none focus:border-[#1a2921] transition"
                  required
                />
                <input
                  type="password"
                  placeholder="PIN / Password (6 digit)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-white border border-[#d8d2c2] rounded-2xl px-4 py-3 text-sm text-[#1a2921] focus:outline-none focus:border-[#1a2921] transition"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#23382b] text-[#f5f2e9] font-black tracking-wide py-3.5 rounded-2xl hover:bg-[#1a2921] transition text-sm uppercase shadow-md"
                >
                  {loading ? 'Memproses...' : 'DAFTAR & BUAT MEMBER'}
                </button>
              </form>
            ) : (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-3 pt-2">
                <input
                  type="tel"
                  placeholder="Masukkan Nomor WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#d8d2c2] rounded-2xl px-4 py-3 text-sm text-[#1a2921] focus:outline-none focus:border-[#1a2921] transition text-center"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#23382b] text-[#f5f2e9] font-black tracking-wide py-3.5 rounded-2xl hover:bg-[#1a2921] transition text-sm uppercase shadow-md"
                >
                  {loading ? 'Mencari...' : 'CEK STAMP SAYA'}
                </button>
              </form>
            )}

            {/* Toggle Register / Login */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
                className="text-xs font-bold text-[#1a2921] hover:underline"
              >
                {isRegister ? 'Kembali Login' : 'Belum punya member? Daftar di sini'}
              </button>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <p className="text-xs font-bold text-red-600 bg-red-100/60 py-2 px-3 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            {/* Footnote Card */}
            <div className="bg-[#eae5d8] p-3 rounded-2xl border border-[#d8d2c2] text-[11px] text-[#5a6b5c] space-y-1">
              <p className="font-bold uppercase tracking-wider text-[#1a2921]">QR Pendaftaran</p>
              <p>Admin bisa menampilkan QR ini di booth.</p>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-emerald-800 font-bold underline cursor-pointer hover:text-emerald-950"
              >
                Salin link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
