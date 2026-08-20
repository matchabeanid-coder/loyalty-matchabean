import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        setTransactions(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-emerald-400 mb-2">Riwayat Transaksi</h3>
      {transactions.length === 0 ? (
        <p className="text-xs text-emerald-200/40 text-center py-4">Belum ada riwayat transaksi</p>
      ) : (
        transactions.map((t) => (
          <div key={t.id} className="bg-[#1a2921] p-3 rounded-xl border border-emerald-800/40 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">{t.memberName || 'Member'}</p>
              <p className="text-[10px] text-emerald-200/60">{t.type || 'Tambah Stamp'}</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold">{t.amount || '+1'}</span>
          </div>
        ))
      )}
    </div>
  );
}
