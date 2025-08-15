import { auth, signOut } from '/js/config/firebase.js';

export function setupAdminAuth() {
  document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    // Consider client-side routing instead of full page reload for better UX.
    location.href = "login.html";
  };
}
