import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Save, Upload } from 'lucide-react';

export default function SettingsManager({ settings, setSettings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = async (file) => {
    if (!file) return;
    try {
      const storageRef = ref(storage, 'brand/logo');
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(prev => ({ ...prev, logoUrl: url }));
    } catch (err) {
      alert('Gagal upload logo: ' + err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'app'), form);
      setSettings(form);
      alert('Pengaturan berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31]">
      <h3 className="text-lg font-bold text-white">Brand Settings</h3>

      <div>
        <label className="text-xs text-gray-400">Logo Outlet</label>
        <div className="flex items-center space-x-3 mt-1">
          {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="w-12 h-12 rounded-full border border-[#a3e635]" />}
          <label className="bg-[#121d17] border border-[#2b3f31] text-xs font-bold text-white px-3 py-2 rounded-xl cursor-pointer flex items-center space-x-1">
            <Upload size={14} />
            <span>Upload Logo</span>
            <input type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(e.target.files[0])} />
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Nama Brand</label>
        <input type="text" value={form.brandName || ''} onChange={e => setForm({ ...form, brandName: e.target.value })} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#a3e635]" />
      </div>

      <div>
        <label className="text-xs text-gray-400">Tagline</label>
        <input type="text" value={form.tagline || ''} onChange={e => setForm({ ...form, tagline: e.target.value })} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#a3e635]" />
      </div>

      <div>
        <label className="text-xs text-gray-400">WhatsApp Admin Outlet</label>
        <input type="text" value={form.adminPhone || ''} onChange={e => setForm({ ...form, adminPhone: e.target.value })} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#a3e635]" />
      </div>

      <div>
        <label className="text-xs text-gray-400">Target Stamp Per Reward</label>
        <input type="number" value={form.stampTarget || 10} onChange={e => setForm({ ...form, stampTarget: Number(e.target.value) })} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#a3e635]" />
      </div>

      <div>
        <label className="text-xs text-gray-400">Nama Reward</label>
        <input type="text" value={form.rewardName || ''} onChange={e => setForm({ ...form, rewardName: e.target.value })} className="w-full mt-1 bg-[#121d17] border border-[#2b3f31] p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-[#a3e635]" />
      </div>

      <button type="submit" disabled={saving} className="w-full bg-[#a3e635] text-[#121d17] font-bold py-3 rounded-xl flex justify-center items-center space-x-2">
        <Save size={18} />
        <span>{saving ? 'Saving...' : 'Simpan Perubahan'}</span>
      </button>
    </form>
  );
}
