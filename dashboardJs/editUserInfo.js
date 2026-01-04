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
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const usernameInput = document.getElementById("username");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
const updateBtn = document.getElementById("updateBtn");
const backBtn = document.getElementById("backBtn");

if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}

// Global user check and UI prep
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        console.log("User is here");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  } else {
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

  // Validation
  if (!newUsername) {
    alert("Username cannot be empty.");
    return;
  }

  if (!currentPassword) {
    alert("Please enter your current password to confirm changes.");
    return;
  }

  if (newPassword && newPassword !== confirmNewPassword) {
    alert("New passwords do not match!");
    return;
  }

  try {
    // 1. CHECK FOR DUPLICATE USERNAME (Proper way)
    // We search the collection for any user who already has this username
    const q = query(
      collection(db, "users"),
      where("username", "==", newUsername),
    );
    const querySnapshot = await getDocs(q);

    // If a document is found AND it's not the current user's document
    let isTaken = false;
    querySnapshot.forEach((doc) => {
      if (doc.id !== user.uid) isTaken = true;
    });

    if (isTaken) {
      alert("Username already taken. Please choose another one.");
      return;
    }

    // 2. RE-AUTHENTICATE
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);

    // 3. UPDATE PASSWORD (If provided)
    if (newPassword) {
      await updatePassword(user, newPassword);
    }

    // 4. UPDATE FIRESTORE & LOCAL STORAGE
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { username: newUsername });

    // Update local storage so the dashboard reflects the change immediately
    localStorage.setItem("username", newUsername);

    alert("Profile updated successfully!");

    // Clear password fields
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmNewPasswordInput.value = "";
  } catch (error) {
    console.error("Update failed:", error);
    alert("Failed to update: " + error.message);
  }
});
