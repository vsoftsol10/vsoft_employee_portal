import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBUoscMu9gbmb3as5j-7YU98HlVT9A9Yzs',
  authDomain: 'check-d47d2.firebaseapp.com',
  projectId: 'check-d47d2',
  storageBucket: 'check-d47d2.appspot.com',
  messagingSenderId: '297017719503',
  appId: '1:297017719503:web:b22146f6cb997e2f8e15ba',
  measurementId: 'G-N74EQMPET2',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional
const auth = getAuth(app); // Initialize Firebase Authentication
const firestore = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, firestore, storage }; // Export storage
