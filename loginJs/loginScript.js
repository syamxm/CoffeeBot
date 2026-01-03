import * as LoginService from "../firebase/loginFirebase.js";
import * as Input from "./loginInput.js";
import * as UI from "./loginUIRenderer.js";
import * as loadingScreen from "../signupJs/loadingScreen.js";

document.getElementById("loginBtn").addEventListener("click", async () => {
  // 1. Get Data from Input
  const inputs = Input.getLoginInputs();

  // 2. Validate Data (Design Logic)
  if (!Input.validateLogin(inputs.username, inputs.password)) return;

  try {
    // 3. Perform Login (Backend Logic)
    await LoginService.loginWithUsername(inputs.username, inputs.password);

    // 4. Update UI on Success
    loadingScreen.showLoadingScreen("login");
  } catch (error) {
    // 5. Update UI on Failure
    UI.showLoginError(error);
  }
});
