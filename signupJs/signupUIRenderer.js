//Switch from signup view to OTP View
export function switchToOtpView() {
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("otpSection").style.display = "block";
  updateStatus("");
}

//Updating signup messages to show as message block
export function updateStatus(msg) {
  const el = document.getElementById("statusMessage");
  if (el) el.innerText = msg;
}

//signup error messages to show as alerts
export function showSignupError(error, context) {
  console.error(error);

  if (context === "otp") {
    if (error.code === "auth/invalid-phone-number") {
      alert("Error: Phone number format is wrong. Try +60123456789");
    } else if (error.code === "auth/captcha-check-failed") {
      alert("Error: Recaptcha failed. Check authorized domains.");
    } else {
      alert("Error Sending OTP: " + error.message);
    }
  } else if (context === "verify") {
    if (error.code === "auth/operation-not-allowed") {
      alert("CRITICAL: Enable 'Email/Password' provider in Firebase Console.");
    } else if (error.code === "auth/email-already-in-use") {
      alert("Error: This email is already taken.");
    } else if (error.code === "auth/invalid-verification-code") {
      alert("Error: Wrong OTP code.");
    } else {
      alert("Verification Failed: " + error.message);
    }
  }
}
