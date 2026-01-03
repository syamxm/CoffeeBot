import { auth, db } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function loginWithUsername(username, password) {
  // 1. Find email associated with username
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("USERNAME_NOT_FOUND");
  }

  const userDoc = querySnapshot.docs[0];
  const userEmail = userDoc.data().email;

  // 2. Sign in using the found email
  const userCredential = await signInWithEmailAndPassword(
    auth,
    userEmail,
    password
  );
  return userCredential.user;
}
