import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, Image as ImageIcon, Check } from 'lucide-react';

export default function PromoManager() {
  const [promos, setPromos] = useState([
    { id: 'slide1', title: '', imageUrl: '' },
    { id: 'slide2', title: '', imageUrl: '' },
    { id: 'slide3', title: '', imageUrl: '' },
    { id: 'slide4', title: '', imageUrl: '' }
  ]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const fetchPromos = async () => {
      const snap = await getDocs(collection(db, 'promos'));
      const dataMap = {};
      snap.docs.forEach(d => { dataMap[d.id] = d.data(); });
      
      setPromos(prev => prev.map(p => dataMap[p.id] ? { ...p, ...dataMap[p.id] } : p));
    };
    fetchPromos();
  }, []);

  const handleFileUpload = async (id, file) => {
    if (!file) return;
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const storageRef = ref(storage, `promos/${id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const updated = promos.find(p => p.id === id);
      const newPromo = { id, title: updated.title || `Promo ${id}`, imageUrl: url };

      await setDoc(doc(db, 'promos', id), newPromo);
      setPromos(prev => prev.map(p => p.id === id ? newPromo : p));
      alert('Promo berhasil diperbarui!');
    } catch (err) {
      alert('Gagal upload gambar: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Kelola 4 Promo Slider</h3>
      <div className="grid grid-cols-1 gap-4">
        {promos.map((p, idx) => (
          <div key={p.id} className="bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt="Promo" className="w-16 h-16 rounded-xl object-cover border border-[#a3e635]" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#121d17] border border-[#2b3f31] flex items-center justify-center text-gray-500">
                  <ImageIcon size={24} />
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-[#a3e635]">SLIDE {idx + 1}</span>
                <p className="text-sm font-semibold text-white">{p.title || "Belum Set"}</p>
              </div>
            </div>

            <label className="bg-[#a3e635] text-[#121d17] px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center space-x-1">
              <Upload size={14} />
              <span>{loading[p.id] ? "Uploading..." : "Upload"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(p.id, e.target.files[0])} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
