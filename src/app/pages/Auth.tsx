import { FormEvent, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

type Mode = "login" | "register";

export default function AuthPage() {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => {
    return mode === "login" ? "Iniciar sesion" : "Crear cuenta";
  }, [mode]);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (mode === "register") {
        await register({ email, password, displayName });
        setMessage("Cuenta creada correctamente.");
        navigate("/dashboard");
      } else {
        await login(email, password);
        setMessage("Sesion iniciada correctamente.");
        navigate("/dashboard");
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Error inesperado";
      setMessage(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 grid place-items-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-600">Prueba simple para validar Auth + Firestore.</p>

        <div className="flex gap-2">
          <button
            className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === "login" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`flex-1 rounded-md py-2 text-sm font-medium ${mode === "register" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setMode("register")}
            type="button"
          >
            Registro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nombre</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
              required
              minLength={6}
            />
          </div>

          <button
            className="w-full bg-emerald-500 text-white rounded-md py-2 font-medium hover:bg-emerald-600 disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        {message && (
          <p className="text-sm rounded-md bg-gray-100 border border-gray-200 p-2 text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
