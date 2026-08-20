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
    
    const username = body.username || body.name || body.nama || body.member_name || body.fkrfebss;
    const phone = body.phone || body.nomorHP || body.noHp || body.telepon || body.phone_number;
    const password = body.password || body.pass || body.pin;

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
