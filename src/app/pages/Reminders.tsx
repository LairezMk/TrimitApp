import { Bell, Clock, Calendar, Plus, Edit2, Trash2, Check } from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

const reminders = [
  {
    id: 1,
    subscription: "Netflix",
    type: "payment",
    date: new Date("2026-02-28"),
    daysBeforereminder: 3,
    enabled: true,
    icon: "N",
    color: "bg-red-500",
  },
  {
    id: 2,
    subscription: "Amazon Prime",
    type: "payment",
    date: new Date("2026-02-22"),
    daysBeforereminder: 3,
    enabled: true,
    icon: "A",
    color: "bg-sky-500",
  },
  {
    id: 3,
    subscription: "Disney+",
    type: "renewal",
    date: new Date("2026-02-25"),
    daysBeforereminder: 7,
    enabled: true,
    icon: "D",
    color: "bg-blue-600",
  },
  {
    id: 4,
    subscription: "Spotify",
    type: "trial_end",
    date: new Date("2026-03-10"),
    daysBeforereminder: 5,
    enabled: false,
    icon: "S",
    color: "bg-green-500",
  },
];

export default function Reminders() {
  const activeReminders = reminders.filter((r) => r.enabled).length;
  const upcomingReminders = reminders.filter(
    (r) => r.enabled && r.date.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "payment":
        return "Pago próximo";
      case "renewal":
        return "Renovación";
      case "trial_end":
        return "Fin de prueba";
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-blue-100 text-blue-700";
      case "renewal":
        return "bg-purple-100 text-purple-700";
      case "trial_end":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Recordatorios</h1>
          <p className="text-gray-500">Configura alertas para tus suscripciones</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Recordatorio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <Bell className="w-8 h-8 mb-2" />
          <p className="text-emerald-100 text-sm">Recordatorios Activos</p>
          <p className="text-3xl font-bold">{activeReminders}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Próxima Semana</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingReminders}</p>
          <p className="text-gray-400 text-xs mt-1">alertas programadas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Total Configurados</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{reminders.length}</p>
          <p className="text-gray-400 text-xs mt-1">recordatorios</p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Todos los Recordatorios</h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {reminders.map((reminder) => {
            const daysUntil = Math.ceil(
              (reminder.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            const reminderDate = addDays(reminder.date, -reminder.daysBeforereminder);

            return (
              <div
                key={reminder.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !reminder.enabled ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-14 h-14 ${reminder.color} rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                    >
                      {reminder.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg dark:text-white">{reminder.subscription}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(
                            reminder.type
                          )}`}
                        >
                          {getTypeLabel(reminder.type)}
                        </span>
                        {reminder.enabled && daysUntil <= 7 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Próximo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(reminder.date, "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Recordar {reminder.daysBeforereminder} días antes
                        </span>
                        <span className="flex items-center gap-1">
                          <Bell className="w-4 h-4" />
                          {format(reminderDate, "d 'de' MMM", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={reminder.enabled}
                        className="peer sr-only"
                        readOnly
                      />
                      <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500"></span>
                      <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                    </label>

                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>

                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 dark:text-white">
            <Bell className="w-5 h-5 text-emerald-600" />
            Configuración de Notificaciones
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium dark:text-white">Notificaciones push</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recibe alertas en tu dispositivo</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium dark:text-white">Email</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recibe recordatorios por correo</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium dark:text-white">SMS</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recibe mensajes de texto</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-emerald-200 dark:border-slate-600">
          <div className="flex items-start gap-3 mb-4">
            <Check className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
                Tips para Recordatorios
              </h3>
              <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-100">
                <li>• Configura recordatorios con al menos 3 días de anticipación</li>
                <li>• Activa múltiples canales para no perderte ninguna alerta</li>
                <li>• Revisa tus recordatorios semanalmente</li>
                <li>• Ajusta las fechas según tu calendario de pagos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
