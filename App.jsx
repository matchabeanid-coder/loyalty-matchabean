import React, { useEffect, useState } from 'react';
import { auth, db, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import MemberApp from './MemberApp';
import MemberDashboard from './MemberDashboard';
import AdminApp from './AdminApp';

const defaultBrand = {
  name: 'MATCHABEAN',
  tagline: 'Balance in every cup',
  reward: 'FREE MATCHA OG',
  adminWhatsapp: '',
  logo: '/logo.jpg'
};

export default function App() {
  const [screen, setScreen] = useState(null);
  const [member, setMember] = useState(null);
  const [brand, setBrand] = useState(defaultBrand);
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMember(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'members', user.uid));
        if (snap.exists()) setMember({ id: snap.id, ...snap.data() });
        else setMember(null);
      } catch (e) {
        // Admin accounts do not have a member document; ignore that case.
        setMember(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!member) return;
    const settingsUnsub = onSnapshot(doc(db, 'settings', 'app'), (snap) => {
      if (snap.exists()) setBrand((current) => ({ ...current, ...snap.data() }));
    });
    const promoUnsubs = [1, 2, 3, 4].map((slide) =>
      onSnapshot(doc(db, 'promos', `slide${slide}`), (snap) => {
        setPromos((current) => {
          const next = current.filter((x) => x.slide !== slide);
          if (snap.exists()) next.push({ id: snap.id, ...snap.data() });
          return next.sort((a, b) => a.slide - b.slide);
        });
      })
    );
    return () => {
      settingsUnsub();
      promoUnsubs.forEach((unsub) => unsub());
    };
  }, [member?.id]);

  if (member) {
    return (
      <MemberDashboard
        member={member}
        brand={brand}
        promos={promos}
        onLogout={async () => {
          await signOut(auth);
          setMember(null);
          setScreen(null);
        }}
      />
    );
  }

  if (screen === 'admin') return <AdminApp onBack={() => setScreen(null)} />;
  if (screen === 'member') return <MemberApp onLogin={setMember} onBack={() => setScreen(null)} />;

  const register = new URLSearchParams(location.search).get('register') === '1';
  return (
    <div className="landing">
      <img src={defaultBrand.logo} className="landing-logo" alt="Matchabean" />
      <h1>MATCHABEAN CLUB</h1>
      <p>{defaultBrand.tagline}</p>
      <button className="primary" onClick={() => setScreen('member')}>{register ? 'DAFTAR MEMBER' : 'MEMBER'}</button>
      {!register && <button className="outline" onClick={() => setScreen('admin')}>ADMIN / KASIR</button>}
      <small>Member dan Admin berada dalam 1 aplikasi, tetapi aksesnya terpisah.</small>
    </div>
  );
}
