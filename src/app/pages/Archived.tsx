import { useEffect, useMemo, useState } from "react";
import { Archive, RotateCcw, Search, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteUserSubscription,
  subscribeToUserSubscriptions,
  updateUserSubscription,
} from "../services/subscriptions";
import type { Subscription } from "../types/subscription";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";

function toCurrencyCode(currency: string) {
  if (currency === "USD" || currency === "EUR" || currency === "COP") {
    return currency;
  }
  return "COP";
}

function formatCurrency(value: number, currency: string) {
  const code = toCurrencyCode(currency);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "COP" ? 0 : 2,
  }).format(value);
}

export default function Archived() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserSubscriptions(
      user.uid,
      (data) => {
        setSubscriptions(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const archivedSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === "suspended"),
    [subscriptions],
  );

  const categories = useMemo(
    () => Array.from(new Set(archivedSubscriptions.map((item) => item.category))).sort(),
    [archivedSubscriptions],
  );

  const filteredSubscriptions = useMemo(
    () =>
      archivedSubscriptions.filter((subscription) => {
        const matchesSearch = subscription.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" || subscription.category === categoryFilter;
        return matchesSearch && matchesCategory;
      }),
    [archivedSubscriptions, searchTerm, categoryFilter],
  );

  const totalSavedMonthly = archivedSubscriptions.reduce(
    (sum, subscription) => sum + subscription.amount,
    0,
  );
  const totalSavedYearly = totalSavedMonthly * 12;

  const handleRestore = async (subscription: Subscription) => {
    if (!user) {
      return;
    }
    setProcessingId(subscription.id);
    setError(null);
    try {
      await updateUserSubscription(user.uid, subscription.id, {
        name: subscription.name,
        category: subscription.category,
        amount: subscription.amount,
        currency: subscription.currency,
        status: "active",
        isRecurring: subscription.isRecurring,
        nextPaymentDate: subscription.nextPaymentDate,
        icon: subscription.icon,
        color: subscription.color,
        notes: subscription.notes || "",
        source: subscription.source || "manual",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo restaurar la suscripción.";
      setError(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (subscriptionId: string) => {
    if (!user) {
      return;
    }
    setProcessingId(subscriptionId);
    setError(null);
    try {
      await deleteUserSubscription(user.uid, subscriptionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar la suscripción.";
      setError(message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Suscripciones Archivadas</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Aquí ves suscripciones pausadas. Puedes restaurarlas o eliminarlas.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState title="No se pudo procesar la acción" message={error} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-emerald-100 text-sm mb-1">Ahorro mensual actual</p>
          <p className="text-3xl font-bold">{formatCurrency(totalSavedMonthly, "COP")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Ahorro anual estimado</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalSavedYearly, "COP")}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total archivadas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {archivedSubscriptions.length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar suscripción archivada..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <LoadingState title="Cargando suscripciones archivadas..." />}

      {!loading && filteredSubscriptions.length === 0 && (
        <EmptyState
          icon={Archive}
          title="No hay suscripciones archivadas"
          description="Cuando pauses una suscripción activa, aparecerá aquí."
        />
      )}

      <div className="space-y-4">
        {filteredSubscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${subscription.color} rounded-xl flex items-center justify-center text-white text-lg font-semibold opacity-80`}
                >
                  {subscription.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subscription.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscription.category} · Próximo cobro detenido:{" "}
                    {subscription.nextPaymentDate.toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm md:text-base font-semibold text-emerald-600">
                  Ahorras {formatCurrency(subscription.amount, subscription.currency)}
                </p>
                <button
                  onClick={() => handleRestore(subscription)}
                  disabled={processingId === subscription.id}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar
                </button>
                <button
                  onClick={() => handleDelete(subscription.id)}
                  disabled={processingId === subscription.id}
                  className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
