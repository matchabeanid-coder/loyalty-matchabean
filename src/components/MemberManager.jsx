import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

export default function MemberManager({ settings }) {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const fetchMembers = async () => {
    const querySnapshot = await getDocs(collection(db, 'members'));
    const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMembers(list);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    await addDoc(collection(db, 'members'), {
      name,
      phone,
      stamps: 0,
      createdAt: new Date().toISOString()
    });
    setName('');
    setPhone('');
    fetchMembers();
  };

  const addStamp = async (id) => {
    const ref = doc(db, 'members', id);
    await updateDoc(ref, { stamps: increment(1) });
    fetchMembers();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddMember} className="bg-[#1a2921] p-4 rounded-2xl border border-emerald-800/40 space-y-3">
        <h3 className="text-sm font-bold text-emerald-400">Tambah Member Baru</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-xs text-white"
          />
          <input
            type="tel"
            placeholder="No HP"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-[#121d17] border border-emerald-800/60 rounded-xl p-2.5 text-xs text-white"
          />
        </div>
        <button type="submit" className="w-full bg-emerald-500 text-[#121d17] font-bold py-2 rounded-xl text-xs">
          Simpan Member
        </button>
      </form>

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="bg-[#1a2921] p-3 rounded-xl border border-emerald-800/40 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">{m.name}</p>
              <p className="text-[10px] text-emerald-200/60">{m.phone}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-400">{m.stamps || 0} Stamp</span>
              <button
                onClick={() => addStamp(m.id)}
                className="bg-emerald-500/20 text-emerald-300 border border-emerald-600/40 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-[#121d17] transition"
              >
                + Stamp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
