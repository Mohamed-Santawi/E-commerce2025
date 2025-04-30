import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBgZDDGH3CIvXEZIgrq1BsAzHE03xFnd_w",
  authDomain: "almdrasa-e-commerce.firebaseapp.com",
  projectId: "almdrasa-e-commerce",
  storageBucket: "almdrasa-e-commerce.firebasestorage.app",
  messagingSenderId: "570335079345",
  appId: "1:570335079345:web:5fc8f64993b850727beb90",
  measurementId: "G-2W6NCT0PTZ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);