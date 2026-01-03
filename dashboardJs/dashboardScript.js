import { auth } from "../firebase/firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import * as ChatService from "./chatService.js";
import * as UI from "./dashboardUIRenderer.js";

let currentUser = null;
let currentChatId = null;

// -- Selectors --
const sendBtn = document.getElementById("send-btn");
const inputField = document.getElementById("user-input");
const newChatBtn = document.getElementById("new-chat-btn");
const recentList = document.getElementById("recent-list");
const logoutBtn = document.getElementById("logout-btn");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");
const themeToggle = document.getElementById("theme-toggle");

// 1. Handling Sending Messages
async function handleSend() {
  const text = inputField.value.trim();
  if (!text) return;

  inputField.value = "";

  // Switch to chat view if we are on the "initial" welcome screen
  UI.switchToChatView();

  // Update UI immediately
  UI.addMessageToUI(text, "user");
  UI.showLoadingIndicator();

  try {
    // Save User message (Backend)
    currentChatId = await ChatService.saveMessage(
      currentUser.uid,
      currentChatId,
      text,
      "user"
    );

    // Get AI Response (Backend)
    const data = await ChatService.fetchAIResponse(text, currentChatId);

    // Update UI with AI response
    UI.removeLoadingIndicator();
    UI.addMessageToUI(data.reply, "ai", true);

    // Save AI message (Backend)
    await ChatService.saveMessage(
      currentUser.uid,
      currentChatId,
      data.reply,
      "ai"
    );
  } catch (error) {
    UI.removeLoadingIndicator();
    UI.addMessageToUI("⚠️ Error connecting to server.", "ai");
    console.error(error);
  }
}

sendBtn.addEventListener("click", handleSend);
inputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend();
});

// 2. Auth State & Loading History
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;

    // Update Welcome Text
    const welcomeText = document.getElementById("welcome-user");
    if (welcomeText) {
      welcomeText.textContent = `Greetings ${
        user.displayName || user.email.split("@")[0]
      }`;
    }

    // Subscribe to DB changes
    ChatService.subscribeToRecentChats(user.uid, (chats, isEmpty) => {
      UI.renderRecentList(chats, isEmpty);
    });
  } else {
    window.location.href = "index.html";
  }
});

// 3. New Chat Button Logic (MISSING IN YOUR SNIPPET)
newChatBtn.addEventListener("click", () => {
  currentChatId = null;
  UI.clearChatHistory();
  UI.showInitialSection(); // You'll need to ensure this exists in UI Renderer
});

// 4. Handling Recent Chat Clicks (UPDATED)
recentList.addEventListener("click", async (e) => {
  // Handle Delete Button
  if (e.target.classList.contains("delete-chat")) {
    const id = e.target.getAttribute("data-id");
    await ChatService.deleteChatSession(currentUser.uid, id);
    if (currentChatId === id) {
      newChatBtn.click(); // Reset to new chat if current one is deleted
    }
    return;
  }

  // Handle Chat Selection
  // We look for the closest 'li' because the user might click the span text inside
  const li = e.target.closest("li");
  if (li && !e.target.classList.contains("delete-chat")) {
    const id = li.getAttribute("data-id");

    // Only load if we aren't already on this chat
    if (currentChatId !== id) {
      currentChatId = id;
      UI.clearChatHistory();
      UI.switchToChatView();

      // We need to fetch messages for this specific chat
      // NOTE: You need to add `getChatMessages` to chatService.js
      const messages = await ChatService.getChatMessages(currentUser.uid, id);

      UI.renderConversation(messages);
    }
  }
});

// 5. Logout Logic (MISSING IN YOUR SNIPPET)
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).catch((error) => console.error("Sign out failed:", error));
  });
}

// 6. Settings & Theme Logic (MISSING IN YOUR SNIPPET)
if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });
}

if (closeSettingsBtn) {
  closeSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });
}

window.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
});

if (themeToggle) {
  themeToggle.addEventListener("change", (e) => {
    const isDark = e.target.checked;
    UI.applyTheme(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Initialize Theme
const savedTheme = localStorage.getItem("theme");
UI.applyTheme(savedTheme === "dark");
