// d:\Coding Files\CoffeeBot\CoffeeBot\js\dashboard.js
//added imports for logout functionality
import {
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

import { auth } from "../firebase/firebaseConfig.js";
import {
  signOut,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { db } from "../firebase/firebaseConfig.js";

import * as loadingScreen from "../signupJs/loadingScreen.js";

const newChatBtn = document.getElementById("new-chat-btn");
const dashboardContainer = document.querySelector(".dashboard-container");
const initialSection = document.getElementById("initial-section");
const chatHistory = document.getElementById("chat-history");
const userInput = document.getElementById("user-input");

const editUserBtn = document.getElementById("edit-user-btn");
const logoutBtn = document.getElementById("logout-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");

// New Chat Functionality
newChatBtn.addEventListener("click", () => {
  dashboardContainer.classList.remove("chat-active");
  initialSection.classList.remove("hidden");
  chatHistory.classList.remove("visible");

  // Robustly clear chat history to ensure no nodes remain
  while (chatHistory.firstChild) {
    chatHistory.removeChild(chatHistory.firstChild);
  }

  userInput.value = "";
  userInput.focus();

  // Clear active selection from sidebar items
  document
    .querySelectorAll(".recent-item")
    .forEach((item) => item.classList.remove("active"));
});

// Edit User Info Button Functionality
if (editUserBtn) {
  editUserBtn.addEventListener("click", () => {
    window.location.href = "editUserInfo.html";
  });
} else {
  console.error("Edit User Info button not found in DOM");
}

// Logout Functionality
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    loadingScreen.showLoadingScreen("logout");

    // Delay sign out to allow the loading screen animation to play
    setTimeout(async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Sign out failed:", error);
      }
    }, 1500);
  });
} else {
  console.error("Logout button not found in DOM");
}

// Delete Account Button Functionality
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const confirmDelete = confirm(
      "Warning: This will permanently delete your CoffeeBot profile and all saved data. Proceed?",
    );

    if (confirmDelete) {
      loadingScreen.showLoadingScreen("deleting");

      try {
        const userId = user.uid; // Get ID before deleting the user object

        // STEP 1: Delete from Firestore FIRST
        // We do this while the user is still 'authenticated' so rules allow it.
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
        console.log(`Firestore document ${userId} deleted.`);

        // STEP 2: Delete from Firebase Auth
        await deleteUser(user);

        // STEP 3: Cleanup
        localStorage.clear();
        alert("Account and data wiped successfully.");
        window.location.href = "signup.html";
      } catch (error) {
        console.error("Deletion Error:", error);

        if (error.code === "auth/requires-recent-login") {
          alert(
            "Security Sensitive: Please logout and log back in to verify your identity before deleting.",
          );
        } else {
          alert("Error during deletion: " + error.message);
        }

        if (loadingScreen.hideLoadingScreen) loadingScreen.hideLoadingScreen();
      }
    }
  });
}
