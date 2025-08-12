// firebaseConfig.js

// Import the necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
      // Your web app's Firebase configuration
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
export const db = getFirestore(app);

export { auth, firestore, storage };
