export function showLoginError(error) {
  console.error("Login Error:", error);

  if (error.message === "USERNAME_NOT_FOUND") {
    showErrorToast("User Not Found", "We couldn't find an account with that username.");
  } else if (
    error.code === "auth/wrong-password" ||
    error.code === "auth/invalid-credential"
  ) {
    showErrorToast("Authentication Failed", "Incorrect password.");
  } else if (error.code === "permission-denied") {
    showErrorToast("System Error", "Database Permission Error: Check Firestore Rules.");
  } else {
    showErrorToast("Login Failed", error.message);
  }
}

function showErrorToast(title, message) {
  const existingToast = document.querySelector(".error-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = "error-toast";
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffffff;
    color: #333;
    border-left: 4px solid #e53935;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    padding: 14px 16px;
    border-radius: 8px;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 12px;
    width: fit-content;
    max-width: 90vw;
    cursor: pointer;
    font-family: 'Segoe UI', system-ui, sans-serif;
    animation: toastIn 0.25s ease-out;
  `;

  if (!document.getElementById("toast-animations")) {
    const style = document.createElement("style");
    style.id = "toast-animations";
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translate(-50%, -10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    `;
    document.head.appendChild(style);
  }

  toast.innerHTML = `
    <div style="
      color: #e53935;
      font-size: 18px;
      line-height: 1;
    ">⚠</div>

    <div style="flex: 1;">
      <div style="
        font-size: 13px;
        font-weight: 600;
        color: #c62828;
        margin-bottom: 2px;
      ">${title}</div>
      <div style="
        font-size: 12px;
        color: #555;
      ">${message}</div>
    </div>
  `;

  // Click anywhere to dismiss
  toast.addEventListener("click", () => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  });

  document.body.appendChild(toast);

  // Auto dismiss after 3.5s
  setTimeout(() => {
    if (!toast.parentElement) return;
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.4s";
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
