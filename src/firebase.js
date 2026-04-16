import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "cimra-handbook",
  appId: "1:166876299728:web:76da424f9864c93c16f9d5",
  storageBucket: "cimra-handbook.firebasestorage.app",
  apiKey: "AIzaSyBQD4MuLQZgf_q1DZ5FMVXDwHRfZ399JBA",
  authDomain: "cimra-handbook.firebaseapp.com",
  messagingSenderId: "166876299728",
  measurementId: "G-LDZKMKFL3D",
};

export function getFirebaseApp() {
  try {
    return getApps().length ? getApp() : initializeApp(firebaseConfig);
  } catch {
    return null;
  }
}

export function getFirestoreDb() {
  try {
    const app = getFirebaseApp();
    return app ? getFirestore(app) : null;
  } catch {
    return null;
  }
}