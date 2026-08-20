const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// WAJIB ADA: Netlify mencari 'exports.handler'
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    const { username, phone, password } = JSON.parse(event.body);

    if (!phone || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nama dan Nomor WA wajib diisi' })
      };
    }

    // Simpan data member khusus WA ke koleksi 'members'
    await db.collection('members').add({
      username: username,
      phone: phone,
      password: password,
      role: 'member',
      createdAt: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Registrasi member berhasil' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
