import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth, googleProvider } from "@/services/firebase";
import { checkIsAdmin, fetchUserProfile, saveUserProfile } from "@/services/users";
import type { UserProfile } from "@/types/store";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  /** `true` até o Firebase informar o estado inicial da sessão. */
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function registerGoogleUser(credential: UserCredential | null) {
  if (!credential) return;
  const { user } = credential;
  const isNew = getAdditionalUserInfo(credential)?.isNewUser ?? false;
  await saveUserProfile(
    user.uid,
    isNew
      ? { name: user.displayName ?? "", email: user.email ?? "" }
      : { email: user.email ?? "" },
    isNew,
  ).catch(() => undefined);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // Nome informado no cadastro enquanto a conta ainda está sendo criada.
  const pendingName = useRef("");

  useEffect(() => {
    // Conclui um login com Google iniciado por redirecionamento (fallback do popup).
    getRedirectResult(auth).then(registerGoogleUser).catch(() => undefined);

    return onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (!current) {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const [userProfile, admin] = await Promise.all([
        fetchUserProfile(current).catch(() => ({
          name: current.displayName ?? "",
          email: current.email ?? "",
          phone: "",
        })),
        checkIsAdmin(current.uid),
      ]);
      // Logo após o cadastro o documento users/{uid} ainda pode não existir:
      // usa o nome digitado no formulário em vez de cair no e-mail.
      if (!userProfile.name && pendingName.current) userProfile.name = pendingName.current;
      setProfile((prev) =>
        prev && !userProfile.name ? { ...userProfile, name: prev.name } : userProfile,
      );
      setIsAdmin(admin);
      setLoading(false);
    });
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const cleanName = name.trim();
    pendingName.current = cleanName;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const data = { name: cleanName, email: credential.user.email ?? email.trim(), phone: "" };
      setProfile(data);
      // Grava o nome no Firebase Auth (displayName) e no Firestore (users/{uid}).
      await updateProfile(credential.user, { displayName: cleanName });
      await saveUserProfile(credential.user.uid, data, true).catch((error) =>
        console.error("Não foi possível salvar o perfil no Firestore:", error),
      );
      setProfile(data);
    } finally {
      pendingName.current = "";
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await registerGoogleUser(credential);
    } catch (error) {
      const code = (error as { code?: string }).code;
      // Navegadores que bloqueiam popups (comum em celulares) usam redirecionamento.
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const updateUserProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) throw new Error("Usuário não autenticado.");
      await saveUserProfile(user.uid, data);
      if (data.name !== undefined && data.name !== user.displayName) {
        await updateProfile(user, { displayName: data.name });
      }
      setProfile((prev) => ({ name: "", email: user.email ?? "", phone: "", ...prev, ...data }));
    },
    [user],
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAdmin,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      updateUserProfile,
      signOut,
    }),
    [user, profile, isAdmin, loading, signUp, signIn, signInWithGoogle, resetPassword, updateUserProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return context;
}

/** Nome amigável para exibição e para a mensagem do pedido. */
export function displayName(user: User | null, profile: UserProfile | null) {
  return profile?.name || user?.displayName || "";
}

/** Traduz os códigos de erro do Firebase Auth para mensagens em português. */
export function authErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  const messages: Record<string, string> = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/missing-email": "Informe o seu e-mail.",
    "auth/missing-password": "Informe a sua senha.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "Não encontramos uma conta com este e-mail.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/email-already-in-use": "Já existe uma conta com este e-mail. Tente entrar.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    "auth/network-request-failed": "Sem conexão. Verifique sua internet e tente novamente.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir o login.",
    "auth/cancelled-popup-request": "A janela do Google foi fechada antes de concluir o login.",
    "auth/account-exists-with-different-credential":
      "Este e-mail já está cadastrado com outro método de acesso.",
    "auth/operation-not-allowed":
      "Este método de login ainda não foi ativado no Firebase (Authentication → Sign-in method).",
    "auth/unauthorized-domain":
      "Este domínio não está autorizado no Firebase (Authentication → Settings → Authorized domains).",
  };
  return messages[code] ?? "Não foi possível concluir. Tente novamente.";
}
