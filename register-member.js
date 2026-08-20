import { auth, db, json, body, hashPin, normalizePhone, ts } from './_admin.js';

export default async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
    const { name, phone, pin } = await body(event);
    const p = normalizePhone(phone);
    if (!name?.trim() || p.length < 10 || !/^\d{6}$/.test(String(pin))) {
      return json(400, { error: 'Isi nama, WhatsApp valid dan PIN 6 digit.' });
    }

    const phoneRef = db.doc(`memberPhones/${p}`);
    const counterRef = db.doc('meta/counters');
    const settingsSnap = await db.doc('settings/app').get();
    const settings = settingsSnap.data() || {};

    let reservedCode;
    await db.runTransaction(async (tx) => {
      const phoneSnap = await tx.get(phoneRef);
      if (phoneSnap.exists) throw new Error('Nomor WhatsApp sudah terdaftar. Silakan login.');
      const counterSnap = await tx.get(counterRef);
      const next = (counterSnap.exists ? Number(counterSnap.data().memberCounter || 0) : 0) + 1;
      reservedCode = `MB-${String(next).padStart(6, '0')}`;
      tx.set(counterRef, { memberCounter: next }, { merge: true });
      tx.create(phoneRef, { memberCode: reservedCode, createdAt: ts() });
    });

    try {
      const user = await auth.createUser({ displayName: name.trim() });
      await auth.setCustomUserClaims(user.uid, { role: 'member' });
      const { salt, hash } = hashPin(String(pin));
      const data = {
        name: name.trim(),
        phone: p,
        memberCode: reservedCode,
        stamps: 0,
        stampTarget: Number(settings.defaultTarget) || 10,
        reward: settings.reward || 'FREE MATCHA OG',
        qrValue: reservedCode,
        pinSalt: salt,
        pinHash: hash,
        createdAt: ts(),
        updatedAt: ts()
      };
      await db.doc(`members/${user.uid}`).set(data);
      await db.doc(`memberPhones/${p}`).update({ memberId: user.uid });
      return json(200, { token: await auth.createCustomToken(user.uid, { role: 'member' }), member: { id: user.uid, ...data } });
    } catch (e) {
      await phoneRef.delete().catch(() => {});
      throw e;
    }
  } catch (e) {
    const status = /sudah terdaftar/i.test(e.message) ? 409 : 500;
    return json(status, { error: e.message });
  }
};
