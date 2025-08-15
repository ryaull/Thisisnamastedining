import { auth, db, GoogleAuthProvider, signInWithPopup } from '/js/config/firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function setupLogin() {
  const errorElement = document.getElementById("loginError");

  const handleLogin = async (user) => {
    // Check if the user is an admin by looking for their UID in the 'admins' collection.
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
      console.log("Admin login successful.");
      location.href = "admin.html";
    } else {
      console.log("User login successful.");
      location.href = "index.html";
    }
  };

  document.getElementById("googleBtn").onclick = async () => {
    errorElement.textContent = ""; // Clear previous errors
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleLogin(result.user);
    } catch (error) {
      console.error("Error during Google login:", error);
      errorElement.textContent = "Google login failed: " + error.message;
    }
  };
}
