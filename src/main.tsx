import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
