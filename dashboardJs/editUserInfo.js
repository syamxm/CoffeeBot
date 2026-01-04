import { auth, db } from "../firebase/firebaseConfig.js";
import {
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const usernameInput = document.getElementById("username");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
const updateBtn = document.getElementById("updateBtn");

// Load current user data from Firestore on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Assuming your users are stored in a 'users' collection with the UID as the document ID
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        usernameInput.value = userDoc.data().username || "";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  } else {
    // Redirect to login if not authenticated
    window.location.href = "login.html";
  }
});

updateBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const newUsername = usernameInput.value.trim();
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  if (!currentPassword) {
    alert("Please enter your current password to confirm changes.");
    return;
  }

  if (newPassword && newPassword !== confirmNewPassword) {
    alert("New passwords do not match!");
    return;
  }

  try {
    // 1. Re-authenticate the user (required for password updates)
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);

    // 2. Update password if a new one is provided
    if (newPassword) {
      await updatePassword(user, newPassword);
    }

    // 3. Update username in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { username: newUsername });

    alert("User information updated successfully!");

    // Clear password fields for security
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmNewPasswordInput.value = "";
  } catch (error) {
    console.error("Update failed:", error);
    alert("Failed to update: " + error.message);
  }
});
