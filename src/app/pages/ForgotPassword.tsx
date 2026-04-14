import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
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
      await sendResetPasswordCode(email);
      setMessageType("success");
      setMessage("Te enviamos el correo para restablecer tu contraseña.");
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
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-200 grid place-items-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Recuperar contraseña</h1>
            <p className="text-sm text-slate-300">
              Ingresa tu correo y te enviaremos un código/enlace para recuperarla.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            className="w-full bg-emerald-500 text-white rounded-lg py-2.5 font-medium hover:bg-emerald-600 disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Enviando..." : "Enviar correo de recuperación"}
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
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
