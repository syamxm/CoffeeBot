//adding imports
import { auth, db } from "./firebaseConfig.js";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateEmail,
  updatePassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Initialize Recaptcha (This needs to talk to Firebase, so it lives here)
export function initRecaptcha(elementId) {
  auth.languageCode = "en";
  return new RecaptchaVerifier(auth, elementId, {
    size: "invisible",
    callback: () => console.log("Recaptcha Verified"),
  });
}

// Step 1: Request OTP
export async function sendOtp(phoneNumber, appVerifier) {
  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier
  );
  return confirmationResult;
}

// Step 2: Complete Registration (The 5-Step Chain)
export async function registerUser(confirmationResult, otp, userDetails) {
  const { email, password, username } = userDetails;

  // A. Confirm OTP
  const result = await confirmationResult.confirm(otp);
  const user = result.user;

  // B. Link Email
  await updateEmail(user, email);

  // C. Set Password
  await updatePassword(user, password);

  // D. Set Username
  await updateProfile(user, { displayName: username });

  // E. Save to Database
  await setDoc(doc(db, "users", user.uid), {
    username: username,
    email: email,
    phoneNumber: user.phoneNumber,
    createdAt: new Date(),
  });

  return user;
}
