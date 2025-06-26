import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBwSvWNFcV2gNcRQbTkjTEhJ-S_joGXwWc",
  authDomain: "fir-2c9ea.firebaseapp.com",
  projectId: "fir-2c9ea",
  storageBucket: "fir-2c9ea.firebasestorage.app",
  messagingSenderId: "800990827686",
  appId: "1:800990827686:web:d6933e8833b4288427d067",
  measurementId: "G-35RGDW9Q71",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
