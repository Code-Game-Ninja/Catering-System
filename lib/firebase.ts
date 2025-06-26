import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBwSvWNFcV2gNcRQbTkjTEhJ-S_joGXwWc",
  authDomain: "fir-2c9ea.firebaseapp.com",
  projectId: "fir-2c9ea",
  storageBucket: "fir-2c9ea.firebasestorage.app",
  messagingSenderId: "800990827686",
  appId: "1:800990827686:web:d6933e8833b4288427d067",
  measurementId: "G-35RGDW9Q71",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Helper function to check if we're in development
const isDevelopment = process.env.NODE_ENV === "development"

// Connection status tracking
let isOnline = true

// Network status monitoring
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isOnline = true
    enableNetwork(db).catch(console.error)
  })

  window.addEventListener("offline", () => {
    isOnline = false
    disableNetwork(db).catch(console.error)
  })
}

// Configure auth settings
if (isDevelopment) {
  connectAuthEmulator(auth, "http://localhost:9099")
  connectFirestoreEmulator(db, "localhost", 8080)
  connectStorageEmulator(storage, "localhost", 9199)
} else {
  auth.useDeviceLanguage()
}

export { isOnline }
export default app
