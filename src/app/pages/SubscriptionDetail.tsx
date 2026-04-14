import { useNavigate } from "react-router";
import { ArrowLeft, Edit2, Trash2, Calendar, DollarSign, RefreshCw, Bell, TrendingDown, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function SubscriptionDetail() {
  const navigate = useNavigate();

  // Mock data
  const subscription = {
    name: "Netflix",
    category: "Entretenimiento",
    amount: 19.61,
    currency: "$",
    billingCycle: "Mensual",
    nextPaymentDate: new Date("2026-02-28"),
    startDate: new Date("2023-06-15"),
    color: "bg-red-500",
    icon: "N",
  };

  const paymentHistory = [
    { date: new Date("2026-01-28"), amount: 19.61, status: "Pagado" },
    { date: new Date("2025-12-28"), amount: 19.61, status: "Pagado" },
    { date: new Date("2025-11-28"), amount: 19.61, status: "Pagado" },
    { date: new Date("2025-10-28"), amount: 19.61, status: "Pagado" },
    { date: new Date("2025-09-28"), amount: 19.61, status: "Pagado" },
  ];

  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const monthsActive = 33; // desde junio 2023

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Suscripciones
      </button>

      <div className="max-w-5xl">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 md:p-8 text-white mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${subscription.color} rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg`}>
                {subscription.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{subscription.name}</h1>
                <p className="text-gray-300">{subscription.category}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors">
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg flex items-center gap-2 transition-colors">
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Próximo pago</p>
              <p className="text-2xl font-bold">
                {format(subscription.nextPaymentDate, "d MMM yyyy", { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Costo</p>
              <p className="text-2xl font-bold">
                {subscription.currency}
                {subscription.amount} / mes
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Estado</p>
              <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-sm rounded-full font-medium">
                Activa
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <p className="text-gray-500 text-sm">Total Pagado</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
            <p className="text-gray-500 text-xs mt-1">{paymentHistory.length} pagos realizados</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <p className="text-gray-500 text-sm">Tiempo Activo</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{monthsActive}</p>
            <p className="text-gray-500 text-xs mt-1">meses suscrito</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <p className="text-gray-500 text-sm">Promedio Mensual</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">${subscription.amount}</p>
            <p className="text-gray-500 text-xs mt-1">sin cambios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Detalles de Suscripción</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Ciclo de facturación</span>
                </div>
                <span className="font-medium">{subscription.billingCycle}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Fecha de inicio</span>
                </div>
                <span className="font-medium">
                  {format(subscription.startDate, "d MMM yyyy", { locale: es })}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Recordatorio</span>
                </div>
                <span className="font-medium">3 días antes</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Renovación automática</span>
                </div>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">
                  Activa
                </span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Historial de Pagos</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {paymentHistory.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {format(payment.date, "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      <p className="text-sm text-gray-500">{payment.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 bg-amber-50 rounded-xl p-6 border border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-3">Acciones disponibles</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white border border-amber-200 rounded-lg text-amber-900 hover:bg-amber-50 transition-colors text-sm font-medium">
              Pausar suscripción
            </button>
            <button className="px-4 py-2 bg-white border border-amber-200 rounded-lg text-amber-900 hover:bg-amber-50 transition-colors text-sm font-medium">
              Cambiar ciclo de pago
            </button>
            <button className="px-4 py-2 bg-white border border-amber-200 rounded-lg text-amber-900 hover:bg-amber-50 transition-colors text-sm font-medium">
              Actualizar monto
            </button>
            <button className="px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
              Cancelar suscripción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
