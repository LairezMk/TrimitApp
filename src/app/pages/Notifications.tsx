import { useEffect, useMemo, useState, type ComponentType } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock3,
  Edit2,
  Info,
  Mail,
  MailCheck,
  MailWarning,
  Save,
  RefreshCw,
  Trash2,
  Filter,
  CheckCheck,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserSubscriptions, type Subscription } from "../services/subscriptions";
import { subscribeToUserPayments, type UserPayment } from "../services/payments";
import {
  createUserReminder,
  deleteUserReminder,
  subscribeToUserReminders,
  updateUserReminder,
  type ReminderEmailMode,
  type ReminderType,
  type UserReminder,
} from "../services/reminders";
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
  createUserEmailReminderEvent,
  deleteUserEmailReminderEvent,
  subscribeToUserEmailReminderEvents,
  type EmailReminderEvent,
} from "../services/emailReminderEvents";
import { sendReminderEmailNow } from "../services/reminderEmails";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { dateFromInputValue, dateToInputValue } from "../utils/date";
import { db } from "../lib/firebase";

type FilterMode = "all" | "unread" | "warning" | "success" | "info" | "payment";

type ReminderFormState = {
  subscriptionId: string;
  type: ReminderType;
  date: string;
  daysBeforeReminder: string;
  enabled: boolean;
  emailMode: ReminderEmailMode;
  emailOnceDate: string;
  emailIntervalDays: string;
};

const initialReminderForm: ReminderFormState = {
  subscriptionId: "",
  type: "payment",
  date: "",
  daysBeforeReminder: "3",
  enabled: true,
  emailMode: "none",
  emailOnceDate: "",
  emailIntervalDays: "7",
};

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
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [reminderForm, setReminderForm] = useState<ReminderFormState>(initialReminderForm);
  const [savingReminder, setSavingReminder] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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

  const upcomingSubscriptions = useMemo(
    () =>
      subscriptions
        .filter((subscription) => subscription.status === "active")
        .slice()
        .sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime()),
    [subscriptions],
  );

  const reminderBySubscription = useMemo(() => {
    const bySubscription = new Map<string, UserReminder>();
    reminders
      .filter((reminder) => reminder.type === "payment")
      .forEach((reminder) => {
        const existing = bySubscription.get(reminder.subscriptionId);
        if (!existing || reminder.date.getTime() < existing.date.getTime()) {
          bySubscription.set(reminder.subscriptionId, reminder);
        }
      });

    return bySubscription;
  }, [reminders]);

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

  const closeReminderModal = () => {
    setReminderModalOpen(false);
    setEditingReminderId(null);
    setReminderForm(initialReminderForm);
  };

  const openReminderEditor = (subscription: Subscription) => {
    const existing = reminderBySubscription.get(subscription.id);
    setError(null);
    setActionMessage(null);
    setEditingReminderId(existing?.id || null);
    setReminderForm(
      existing
        ? {
            subscriptionId: existing.subscriptionId,
            type: existing.type,
            date: dateToInputValue(existing.date),
            daysBeforeReminder: String(existing.daysBeforeReminder),
            enabled: existing.enabled,
            emailMode: existing.emailMode || "none",
            emailOnceDate: existing.emailOnceDate ? dateToInputValue(existing.emailOnceDate) : "",
            emailIntervalDays: String(existing.emailIntervalDays || 7),
          }
        : {
            ...initialReminderForm,
            subscriptionId: subscription.id,
            date: dateToInputValue(subscription.nextPaymentDate),
            emailOnceDate: dateToInputValue(subscription.nextPaymentDate),
          },
    );
    setReminderModalOpen(true);
  };

  const handleSaveReminder = async () => {
    if (!user) {
      return;
    }

    const selectedSubscription = subscriptions.find(
      (subscription) => subscription.id === reminderForm.subscriptionId,
    );
    if (!selectedSubscription || !reminderForm.date) {
      setError("Selecciona una suscripción y fecha válidas.");
      return;
    }

    setSavingReminder(true);
    setError(null);
    setActionMessage(null);

    try {
      const emailMode = reminderForm.emailMode;
      const payload = {
        subscriptionId: selectedSubscription.id,
        subscriptionName: selectedSubscription.name,
        type: reminderForm.type,
        date: dateFromInputValue(reminderForm.date),
        daysBeforeReminder: Number(reminderForm.daysBeforeReminder || 0),
        enabled: reminderForm.enabled,
        emailMode,
        emailOnceDate:
          emailMode === "once" && reminderForm.emailOnceDate
            ? dateFromInputValue(reminderForm.emailOnceDate)
            : null,
        emailIntervalDays:
          emailMode === "interval" ? Number(reminderForm.emailIntervalDays || 1) : 0,
        icon: selectedSubscription.icon || selectedSubscription.name.charAt(0).toUpperCase(),
        color: selectedSubscription.color || "bg-emerald-500",
      };

      if (editingReminderId) {
        await updateUserReminder(user.uid, editingReminderId, payload);
      } else {
        await createUserReminder(user.uid, payload);
      }

      if (emailMode !== "none") {
        await setDoc(
          doc(db, "users", user.uid),
          {
            preferences: {
              emailEnabled: true,
              paymentReminderEmail5d: true,
              paymentReminderEmailUnsubscribed: false,
              paymentReminderEmailConsent: {
                acceptedAt: new Date().toISOString(),
                source: "notifications_reminder_editor",
              },
            },
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      closeReminderModal();
      setActionMessage(
        emailMode === "none"
          ? "Recordatorio guardado. Puedes activar el correo cuando quieras probarlo."
          : "Recordatorio por correo guardado. Ya puedes enviar una prueba desde la lista.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar el recordatorio.";
      setError(message);
    } finally {
      setSavingReminder(false);
    }
  };

  const handleDeleteReminder = async () => {
    if (!user || !editingReminderId) {
      return;
    }

    setSavingReminder(true);
    setError(null);
    setActionMessage(null);
    try {
      await deleteUserReminder(user.uid, editingReminderId);
      closeReminderModal();
      setActionMessage("Recordatorio eliminado correctamente.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el recordatorio.";
      setError(message);
    } finally {
      setSavingReminder(false);
    }
  };

  const handleSendReminderEmailNow = async (reminder: UserReminder) => {
    if (!user) {
      return;
    }

    setSendingReminderId(reminder.id);
    setError(null);
    setActionMessage(null);
    try {
      const subscription = subscriptions.find((item) => item.id === reminder.subscriptionId);
      const paymentDate = reminder.date || subscription?.nextPaymentDate || new Date();
      const daysBefore = Math.max(0, daysBetween(new Date(), paymentDate));
      const subscriptionName =
        subscription?.name || reminder.subscriptionName || "Suscripción";
      const amount = Number(subscription?.amount || 0);
      const currency = subscription?.currency || "COP";
      const toEmail = user.email || "";

      const result = await sendReminderEmailNow({
        reminderId: reminder.id,
        toEmail,
        userName: user.displayName || "Usuario",
        subscriptionName,
        amountLabel: subscription ? formatMoney(subscription.amount, subscription.currency) : "$ 0",
        paymentDateLabel: format(paymentDate, "d 'de' MMMM 'de' yyyy", { locale: es }),
        daysBefore,
        appUrl: `${window.location.origin}/notifications`,
      });

      if (result.provider === "emailjs") {
        await createUserEmailReminderEvent(user.uid, {
          eventId: `manual-emailjs-${reminder.id}-${Date.now()}`,
          subscriptionId: reminder.subscriptionId,
          subscriptionName,
          amount,
          currency,
          to: toEmail,
          reminderDays: daysBefore,
          scheduledFor: paymentDate,
          provider: "emailjs",
        });
      }

      setActionMessage(
        result.provider === "emailjs"
          ? "Correo enviado por EmailJS. Revisa tu bandeja de entrada en unos segundos."
          : result.provider === "mail_collection"
          ? "Correo de recordatorio en cola. Se enviará cuando el servicio de correo lo procese."
          : "Correo de recordatorio enviado. Revisa tu bandeja de entrada en unos segundos.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo enviar el correo de recordatorio.";
      setError(message);
    } finally {
      setSendingReminderId(null);
    }
  };

  const getEmailModeLabel = (reminder?: UserReminder) => {
    if (!reminder || reminder.emailMode === "none") {
      return "Sin correo";
    }

    if (reminder.emailMode === "once") {
      return reminder.emailOnceDate
        ? `Correo el ${format(reminder.emailOnceDate, "d 'de' MMMM", { locale: es })}`
        : "Correo una vez";
    }

    if (reminder.emailMode === "interval") {
      return `Correo cada ${reminder.emailIntervalDays || 1} días`;
    }

    return `Correo ${reminder.daysBeforeReminder} días antes`;
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
          <h1 className="text-3xl mb-2 dark:text-white">Notificaciones y recordatorios</h1>
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

      {actionMessage && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100">
          {actionMessage}
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

      <div
        className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        data-tour="notifications-reminders"
      >
        <div className="border-b border-gray-100 p-5 dark:border-gray-700">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold dark:text-white">
                Próximos pagos y recordatorios
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Edita cómo quieres recibir avisos por cada pago próximo.
              </p>
            </div>
            <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {upcomingSubscriptions.length} pagos activos
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {upcomingSubscriptions.slice(0, 10).map((subscription) => {
            const reminder = reminderBySubscription.get(subscription.id);
            const daysUntil = daysBetween(new Date(), subscription.nextPaymentDate);

            return (
              <div
                key={subscription.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${subscription.color} text-lg font-bold text-white`}
                  >
                    {subscription.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {subscription.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(subscription.nextPaymentDate, "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </span>
                      <span>{formatMoney(subscription.amount, subscription.currency)}</span>
                      <span>
                        {daysUntil < 0
                          ? "Vencido"
                          : daysUntil === 0
                            ? "Hoy"
                            : `En ${daysUntil} días`}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                      {reminder
                        ? `${reminder.enabled ? "Activo" : "Pausado"} · ${getEmailModeLabel(reminder)}`
                        : "Sin recordatorio configurado"}
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[180px]">
                  <button
                    type="button"
                    onClick={() => openReminderEditor(subscription)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
                  >
                    <Edit2 className="h-4 w-4" />
                    {reminder ? "Editar aviso" : "Crear aviso"}
                  </button>
                  {reminder && reminder.emailMode !== "none" && (
                    <button
                      type="button"
                      onClick={() => handleSendReminderEmailNow(reminder)}
                      disabled={sendingReminderId === reminder.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Mail className="h-4 w-4" />
                      {sendingReminderId === reminder.id ? "Enviando..." : "Enviar correo"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {upcomingSubscriptions.length === 0 && (
            <div className="p-5">
              <EmptyState
                title="No hay próximos pagos activos"
                description="Agrega suscripciones activas para configurar recordatorios."
              />
            </div>
          )}
        </div>
      </div>

      <div data-tour="notifications-list">
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
      </div>

      <div className="mt-8" data-tour="notifications-email-status">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl dark:text-white">Estado de recordatorios por correo</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Consulta el estado de los correos de recordatorio programados.
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
            title="Sin recordatorios por correo todavía"
            description="Cuando tengas recordatorios programados, aquí podrás revisar su estado."
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

      {reminderModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-emerald-300/20 bg-white p-5 shadow-2xl dark:bg-gray-900 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingReminderId ? "Editar recordatorio" : "Crear recordatorio"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Define cuándo Trimit debe avisarte y si quieres recibir correos.
                </p>
              </div>
              <button
                type="button"
                onClick={closeReminderModal}
                className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Suscripción
                </label>
                <select
                  value={reminderForm.subscriptionId}
                  onChange={(event) => {
                    const selected = subscriptions.find(
                      (subscription) => subscription.id === event.target.value,
                    );
                    setReminderForm((prev) => ({
                      ...prev,
                      subscriptionId: event.target.value,
                      date: selected ? dateToInputValue(selected.nextPaymentDate) : prev.date,
                      emailOnceDate: selected
                        ? dateToInputValue(selected.nextPaymentDate)
                        : prev.emailOnceDate,
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Seleccionar suscripción</option>
                  {subscriptions
                    .filter((subscription) => subscription.status === "active")
                    .map((subscription) => (
                      <option key={subscription.id} value={subscription.id}>
                        {subscription.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Fecha del pago
                </label>
                <input
                  type="date"
                  value={reminderForm.date}
                  onChange={(event) =>
                    setReminderForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Aviso interno
                </label>
                <select
                  value={reminderForm.daysBeforeReminder}
                  onChange={(event) =>
                    setReminderForm((prev) => ({
                      ...prev,
                      daysBeforeReminder: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="0">El mismo día</option>
                  <option value="1">1 día antes</option>
                  <option value="3">3 días antes</option>
                  <option value="5">5 días antes</option>
                  <option value="7">7 días antes</option>
                  <option value="14">14 días antes</option>
                </select>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  <Mail className="h-4 w-4" />
                  Recordatorio por correo
                </label>
                <select
                  value={reminderForm.emailMode}
                  onChange={(event) =>
                    setReminderForm((prev) => ({
                      ...prev,
                      emailMode: event.target.value as ReminderEmailMode,
                    }))
                  }
                  className="w-full rounded-lg border border-emerald-200 bg-white px-4 py-2.5 dark:border-emerald-500/30 dark:bg-gray-900 dark:text-white"
                >
                  <option value="none">No enviar correo</option>
                  <option value="days_before">Enviar faltando X días</option>
                  <option value="once">Enviar solo una vez en fecha específica</option>
                  <option value="interval">Enviar cada cierto tiempo</option>
                </select>

                {reminderForm.emailMode === "days_before" && (
                  <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
                    Se enviará usando la misma anticipación configurada arriba.
                  </p>
                )}

                {reminderForm.emailMode === "once" && (
                  <div className="mt-3">
                    <label className="mb-1.5 block text-xs font-medium text-emerald-900 dark:text-emerald-100">
                      Fecha exacta del correo
                    </label>
                    <input
                      type="date"
                      value={reminderForm.emailOnceDate}
                      onChange={(event) =>
                        setReminderForm((prev) => ({
                          ...prev,
                          emailOnceDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-emerald-200 bg-white px-4 py-2.5 dark:border-emerald-500/30 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                )}

                {reminderForm.emailMode === "interval" && (
                  <div className="mt-3">
                    <label className="mb-1.5 block text-xs font-medium text-emerald-900 dark:text-emerald-100">
                      Frecuencia del correo
                    </label>
                    <select
                      value={reminderForm.emailIntervalDays}
                      onChange={(event) =>
                        setReminderForm((prev) => ({
                          ...prev,
                          emailIntervalDays: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-emerald-200 bg-white px-4 py-2.5 dark:border-emerald-500/30 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="1">Cada día</option>
                      <option value="3">Cada 3 días</option>
                      <option value="7">Cada semana</option>
                      <option value="15">Cada 15 días</option>
                    </select>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:col-span-2">
                Recordatorio activo
                <input
                  type="checkbox"
                  checked={reminderForm.enabled}
                  onChange={(event) =>
                    setReminderForm((prev) => ({ ...prev, enabled: event.target.checked }))
                  }
                  className="h-5 w-5 accent-emerald-500"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {editingReminderId && (
                <button
                  type="button"
                  onClick={handleDeleteReminder}
                  disabled={savingReminder}
                  className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-500/10"
                >
                  Eliminar
                </button>
              )}
              <button
                type="button"
                onClick={closeReminderModal}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 sm:ml-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveReminder}
                disabled={savingReminder || !reminderForm.subscriptionId || !reminderForm.date}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {savingReminder ? "Guardando..." : "Guardar recordatorio"}
              </button>
            </div>
          </div>
        </div>
      )}
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
            {format(notification.createdAt, "d 'de' MMMM 'de' yyyy", { locale: es })}
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
