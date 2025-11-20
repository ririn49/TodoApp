// file: config/firebaseConfig.ts

import { initializeApp } from "firebase/app";

// --- PERBAIKAN: IMPORTS MODULAR UNTUK PERSISTENCE RN ---
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// --------------------------------------------------------

import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAFyBzkGu6ljhvhbGr3fNaR8iZlSzETsSM",
  authDomain: "doitnow-todoapp-2025.firebaseapp.com",
  projectId: "doitnow-todoapp-2025",
  storageBucket: "doitnow-todoapp-2025.firebasestorage.app",
  messagingSenderId: "275364052860",
  appId: "1:275364052860:web:f555d77f55f7cddabb2ef9",
  measurementId: "G-28GYHW80B1"
};

// Inisialisasi Firebase App
export const app = initializeApp(firebaseConfig); // Tetap ekspor app (opsional)

// 1. INISIALISASI AUTH BARU
// Ini adalah satu-satunya cara yang didukung untuk RN Persistence
export const auth = initializeAuth(app, {
     persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// 2. INISIALISASI FIRESTORE
export const db = getFirestore(app);