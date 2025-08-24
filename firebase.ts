import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// IMPORTANT: Replace with your own Firebase project configuration
// You can get this from the Firebase console:
// Project settings > General > Your apps > Web app > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
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
