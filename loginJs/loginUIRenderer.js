export function showLoginSuccess() {
  alert("Login Successful! Redirecting...");
  window.location.href = "dashboard.html";
}

export function showLoginError(error) {
  console.error("Login Error:", error);

  if (error.message === "USERNAME_NOT_FOUND") {
    alert("Username not found!");
  } else if (
    error.code === "auth/wrong-password" ||
    error.code === "auth/invalid-credential"
  ) {
    alert("Incorrect Password.");
  } else if (error.code === "permission-denied") {
    alert("Database Permission Error: Check Firestore Rules.");
  } else {
    alert("Login Failed: " + error.message);
  }
}
