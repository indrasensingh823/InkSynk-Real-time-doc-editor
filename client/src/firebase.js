// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCW_E76QVsdxojLl_-a16vyOwUilLd-hnc",
  authDomain: "real-time-doc-app.firebaseapp.com",
  projectId: "real-time-doc-app",
  storageBucket: "real-time-doc-app.firebasestorage.app",
  messagingSenderId: "855285591748",
  appId: "1:855285591748:web:d06e1c5e8edeab92aae391",
  measurementId: "G-C0CT0M41VZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
