import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function SettingManager({ settings, setSettings }) {
  const [form, setForm] = useState(settings);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'general'), form);
      setSettings(form);
      alert('Pengaturan berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a2921] p-4 rounded-2xl border border-emerald-800/40 space-y-3">
      <h3 className="text-sm font-bold text-emerald-400">Pengaturan Aplikasi</h3>
      <div>
        <label className="text-[10px] text-emerald-200/60">Nama Brand</label>
        <input
          type="text"
          value={form.brandName || ''}
          onChange={(e) => setForm({ ...form, brandName: e.target.value })}
          className="w-full bg-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-xs text-white"
        />
      </div>
      <div>
        <label className="text-[10px] text-emerald-200/60">Tagline</label>
        <input
          type="text"
          value={form.tagline || ''}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="w-full bg-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-xs text-white"
        />
      </div>
      <div>
        <label className="text-[10px] text-emerald-200/60">Target Stamp</label>
        <input
          type="number"
          value={form.stampTarget || 10}
          onChange={(e) => setForm({ ...form, stampTarget: Number(e.target.value) })}
          className="w-full bg-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-xs text-white"
        />
      </div>
      <button type="submit" className="w-full bg-emerald-500 text-[#121d17] font-bold py-2 rounded-xl text-xs">
        Simpan Pengaturan
      </button>
    </form>
  );
}
