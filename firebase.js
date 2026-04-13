import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwP928QBVy3vDBGLv99eIPXIDBJ6-ZTms",
  authDomain: "chipi-14c2b.firebaseapp.com",
  projectId: "chipi-14c2b",
  storageBucket: "chipi-14c2b.firebasestorage.app",
  messagingSenderId: "432793550713",
  appId: "1:432793550713:web:913c5388243000af6fb9a8",
  measurementId: "G-XJTWRW333V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);