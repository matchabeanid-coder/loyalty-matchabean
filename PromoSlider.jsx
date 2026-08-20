import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function PromoSlider() {
  const [promos, setPromos] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const snap = await getDocs(collection(db, 'promos'));
        const list = snap.docs.map(doc => doc.data()).filter(p => p.imageUrl);
        setPromos(list);
      } catch (err) {
        console.error("Error loading promos", err);
      }
    };
    fetchPromos();
  }, []);

  if (promos.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-[#a3e635]">Special Offers</div>
      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-2">
        {promos.map((promo, idx) => (
          <div key={idx} className="snap-center shrink-0 w-[280px] h-[140px] rounded-2xl overflow-hidden relative border border-[#233529] shadow-lg">
            <img src={promo.imageUrl} alt={promo.title || "Promo"} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121d17] via-transparent to-transparent p-3 flex flex-col justify-end">
              <span className="text-sm font-bold text-white">{promo.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
