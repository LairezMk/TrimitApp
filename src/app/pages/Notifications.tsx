import { useEffect, useMemo, useState, type ComponentType } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock3,
  Info,
  MailCheck,
  MailWarning,
  RefreshCw,
  Trash2,
  Filter,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserSubscriptions, type Subscription } from "../services/subscriptions";
import { subscribeToUserPayments, type UserPayment } from "../services/payments";
import { subscribeToUserReminders, type UserReminder } from "../services/reminders";
import {
  clearAllNotifications,
  createUserNotification,
  deleteReadNotifications,
  deleteUserNotification,
  markAllNotificationsAsRead,
  subscribeToUserNotifications,
  updateUserNotification,
  type UserNotification,
} from "../services/notifications";
import {
  clearUserEmailReminderEventsByState,
  deleteUserEmailReminderEvent,
  subscribeToUserEmailReminderEvents,
  type EmailReminderEvent,
} from "../services/emailReminderEvents";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";

type FilterMode = "all" | "unread" | "warning" | "success" | "info" | "payment";

function daysBetween(baseDate: Date, targetDate: Date) {
  const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).getTime();
  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  ).getTime();
  return Math.round((target - base) / (1000 * 60 * 60 * 24));
}

function buildFingerprint(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 140);
}

export default function Notifications() {
  const { user } = useAuth();
  const { formatMoney } = useCurrencyDisplay();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [reminders, setReminders] = useState<UserReminder[]>([]);
  const [emailReminderEvents, setEmailReminderEvents] = useState<EmailReminderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setSubscriptions([]);
      setPayments([]);
      setReminders([]);
      setEmailReminderEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubNotifications = subscribeToUserNotifications(
      user.uid,
      (data) => {
        setNotifications(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    const unsubSubscriptions = subscribeToUserSubscriptions(
      user.uid,
      setSubscriptions,
      (err) => setError(err.message),
    );
    const unsubPayments = subscribeToUserPayments(user.uid, setPayments, (err) =>
      setError(err.message),
    );
    const unsubReminders = subscribeToUserReminders(user.uid, setReminders, (err) =>
      setError(err.message),
    );
    const unsubEmailReminderEvents = subscribeToUserEmailReminderEvents(
      user.uid,
      setEmailReminderEvents,
      (err) => setError(err.message),
    );

    return () => {
      unsubNotifications();
      unsubSubscriptions();
      unsubPayments();
      unsubReminders();
      unsubEmailReminderEvents();
    };
  }, [user]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const filteredNotifications = useMemo(() => {
    if (filterMode === "all") {
      return notifications;
    }
    if (filterMode === "unread") {
      return notifications.filter((item) => !item.read);
    }
    return notifications.filter((item) => item.type === filterMode);
  }, [notifications, filterMode]);

  const syncRealNotifications = async () => {
    if (!user) {
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const now = new Date();
      const fingerprintSet = new Set(
        notifications.map((item) => item.fingerprint).filter(Boolean) as string[],
      );
      const queuedFingerprints = new Set<string>();
      const queue: Array<Parameters<typeof createUserNotification>[1]> = [];

      subscriptions
        .filter((subscription) => subscription.status === "active")
        .forEach((subscription) => {
          const days = daysBetween(now, subscription.nextPaymentDate);
          if (days >= 0 && days <= 7) {
            const fingerprint = buildFingerprint(`due-${subscription.id}-${subscription.nextPaymentDate.toISOString().slice(0, 10)}`);
            if (!fingerprintSet.has(fingerprint) && !queuedFingerprints.has(fingerprint)) {
              queuedFingerprints.add(fingerprint);
              queue.push({
                type: "warning",
                title: `Pago próximo: ${subscription.name}`,
                message: `Tu suscripción se renovará en ${days} día(s) por ${formatMoney(subscription.amount, subscription.currency)}.`,
                fingerprint,
                relatedSubscriptionId: subscription.id,
              });
            }
          }
        });

      payments
        .filter((payment) => payment.status === "failed")
        .filter((payment) => {
          const daysSinceFailure = daysBetween(payment.paymentDate, now);
          return daysSinceFailure >= 0 && daysSinceFailure <= 30;
        })
        .forEach((payment) => {
          const fingerprint = buildFingerprint(`failed-${payment.id}`);
          if (!fingerprintSet.has(fingerprint) && !queuedFingerprints.has(fingerprint)) {
            queuedFingerprints.add(fingerprint);
            queue.push({
              type: "warning",
              title: `Pago fallido: ${payment.subscriptionName}`,
              message: `Se detectó un pago fallido por ${formatMoney(payment.amount, payment.currency)}.`,
              fingerprint,
              relatedPaymentId: payment.id,
              relatedSubscriptionId: payment.subscriptionId,
            });
          }
        });

      reminders
        .filter((reminder) => reminder.enabled)
        .forEach((reminder) => {
          const days = daysBetween(now, reminder.date);
          if (days >= 0 && days <= 7) {
            const fingerprint = buildFingerprint(`reminder-${reminder.id}-${reminder.date.toISOString().slice(0, 10)}`);
            if (!fingerprintSet.has(fingerprint) && !queuedFingerprints.has(fingerprint)) {
              queuedFingerprints.add(fingerprint);
              queue.push({
                type: "info",
                title: `Recordatorio: ${reminder.subscriptionName}`,
                message: `Tienes un recordatorio programado para ${format(reminder.date, "d 'de' MMMM", { locale: es })}.`,
                fingerprint,
                relatedSubscriptionId: reminder.subscriptionId,
              });
            }
          }
        });

      if (queue.length === 0) {
        return;
      }

      await Promise.all(queue.map((item) => createUserNotification(user.uid, item)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo sincronizar notificaciones.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleRead = async (notification: UserNotification) => {
    if (!user) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateUserNotification(user.uid, notification.id, { read: !notification.read });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar la notificación.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteOne = async (notificationId: string) => {
    if (!user) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteUserNotification(user.uid, notificationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo borrar la notificación.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron marcar como leídas.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteRead = async () => {
    if (!user) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteReadNotifications(user.uid);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron borrar las leídas.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleClearAll = async () => {
    if (!user) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await clearAllNotifications(user.uid);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron borrar todas las notificaciones.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const reminderQueued = emailReminderEvents.filter((item) => item.state === "queued").length;
  const reminderSent = emailReminderEvents.filter((item) => item.state === "sent").length;
  const reminderRetried = emailReminderEvents.filter((item) => item.state === "retried").length;
  const reminderFailed = emailReminderEvents.filter((item) => item.state === "failed").length;

  const handleClearCompletedEmailEvents = async () => {
    if (!user) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await clearUserEmailReminderEventsByState(user.uid, ["sent", "failed"]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo limpiar el historial de correos.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <LoadingState title="Cargando notificaciones..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Notificaciones</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificaciones sin leer`
              : "Estás al día"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={syncRealNotifications}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-cyan-300 text-cyan-700 hover:bg-cyan-50 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />
            Sincronizar
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={busy || unreadCount === 0}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 inline-flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas leídas
          </button>
          <button
            onClick={handleDeleteRead}
            disabled={busy || notifications.every((item) => !item.read)}
            className="px-4 py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
          >
            Borrar leídas
          </button>
          <button
            onClick={handleClearAll}
            disabled={busy || notifications.length === 0}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Borrar todo
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState title="No se pudo completar la acción" message={error} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6">
        <StatCard icon={Bell} label="Total" value={String(notifications.length)} />
        <StatCard icon={AlertCircle} label="Sin leer" value={String(unreadCount)} />
        <StatCard
          icon={CheckCircle}
          label="Leídas"
          value={String(notifications.length - unreadCount)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6">
        <StatCard icon={Clock3} label="Correos en cola" value={String(reminderQueued)} />
        <StatCard icon={MailCheck} label="Correos enviados" value={String(reminderSent)} />
        <StatCard icon={RefreshCw} label="Correos reintentados" value={String(reminderRetried)} />
        <StatCard icon={MailWarning} label="Correos fallidos" value={String(reminderFailed)} />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={filterMode}
          onChange={(event) => setFilterMode(event.target.value as FilterMode)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm"
        >
          <option value="all">Todas</option>
          <option value="unread">Sin leer</option>
          <option value="warning">Advertencias</option>
          <option value="success">Éxito</option>
          <option value="info">Informativas</option>
          <option value="payment">Pagos</option>
        </select>
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          title="No hay notificaciones para este filtro"
          description="Puedes sincronizar para generar notificaciones con base en tus datos reales."
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {filteredNotifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              busy={busy}
              onToggleRead={() => handleToggleRead(notification)}
              onDelete={() => handleDeleteOne(notification.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl dark:text-white">Estado de recordatorios por correo</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pipeline real del backend: queued, sent, retried y failed.
            </p>
          </div>
          <button
            onClick={handleClearCompletedEmailEvents}
            disabled={busy || emailReminderEvents.length === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Limpiar enviados/fallidos
          </button>
        </div>

        {emailReminderEvents.length === 0 ? (
          <EmptyState
            title="Sin eventos de correo todavía"
            description="Cuando el backend programe recordatorios, aquí verás su estado."
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {emailReminderEvents.slice(0, 30).map((event) => (
              <div key={event.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <div className="flex-1">
                  <p className="font-medium dark:text-white">{event.subscriptionName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Estado:{" "}
                    <span className="uppercase tracking-wide">{event.state}</span>{" "}
                    • Intentos: {event.attempts}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Programado:{" "}
                    {format(event.scheduledFor, "d 'de' MMMM 'de' yyyy", { locale: es })}
                    {event.lastError ? ` • Error: ${event.lastError}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => user && deleteUserEmailReminderEvent(user.uid, event.id)}
                  disabled={busy}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                  title="Borrar evento"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-600" />
        </div>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function NotificationRow({
  notification,
  busy,
  onToggleRead,
  onDelete,
}: {
  notification: UserNotification;
  busy: boolean;
  onToggleRead: () => void;
  onDelete: () => void;
}) {
  const iconByType = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    payment: <Bell className="w-5 h-5 text-cyan-600" />,
  } as const;

  const bgByType = {
    success: "bg-emerald-50 dark:bg-emerald-900/20",
    warning: "bg-amber-50 dark:bg-amber-900/20",
    info: "bg-blue-50 dark:bg-blue-900/20",
    payment: "bg-cyan-50 dark:bg-cyan-900/20",
  } as const;

  return (
    <div
      className={`p-5 ${notification.read ? "bg-white dark:bg-gray-800" : bgByType[notification.type]}`}
    >
      <div className="flex gap-4">
        <div className="mt-1">{iconByType[notification.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
            {!notification.read && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {format(notification.createdAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <button
            onClick={onToggleRead}
            disabled={busy}
            className="text-xs px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {notification.read ? "No leída" : "Leída"}
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="text-gray-400 hover:text-red-500 disabled:opacity-50"
            title="Borrar notificación"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
