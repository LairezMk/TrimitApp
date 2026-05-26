import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getAuthErrorMessage } from "../utils/authErrors";

export default function ForgotPasswordPage() {
  const { sendResetPasswordCode } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setMessageType("error");
    setSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setMessage("Ingresa tu correo para continuar.");
        return;
      }
      if (trimmedEmail !== email) {
        setEmail(trimmedEmail);
      }

      await sendResetPasswordCode(trimmedEmail);
      setMessageType("success");
      setMessage(
        "Te enviamos un enlace seguro en español para restablecer tu contraseña. Revisa tu bandeja principal; si no aparece, mira promociones o spam.",
      );
    } catch (error) {
      setMessageType("error");
      setMessage(getAuthErrorMessage(error, "reset"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 grid place-items-center p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,.22),transparent_34%),radial-gradient(circle_at_82%_35%,rgba(6,182,212,.18),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_54%,#042f2e_100%)]" />
        <div className="absolute left-[12%] top-[18%] h-28 w-28 rounded-full border border-cyan-300/20" />
        <div className="absolute bottom-[18%] right-[18%] h-32 w-32 rounded-full border border-emerald-300/20" />
      </div>

      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-white/[0.09] backdrop-blur-2xl shadow-2xl shadow-emerald-950/40 p-5 sm:p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3 mb-1">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-200 grid place-items-center border border-emerald-300/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Recuperar contraseña
            </h1>
            <p className="text-sm text-slate-300">
              Ingresa tu correo y te enviaremos un enlace seguro para crear una nueva.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            className="w-full bg-emerald-500 text-white rounded-xl py-3 font-semibold hover:bg-emerald-600 disabled:opacity-50 shadow-lg shadow-emerald-500/20 transition inline-flex items-center justify-center gap-2"
            disabled={submitting}
            type="submit"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar enlace de recuperación"
            )}
          </button>
        </form>

        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-cyan-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al login
        </Link>

        {message && (
          <p
            className={`text-sm rounded-lg border p-2.5 ${
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
      </div>
    </div>
  );
}
