// signup input logic
export function getSignupInputs() {
  return {
    username: document.getElementById("username").value.trim(),
    email: document.getElementById("email").value.trim(),
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    password: document.getElementById("password").value.trim(),
    confirmPassword: document.getElementById("confirmPassword").value.trim(),
  };
}

export function validateSignup(inputs) {
  const { username, email, phoneNumber, password, confirmPassword } = inputs;

  if (!username || !email || !phoneNumber || !password || !confirmPassword) {
    alert("Please fill in ALL fields.");
    return false;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return false;
  }
  return true;
}
