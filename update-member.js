import { db, json, body, adminOnly, ts } from './_admin.js';

export default async (event) => {
  try {
    const adminUser = await adminOnly(event);
    const { memberId, stamps, stampTarget, reward } = await body(event);
    const ref = db.doc(`members/${memberId}`);
    let result;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('Member tidak ditemukan.');
      const current = snap.data();
      const data = { updatedAt: ts() };
      if (stamps !== undefined) {
        const n = Number(stamps);
        if (!Number.isInteger(n) || n < 0) throw new Error('Stamp tidak valid');
        data.stamps = n;
      }
      if (stampTarget !== undefined) {
        const n = Number(stampTarget);
        if (!Number.isInteger(n) || n < 1) throw new Error('Target tidak valid');
        data.stampTarget = n;
      }
      if (reward !== undefined) data.reward = String(reward).trim();
      tx.update(ref, data);
      const oldStamps = Number(current.stamps || 0);
      const newStamps = stamps === undefined ? oldStamps : Number(stamps);
      if (newStamps !== oldStamps) {
        const tr = db.collection('transactions').doc();
        tx.set(tr, {
          id: tr.id,
          memberId,
          memberCode: current.memberCode,
          memberName: current.name,
          phone: current.phone,
          stampDelta: newStamps - oldStamps,
          stampAfter: newStamps,
          type: 'stamp_adjust',
          adminId: adminUser.uid,
          createdAt: ts()
        });
      }
      result = { stamps: newStamps };
    });
    return json(200, { ok: true, ...result });
  } catch (e) {
    return json(e.message === 'Unauthorized' ? 401 : 403, { error: e.message });
  }
};
