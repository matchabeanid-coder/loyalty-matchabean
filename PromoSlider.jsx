import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function PromoSlider() {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'promos'));
        setPromos(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Gagal mengambil promo:", err);
      }
    };
    fetchPromos();
  }, []);

  if (promos.length === 0) return null;

  return (
    <div className="bg-[#1a2921] p-4 rounded-2xl border border-emerald-800/40 space-y-3">
      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Promo Spesial</h3>
      <div className="space-y-2">
        {promos.map((p) => (
          <div key={p.id} className="bg-[#121d17] p-3 rounded-xl border border-emerald-900/60">
            <p className="text-xs font-bold text-emerald-100">{p.title}</p>
            {p.desc && <p className="text-[10px] text-emerald-200/60 mt-1">{p.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
