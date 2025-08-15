import { db, userProfile, getUserUid } from './auth.js';
import { doc, getDoc, setDoc, GeoPoint } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from './ui.js';

export let map = null;
export let marker;

function updateProfileForm(profileData) {
  document.getElementById("address").value = profileData.address || '';
  document.getElementById("phone").value = profileData.phone || '';
  document.getElementById("notes").value = profileData.notes || '';
  const locationLink = document.getElementById("currentLocationLink");

  // Handle both GeoPoint and separate lat/lng for backward compatibility
  const lat = profileData.location?.latitude ?? profileData.latitude;
  const lon = profileData.location?.longitude ?? profileData.longitude;

  if (lat && lon) {
    locationLink.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    locationLink.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    updateMap(lat, lon);
  } else {
    locationLink.textContent = "N/A";
    locationLink.href = "#";
    if (map && marker) {
      map.removeLayer(marker);
      marker = null;
    }
  }
}

export async function loadUserProfile() {
  const userUid = getUserUid();
  if (!userUid) return;

  try {
    const docRef = doc(db, "userProfiles", userUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      Object.assign(userProfile, docSnap.data());
    } else {
      // Clear the local profile object if no document exists
      Object.keys(userProfile).forEach(key => delete userProfile[key]);
    }
    updateProfileForm(userProfile);
  } catch (error) {
    console.error("Error loading user profile:", error);
    showToast("Failed to load profile. Please try again.", "error");
  }
}

async function saveProfileDetails() {
  const userUid = getUserUid();
  if (!userUid) {
    showToast("You must be logged in to save your profile.", "error");
    return;
  }
  const profileUpdate = {
    address: document.getElementById("address").value,
    phone: document.getElementById("phone").value,
    notes: document.getElementById("notes").value,
  };
  // IMPORTANT: In a production environment, all data modifications (add, update, delete)
  // should be validated and authorized on a secure backend (e.g., Firebase Cloud Functions)
  // to prevent unauthorized access and data corruption.
  try {
    await setDoc(doc(db, "userProfiles", userUid), profileUpdate, { merge: true });
    Object.assign(userProfile, profileUpdate); // Update local state
    showToast("Profile details saved!");
  } catch (error) {
    console.error("Error saving user profile:", error);
    showToast("Failed to save profile.", "error");
  }
}

document.getElementById("saveProfileBtn").onclick = saveProfileDetails;

// This new helper function saves location and (optionally) an address instantly.
async function saveLocation(lat, lon, newAddress = null) {
  const userUid = getUserUid();
  if (!userUid) return; // The user is already alerted by other functions

  const profileUpdate = {
    location: new GeoPoint(lat, lon)
  };
  if (newAddress) {
    profileUpdate.address = newAddress;
  }

  // IMPORTANT: In a production environment, all data modifications (add, update, delete)
  // should be validated and authorized on a secure backend (e.g., Firebase Cloud Functions)
  // to prevent unauthorized access and data corruption.
  try {
    await setDoc(doc(db, "userProfiles", userUid), profileUpdate, { merge: true });
    // Update local state
    userProfile.location = profileUpdate.location;
    if (newAddress) userProfile.address = newAddress;
    delete userProfile.latitude; // Clean up old properties
    delete userProfile.longitude;
    showToast("Location has been updated and saved!");
  } catch (error) {
    console.error("Error saving location:", error);
    showToast("Failed to save your new location.", "error");
  }
}

document.getElementById("shareLocationBtn").onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      updateMap(latitude, longitude);
      const locationLink = document.getElementById("currentLocationLink");
      locationLink.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      locationLink.href = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      await saveLocation(latitude, longitude); // Automatically save
    }, error => {
      showToast("Could not get your location: " + error.message, "error");
    });
  } else {
    showToast("Geolocation is not supported by your browser.", "error");
  }
};

document.getElementById("useCurrentLocationForAddressBtn").onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (data.display_name) {
          document.getElementById("address").value = data.display_name;
          updateMap(latitude, longitude);
          await saveLocation(latitude, longitude, data.display_name); // Automatically save address and location
        } else {
          showToast("Could not find an address for your current location.", "error");
        }
      } catch (error) {
        showToast("Error fetching address: " + error.message, "error");
      }
    }, error => {
      showToast("Could not get your location: " + error.message, "error");
    });
  } else {
    showToast("Geolocation is not supported by your browser.", "error");
  }
};

export function updateMap(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.on('click', handleMapClick);
  }
  map.setView([lat, lon], 13);
  if (marker) {
    marker.setLatLng([lat, lon]);
  } else {
    marker = L.marker([lat, lon]).addTo(map);
  }
}

export async function handleMapClick(e) {
  const { lat, lng } = e.latlng;
  const locationLink = document.getElementById("currentLocationLink");
  locationLink.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  locationLink.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  updateMap(lat, lng);

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    if (data.display_name) {
      document.getElementById("address").value = data.display_name;
      await saveLocation(lat, lng, data.display_name); // Automatically save address and location
    } else {
      showToast("Could not find an address for the selected location.", "error");
    }
  } catch (error) {
    showToast("Error fetching address: " + error.message, "error");
  }
}
