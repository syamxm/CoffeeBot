import * as SignUpService from "../firebase/signupFirebase.js";
import * as UI from "./signupUIRenderer.js";
import * as Input from "./signupInput.js";

// Global State for the registration session
let appVerifier = null;
let confirmationResult = null;

// Setup Recaptcha on Load
try {
  // We pass the ID of the HTML element where recaptcha lives
  appVerifier = SignUpService.initRecaptcha("recaptcha-container");
} catch (e) {
  if (e instanceof Error) {
    alert("Error setting up Recaptcha: " + e.message);
  } else {
    alert("An unknown error occurred");
  }
}

// 1. Send OTP Button
document.getElementById("sendOtpBtn").addEventListener("click", async () => {
  const inputs = Input.getSignupInputs();

  //Validating inputs
  const isValid = await Input.validateSignup(inputs);
  if (!isValid) return;

  try {
    UI.updateStatus("Sending OTP...");

    // Call Backend Service
    try {
      confirmationResult = await SignUpService.sendOtp(
        inputs.phoneNumber,
        appVerifier
      );
    } catch (error) {
      console.error("SMS failed", error);
    }

    alert("OTP Sent! Check your phone.");
    UI.switchToOtpView();
  } catch (error) {
    UI.showSignupError(error, "otp");

    // Reset Recaptcha on failure so they can try again
    if (appVerifier) {
      appVerifier
        .render()
        .then((widgetId) => window.grecaptcha.reset(widgetId));
    }
  }
});

// 2. Verify Button
document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
  if (!confirmationResult) {
    alert("Please request OTP first.");
    return;
  }

  const otp = document.getElementById("otpInput").value;
  const inputs = Input.getSignupInputs(); // We need email/pass/username again

  try {
    UI.updateStatus("Verifying...");

    // Call Backend Service (The 5-step chain)
    await SignUpService.registerUser(confirmationResult, otp, {
      email: inputs.email,
      password: inputs.password,
      username: inputs.username,
    });

    alert("Signup Successful! Click OK to go to Login.");
    window.location.href = "index.html";
  } catch (error) {
    UI.showSignupError(error, "verify");
  }
});
