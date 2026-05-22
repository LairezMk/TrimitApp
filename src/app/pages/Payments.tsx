import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  Calendar,
  TrendingDown,
  TrendingUp,
  Filter,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import {
  createUserPayment,
  subscribeToUserPayments,
  type UserPayment,
} from "../services/payments";
import type { Subscription } from "../types/subscription";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";

type DisplayPayment = {
  id: string;
  subscription: Subscription;
  date: Date;
  amount: number;
  status: "paid" | "upcoming";
  source: "manual" | "projected" | "imported";
  currency: string;
};

export default function Payments() {
  const { user } = useAuth();
  const { formatMoney, convertMoney } = useCurrencyDisplay();
  const [filter, setFilter] = useState<"all" | "paid" | "upcoming">("all");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newSubscriptionId, setNewSubscriptionId] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [addingPayment, setAddingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubSubs = subscribeToUserSubscriptions(
      user.uid,
      (data) => {
        setSubscriptions(data);
        if (!newSubscriptionId && data.length > 0) {
          setNewSubscriptionId(data[0].id);
          setNewAmount(String(data[0].amount));
        }
      },
      (err) => setError(err.message),
    );

    const unsubPayments = subscribeToUserPayments(
      user.uid,
      (data) => {
        setPayments(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      unsubSubs();
      unsubPayments();
    };
  }, [user, newSubscriptionId]);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === "active"),
    [subscriptions],
  );

  const upcomingProjected = useMemo<DisplayPayment[]>(() => {
    const paidBySubscription = new Map<string, UserPayment[]>();
    for (const payment of payments) {
      const list = paidBySubscription.get(payment.subscriptionId) || [];
      list.push(payment);
      paidBySubscription.set(payment.subscriptionId, list);
    }

    return activeSubscriptions.map((subscription) => {
      const recorded = paidBySubscription.get(subscription.id) || [];
      const newest = recorded
        .slice()
        .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())[0];

      return {
        id: `projected-${subscription.id}`,
        subscription,
        date: newest ? subscription.nextPaymentDate : subscription.nextPaymentDate,
        amount: subscription.amount,
        currency: subscription.currency,
        status: "upcoming",
        source: "projected",
      };
    });
  }, [activeSubscriptions, payments]);

  const paidTimeline = useMemo<DisplayPayment[]>(
    () =>
      payments.map((payment) => ({
        id: payment.id,
        subscription:
          subscriptions.find((sub) => sub.id === payment.subscriptionId) || {
            id: payment.subscriptionId,
            name: payment.subscriptionName,
            category: payment.category,
            amount: payment.amount,
            currency: payment.currency,
            status: "active",
            isRecurring: true,
            nextPaymentDate: payment.paymentDate,
            icon: payment.subscriptionName.charAt(0).toUpperCase() || "S",
            color: "bg-emerald-500",
          },
        date: payment.paymentDate,
        amount: payment.amount,
        currency: payment.currency,
        status: "paid",
        source: payment.source,
      })),
    [payments, subscriptions],
  );

  const allPayments = useMemo(
    () =>
      [...paidTimeline, ...upcomingProjected].sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      ),
    [paidTimeline, upcomingProjected],
  );

  const filteredPayments =
    filter === "all" ? allPayments : allPayments.filter((payment) => payment.status === filter);

  const totalPaid = paidTimeline.reduce(
    (sum, payment) => sum + convertMoney(payment.amount, payment.currency),
    0,
  );
  const totalUpcoming = upcomingProjected.reduce(
    (sum, payment) => sum + convertMoney(payment.amount, payment.currency),
    0,
  );

  const nextUpcoming = upcomingProjected
    .slice()
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  const getDaysUntilPayment = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddPayment = async () => {
    if (!user) {
      return;
    }

    const selected = subscriptions.find((subscription) => subscription.id === newSubscriptionId);
    if (!selected || !newAmount || !newDate) {
      return;
    }

    setAddingPayment(true);
    setError(null);

    try {
      await createUserPayment(user.uid, {
        subscriptionId: selected.id,
        subscriptionName: selected.name,
        category: selected.category,
        amount: Number(newAmount),
        currency: selected.currency,
        paymentDate: new Date(newDate),
        source: "manual",
        status: "paid",
      });
    } catch (err) {
      const text = err instanceof Error ? err.message : "No se pudo registrar el pago.";
      setError(text);
    } finally {
      setAddingPayment(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Historial de Pagos</h1>
        <p className="text-gray-500">
          Revisa tus pagos realizados y los próximos programados
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState
            title="Error al cargar pagos"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8"
        data-tour="payments-register"
      >
        <div className="flex items-center gap-3 mb-4">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg dark:text-white">Registrar pago</h2>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={newSubscriptionId}
            onChange={(e) => {
              setNewSubscriptionId(e.target.value);
              const selected = subscriptions.find((sub) => sub.id === e.target.value);
              if (selected) {
                setNewAmount(String(selected.amount));
              }
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          >
            {subscriptions.map((subscription) => (
              <option key={subscription.id} value={subscription.id}>
                {subscription.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Monto"
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          />
          <button
            onClick={handleAddPayment}
            disabled={addingPayment || !subscriptions.length}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {addingPayment ? "Guardando..." : "Agregar pago"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-8" data-tour="payments-stats">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Total pagado</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl text-red-600">{formatMoney(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-1">{paidTimeline.length} pagos realizados</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Próximos pagos</p>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl text-emerald-600">{formatMoney(totalUpcoming)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {upcomingProjected.length} pagos programados
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-sm text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-emerald-100 text-sm">Próximo pago</p>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl">
            {nextUpcoming ? `${getDaysUntilPayment(nextUpcoming.date)} días` : "--"}
          </p>
            <p className="text-xs text-emerald-100 mt-1">
              {nextUpcoming
                ? `${nextUpcoming.subscription.name} - ${formatMoney(nextUpcoming.amount, nextUpcoming.currency)}`
                : "Sin pagos próximos"}
            </p>
        </div>
      </div>

      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
        data-tour="payments-filters"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Filtrar por:</span>
          </div>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
            {(["all", "paid", "upcoming"] as const).map((targetFilter) => (
              <button
                key={targetFilter}
                onClick={() => setFilter(targetFilter)}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  filter === targetFilter
                    ? "bg-white dark:bg-gray-800 shadow-sm dark:text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {targetFilter === "all"
                  ? "Todos"
                  : targetFilter === "paid"
                  ? "Pagados"
                  : "Próximos"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        data-tour="payments-timeline"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl dark:text-white">Cronología de Pagos</h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading && (
            <div className="p-6">
              <LoadingState title="Cargando pagos..." />
            </div>
          )}
          {!loading &&
            filteredPayments.map((payment, index) => {
              const isUpcoming = payment.status === "upcoming";
              const daysUntil = isUpcoming ? getDaysUntilPayment(payment.date) : null;

              return (
                <div
                  key={payment.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isUpcoming ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isUpcoming
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
                        }`}
                      >
                        {isUpcoming ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                      </div>
                      {index < filteredPayments.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                      )}
                    </div>

                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 ${payment.subscription.color} rounded-xl flex items-center justify-center text-white text-lg`}
                        >
                          {payment.subscription.icon}
                        </div>
                        <div>
                          <h3 className="font-medium dark:text-white">
                            {payment.subscription.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.subscription.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-lg dark:text-white">
                          {formatMoney(payment.amount, payment.currency)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(payment.date, "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                        </div>
                        {isUpcoming && daysUntil !== null && (
                          <p
                            className={`text-xs mt-1 ${
                              daysUntil <= 3
                                ? "text-red-600 font-medium"
                                : daysUntil <= 7
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {daysUntil === 0
                              ? "Hoy"
                              : daysUntil === 1
                              ? "Mañana"
                              : daysUntil < 0
                              ? "Vencido"
                              : `En ${daysUntil} días`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isUpcoming
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {isUpcoming ? "Programado" : "Pagado"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          {!loading && filteredPayments.length === 0 && (
            <div className="p-6">
              <EmptyState
                title="No hay pagos para este filtro"
                description="Prueba con otro filtro o registra tu primer pago manual."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
