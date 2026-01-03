// login input logic
export function getLoginInputs() {
  return {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value.trim(),
  };
}

export function validateLogin(username, password) {
  if (!username || !password) {
    alert("Please enter both username and password!");
    return false;
  }
  return true;
}
