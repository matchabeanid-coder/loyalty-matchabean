import React, { useState } from 'react';
import { db } from './firebase'; // Pastikan path ke file firebaseConfig sesuai
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const normalize = (p) => p.replace(/\D/g, '').replace(/^0/, '62');

export default function MemberApp({ onLogin, onBack }) {
  const [mode, setMode] = useState('register'); // 'register' atau 'login'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. FUNGSI DAFTAR MEMBER (Langsung ke Firestore)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = normalize(phone);

      // Simpan data member langsung ke koleksi 'members'
      await addDoc(collection(db, 'members'), {
        username: name,
        phone: formattedPhone,
        password: pin,
        role: 'member',
        createdAt: new Date().toISOString()
      });

      alert('Pendaftaran Member Matchabean Berhasil!');
      setMode('login'); // Otomatis pindah ke mode login
    } catch (err) {
      console.error(err);
      alert('Gagal mendaftar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. FUNGSI LOGIN MEMBER (Cek Nomor WA & Password di Firestore)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = normalize(phone);
      const q = query(collection(db, 'members'), where('phone', '==', formattedPhone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Nomor WA belum terdaftar!');
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
    <div className="member-container">
      <h2>MATCHABEAN CLUB</h2>
      <p>Balance in every cup</p>

      {mode === 'register' ? (
        <form onSubmit={handleRegister}>
          <h3>Daftar Member</h3>
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Nomor WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password / PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'DAFTAR & BUAT MEMBER'}
          </button>
          <p onClick={() => setMode('login')} style={{ cursor: 'pointer', marginTop: '10px' }}>
            Sudah punya akun? <b>Kembali Login</b>
          </p>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <h3>Login Member</h3>
          <input
            type="tel"
            placeholder="Nomor WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password / PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'LOGIN MEMBER'}
          </button>
          <p onClick={() => setMode('register')} style={{ cursor: 'pointer', marginTop: '10px' }}>
            Belum punya akun? <b>Daftar Member</b>
          </p>
        </form>
      )}

      {onBack && (
        <button onClick={onBack} style={{ marginTop: '15px' }}>
          Kembali
        </button>
      )}
    </div>
  );
}
