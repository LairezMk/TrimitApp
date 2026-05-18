import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  detectSubscriptionsFromGmail,
  saveDetectedSubscriptionsDrafts,
} from "../services/gmailDetection";
import { getAuthErrorMessage } from "../utils/authErrors";

type Mode = "login" | "register";

export default function AuthPage() {
  const { user, loading, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => {
    return mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta";
  }, [mode]);

  const passwordChecks = useMemo(() => {
    const hasLength8 = password.length >= 8;
    const hasLength16 = password.length >= 16;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasComplex = hasUpper && hasLower && hasSpecial;
    const criteriaMet = [
      hasLength8,
      hasLength16,
      hasUpper,
      hasLower,
      hasSpecial,
      hasComplex,
    ].filter(Boolean).length;

    let score = 0;
    if (hasLength8) {
      score += 1;
    }
    if (hasComplex) {
      score += 1;
    }
    if (hasLength16) {
      score += 1;
    }

    const levelMap = {
      0: { label: "Muy debil", color: "bg-red-500", width: "w-1/4" },
      1: { label: "Debil", color: "bg-orange-500", width: "w-2/4" },
      2: { label: "Aceptable", color: "bg-yellow-500", width: "w-3/4" },
      3: { label: "Fuerte", color: "bg-emerald-500", width: "w-full" },
    } as const;

    return {
      hasLength8,
      hasLength16,
      hasComplex,
      hasUpper,
      hasLower,
      hasSpecial,
      criteriaMet,
      score,
      level: levelMap[score as 0 | 1 | 2 | 3],
    };
  }, [password]);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setMessageType("error");

    try {
      const trimmedEmail = email.trim();
      const trimmedDisplayName = displayName.trim();

      if (!trimmedEmail) {
        setMessage("El correo no puede estar vacio.");
        return;
      }

      if (trimmedEmail !== email) {
        setEmail(trimmedEmail);
        setMessage("El correo no puede tener espacios al inicio o al final.");
        return;
      }

      if (mode === "register") {
        if (!trimmedDisplayName) {
          setMessage("El nombre no puede estar vacio.");
          return;
        }

        if (trimmedDisplayName !== displayName) {
          setDisplayName(trimmedDisplayName);
          setMessage("El nombre no puede tener espacios al inicio o al final.");
          return;
        }

        if (!passwordChecks.hasLength8 || passwordChecks.criteriaMet < 3) {
          setMessage(
            "Minimo debes cumplir 3 requisitos de seguridad, y uno de ellos es tener 8 caracteres.",
          );
          setMessageType("error");
          return;
        }

        await register({ email: trimmedEmail, password, displayName: trimmedDisplayName });
        setMessageType("success");
        setMessage("Cuenta creada correctamente.");
        navigate("/dashboard");
      } else {
        await login(trimmedEmail, password);
        setMessageType("success");
        setMessage("Sesion iniciada correctamente.");
        navigate("/dashboard");
      }
    } catch (error) {
      setMessageType("error");
      setMessage(getAuthErrorMessage(error, mode === "login" ? "login" : "register"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setMessage("");
    setMessageType("error");

    try {
      const { isNewUser, accessToken } = await loginWithGoogle();

      if (!isNewUser) {
        navigate("/dashboard");
        return;
      }

      if (!accessToken) {
        navigate("/dashboard");
        return;
      }

      const detected = await detectSubscriptionsFromGmail(accessToken);
      saveDetectedSubscriptionsDrafts(detected);
      navigate("/subscriptions/gmail-confirmation");
    } catch (error) {
      setMessageType("error");
      setMessage(getAuthErrorMessage(error, "login"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 grid place-items-center p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        {Array.from({ length: 32 }).map((_, index) => (
          <span
            key={index}
            className={`absolute rounded-full bg-white/30 ${
              index % 3 === 0 ? "animate-pulse" : "animate-bounce"
            }`}
            style={{
              width: `${(index % 4) + 2}px`,
              height: `${(index % 4) + 2}px`,
              left: `${(index * 17) % 100}%`,
              top: `${(index * 29) % 100}%`,
              animationDuration: `${2 + (index % 4)}s`,
              animationDelay: `${(index % 5) * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-200 grid place-items-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <p className="text-sm text-slate-300">
              Gestiona tus suscripciones con una experiencia moderna.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              mode === "login"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              mode === "register"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
            onClick={() => setMode("register")}
            type="button"
          >
            Registro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-sm text-slate-200 mb-1.5">Nombre</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full border border-white/20 rounded-lg pl-9 pr-3 py-2.5 bg-white/10 text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-200 mb-1.5">Correo</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full border border-white/20 rounded-lg pl-9 pr-3 py-2.5 bg-white/10 text-white placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-200 mb-1.5">Contrasena</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Crea una contrasena segura" : "Ingresa tu contrasena"}
                className="w-full border border-white/20 rounded-lg pl-9 pr-10 py-2.5 bg-white/10 text-white placeholder:text-slate-400"
                required
                minLength={mode === "register" ? 8 : 6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-2 rounded-lg border border-white/15 bg-black/20 p-3">
              <p className="text-xs text-amber-200">
                Minimo 3 requisitos, incluyendo 8 caracteres.
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">Fortaleza de contrasena</p>
                <span className="text-xs font-medium text-white">{passwordChecks.level.label}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                <div className={`h-full ${passwordChecks.level.color} ${passwordChecks.level.width} transition-all`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <p className={passwordChecks.hasLength8 ? "text-emerald-300" : "text-slate-400"}>
                  • Minimo 8 caracteres 
                </p>
                <p className={passwordChecks.hasLength16 ? "text-emerald-300" : "text-slate-400"}>
                  • 16+ caracteres 
                </p>
                <p className={passwordChecks.hasUpper ? "text-emerald-300" : "text-slate-400"}>
                  • Una mayuscula
                </p>
                <p className={passwordChecks.hasLower ? "text-emerald-300" : "text-slate-400"}>
                  • Una minuscula
                </p>
                <p className={passwordChecks.hasSpecial ? "text-emerald-300" : "text-slate-400"}>
                  • Un caracter especial
                </p>
                <p className={passwordChecks.hasComplex ? "text-emerald-300" : "text-slate-400"}>
                  • Combinacion completa
                </p>
              </div>
            </div>
          )}

          <button
            className="w-full bg-emerald-500 text-white rounded-lg py-2.5 font-medium hover:bg-emerald-600 disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>

          {mode === "login" && (
            <Link
              to="/auth/forgot-password"
              className="w-full text-sm text-cyan-200 hover:text-cyan-100 underline underline-offset-2 disabled:opacity-50"
            >
              Olvidé mi contraseña
            </Link>
          )}

          <button
            className="w-full border border-white/25 text-white rounded-lg py-2.5 font-medium hover:bg-white/10 disabled:opacity-50"
            disabled={submitting}
            type="button"
            onClick={handleGoogleAuth}
          >
            Continuar con Google
          </button>
        </form>

        {message && (
          <p
            className={`text-sm rounded-lg border p-2.5 ${
              messageType === "success"
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-100"
                : "bg-red-500/15 border-red-400/40 text-red-100"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
