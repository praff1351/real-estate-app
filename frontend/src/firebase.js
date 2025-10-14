// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-53068.firebaseapp.com",
  projectId: "mern-estate-53068",
  storageBucket: "mern-estate-53068.firebasestorage.app",
  messagingSenderId: "210120582019",
  appId: "1:210120582019:web:45ba5fe702ad2a9ac60cb6",
  measurementId: "G-G71ZVMGJ2C"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);