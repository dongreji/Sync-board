import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// IMPORTANT: Replace with your own Firebase project configuration
// You can get this from the Firebase console:
// Project settings > General > Your apps > Web app > Firebase SDK snippet > Config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsFWIuTLgCmbQ7tTULIrzQvObLYzf6UPs",
  authDomain: "sync-bo.firebaseapp.com",
  projectId: "sync-bo",
  storageBucket: "sync-bo.firebasestorage.app",
  messagingSenderId: "641455814582",
  appId: "1:641455814582:web:2c4de9567d642a41473317",
  measurementId: "G-XQXPWB04BG"
};


// For this public clipboard to work, you must also set your Realtime Database security rules to be public.
// In the Firebase Console, go to Realtime Database > Rules and set them to:
/*
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
*/
// WARNING: These rules are insecure and only suitable for a demo or personal project.

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
