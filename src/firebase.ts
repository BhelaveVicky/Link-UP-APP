// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCeKyoAIvElYkdzbp2mT0_DoaNHKc3d0U4",
  authDomain: "link-up-chat-app-e4dc3.firebaseapp.com",
  projectId: "link-up-chat-app-e4dc3",
  storageBucket: "link-up-chat-app-e4dc3.firebasestorage.app",
  messagingSenderId: "455907169474",
  appId: "1:455907169474:web:86b439233274e101a3d75b",
  measurementId: "G-124XLDJMK5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

let analytics: ReturnType<typeof getAnalytics> | undefined;
try {
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) analytics = getAnalytics(app);
    });
  }
} catch (e) {
  // ignore analytics errors in non-browser env
}

export { app, auth, provider, db, analytics };
