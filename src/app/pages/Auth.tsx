import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
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
      0: { label: "Muy débil", color: "bg-red-500", width: "w-1/4" },
      1: { label: "Débil", color: "bg-orange-500", width: "w-2/4" },
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
        setMessage("El correo no puede estar vacío.");
        return;
      }

      if (trimmedEmail !== email) {
        setEmail(trimmedEmail);
        setMessage("El correo no puede tener espacios al inicio o al final.");
        return;
      }

      if (mode === "register") {
        if (!trimmedDisplayName) {
          setMessage("El nombre no puede estar vacío.");
          return;
        }

        if (trimmedDisplayName !== displayName) {
          setDisplayName(trimmedDisplayName);
          setMessage("El nombre no puede tener espacios al inicio o al final.");
          return;
        }

        if (!passwordChecks.hasLength8 || passwordChecks.criteriaMet < 3) {
          setMessage(
            "Mínimo debes cumplir 3 requisitos de seguridad, incluyendo 8 caracteres.",
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
        setMessage("Sesión iniciada correctamente.");
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
      await loginWithGoogle();
      navigate("/dashboard");
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.22),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(6,182,212,.18),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#042f2e_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[580px] w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-[12%] top-[18%] h-24 w-24 rounded-full border border-cyan-300/20" />
        <div className="absolute bottom-[14%] right-[16%] h-32 w-32 rounded-full border border-emerald-300/20" />
      </div>

      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-white/[0.09] backdrop-blur-2xl shadow-2xl shadow-emerald-950/40 p-5 sm:p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3 mb-1">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-200 grid place-items-center border border-emerald-300/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{title}</h1>
            <p className="text-sm text-slate-300">
              Entra a Trimit para controlar pagos, alertas y suscripciones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1">
          <button
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "text-slate-200 hover:bg-white/10"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            Iniciar sesión
          </button>
          <button
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              mode === "register"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "text-slate-200 hover:bg-white/10"
            }`}
            onClick={() => setMode("register")}
            type="button"
          >
            Registro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Nombre</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full border border-white/15 rounded-xl pl-9 pr-3 py-3 bg-white/10 text-white placeholder:text-slate-400 outline-none focus:border-emerald-300/70 focus:ring-4 focus:ring-emerald-400/10 transition"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Correo</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full border border-white/15 rounded-xl pl-9 pr-3 py-3 bg-white/10 text-white placeholder:text-slate-400 outline-none focus:border-emerald-300/70 focus:ring-4 focus:ring-emerald-400/10 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Crea una contraseña segura" : "Ingresa tu contraseña"}
                className="w-full border border-white/15 rounded-xl pl-9 pr-10 py-3 bg-white/10 text-white placeholder:text-slate-400 outline-none focus:border-emerald-300/70 focus:ring-4 focus:ring-emerald-400/10 transition"
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
            <div className="space-y-3 rounded-xl border border-white/15 bg-slate-950/35 p-3.5">
              <div className="flex items-start gap-2 text-xs text-amber-100">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-200" />
                <p>Mínimo 3 requisitos, incluyendo 8 caracteres.</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">Fortaleza de contraseña</p>
                <span className="text-xs font-medium text-white">{passwordChecks.level.label}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                <div className={`h-full ${passwordChecks.level.color} ${passwordChecks.level.width} transition-all`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <PasswordCheck active={passwordChecks.hasLength8} label="Mínimo 8 caracteres" />
                <PasswordCheck active={passwordChecks.hasLength16} label="16+ caracteres" />
                <PasswordCheck active={passwordChecks.hasUpper} label="Una mayúscula" />
                <PasswordCheck active={passwordChecks.hasLower} label="Una minúscula" />
                <PasswordCheck active={passwordChecks.hasSpecial} label="Un carácter especial" />
                <PasswordCheck active={passwordChecks.hasComplex} label="Combinación completa" />
              </div>
            </div>
          )}

          <button
            className="w-full bg-emerald-500 text-white rounded-xl py-3 font-semibold hover:bg-emerald-600 disabled:opacity-50 shadow-lg shadow-emerald-500/20 transition"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>

          {mode === "login" && (
            <Link
              to="/auth/forgot-password"
              className="inline-flex text-sm text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
            >
              Olvidé mi contraseña
            </Link>
          )}

          <button
            className="w-full border border-white/20 text-white rounded-xl py-3 font-semibold hover:bg-white/10 disabled:opacity-50 transition"
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

function PasswordCheck({ active, label }: { active: boolean; label: string }) {
  return (
    <p className={active ? "text-emerald-300" : "text-slate-400"}>
      <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
      {label}
    </p>
  );
}
