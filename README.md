# MATCHABEAN CLUB — production setup

React + Vite + Firebase + Netlify Functions + QR Scanner + PWA.

## Fitur
- 1 aplikasi dengan pilihan Member / Admin
- Registrasi member melalui QR URL `?register=1`
- Login member dengan WhatsApp + PIN 6 digit
- QR member unik MB-000001, dst.
- Scan QR kamera HP untuk +1/-1 stamp
- Firestore transactions
- 4 promo dari Firebase Storage
- Brand settings
- PWA
- WhatsApp Cloud API melalui Netlify Function
- Real-time stamp update pada dashboard member
- Nomor WhatsApp dijaga unik dengan `memberPhones`

## Firebase collections
- `users/{uid}` → role admin/member
- `members/{uid}` → data member
- `memberPhones/{phone}` → unique phone index
- `transactions/{id}` → riwayat stamp
- `promos/slide1` sampai `slide4`
- `settings/app`
- `meta/counters`

## Environment frontend
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ADMIN_WHATSAPP

## Environment Netlify Functions
FIREBASE_SERVICE_ACCOUNT_JSON
FIREBASE_STORAGE_BUCKET
WA_ACCESS_TOKEN
WA_PHONE_NUMBER_ID
WA_API_VERSION

Never commit service-account JSON or WhatsApp access tokens to GitHub.

## Bootstrap admin
1. Firebase Authentication > Email/Password aktif.
2. Buat akun admin.
3. Ambil UID akun tersebut.
4. Firestore > `users` > buat dokumen dengan ID UID tadi dan `role = admin`.
5. Login admin. Function `admin-session` memberi custom claim admin.

## WhatsApp
Pesan bisnis di luar jendela layanan WhatsApp dapat membutuhkan approved message template. Untuk produksi, siapkan template WhatsApp dan gunakan template tersebut untuk notifikasi transaksional jika diperlukan.
