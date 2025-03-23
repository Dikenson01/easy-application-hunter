
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA-vxX7VK47JWfb0IvPIrKTJ0a0wS6PFeU",
  authDomain: "cv-auto-1f01e.firebaseapp.com",
  projectId: "cv-auto-1f01e",
  storageBucket: "cv-auto-1f01e.firebaseapp.com",
  messagingSenderId: "781780535299",
  appId: "1:781780535299:web:3f27b92171f3763178e636",
  measurementId: "G-M9SXEKFRZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
