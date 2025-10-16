import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBV1XbzXVOzyp4FIY2uVFn8_YmRgU7R5CM",
  authDomain: "plansync-25a2e.firebaseapp.com",
  projectId: "plansync-25a2e",
  storageBucket: "plansync-25a2e.firebasestorage.app",
  messagingSenderId: "286790101263",
  appId: "1:286790101263:web:beb890b73e6832c5e8f67a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
export const firestore = getFirestore(app);

export default app;