  try {
    const body = await req.json();
    
    // Membaca semua variasi nama input dari frontend
    const username = body.username || body.name || body.nama || body.member_name || body.fkrfebss;
    const phone = body.phone || body.nomorHP || body.noHp || body.telepon || body.phone_number;
    const password = body.password || body.pass || body.pin;

    // Nilai cadangan jika salah satu properti tidak terbaca
    const finalUsername = username || 'Member Matchabean';
    const finalPhone = phone || '08' + Date.now().toString().slice(-8);

    await db.collection('members').add({
      username: finalUsername,
      phone: finalPhone,
      createdAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Pendaftaran berhasil' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Terjadi kesalahan sistem' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
