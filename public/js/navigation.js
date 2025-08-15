import { loadUserProfile, handleMapClick, map, marker, updateMap } from './profile.js';
import { signOut, auth, clearUserState } from './auth.js';

async function handleLogout() {
  await signOut(auth);
  clearUserState(); // Clear the session state
  // A full page reload to a login page is a secure way to clear all state.
  location.href = "login.html";
}

function showSection(sectionIdToShow) {
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(section => {
    section.hidden = (section.id !== sectionIdToShow);
  });
}

export function setupNavigation() {
  document.getElementById("myProfileLink").onclick = () => {
    showSection('profileSection');
    loadUserProfile();
    // Invalidate map size after the profile section becomes visible
    if (map) {
      setTimeout(() => { map.invalidateSize(); }, 400);
    }
  };

  // Add a link for the main menu/home page
  // document.getElementById("homeLink").onclick = () => showSection('menuSection');

  document.getElementById("myOrdersLink").onclick = () => {
    showSection('myOrdersSection');
  };

  document.getElementById("logoutBtn").onclick = handleLogout;

}
