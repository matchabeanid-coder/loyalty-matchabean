import admin from 'firebase-admin';

if (!admin.apps.length) {
  let rawSecret = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}';
  if (typeof rawSecret === 'string') {
    rawSecret = rawSecret.replace(/[\r\n]+/g, '\\n');
  }
  const serviceAccount = JSON.parse(rawSecret);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    
    // Membaca input secara fleksibel (mendukung berbagai nama properti frontend)
    const username = body.username || body.name || body.nama;
    const phone = body.phone || body.nomorHP || body.noHp || body.telepon;
    const password = body.password || body.pass;

    if (!username || !phone || !password) {
      return new Response(
        JSON.stringify({ error: 'Semua field harus diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db.collection('members').add({
      username,
      phone,
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
