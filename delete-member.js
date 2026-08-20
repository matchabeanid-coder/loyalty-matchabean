import { auth, db, json, body, adminOnly } from './_admin.js';

export default async (event) => {
  try {
    await adminOnly(event);
    const { memberId } = await body(event);
    const memberRef = db.doc(`members/${memberId}`);
    const snap = await memberRef.get();
    if (!snap.exists) return json(404, { error: 'Member tidak ditemukan.' });
    const phone = snap.data().phone;
    await memberRef.delete();
    if (phone) await db.doc(`memberPhones/${phone}`).delete().catch(() => {});
    await auth.deleteUser(memberId).catch(() => {});
    return json(200, { ok: true });
  } catch (e) {
    return json(e.message === 'Unauthorized' ? 401 : 403, { error: e.message });
  }
};
