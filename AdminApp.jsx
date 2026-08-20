import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Pastikan sesuai dengan nama file konfigurasi Firebase kamu
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export default function AdminApp({ onLogout }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Ambil data semua member dari Firestore
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'members'));
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      setMembers(list);
    } catch (error) {
      console.error("Gagal mengambil data member:", error);
      alert("Gagal memuat data member: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 2. Fungsi Hapus Member dari Firestore
  const handleDeleteMember = async (id, name) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus member ${name || ''}?`);
    if (!isConfirmed) return;

    try {
      // Hapus dokumen berdasarkan ID dari koleksi 'members'
      await deleteDoc(doc(db, 'members', id));
      alert("Member berhasil dihapus!");
      
      // Update tampilan langsung tanpa reload
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Gagal menghapus member: " + error.message);
    }
  };

  // Filter pencarian berdasarkan nama atau nomor HP
  const filteredMembers = members.filter((member) => {
    const term = search.toLowerCase();
    const nameMatch = member.username ? member.username.toLowerCase().includes(term) : false;
    const phoneMatch = member.phone ? member.phone.includes(term) : false;
    return nameMatch || phoneMatch;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header Admin */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#1b4332', margin: 0 }}>MATCHABEAN ADMIN</h2>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Panel Kelola Member</p>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Keluar
          </button>
        )}
      </div>

      {/* Input Pencarian & Refresh */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Cari nama atau nomor WA..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          onClick={fetchMembers}
          style={{ padding: '10px 16px', background: '#1b4332', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Refresh Data
        </button>
      </div>

      {/* Tabel Data Member */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Memuat data member...</p>
        ) : filteredMembers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Tidak ada data member yang ditemukan.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', color: '#1b4332' }}>
                <th style={{ padding: '12px 8px' }}>Nama</th>
                <th style={{ padding: '12px 8px' }}>Nomor WA</th>
                <th style={{ padding: '12px 8px' }}>Tanggal Daftar</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{member.username || '-'}</td>
                  <td style={{ padding: '12px 8px' }}>{member.phone || '-'}</td>
                  <td style={{ padding: '12px 8px', fontSize: '12px', color: '#666' }}>
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.username)}
                      style={{
                        padding: '6px 12px',
                        background: '#e63946',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
