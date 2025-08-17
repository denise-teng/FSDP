import { signInWithGoogle, signOut, getIdToken, onAuthStateChanged } from './firebase';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth'; // Your backend API URL

// Handle Firebase auth and backend session
const loginWithGoogle = async () => {
  try {
    // 1. Sign in with Firebase
    const firebaseToken = await signInWithGoogle();
    
    // 2. Send token to backend
    const response = await axios.post(`${API_URL}/google`, {
      token: firebaseToken
    });
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Check auth state and sync with backend
const syncAuthState = async () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await getIdToken();
          // Verify session with backend
          await axios.get(`${API_URL}/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          resolve(user);
        } catch {
          await signOut();
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

export { loginWithGoogle, signOut, syncAuthState, getIdToken };