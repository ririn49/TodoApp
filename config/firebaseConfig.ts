// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Import layanan yang kita butuhkan
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFyBzkGu6ljhvhbGr3fNaR8iZlSzETsSM",
  authDomain: "doitnow-todoapp-2025.firebaseapp.com",
  projectId: "doitnow-todoapp-2025",
  storageBucket: "doitnow-todoapp-2025.firebasestorage.app",
  messagingSenderId: "275364052860",
  appId: "1:275364052860:web:f555d77f55f7cddabb2ef9",
  measurementId: "G-28GYHW80B1"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan yang kita butuhkan
export const auth = getAuth(app);
export const db = getFirestore(app);