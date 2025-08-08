// firebaseConfig.js

// Import the necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnm0_CXGcvyBEPRANZvanqQEQs703PrCk",
  authDomain: "exam-system-b270f.firebaseapp.com",
  databaseURL: "https://exam-system-b270f-default-rtdb.firebaseio.com",
  projectId: "exam-system-b270f",
  storageBucket: "exam-system-b270f.firebasestorage.app",
  messagingSenderId: "382075561863",
  appId: "1:382075561863:web:0341d43f07f99131995522"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
export const db = getFirestore(app);

export { auth, firestore, storage };
