import React, { useState } from 'react';
import { db } from './firebase';
 // Menggunakan firebaseConfig bawaan project
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function MemberApp({ onLogin, onBack }) {
  const [mode, setMode] = useState('register'); // 'register' atau 'login'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const normalize = (p) => p.replace(/\D/g, '').replace(/^0/, '62');

  // FUNGSI DAFTAR MEMBER
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = normalize(phone);

      await addDoc(collection(db, 'members'), {
        username: name,
        phone: formattedPhone,
        password: pin,
        role: 'member',
        createdAt: new Date().toISOString()
      });

      alert('Pendaftaran Member Matchabean Berhasil!');
      setMode('login');
    } catch (err) {
      console.error(err);
      alert('Gagal mendaftar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI LOGIN MEMBER
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = normalize(phone);
      const q = query(collection(db, 'members'), where('phone', '==', formattedPhone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Nomor WhatsApp belum terdaftar!');
        setLoading(false);
        return;
      }

      let isMatch = false;
      let userData = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.password === pin || data.pin === pin) {
          isMatch = true;
          userData = data;
        }
      });

      if (isMatch) {
        alert(`Selamat datang, ${userData.username}!`);
        if (onLogin) onLogin(userData);
      } else {
        alert('Password / PIN salah!');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal login: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1b4332', marginBottom: '4px' }}>MATCHABEAN CLUB</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Balance in every cup</p>

        {mode === 'register' ? (
          <form onSubmit={handleRegister}>
            <h3 style={{ marginBottom: '16px' }}>Daftar Member</h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
              Scan QR pendaftaran Matchabean dari booth, lalu isi data di bawah.
            </p>
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <input
              type="tel"
              placeholder="Nomor WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              placeholder="Password / PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#1b4332', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? 'Memproses...' : 'DAFTAR & BUAT MEMBER'}
            </button>
            <p
              onClick={() => setMode('login')}
              style={{ cursor: 'pointer', marginTop: '16px', color: '#1b4332', fontSize: '14px', fontWeight: 'bold' }}
            >
              Kembali Login
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <h3 style={{ marginBottom: '16px' }}>Login Member</h3>
            <input
              type="tel"
              placeholder="Nomor WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              placeholder="Password / PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#1b4332', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? 'Memproses...' : 'LOGIN MEMBER'}
            </button>
            <p
              onClick={() => setMode('register')}
              style={{ cursor: 'pointer', marginTop: '16px', color: '#1b4332', fontSize: '14px', fontWeight: 'bold' }}
            >
              Belum Punya Akun? Daftar Member
            </p>
          </form>
        )}

        {onBack && (
          <button
            onClick={onBack}
            style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
          >
            ← Kembali
          </button>
        )}
      </div>
    </div>
  );
}
