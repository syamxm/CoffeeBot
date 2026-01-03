// d:\Coding Files\CoffeeBot\CoffeeBot\js\dashboard.js
//added imports for logout functionality
import { auth } from "../firebase/firebaseConfig.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const newChatBtn = document.getElementById("new-chat-btn");
const dashboardContainer = document.querySelector(".dashboard-container");
const initialSection = document.getElementById("initial-section");
const chatHistory = document.getElementById("chat-history");
const userInput = document.getElementById("user-input");

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");

const logoutBtn = document.getElementById("logout-btn");

// New Chat Functionality
newChatBtn.addEventListener("click", () => {
  dashboardContainer.classList.remove("chat-active");
  initialSection.classList.remove("hidden");
  chatHistory.classList.remove("visible");
  chatHistory.innerHTML = ""; // Clear chat history
  userInput.value = "";
  userInput.focus();
});

// Move modal to body to ensure it sits on top of everything (fixes z-index stacking)
document.body.appendChild(settingsModal);

// Settings Modal Logic
settingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
});

// Logout Functionality
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      window.location.href = "index.html"; // Redirect after logout
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  });
} else {
  console.error("Logout button not found in DOM");
}
