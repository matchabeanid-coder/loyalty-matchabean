// FUNGSI KHUSUS MEMBER (Tanpa Firebase Auth)
async function handleRegisterMember(e) {
  e.preventDefault();

  const nama = document.getElementById('namaInput').value;   // Ambil input nama
  const phone = document.getElementById('phoneInput').value; // Ambil input nomor WA
  const password = document.getElementById('passwordInput').value;

  try {
    // 1. Kirim data member ke Netlify Function (Langsung ke Firestore)
    const response = await fetch('/.netlify/functions/register-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: nama,
        phone: phone,
        password: password,
        role: 'member' // Menandakan akun ini murni Member
      })
    });

    const resData = await response.json();

    if (response.ok) {
      alert("Pendaftaran Member Matchabean Berhasil!");
      window.location.href = "/login"; // Ke halaman login member
    } else {
      alert("Gagal: " + (resData.error || "Terjadi kesalahan"));
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi masalah jaringan.");
  }
}
