// src/lib/firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// --- Add imports for functions needed by script ---
import { collection, getDocs, writeBatch, query, limit, doc } from 'firebase/firestore';
// -------------------------------------------------

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Consider loading these from environment variables for better security
const firebaseConfig = {
  apiKey: "AIzaSyBcjwP_ezcWLA0ipt8i1OARTGS8qusUjFk",
  authDomain: "qopsengorg.firebaseapp.com",
  projectId: "qopsengorg",
  storageBucket: "qopsengorg.firebasestorage.app",
  messagingSenderId: "713148718617",
  appId: "1:713148718617:web:2c8b89797d8780275c1488",
  measurementId: "G-5J9EFPW2WC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Conditionally expose to window for console script (DEV ONLY) ---
if (import.meta.env.DEV) {
  console.log("DEV MODE: Exposing Firebase utils to window.firebaseUtils");
  (window as any).firebaseUtils = {
    db,
    collection,
    getDocs,
    writeBatch,
    query,
    limit,
    doc
  };
}
// ----------------------------------------------------------------

export { app, analytics, auth, db }; 