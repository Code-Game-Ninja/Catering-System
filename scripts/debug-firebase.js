import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

console.log("Firebase initialized successfully!")
console.log("Firestore:", db)
console.log("Auth:", auth)
console.log("Storage:", storage)

// Test Storage rules
async function testStorageAccess() {
  try {
    // Test public read access to a sample image
    const testImageUrl =
      "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/public%2Ftest-image.jpg?alt=media"

    const response = await fetch(testImageUrl)
    console.log("Storage test response:", response.status)

    if (response.ok) {
      console.log("✅ Storage public read access working")
    } else {
      console.log("❌ Storage public read access failed")
    }
  } catch (error) {
    console.error("Storage test error:", error)
  }
}

// Test Firestore rules
async function testFirestoreAccess() {
  try {
    // Test public read access to products
    const { collection, getDocs } = await import("firebase/firestore")
    const productsRef = collection(db, "products")
    const snapshot = await getDocs(productsRef)

    console.log("✅ Firestore public read access working")
    console.log("Products found:", snapshot.size)
  } catch (error) {
    console.error("❌ Firestore test error:", error)
  }
}

// Run tests
testStorageAccess()
testFirestoreAccess()
