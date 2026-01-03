export function showLoadingScreen(action) {
  const isDarkMode = document.body.classList.contains("dark-mode") || localStorage.getItem("theme") === "dark";
  const bgColor = isDarkMode ? "#202020" : "#FAF7F2";
  const titleColor = isDarkMode ? "#e0e0e0" : "#4b3621";
  const textColor = isDarkMode ? "#cccccc" : "#6f4e37";

  let title = "Loading...";
  let message = "Please wait...";
  let redirectUrl = "index.html";

  if (action === "login") {
    title = "Login Successful!";
    message = "Brewing your dashboard... ☕";
    redirectUrl = "dashboard.html";
  } else if (action === "signup") {
    title = "Sign Up Successful!";
    message = "Login to start Brewing ... ☕";
    redirectUrl = "index.html";
  } else if (action === "logout") {
    title = "Logged Out";
    message = "Come back for more coffee soon! ☕";
    redirectUrl = "index.html";
  }

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${bgColor};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: 'Segoe UI', sans-serif;
  `;
  overlay.innerHTML = `
    <h2 style="color: ${titleColor}; margin-bottom: 15px;">${title}</h2>
    <p style="color: ${textColor}; font-size: 1.2rem;">${message}</p>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 2000);
}