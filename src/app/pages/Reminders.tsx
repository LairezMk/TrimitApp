import { useEffect, useMemo, useState } from "react";
import { Bell, Clock, Calendar, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import {
  createUserReminder,
  deleteUserReminder,
  subscribeToUserReminders,
  updateUserReminder,
  type ReminderType,
  type UserReminder,
} from "../services/reminders";
import type { Subscription } from "../types/subscription";
import { dateFromInputValue, dateToInputValue } from "../utils/date";

type ReminderFormState = {
  subscriptionId: string;
  type: ReminderType;
  date: string;
  daysBeforeReminder: string;
  enabled: boolean;
};

const initialForm: ReminderFormState = {
  subscriptionId: "",
  type: "payment",
  date: "",
  daysBeforeReminder: "3",
  enabled: true,
};

export default function Reminders() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reminders, setReminders] = useState<UserReminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [form, setForm] = useState<ReminderFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubReminders = subscribeToUserReminders(
      user.uid,
      (data) => setReminders(data),
      (err) => setError(err.message),
    );
    const unsubSubs = subscribeToUserSubscriptions(
      user.uid,
      (data) => setSubscriptions(data.filter((sub) => sub.status === "active")),
      () => undefined,
    );

    return () => {
      unsubReminders();
      unsubSubs();
    };
  }, [user]);

  const activeReminders = reminders.filter((r) => r.enabled).length;
  const upcomingReminders = reminders.filter((r) => {
    const diff = r.date.getTime() - new Date().getTime();
    return r.enabled && diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const sortedReminders = useMemo(
    () => reminders.slice().sort((a, b) => a.date.getTime() - b.date.getTime()),
    [reminders],
  );

  const resetForm = () => {
    setEditingReminderId(null);
    setForm(initialForm);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setError(null);
    setEditingReminderId(null);
    const defaultSubscription = subscriptions[0];
    setForm({
      ...initialForm,
      subscriptionId: defaultSubscription?.id || "",
      date: defaultSubscription
        ? dateToInputValue(defaultSubscription.nextPaymentDate)
        : "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (reminder: UserReminder) => {
    setError(null);
    setEditingReminderId(reminder.id);
    setForm({
      subscriptionId: reminder.subscriptionId,
      type: reminder.type,
      date: dateToInputValue(reminder.date),
      daysBeforeReminder: String(reminder.daysBeforeReminder),
      enabled: reminder.enabled,
    });
    setIsModalOpen(true);
  };

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

  const handleCreateOrUpdateReminder = async () => {
    if (!user) {
      return;
    }

    const selectedSubscription = subscriptions.find((sub) => sub.id === form.subscriptionId);
    if (!selectedSubscription || !form.date) {
      setError("Selecciona una suscripción y fecha válidas.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        subscriptionId: selectedSubscription.id,
        subscriptionName: selectedSubscription.name,
        type: form.type,
        date: dateFromInputValue(form.date),
        daysBeforeReminder: Number(form.daysBeforeReminder || 0),
        enabled: form.enabled,
        icon: selectedSubscription.icon || selectedSubscription.name.charAt(0).toUpperCase(),
        color: selectedSubscription.color || "bg-emerald-500",
      };

      if (editingReminderId) {
        await updateUserReminder(user.uid, editingReminderId, payload);
      } else {
        await createUserReminder(user.uid, payload);
      }

      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar el recordatorio.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!user) {
      return;
    }

    try {
      await deleteUserReminder(user.uid, reminderId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el recordatorio.";
      setError(message);
    }
  };

  const handleToggleReminder = async (reminder: UserReminder, enabled: boolean) => {
    if (!user) {
      return;
    }

    try {
      await updateUserReminder(user.uid, reminder.id, { enabled });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el recordatorio.";
      setError(message);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Recordatorios</h1>
          <p className="text-gray-500">Configura alertas para tus suscripciones</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Recordatorio
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-8">
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Todos los Recordatorios</h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {sortedReminders.map((reminder) => {
            const daysUntil = Math.ceil(
              (reminder.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            );
            const reminderDate = addDays(reminder.date, -reminder.daysBeforeReminder);

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
                        <h3 className="font-semibold text-lg dark:text-white">
                          {reminder.subscriptionName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(
                            reminder.type,
                          )}`}
                        >
                          {getTypeLabel(reminder.type)}
                        </span>
                        {reminder.enabled && daysUntil <= 7 && daysUntil >= 0 && (
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
                          Recordar {reminder.daysBeforeReminder} días antes
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
                        onChange={(e) => handleToggleReminder(reminder, e.target.checked)}
                      />
                      <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500" />
                      <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6" />
                    </label>

                    <button
                      onClick={() => openEditModal(reminder)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {sortedReminders.length === 0 && (
            <div className="p-6 text-sm text-gray-500">No tienes recordatorios configurados.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 dark:text-white">
            <Bell className="w-5 h-5 text-emerald-600" />
            Configuración de Notificaciones
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium dark:text-white">Notificaciones push</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ajusta esta opción en Configuración.
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Global</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium dark:text-white">Email</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ajusta esta opción en Configuración.
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Global</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium dark:text-white">Recordatorios activos</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeReminders} de {reminders.length} habilitados.
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                {activeReminders}
              </span>
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
                <li>• Usa renovación para suscripciones anuales</li>
                <li>• Revisa tus recordatorios semanalmente</li>
                <li>• Desactiva alertas irrelevantes para mantener foco</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingReminderId ? "Editar Recordatorio" : "Nuevo Recordatorio"}
              </h2>
              <button
                onClick={resetForm}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Suscripción *
                </label>
                <select
                  value={form.subscriptionId}
                  onChange={(e) => setForm({ ...form, subscriptionId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar suscripción</option>
                  {subscriptions.map((subscription) => (
                    <option key={subscription.id} value={subscription.id}>
                      {subscription.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Tipo de recordatorio
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ReminderType })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="payment">Pago próximo</option>
                  <option value="renewal">Renovación</option>
                  <option value="trial_end">Fin de prueba</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Fecha de evento *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Días de anticipación
                </label>
                <select
                  value={form.daysBeforeReminder}
                  onChange={(e) => setForm({ ...form, daysBeforeReminder: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1">1 día antes</option>
                  <option value="3">3 días antes</option>
                  <option value="7">7 días antes</option>
                  <option value="14">14 días antes</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 p-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">Habilitado</span>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                    className="peer sr-only"
                  />
                  <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500" />
                  <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6" />
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOrUpdateReminder}
                disabled={saving || !form.subscriptionId || !form.date}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : editingReminderId ? "Guardar cambios" : "Crear recordatorio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
