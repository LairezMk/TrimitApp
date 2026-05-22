import { useEffect, useMemo, useState } from "react";
import { AlertCircle, DollarSign, PlusCircle, Save, TrendingDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import { getUserBudget, upsertUserBudget, type BudgetCategory } from "../services/budgets";
import type { Subscription } from "../types/subscription";
import { EmptyState, ErrorState, LoadingState } from "../components/PageStates";

export default function Budget() {
  const { user } = useAuth();
  const { formatMoney, convertMoney } = useCurrencyDisplay();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLimit, setNewCategoryLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBudget = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const budget = await getUserBudget(user.uid);
        setTotalBudget(budget.totalBudget);
        setCategories(budget.categories);
      } finally {
        setLoading(false);
      }
    };

    void loadBudget();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToUserSubscriptions(
      user.uid,
      (data) => setSubscriptions(data.filter((sub) => sub.status === "active")),
      () => undefined,
    );
  }, [user]);

  const categorySpent = useMemo(() => {
    const map = new Map<string, number>();
    for (const sub of subscriptions) {
      map.set(
        sub.category,
        (map.get(sub.category) || 0) + convertMoney(sub.amount, sub.currency),
      );
    }
    return map;
  }, [subscriptions, convertMoney]);

  const totalSpent = useMemo(
    () => subscriptions.reduce((sum, sub) => sum + convertMoney(sub.amount, sub.currency), 0),
    [subscriptions, convertMoney],
  );

  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !newCategoryLimit) {
      return;
    }

    const category: BudgetCategory = {
      id: `${newCategoryName.trim().toLowerCase()}-${Date.now()}`,
      name: newCategoryName.trim(),
      limit: Number(newCategoryLimit),
    };

    setCategories((prev) => [...prev, category]);
    setNewCategoryName("");
    setNewCategoryLimit("");
  };

  const handleCategoryLimitChange = (id: string, limit: number) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, limit: Number(limit || 0) } : category,
      ),
    );
  };

  const handleSaveBudget = async () => {
    if (!user) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await upsertUserBudget(user.uid, { totalBudget, categories });
      setMessage("Presupuesto guardado correctamente.");
    } catch (err) {
      const text = err instanceof Error ? err.message : "No se pudo guardar.";
      setError(text);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <LoadingState title="Cargando presupuesto..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Presupuesto</h1>
          <p className="text-gray-500">Gestiona tus límites de gasto mensuales</p>
        </div>
        <button
          onClick={handleSaveBudget}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors disabled:opacity-60"
        >
          <Save className="w-5 h-5" />
          {saving ? "Guardando..." : "Guardar presupuesto"}
        </button>
      </div>

      <div
        className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg mb-8"
        data-tour="budget-overview"
      >
        <div className="grid md:grid-cols-2 gap-6 items-end">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Presupuesto Mensual</p>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value || 0))}
              className="w-full max-w-sm px-4 py-2 rounded-lg bg-white/15 border border-white/30 text-white placeholder:text-emerald-100"
            />
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Gastado actual</p>
            <p className="text-3xl font-bold">{formatMoney(totalSpent)}</p>
          </div>
        </div>

        <div className="bg-emerald-400/30 rounded-full h-4 my-5 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Gastado</p>
            <p className="text-2xl font-bold">{formatMoney(totalSpent)}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Restante</p>
            <p className="text-2xl font-bold">{formatMoney(remaining)}</p>
          </div>
        </div>
      </div>

      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
        data-tour="budget-categories"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold dark:text-white">Presupuesto por Categoría</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Categoría"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 w-full sm:w-auto"
            />
            <input
              type="number"
              value={newCategoryLimit}
              onChange={(e) => setNewCategoryLimit(e.target.value)}
              placeholder="Límite"
              className="px-3 py-2 w-full sm:w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            />
            <button
              onClick={handleAddCategory}
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map((category) => {
            const spent = categorySpent.get(category.name) || 0;
            const percentage = category.limit > 0 ? (spent / category.limit) * 100 : 0;
            const isNearLimit = percentage >= 80;
            const isOverLimit = percentage >= 100;

            return (
              <div key={category.id}>
                <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium dark:text-white">{category.name}</h3>
                    {isNearLimit && (
                      <AlertCircle
                        className={`w-4 h-4 ${
                          isOverLimit ? "text-red-500" : "text-amber-500"
                        }`}
                      />
                    )}
                  </div>
                  <input
                    type="number"
                    value={category.limit}
                    onChange={(e) =>
                      handleCategoryLimitChange(category.id, Number(e.target.value || 0))
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 w-28"
                  />
                  <div className="text-right">
                    <span className="font-bold dark:text-white">{formatMoney(spent)}</span>
                  </div>
                </div>

                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverLimit
                        ? "bg-red-500"
                        : isNearLimit
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between mt-1">
                  <span
                    className={`text-xs ${
                      isOverLimit
                        ? "text-red-600 font-medium"
                        : isNearLimit
                        ? "text-amber-600"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {percentage.toFixed(0)}% utilizado
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatMoney(category.limit - spent)} restante
                  </span>
                </div>
              </div>
            );
          })}
          {categories.length === 0 && (
            <EmptyState
              title="No hay categorías de presupuesto"
              description="Agrega una categoría y su límite para comenzar a controlar el gasto."
            />
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorState
            title="Error de presupuesto"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div
        className="bg-blue-50 dark:bg-slate-800 rounded-xl p-6 border border-blue-200 dark:border-slate-600"
        data-tour="budget-insights"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Consejos basados en tus datos
            </h3>
            <p className="text-blue-800 dark:text-blue-100 text-sm mb-2">
              Total actual de suscripciones activas: <strong>{formatMoney(totalSpent)}</strong>.
            </p>
            <p className="text-blue-800 dark:text-blue-100 text-sm">
              {remaining < 0
                ? "Estás por encima del presupuesto. Revisa categorías con alerta."
                : "Vas dentro del presupuesto general."}
            </p>
          </div>
          <DollarSign className="w-10 h-10 text-blue-500 self-center ml-auto hidden lg:block" />
        </div>
      </div>
    </div>
  );
}
