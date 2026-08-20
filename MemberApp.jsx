import React, { useState } from 'react';
import { db } from './firebase'; // Sesuaikan jika titik satu (./) atau dua (../)
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export default function MemberApp({ settings }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        setErrorMsg('Member tidak ditemukan. Silakan daftar dulu.');
        setMember(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal mengambil data.');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !phone || !pin) {
      setErrorMsg('Harap isi semua kolom!');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const q = query(collection(db, 'members'), where('phone', '==', phone));
      const existing = await getDocs(q);
      if (!existing.empty) {
        setErrorMsg('Nomor WhatsApp sudah terdaftar!');
        setLoading(false);
        return;
      }

      const newMember = { name, phone, pin, stamps: 0, createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'members'), newMember);
      setMember({ id: docRef.id, ...newMember });
      setIsRegister(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal mendaftar.');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#1a2921', minHeight: '100vh', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
      {/* Card Utama Berwarna Cream */}
      <div style={{ backgroundColor: '#f5f2e9', width: '100%', maxWidth: '380px', borderRadius: '32px', padding: '28px 20px', border: '1px solid #e2ddd0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', textAlign: 'center' }}>
        
        {/* Header */}
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1a2921', letterSpacing: '1px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
          {settings?.brandName || 'MATCHABEAN CLUB'}
        </h1>
        <p style={{ fontSize: '13px', color: '#5a6b5c', margin: '0 0 24px 0', fontWeight: '500' }}>
          {settings?.tagline || 'Balance in every cup'}
        </p>

        {member ? (
          /* Tampilan Stamp Member */
          <div style={{ textAlign: 'left' }}>
            <div style={{ backgroundColor: '#eae5d8', padding: '14px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #d8d2c2', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1a2921' }}>{member.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#5a6b5c' }}>{member.phone}</p>
              </div>
              <div style={{ backgroundColor: '#1a2921', color: '#f5f2e9', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                {member.stamps || 0} / 10 Stamp
              </div>
            </div>

            {/* Grid 10 Stamp */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1/1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #1a2921', backgroundColor: i < (member.stamps || 0) ? '#1a2921' : '#f5f2e9', color: i < (member.stamps || 0) ? '#f5f2e9' : '#b0a898' }}>
                  {i + 1}
                </div>
              ))}
            </div>

            <button onClick={() => setMember(null)} style={{ width: '100%', background: 'none', border: 'none', color: '#5a6b5c', textDecoration: 'underline', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              Keluar / Gunakan Nomor Lain
            </button>
          </div>
        ) : (
          /* Tampilan Form */
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a2921', margin: '0 0 6px 0' }}>
              {isRegister ? 'Daftar Member' : 'Cek Stamp Member'}
            </h2>
            <p style={{ fontSize: '12px', color: '#6b7c6d', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              {isRegister
                ? 'Scan QR pendaftaran Matchabean dari booth, lalu isi data di bawah.'
                : 'Masukkan nomor WhatsApp terdaftar untuk melihat perolehan stamp kamu.'}
            </p>

            {isRegister ? (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '12px 16px', borderRadius: '16px', border: '1px solid #d8d2c2', fontSize: '14px', outline: 'none' }} required />
                <input type="tel" placeholder="Nomor WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '12px 16px', borderRadius: '16px', border: '1px solid #d8d2c2', fontSize: '14px', outline: 'none' }} required />
                <input type="password" placeholder="PIN / Password" value={pin} onChange={(e) => setPin(e.target.value)} style={{ padding: '12px 16px', borderRadius: '16px', border: '1px solid #d8d2c2', fontSize: '14px', outline: 'none' }} required />
                <button type="submit" disabled={loading} style={{ backgroundColor: '#23382b', color: '#f5f2e9', padding: '14px', borderRadius: '16px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}>
                  {loading ? 'MEMPROSES...' : 'DAFTAR & BUAT MEMBER'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="tel" placeholder="Masukkan No. WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '12px 16px', borderRadius: '16px', border: '1px solid #d8d2c2', fontSize: '14px', textAlign: 'center', outline: 'none' }} required />
                <button type="submit" disabled={loading} style={{ backgroundColor: '#23382b', color: '#f5f2e9', padding: '14px', borderRadius: '16px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}>
                  {loading ? 'MENCARI...' : 'CEK STAMP SAYA'}
                </button>
              </form>
            )}

            <button type="button" onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: '#1a2921', fontSize: '12px', fontWeight: 'bold', marginTop: '16px', cursor: 'pointer' }}>
              {isRegister ? 'Kembali Login' : 'Belum punya member? Daftar di sini'}
            </button>

            {errorMsg && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', marginTop: '12px' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ backgroundColor: '#eae5d8', padding: '12px', borderRadius: '16px', border: '1px solid #d8d2c2', marginTop: '20px', fontSize: '11px', color: '#5a6b5c' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 2px 0', color: '#1a2921' }}>QR PENDAFTARAN</p>
              <p style={{ margin: '0 0 6px 0' }}>Admin bisa menampilkan QR ini di booth.</p>
              <span onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ color: '#15803d', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>
                Salin link
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
