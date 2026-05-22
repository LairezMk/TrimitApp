import { Link, useRouteError } from "react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function AppErrorBoundary() {
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : "Ocurrió un error inesperado al cargar esta vista.";

  return (
    <div className="min-h-screen bg-slate-950 text-white grid place-items-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-white/[0.09] backdrop-blur-2xl shadow-2xl shadow-emerald-950/40 p-6 md:p-8">
        <div className="mb-5 flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-red-500/15 text-red-200 grid place-items-center border border-red-300/20 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Algo no cargó bien</h1>
            <p className="mt-1 text-sm text-slate-300">
              Protegimos la sesión y dejamos esta pantalla para que puedas recuperarte sin perderte.
            </p>
          </div>
        </div>

        <p className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-slate-200">
          {message}
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white hover:bg-emerald-600"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
          <Link
            to="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-semibold text-slate-100 hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
