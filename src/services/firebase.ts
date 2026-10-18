import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: import.meta.env["VITE_FIREBASE_APP_ID"],
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"],
};

const app = initializeApp(firebaseConfig);

// O Analytics só existe no navegador (não roda em testes ou navegadores que
// bloqueiam IndexedDB). A verificação evita que a aplicação quebre nesses casos.
export const analytics: Promise<Analytics | null> = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);

export const auth = getAuth(app);
auth.languageCode = "pt-BR";

export const db = getFirestore(app);

/**
 * Exportado para uso futuro. No plano gratuito (Spark) as fotos ficam no
 * Firestore (ver services/products.ts) e o Storage não é utilizado.
 */
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;