import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, getDocs, getDoc, serverTimestamp, doc } from "firebase/firestore";

const firebaseConfig = {

    apiKey: "AIzaSyDnm0_CXGcvyBEPRANZvanqQEQs703PrCk",
    authDomain: "exam-system-b270f.firebaseapp.com",
    databaseURL: "https://exam-system-b270f-default-rtdb.firebaseio.com",
    projectId: "exam-system-b270f",
    storageBucket: "exam-system-b270f.firebasestorage.app",
    messagingSenderId: "382075561863",
    appId: "1:382075561863:web:0341d43f07f99131995522"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, setDoc, getDoc, serverTimestamp, doc,getFirestore, getDocs };
