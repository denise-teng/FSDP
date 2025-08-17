// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,  // Make sure this is imported
  signOut as firebaseSignOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCRWQOvxg8hqJO6zcLf70TOm-r32l8svRk",
  authDomain: "fsdpsignup.firebaseapp.com",
  projectId: "fsdpsignup",
  storageBucket: "fsdpsignup.appspot.com",
  messagingSenderId: "206494624616",
  appId: "1:206494624616:web:9d87b190298c7992a004dd",
  measurementId: "G-394KL6DCB7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export all needed functions
export { 
  auth, 
  provider, 
  signInWithPopup,  // Make sure this is exported
  firebaseSignOut 
};