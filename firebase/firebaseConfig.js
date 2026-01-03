// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeAtKCKCVcGS2scZ4r2ijdTKiezl0Z9Rg",
  authDomain: "coffeechatbotdb.firebaseapp.com",
  projectId: "coffeechatbotdb",
  storageBucket: "coffeechatbotdb.firebasestorage.app",
  messagingSenderId: "325567606454",
  appId: "1:325567606454:web:848f1716c027047e7cc017",
  measurementId: "G-FXEM0GMMLQ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ccfdb21");
