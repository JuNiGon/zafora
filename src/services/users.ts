import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import type { CartItem, UserProfile } from "@/types/store";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export async function fetchUserProfile(user: User): Promise<UserProfile> {
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = (snap.data() ?? {}) as Record<string, unknown>;
  return {
    name: asString(data["name"]) || user.displayName || "",
    email: asString(data["email"]) || user.email || "",
    phone: asString(data["phone"]),
  };
}

/** Cria ou atualiza o documento `users/{uid}` com os dados do cliente. */
export async function saveUserProfile(uid: string, profile: Partial<UserProfile>, isNew = false) {
  await setDoc(
    doc(db, "users", uid),
    {
      ...profile,
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true },
  );
}

/**
 * Um usuário é administrador quando existe o documento `admins/{uid}` no Firestore.
 * Esse documento só pode ser criado pelo console do Firebase (ver README).
 */
export async function checkIsAdmin(uid: string) {
  try {
    const snap = await getDoc(doc(db, "admins", uid));
    return snap.exists();
  } catch {
    return false;
  }
}

/* ---------- Carrinho sincronizado (carts/{uid}) ---------- */

export async function fetchRemoteCart(uid: string): Promise<CartItem[]> {
  try {
    const snap = await getDoc(doc(db, "carts", uid));
    const items = (snap.data() as Record<string, unknown> | undefined)?.["items"];
    return Array.isArray(items) ? (items as CartItem[]) : [];
  } catch {
    return [];
  }
}

export async function saveRemoteCart(uid: string, items: CartItem[]) {
  await setDoc(doc(db, "carts", uid), { items, updatedAt: serverTimestamp() });
}
