import admin from 'firebase-admin';
import crypto from 'node:crypto';
if(!admin.apps.length){const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON belum diatur');admin.initializeApp({credential:admin.credential.cert(JSON.parse(raw)),storageBucket:process.env.FIREBASE_STORAGE_BUCKET});}
export const db=admin.firestore();export const auth=admin.auth();export const ts=admin.firestore.FieldValue.serverTimestamp;
export const json=(status,body)=>({status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization'},body:JSON.stringify(body)});
export async function body(event){return JSON.parse(event.body||'{}')}
export async function userFrom(event){const h=event.headers?.authorization||event.headers?.Authorization;if(!h?.startsWith('Bearer '))throw new Error('Unauthorized');return auth.verifyIdToken(h.slice(7),true)}
export async function adminOnly(event){const u=await userFrom(event);if(u.role!=='admin')throw new Error('Admin access required');return u}
export function hashPin(pin,salt=crypto.randomBytes(16).toString('hex')){return {salt,hash:crypto.scryptSync(pin,salt,64).toString('hex')}}
export function verifyPin(pin,salt,hash){return crypto.scryptSync(pin,salt,64).toString('hex')===hash}
export function normalizePhone(v){return String(v||'').replace(/\D/g,'').replace(/^0/,'62')}
