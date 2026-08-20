import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCgso55_TlnaPCxTAr-p12j_8BJ-hD19NU",
  authDomain: "matchabeanloyalty.firebaseapp.com",
  projectId: "matchabeanloyalty",
  storageBucket: "matchabeanloyalty.firebasestorage.app",
  messagingSenderId: "204433042669",
  appId: "1:204433042669:web:07e45979de581895e830e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export layanan database dan otentikasi
export const db = getFirestore(app);
export const auth = getAuth(app);
