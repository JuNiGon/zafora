import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDnZeCj5H9rnvtk87tPI4OarGXFkXZejdo",
  authDomain: "zafora-d0d33.firebaseapp.com",
  projectId: "zafora-d0d33",
  storageBucket: "zafora-d0d33.firebasestorage.app",
  messagingSenderId: "464771938273",
  appId: "1:464771938273:web:32c4789cc266b19dfd44a0",
  measurementId: "G-9YSQ2PFG62",
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
