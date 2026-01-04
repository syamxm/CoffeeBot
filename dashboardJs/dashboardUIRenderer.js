const chatHistory = document.getElementById("chat-history");
const recentList = document.getElementById("recent-list");
const initialSection = document.getElementById("initial-section");
const dashboardWrapper = document.querySelector(".dashboard-container");

//Theme Toggle for dark mode
const themeToggle = document.getElementById("theme-toggle");

let renderTimeouts = []; // Track active rendering timers to clear them if needed

export function showInitialSection() {
  chatHistory.innerHTML = "";
  chatHistory.style.display = "none";
  chatHistory.classList.remove("visible");

  initialSection.style.display = "flex";
  // Delay removing 'hidden' to allow display:flex to apply first, enabling transition
  setTimeout(() => {
    initialSection.classList.remove("hidden");
  }, 10);

  if (dashboardWrapper) dashboardWrapper.classList.remove("chat-active");
}

export function switchToChatView() {
  if (!initialSection.classList.contains("hidden")) {
    setTimeout(() => initialSection.classList.add("hidden"), 0);
    setTimeout(() => (initialSection.style.display = "none"), 1000);

    setTimeout(() => (chatHistory.style.display = "flex"), 500);
    setTimeout(() => chatHistory.classList.add("visible"), 500);

    if (dashboardWrapper) dashboardWrapper.classList.add("chat-active");
  }
}

export function addMessageToUI(
  text,
  sender,
  typeEffect = false,
  animate = false
) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add(
    "message",
    sender === "user" ? "user-message" : "ai-message"
  );

  if (animate) {
    messageDiv.classList.add("animate-entry");
  }

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");
  messageDiv.appendChild(contentDiv);
  chatHistory.appendChild(messageDiv);

  if (typeEffect) {
    let i = 0;
    const speed = 10;
    function type() {
      if (i < text.length) {
        contentDiv.textContent += text.charAt(i);
        i++;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        setTimeout(type, speed);
      }
    }
    type();
  } else {
    contentDiv.textContent = text;
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}

export function showLoadingIndicator() {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loading-indicator";
  loadingDiv.classList.add("message", "ai-message");
  loadingDiv.innerHTML = `<div class="message-content">Brewing<span class="dots"></span></div>`;
  chatHistory.appendChild(loadingDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return loadingDiv;
}

export function removeLoadingIndicator() {
  const loader = document.getElementById("loading-indicator");
  if (loader) loader.remove();
}

export function renderRecentList(chats, isEmpty) {
  recentList.innerHTML = "";
  if (isEmpty) {
    recentList.innerHTML = '<li class="recent-item">No recent chats</li>';
    return;
  }

  chats.forEach((chat) => {
    const li = document.createElement("li");
    li.className = "recent-item";
    li.setAttribute("data-id", chat.id);
    li.innerHTML = `
      <span>${chat.title || "Untitled Chat"}</span>
      <button class="delete-chat" data-id="${chat.id}">×</button>
    `;
    recentList.appendChild(li);
  });
}

export function clearChatHistory() {
  // Clear any pending message renders to prevent "ghost" messages from previous chat
  renderTimeouts.forEach((t) => clearTimeout(t));
  renderTimeouts = [];
  chatHistory.innerHTML = "";
}

// New function to render messages one by one
export function renderConversation(messages) {
  clearChatHistory(); // Ensure clean slate

  if (!messages || messages.length === 0) return;

  messages.forEach((msg, index) => {
    const t = setTimeout(() => {
      addMessageToUI(msg.text, msg.sender, false, true);
    }, index * 150); // 150ms delay between each bubble
    renderTimeouts.push(t);
  });
}

// Function to apply dark theme
const applyTheme = (isDark) => {
  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
};

// 1. Apply theme immediately on page load
const savedTheme = localStorage.getItem("theme");
const isDarkInitial = savedTheme === "dark";

if (themeToggle) {
  themeToggle.checked = isDarkInitial; // Sync the checkbox state
  applyTheme(isDarkInitial);

  // 2. Dark Mode Toggle Event Listener
  themeToggle.addEventListener("change", (e) => {
    const isDark = e.target.checked;

    // Instant UI Update
    applyTheme(isDark);

    // Save to LocalStorage
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}
