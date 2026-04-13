import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import type { ComponentType } from "react";

export function LoadingState({
  title = "Cargando...",
  description = "Espera un momento mientras traemos la información.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
      <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

export function EmptyState({
  title = "Sin datos",
  description = "Aún no hay información para mostrar.",
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-8 text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-gray-400" />
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "No se pudo cargar la información",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
        <div className="flex-1">
          <p className="font-medium text-red-700">{title}</p>
          {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-3 w-3" />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
