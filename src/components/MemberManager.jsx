import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';

export default function MemberManager({ members, settings, adminUser }) {
  const [search, setSearch] = useState('');

  const filtered = members.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.phone?.includes(search) || 
    m.memberCode?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStamp = async (member, delta) => {
    const newStamp = Math.max(0, (member.stamps || 0) + delta);
    const target = member.stampTarget || settings.stampTarget || 10;
    
    try {
      await updateDoc(doc(db, 'members', member.id), {
        stamps: newStamp,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'transactions'), {
        memberId: member.id,
        memberCode: member.memberCode,
        memberName: member.name,
        phone: member.phone,
        stampDelta: delta,
        stampAfter: newStamp,
        type: delta > 0 ? 'ADD_STAMP' : 'REDUCE_STAMP',
        adminId: adminUser.uid,
        createdAt: serverTimestamp()
      });

      // Send WA notification on addition
      if (delta > 0) {
        fetch('/.netlify/functions/whatsapp', {
          method: 'POST',
          body: JSON.stringify({
            phone: member.phone,
            memberName: member.name,
            memberCode: member.memberCode,
            stamps: newStamp,
            stampTarget: target,
            rewardReady: newStamp >= target,
            rewardName: settings.rewardName || "FREE MATCHA OG"
          })
        }).catch(err => console.error("WA Error", err));
      }

    } catch (err) {
      alert('Gagal update stamp: ' + err.message);
    }
  };

  const deleteMember = async (id) => {
    if (confirm('Yakin ingin menghapus member ini?')) {
      try {
        await deleteDoc(doc(db, 'members', id));
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Cari Nama, WA, atau Member ID..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1b2a20] border border-[#2b3f31] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#a3e635]"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(m => {
          const target = m.stampTarget || settings.stampTarget || 10;
          const isReady = (m.stamps || 0) >= target;

          return (
            <div key={m.id} className="bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-base">{m.name}</h4>
                  <p className="text-xs text-gray-400">{m.phone} • <span className="text-[#a3e635] font-mono">{m.memberCode}</span></p>
                </div>
                <button onClick={() => deleteMember(m.id)} className="text-red-400 p-1 hover:bg-red-400/10 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex justify-between items-center bg-[#121d17] p-2.5 rounded-xl border border-[#2b3f31]">
                <div>
                  <span className="text-xs text-gray-400 block">Stamps</span>
                  <span className="text-lg font-black text-[#a3e635]">{m.stamps || 0} / {target}</span>
                  {isReady && <span className="ml-2 text-[10px] bg-[#a3e635] text-[#121d17] px-2 py-0.5 rounded font-bold">REWARD READY</span>}
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => updateStamp(m, -1)} className="p-2 bg-[#1b2a20] border border-[#2b3f31] rounded-lg text-white">
                    <Minus size={16} />
                  </button>
                  <button onClick={() => updateStamp(m, 1)} className="px-3 py-2 bg-[#a3e635] text-[#121d17] font-bold rounded-lg flex items-center space-x-1 text-xs">
                    <Plus size={16} />
                    <span>STAMP</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
