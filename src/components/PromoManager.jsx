import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function PromoManager() {
  const [promos, setPromos] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const fetchPromos = async () => {
    const querySnapshot = await getDocs(collection(db, 'promos'));
    setPromos(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title) return;
    await addDoc(collection(db, 'promos'), { title, desc });
    setTitle('');
    setDesc('');
    fetchPromos();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'promos', id));
    fetchPromos();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="bg-[#1a2921] p-4 rounded-2xl border border-emerald-800/40 space-y-3">
        <h3 className="text-sm font-bold text-emerald-400">Tambah Promo</h3>
        <input
          type="text"
          placeholder="Judul Promo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-xs text-white"
        />
        <textarea
          placeholder="Deskripsi Promo"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full bg-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-xs text-white"
        />
        <button type="submit" className="w-full bg-emerald-500 text-[#121d17] font-bold py-2 rounded-xl text-xs">
          Simpan Promo
        </button>
      </form>

      <div className="space-y-2">
        {promos.map((p) => (
          <div key={p.id} className="bg-[#1a2921] p-3 rounded-xl border border-emerald-800/40 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">{p.title}</p>
              <p className="text-[10px] text-emerald-200/60">{p.desc}</p>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-xs text-red-400 hover:text-red-300 font-bold"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
