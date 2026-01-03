// d:\Coding Files\CoffeeBot\CoffeeBot\js\dashboard.js
//added imports for logout functionality
import { auth } from "../firebase/firebaseConfig.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import * as loadingScreen from "../signupJs/loadingScreen.js";

const newChatBtn = document.getElementById("new-chat-btn");
const dashboardContainer = document.querySelector(".dashboard-container");
const initialSection = document.getElementById("initial-section");
const chatHistory = document.getElementById("chat-history");
const userInput = document.getElementById("user-input");

const logoutBtn = document.getElementById("logout-btn");

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
  document.querySelectorAll(".recent-item").forEach(item => item.classList.remove("active"));
});


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
