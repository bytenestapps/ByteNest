import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDXQWBm2tWG5JY8mos8bJoWQLx8AJ4Z0Vw",
  authDomain:        "bytenest-website.firebaseapp.com",
  projectId:         "bytenest-website",
  storageBucket:     "bytenest-website.firebasestorage.app",
  messagingSenderId: "861805437655",
  appId:             "1:861805437655:web:a5e4983c104f4e4d450692",
  measurementId:     "G-MFE6VCCG63",
};

const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);

/*
  ── FIRESTORE SECURITY RULES ──────────────────────────────────────────────
  Paste these in Firebase Console → Firestore → Rules, then click Publish:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read:  if true;
        allow write: if request.auth != null;
      }
    }
  }
*/
