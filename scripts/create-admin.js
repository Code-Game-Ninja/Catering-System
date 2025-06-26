import { doc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase.js"

// Function to make a user an admin
async function makeUserAdmin(userId) {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: "admin",
    })
    console.log(`User ${userId} has been made an admin successfully!`)
  } catch (error) {
    console.error("Error making user admin:", error)
  }
}

// Replace 'USER_ID_HERE' with the actual user ID you want to make admin
// You can find the user ID in the Firebase Console under Authentication
const userIdToMakeAdmin = "USER_ID_HERE"

makeUserAdmin(userIdToMakeAdmin)
