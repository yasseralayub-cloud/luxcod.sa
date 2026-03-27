import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Initialize EmailJS
if (typeof window !== 'undefined') {
  const { default: emailjs } = require('@emailjs/browser');
  emailjs.init('njvn9St5gAnWLOI61');
}

const firebaseConfig = {
  apiKey: "AIzaSyD46R7Mei7ANhzqSyihJVtxO6YQsiZls8s",
  authDomain: "luxcod-ratings.firebaseapp.com",
  projectId: "luxcod-ratings",
  storageBucket: "luxcod-ratings.firebasestorage.app",
  messagingSenderId: "195575730935",
  appId: "1:195575730935:web:7598414c4134e71f04b9f2",
  measurementId: "G-HB3PTKE582"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
