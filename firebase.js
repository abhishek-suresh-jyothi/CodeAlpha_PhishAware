// firebase.js — Firebase setup (modular SDK v10, loaded from Google's CDN)
// STEP: Replace the placeholder values below with YOUR existing firebaseConfig
// (Firebase Console → Project settings → General → Your apps → SDK setup and configuration).
// Do not share private OAuth secrets here. The apiKey of a web app is not a secret.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtpYHjrNgnXu-iX8PM9REoBUJpMosIpSM",
  authDomain: "phishing-awareness-training.firebaseapp.com",
  projectId: "phishing-awareness-training",
  storageBucket: "phishing-awareness-training.firebasestorage.app",
  messagingSenderId: "540830052696",
  appId: "1:540830052696:web:a9eab1b8bdf34915ff752d",
  measurementId: "G-XB1PT9DH5P"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope("user:email");