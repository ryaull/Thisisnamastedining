// WARNING: These API keys are exposed on the client-side.
// For production, consider using a backend to proxy requests or environment variables.
// WARNING: These API keys are exposed on the client-side.
// For production, these should be loaded from a secure backend or environment variables
// and not hardcoded or exposed directly in client-side code.
export const FIREBASE_CONFIG = {
   apiKey: "AIzaSyBCjoBgtSqLYM_sPGJEqMT8wON0dCo_gkI",
  authDomain: "namastedining-35687.firebaseapp.com",
  projectId: "namastedining-35687",
  storageBucket: "namastedining-35687.firebasestorage.app",
  messagingSenderId: "233107273642",
  appId: "1:233107273642:web:423f8fd08e82bd25009dd3"
};

// WARNING: Using an unsigned upload preset for Cloudinary is insecure.
// For production, implement signed uploads via a backend to prevent unauthorized uploads.
export const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dlrkqlxlb/image/upload";
export const CLOUDINARY_UPLOAD_PRESET = "name-unsigned";
