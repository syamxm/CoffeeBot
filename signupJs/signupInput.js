// Adding necessary Firestore imports
import { db } from "../firebase/firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export function getSignupInputs() {
  return {
    username: document.getElementById("username").value.trim(),
    email: document.getElementById("email").value.trim(),
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    password: document.getElementById("password").value.trim(),
    confirmPassword: document.getElementById("confirmPassword").value.trim(),
  };
}

// Updated validation logic
export async function validateSignup(inputs) {
  const { username, email, phoneNumber, password, confirmPassword } = inputs;

  // 1. Basic empty field check
  if (!username || !email || !phoneNumber || !password || !confirmPassword) {
    alert("Please fill in ALL fields.");
    return false;
  }

  // 2. Password length check (New)
  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return false;
  }

  // 3. Confirm password check
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return false;
  }

  try {
    // 4. Check if Username, Email, or Phone is already taken in Firestore
    const usersRef = collection(db, "users");

    // We check all three conditions using queries
    const usernameQuery = query(usersRef, where("username", "==", username));
    const emailQuery = query(usersRef, where("email", "==", email));
    const phoneQuery = query(usersRef, where("phoneNumber", "==", phoneNumber));

    const [usernameSnap, emailSnap, phoneSnap] = await Promise.all([
      getDocs(usernameQuery),
      getDocs(emailQuery),
      getDocs(phoneQuery),
    ]);

    if (!usernameSnap.empty) {
      alert("This username is already taken.");
      return false;
    }

    if (!emailSnap.empty) {
      alert("This email is already registered.");
      return false;
    }

    if (!phoneSnap.empty) {
      alert("This phone number is already registered.");
      return false;
    }

    return true; // All checks passed
  } catch (error) {
    console.error("Error checking user availability: ", error);
    alert("An error occurred during validation. Please try again.");
    return false;
  }
}
