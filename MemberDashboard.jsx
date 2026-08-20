import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { auth, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import PromoSlider from './PromoSlider';

export default function MemberDashboard({ member: initialMember, brand, promos, onLogout }) {
  const [member, setMember] = useState(initialMember);
  const [qr, setQr] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    return onSnapshot(doc(db, 'members', auth.currentUser.uid), (snap) => {
      if (snap.exists()) setMember({ id: snap.id, ...snap.data() });
    });
  }, []);

  useEffect(() => {
    QRCode.toDataURL(member.qrValue || member.memberCode, {
      width: 600,
      margin: 2,
      color: { dark: '#294b2b', light: '#ffffff' }
    }).then(setQr);
  }, [member.qrValue, member.memberCode]);

  const target = Math.max(1, Number(member.stampTarget) || 10);
  const stamps = Math.max(0, Number(member.stamps) || 0);
  const pct = Math.min(100, Math.round(stamps / target * 100));
  const ready = stamps >= target;
  const reward = member.reward || brand.reward || 'FREE MATCHA OG';

  return (
    <div className="member-page">
      <header className="topbar">
        <img src={brand.logo || '/logo.jpg'} alt="Matchabean" />
        <button onClick={onLogout}>Keluar</button>
      </header>
      <main>
        <div className="greeting">Hi, {member.name} 👋</div>
        <div className="loyalty-card">
          <div className="member-meta">
            <span>{brand.name || 'MATCHABEAN CLUB'}</span>
            <small>{member.memberCode} · {member.phone}</small>
          </div>
          <div className="stamp-count"><strong>{stamps}</strong><span>/ {target} STAMPS</span></div>
          <div className="progress"><i style={{ width: `${pct}%` }} /></div>
          <p>{ready ? '🎉 REWARD READY!' : `${target - stamps} stamp lagi untuk mendapatkan reward`}</p>
          <div className="reward">{reward}</div>
          <img className="member-qr" src={qr} alt="QR member" />
          <small className="qr-help">Tunjukkan QR ini ke kasir saat transaksi.</small>
        </div>
        <h3>Promo Matchabean</h3>
        <PromoSlider promos={promos} />
      </main>
    </div>
  );
}
