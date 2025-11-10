// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYtDAjd2x6VndBwV7YHRnLPS0gh3StBrU",
  authDomain: "hikeapp-f9695.firebaseapp.com",
  projectId: "hikeapp-f9695",
  storageBucket: "hikeapp-f9695.firebasestorage.app",
  messagingSenderId: "103026004651",
  appId: "1:103026004651:web:ec2d19e16b1e260a22ddee"
};

// ✅ Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// ✅ Initialize Firestore database
export const db = getFirestore(firebaseApp);
