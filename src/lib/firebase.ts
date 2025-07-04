import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let storage: FirebaseStorage | undefined = undefined;

if (typeof window !== "undefined") {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
}

export { app, auth, storage };
export default app;
