import type { Subscription } from "../types/subscription";
import { Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { subscriptionColorStyle } from "../utils/subscriptionColor";

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick: () => void;
}

export function SubscriptionCard({
  subscription,
  onClick,
}: SubscriptionCardProps) {
  const statusConfig = {
    active: {
      label: "Activa",
      className: "bg-emerald-50 text-emerald-600",
    },
    forgotten: {
      label: "Olvidada",
      className: "bg-amber-50 text-amber-600",
    },
    suspended: {
      label: "Suspendida",
      className: "bg-cyan-50 text-cyan-600",
    },
  };

  const status = statusConfig[subscription.status];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group motion-card-grow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg"
            style={subscriptionColorStyle(subscription.color)}
          >
            {subscription.icon}
          </div>
          <div>
            <h3 className="text-lg">{subscription.name}</h3>
            <p className="text-sm text-gray-500">{subscription.category}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">Monto mensual</span>
          <span className="text-xl">
            {subscription.currency}
            {subscription.amount.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            Próximo pago:{" "}
            {format(subscription.nextPaymentDate, "d 'de' MMMM", {
              locale: es,
            })}
          </span>
        </div>

        {subscription.isRecurring && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>Pago recurrente</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400 group-hover:text-emerald-600 transition-colors">
        Click para editar →
      </div>
    </div>
  );
}
