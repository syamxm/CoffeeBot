// login input logic
export function getLoginInputs() {
  return {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value.trim(),
  };
}

export function validateLogin(inputs) {
  const { username, password } = inputs;

  if (!username || !password) {
    alert("Please fill in ALL fields.");
    return false;
  }

  return true;
}
