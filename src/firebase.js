import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8tEt_tfkpe_y2j0_YXhFSweTtOuMe30M",
  authDomain: "contact-form-app-286d7.firebaseapp.com",
  projectId: "contact-form-app-286d7",
  storageBucket: "contact-form-app-286d7.firebasestorage.app",
  messagingSenderId: "283526146679",
  appId: "1:283526146679:web:29dc35e4f565f2fe6ff472"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);