import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function TransactionList() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setTxs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Tx load error", err);
      }
    };
    fetchTxs();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Riwayat Transaksi</h3>
      <div className="space-y-2">
        {txs.map(tx => {
          const dateStr = tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString('id-ID') : 'Baru saja';
          return (
            <div key={tx.id} className="bg-[#1b2a20] p-3 rounded-xl border border-[#2b3f31] flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-white">{tx.memberName} ({tx.memberCode})</p>
                <p className="text-gray-400">{dateStr}</p>
              </div>
              <div className="text-right">
                <span className={`font-bold px-2 py-1 rounded ${tx.stampDelta > 0 ? 'bg-[#a3e635]/20 text-[#a3e635]' : 'bg-red-500/20 text-red-400'}`}>
                  {tx.stampDelta > 0 ? `+${tx.stampDelta}` : tx.stampDelta} Stamp
                </span>
                <p className="text-gray-400 mt-1">Total: {tx.stampAfter}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
