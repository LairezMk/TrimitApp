import { FirebaseError } from "firebase/app";

type AuthErrorContext = "login" | "register" | "reset" | "changePassword";

const DEFAULT_MESSAGE_BY_CONTEXT: Record<AuthErrorContext, string> = {
  login: "No se pudo iniciar sesión. Inténtalo nuevamente.",
  register: "No se pudo crear la cuenta. Inténtalo nuevamente.",
  reset: "No se pudo enviar el correo de recuperación.",
  changePassword: "No se pudo actualizar la contraseña.",
};

export function getAuthErrorMessage(error: unknown, context: AuthErrorContext): string {
  if (!(error instanceof FirebaseError)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return DEFAULT_MESSAGE_BY_CONTEXT[context];
  }

  switch (error.code) {
    case "auth/invalid-email":
      return "El correo ingresado no es válido.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return context === "login"
        ? "No existe una cuenta con ese correo o la contraseña es incorrecta."
        : "Credenciales inválidas.";
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/weak-password":
      return "La contraseña es demasiado débil.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    default:
      return DEFAULT_MESSAGE_BY_CONTEXT[context];
  }
}
