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
  requestMicrosoftMailAccessToken: () => Promise<string>;
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

    const googleOAuthClientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as
      | string
      | undefined;
    if (googleOAuthClientId) {
      const redirectUri = window.location.origin;
      const state = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const params = new URLSearchParams({
        client_id: googleOAuthClientId,
        response_type: "token",
        redirect_uri: redirectUri,
        scope: "https://www.googleapis.com/auth/gmail.readonly email profile",
        state,
        prompt: "select_account consent",
        include_granted_scopes: "true",
      });
      const popup = window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
        "trimit-gmail-mail",
        "width=520,height=720",
      );

      if (!popup) {
        throw new Error("El navegador bloqueó la ventana de autorización de Gmail.");
      }

      return new Promise<string>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          popup.close();
          reject(new Error("Se agotó el tiempo para autorizar Gmail."));
        }, 120_000);

        const interval = window.setInterval(() => {
          if (popup.closed) {
            window.clearInterval(interval);
            window.clearTimeout(timeout);
            reject(new Error("Autorización de Gmail cancelada."));
            return;
          }

          try {
            const hash = popup.location.hash;
            if (!hash) {
              return;
            }

            const responseParams = new URLSearchParams(hash.replace(/^#/, ""));
            const error = responseParams.get("error_description") || responseParams.get("error");
            const returnedState = responseParams.get("state");
            const token = responseParams.get("access_token");

            if (returnedState && returnedState !== state) {
              throw new Error("La respuesta de Gmail no coincide con esta sesión.");
            }

            window.clearInterval(interval);
            window.clearTimeout(timeout);
            popup.close();

            if (error) {
              reject(new Error(error));
              return;
            }

            if (!token) {
              reject(new Error("Gmail no devolvió un token de acceso."));
              return;
            }

            resolve(token);
          } catch (err) {
            if (err instanceof DOMException) {
              return;
            }

            window.clearInterval(interval);
            window.clearTimeout(timeout);
            popup.close();
            reject(err);
          }
        }, 500);
      });
    }

    const credential = await reauthenticateWithPopup(auth.currentUser, googleProvider);
    const additional = GoogleAuthProvider.credentialFromResult(credential);

    if (!additional?.accessToken) {
      throw new Error(
        "No se pudo obtener acceso a Gmail. Para escanear correos distintos al usuario logueado, configura VITE_GOOGLE_OAUTH_CLIENT_ID.",
      );
    }

    return additional.accessToken;
  };

  const requestMicrosoftMailAccessToken = async () => {
    if (!auth.currentUser) {
      throw new Error("Debes iniciar sesión para detectar suscripciones por correo.");
    }

    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined;
    if (!clientId) {
      throw new Error(
        "Para detectar Outlook/Hotmail configura VITE_MICROSOFT_CLIENT_ID en el entorno.",
      );
    }

    const redirectUri = window.location.origin;
    const state = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "token",
      redirect_uri: redirectUri,
      response_mode: "fragment",
      scope: "Mail.Read User.Read",
      state,
      prompt: "select_account",
    });
    const popup = window.open(
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`,
      "trimit-outlook-mail",
      "width=520,height=720",
    );

    if (!popup) {
      throw new Error("El navegador bloqueó la ventana de autorización de Outlook.");
    }

    return new Promise<string>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        popup.close();
        reject(new Error("Se agotó el tiempo para autorizar Outlook."));
      }, 120_000);

      const interval = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(interval);
          window.clearTimeout(timeout);
          reject(new Error("Autorización de Outlook cancelada."));
          return;
        }

        try {
          const hash = popup.location.hash;
          if (!hash) {
            return;
          }

          const responseParams = new URLSearchParams(hash.replace(/^#/, ""));
          const error = responseParams.get("error_description") || responseParams.get("error");
          const returnedState = responseParams.get("state");
          const token = responseParams.get("access_token");

          if (returnedState && returnedState !== state) {
            throw new Error("La respuesta de Outlook no coincide con esta sesión.");
          }

          window.clearInterval(interval);
          window.clearTimeout(timeout);
          popup.close();

          if (error) {
            reject(new Error(error));
            return;
          }

          if (!token) {
            reject(new Error("Outlook no devolvió un token de acceso."));
            return;
          }

          resolve(token);
        } catch (err) {
          if (err instanceof DOMException) {
            return;
          }

          window.clearInterval(interval);
          window.clearTimeout(timeout);
          popup.close();
          reject(err);
        }
      }, 500);
    });
  };

  const sendResetPasswordCode = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error("Ingresa tu correo para recuperar la contraseña.");
    }

    await sendPasswordResetEmail(auth, trimmedEmail, {
      url: `${window.location.origin}/auth/action`,
      handleCodeInApp: true,
    });
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
        throw new Error("Debes ingresar tu contraseña actual para cambiarla.");
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
      requestMicrosoftMailAccessToken,
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
