import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { bootstrapUserWorkspace } from "../services/userBootstrap";

interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ isNewUser: boolean; accessToken: string | null }>;
  requestGmailAccessToken: () => Promise<string>;
  sendResetPasswordCode: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async ({ email, password, displayName }: RegisterPayload) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const safeDisplayName = displayName.trim() || "Usuario";

    if (displayName.trim()) {
      await updateProfile(credential.user, { displayName: safeDisplayName });
    }

    await bootstrapUserWorkspace({
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: safeDisplayName,
    });
  };

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    await bootstrapUserWorkspace({
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: credential.user.displayName || "Usuario",
    });

    await setDoc(
      doc(db, "users", credential.user.uid),
      {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const additional = GoogleAuthProvider.credentialFromResult(credential);
    const isNewUser =
      credential.user.metadata.creationTime === credential.user.metadata.lastSignInTime;

    await bootstrapUserWorkspace({
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: credential.user.displayName || "Usuario",
    });

    await setDoc(
      doc(db, "users", credential.user.uid),
      {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { isNewUser, accessToken: additional?.accessToken || null };
  };

  const logout = async () => {
    await signOut(auth);
  };

  const requestGmailAccessToken = async () => {
    if (!auth.currentUser) {
      throw new Error("Debes iniciar sesión para detectar suscripciones por correo.");
    }

    const credential = await reauthenticateWithPopup(auth.currentUser, googleProvider);
    const additional = GoogleAuthProvider.credentialFromResult(credential);

    if (!additional?.accessToken) {
      throw new Error("No se pudo obtener acceso a Gmail. Intenta de nuevo.");
    }

    return additional.accessToken;
  };

  const sendResetPasswordCode = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error("No hay una sesion activa.");
    }

    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const hasPasswordProvider = auth.currentUser.providerData.some(
      (provider) => provider.providerId === "password",
    );

    if (hasPasswordProvider) {
      if (!trimmedCurrentPassword) {
        throw new Error("Debes ingresar tu contrasena actual para cambiarla.");
      }
      if (!auth.currentUser.email) {
        throw new Error("No se encontro correo asociado a la cuenta.");
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        trimmedCurrentPassword,
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
    }

    await updatePassword(auth.currentUser, trimmedNewPassword);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      loginWithGoogle,
      requestGmailAccessToken,
      sendResetPasswordCode,
      changePassword,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
