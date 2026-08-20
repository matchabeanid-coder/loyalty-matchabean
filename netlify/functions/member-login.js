import { auth, db, json, body, normalizePhone, verifyPin } from './_admin.js';

export default async (event) => {
  try {
    const { phone, pin } = await body(event);
    const p = normalizePhone(phone);
    const phoneSnap = await db.doc(`memberPhones/${p}`).get();
    if (!phoneSnap.exists) return json(404, { error: 'Member belum ditemukan.' });
    const memberId = phoneSnap.data().memberId;
    if (!memberId) return json(404, { error: 'Member belum siap. Silakan coba lagi.' });
    const d = await db.doc(`members/${memberId}`).get();
    if (!d.exists) return json(404, { error: 'Member belum ditemukan.' });
    const m = d.data();
    if (!verifyPin(String(pin), m.pinSalt, m.pinHash)) return json(401, { error: 'PIN salah.' });
    return json(200, { token: await auth.createCustomToken(memberId, { role: 'member' }), member: { id: memberId, ...m } });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
