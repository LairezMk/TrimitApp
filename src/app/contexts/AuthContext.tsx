import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
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

  const value = useMemo(
    () => ({ user, loading, register, login, loginWithGoogle, logout }),
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
