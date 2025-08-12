import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, getDocs, getDoc, serverTimestamp, doc } from "firebase/firestore";

const firebaseConfig = {

    apiKey: "Place_your_api_key_here",
    authDomain: "your_authDomain",
    databaseURL: "databaseURL",
    projectId: "your_projectID",
    storageBucket: "your_storageBucket",
    messagingSenderId: "messagingSenderID",
    appId: "appID"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, setDoc, getDoc, serverTimestamp, doc,getFirestore, getDocs };
