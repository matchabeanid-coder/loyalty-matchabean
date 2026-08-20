import React, { useEffect, useState } from 'react';
import { auth, signInWithCustomToken } from '../firebase';

const fn = (path) => `/.netlify/functions/${path}`;
const normalize = (p) => p.replace(/\D/g, '').replace(/^0/, '62');

export default function MemberApp({ onLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [adminWhatsapp, setAdminWhatsapp] = useState('');

  useEffect(() => {
    // Public registration/login does not need Firestore access. The number is
    // supplied through a build-time environment variable for the WhatsApp CTA.
    setAdminWhatsapp(import.meta.env.VITE_ADMIN_WHATSAPP || '');
  }, []);

  const submit = async () => {
    setBusy(true);
    setMsg('');
    setNotFound(false);
    try {
      const path = mode === 'login' ? 'member-login' : 'register-member';
      const payload = mode === 'login'
        ? { phone: normalize(phone), pin }
        : { name, phone: normalize(phone), pin };
      const r = await fetch(fn(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await r.json();
      if (!r.ok) {
        if (r.status === 404 && mode === 'login') setNotFound(true);
        throw new Error(d.error || 'Gagal');
      }
      await signInWithCustomToken(auth, d.token);
      onLogin(d.member);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const registerUrl = `${location.origin}${location.pathname}?register=1`;
  const waNumber = normalize(adminWhatsapp);
  const waText = encodeURIComponent(`Halo Matchabean 👋\n\nSaya ingin mendaftar Matchabean Club.\n\nNama:\nNomor WhatsApp:\n\nMohon bantu daftarkan saya.`);
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : '';

  return (
    <div className="auth-page">
      <div className="auth-box">
        <img className="brand-logo" src="/logo.jpg" alt="Matchabean" />
        <h1>MATCHABEAN CLUB</h1>
        <p className="tagline">Balance in every cup</p>

        {mode === 'register' ? (
          <>
            <h2>Daftar Member</h2>
            <p>Scan QR pendaftaran Matchabean dari booth, lalu isi data di bawah.</p>
            <input placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="WhatsApp 08xxxxxxxxxx" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder="PIN 6 digit" type="password" inputMode="numeric" maxLength="6" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
            <button className="primary" disabled={busy} onClick={submit}>{busy ? 'Memproses...' : 'DAFTAR & BUAT MEMBER'}</button>
            <button className="ghost" onClick={() => { setMode('login'); history.replaceState({}, '', location.pathname); }}>Kembali Login</button>
          </>
        ) : (
          <>
            <h2>Member Login</h2>
            <input placeholder="Nomor WhatsApp" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder="PIN 6 digit" type="password" inputMode="numeric" maxLength="6" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
            <button className="primary" disabled={busy} onClick={submit}>{busy ? 'Masuk...' : 'MASUK MEMBER'}</button>
            <button className="outline" onClick={() => { setMode('register'); setMsg(''); setNotFound(false); history.replaceState({}, '', `${location.pathname}?register=1`); }}>DAFTAR MEMBER</button>
            <button className="ghost" onClick={onBack}>Kembali</button>
          </>
        )}

        {msg && <p className="error">{msg}</p>}
        {notFound && (
          <div className="not-found-box">
            <b>Member belum ditemukan.</b>
            <span>Anda bisa mendaftar sendiri atau menghubungi admin Matchabean.</span>
            {waUrl && <a className="whatsapp-button" href={waUrl} target="_blank" rel="noreferrer">DAFTAR VIA WHATSAPP</a>}
            <button className="primary" onClick={() => { setMode('register'); setMsg(''); setNotFound(false); }}>DAFTAR SEKARANG</button>
          </div>
        )}

        <div className="qr-register">
          <b>QR PENDAFTARAN</b>
          <span>Admin bisa menampilkan QR ini di booth.</span>
          <button onClick={() => navigator.clipboard?.writeText(registerUrl)}>Salin link</button>
        </div>
      </div>
    </div>
  );
}
