import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { auth } from "../lib/firebase";
import { getAuthErrorMessage } from "../utils/authErrors";

export default function ResetPasswordAction() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const passwordReady = useMemo(
    () => password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[^A-Za-z0-9]/.test(password),
    [password],
  );

  useEffect(() => {
    const verifyCode = async () => {
      if (mode !== "resetPassword" || !oobCode) {
        setMessage("El enlace de recuperación no es válido o está incompleto.");
        setVerifying(false);
        return;
      }

      try {
        const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(verifiedEmail);
      } catch (error) {
        setMessage(getAuthErrorMessage(error, "reset"));
      } finally {
        setVerifying(false);
      }
    };

    void verifyCode();
  }, [mode, oobCode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setMessageType("error");

    if (!passwordReady) {
      setMessage("Usa mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessageType("success");
      setMessage("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(getAuthErrorMessage(error, "reset"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 grid place-items-center p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,.24),transparent_34%),radial-gradient(circle_at_82%_32%,rgba(6,182,212,.18),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#042f2e_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        <div className="absolute left-[10%] top-[18%] h-24 w-24 rounded-full border border-cyan-300/20" />
        <div className="absolute bottom-[14%] right-[16%] h-32 w-32 rounded-full border border-emerald-300/20" />
      </div>

      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-white/[0.09] backdrop-blur-2xl shadow-2xl shadow-emerald-950/40 p-5 sm:p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-200 grid place-items-center border border-emerald-300/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Restablecer contraseña
            </h1>
            <p className="text-sm text-slate-300">
              Crea una contraseña nueva para volver a entrar a Trimit.
            </p>
          </div>
        </div>

        {verifying ? (
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-slate-200 inline-flex items-center gap-3 w-full">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-200" />
            Verificando enlace seguro...
          </div>
        ) : email && messageType !== "success" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm text-emerald-100 inline-flex items-start gap-2 w-full">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
              Recuperación autorizada para <strong className="break-all">{email}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border border-white/15 rounded-xl pl-9 pr-11 py-3 bg-white/10 text-white placeholder:text-slate-400 outline-none focus:border-emerald-300/70 focus:ring-4 focus:ring-emerald-400/10 transition"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full border border-white/15 rounded-xl px-3 py-3 bg-white/10 text-white placeholder:text-slate-400 outline-none focus:border-emerald-300/70 focus:ring-4 focus:ring-emerald-400/10 transition"
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
            </div>

            <button
              className="w-full bg-emerald-500 text-white rounded-xl py-3 font-semibold hover:bg-emerald-600 disabled:opacity-50 shadow-lg shadow-emerald-500/20 transition inline-flex items-center justify-center gap-2"
              disabled={submitting}
              type="submit"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar nueva contraseña"
              )}
            </button>
          </form>
        ) : null}

        {message && (
          <p
            className={`text-sm rounded-lg border p-3 ${
              messageType === "success"
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-100"
                : "bg-red-500/15 border-red-400/40 text-red-100"
            }`}
          >
            {messageType === "success" && (
              <CheckCircle2 className="mr-1 inline h-4 w-4 align-[-3px]" />
            )}
            {message}
          </p>
        )}

        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-cyan-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al login
        </Link>
      </div>
    </div>
  );
}
