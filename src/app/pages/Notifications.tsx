import { Bell, CheckCircle, AlertCircle, Info, Trash2, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Pago próximo: Amazon Prime",
    message: "Tu suscripción a Amazon Prime se renovará en 2 días por $14.99",
    date: new Date("2026-02-23T10:30:00"),
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Pago procesado",
    message: "Se ha procesado correctamente el pago de Netflix por $19.61",
    date: new Date("2026-01-28T08:15:00"),
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Nuevo límite de presupuesto",
    message: "Has alcanzado el 80% de tu presupuesto mensual en Entretenimiento",
    date: new Date("2026-02-20T14:00:00"),
    read: true,
  },
  {
    id: 4,
    type: "warning",
    title: "Recordatorio: Disney+",
    message: "Tu suscripción a Disney+ vence en 3 días. ¿Deseas renovarla?",
    date: new Date("2026-02-22T09:00:00"),
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "Ahorro mensual",
    message: "Has ahorrado $38 este mes cancelando suscripciones no utilizadas",
    date: new Date("2026-02-15T16:45:00"),
    read: true,
  },
  {
    id: 6,
    type: "success",
    title: "Suscripción agregada",
    message: "Has agregado exitosamente Notion a tus suscripciones",
    date: new Date("2026-02-10T11:20:00"),
    read: true,
  },
];

export default function Notifications() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return "bg-white";
    switch (type) {
      case "success":
        return "bg-emerald-50";
      case "warning":
        return "bg-amber-50";
      case "info":
        return "bg-blue-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Notificaciones</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : "Estás al día"}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurar
          </button>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            Marcar todas como leídas
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-gray-500 text-sm">Total</p>
          </div>
          <p className="text-3xl font-bold">{notifications.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-gray-500 text-sm">Sin leer</p>
          </div>
          <p className="text-3xl font-bold">{unreadCount}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-500 text-sm">Leídas</p>
          </div>
          <p className="text-3xl font-bold">{notifications.length - unreadCount}</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Todas las notificaciones</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${getBgColor(
                notification.type,
                notification.read
              )}`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2"></span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                  <p className="text-gray-400 text-xs">
                    {format(notification.date, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                  </p>
                </div>

                <button className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State (hidden when there are notifications) */}
      {notifications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes notificaciones
          </h3>
          <p className="text-gray-500">
            Cuando tengas nuevas notificaciones, aparecerán aquí
          </p>
        </div>
      )}
    </div>
  );
}
