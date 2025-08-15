import { auth, db } from '/js/config/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// These variables hold the application's state related to the logged-in user.
// In a larger application, consider a more robust state management pattern
// (e.g., Redux, Vuex, or a simple event bus) to avoid potential issues with global mutable state.
export let userEmail = "";
export let userUid = "";
export let cart = [];
export let userProfile = {};

export function setUserDetails(email, uid) {
  userEmail = email;
  userUid = uid;
}

export function getUserEmail() {
  return userEmail;
}

export function getUserUid() {
  return userUid;
}

export function clearUserState() {
  userEmail = "";
  userUid = "";
  cart = [];
  userProfile = {};
}

export { onAuthStateChanged, signOut, auth, db };
