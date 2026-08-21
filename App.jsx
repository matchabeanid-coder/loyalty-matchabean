import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

// Import komponen dari folder src/components/
import MemberApp from './src/components/MemberApp';
import MemberDashboard from './src/components/MemberDashboard';
import AdminApp from './src/components/AdminApp';

const defaultBrand = {
  name: 'MATCHABEAN',
  tagline: 'Balance in every cup',
  reward: 'FREE MATCHA OG',
  adminWhatsapp: '',
  logo: '/logo.jpg'
};

export default function App() {
  // Set default screen langsung ke 'member' agar form estetik muncul
  const [screen, setScreen] = useState('member'); 
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

  // Jika member sudah terverifikasi login
  if (member) {
    return (
      <MemberDashboard
        member={member}
        brand={brand}
        promos={promos}
        onLogout={async () => {
          await signOut(auth);
          setMember(null);
          setScreen('member');
        }}
      />
    );
  }

  // Jika membuka Portal Admin
  if (screen === 'admin') {
    return <AdminApp onBack={() => setScreen('member')} />;
  }

  // Default: Menampilkan Form Member/Registrasi Estetik
  return <MemberApp settings={brand} onLogin={setMember} onAdminClick={() => setScreen('admin')} />;
}
