import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Sparkles,
  Dumbbell,
  Music,
  Briefcase,
  BookOpen,
  Newspaper,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  Tag,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCurrencyDisplay } from "../contexts/CurrencyDisplayContext";
import { subscribeToUserSubscriptions } from "../services/subscriptions";
import {
  createUserCategory,
  deleteUserCategory,
  subscribeToUserCategories,
  updateUserCategory,
  type UserCategory,
} from "../services/categories";
import type { Subscription } from "../types/subscription";

const availableIcons = [
  { name: "Sparkles", component: Sparkles },
  { name: "Briefcase", component: Briefcase },
  { name: "Dumbbell", component: Dumbbell },
  { name: "Music", component: Music },
  { name: "BookOpen", component: BookOpen },
  { name: "Newspaper", component: Newspaper },
  { name: "Tag", component: Tag },
];

const availableColors = [
  { name: "Rojo", value: "bg-red-500" },
  { name: "Azul", value: "bg-blue-500" },
  { name: "Verde", value: "bg-green-500" },
  { name: "Naranja", value: "bg-orange-500" },
  { name: "Púrpura", value: "bg-purple-500" },
  { name: "Rosa", value: "bg-pink-500" },
  { name: "Amarillo", value: "bg-yellow-500" },
  { name: "Índigo", value: "bg-indigo-500" },
  { name: "Gris", value: "bg-gray-700" },
];

export default function Categories() {
  const { user } = useAuth();
  const { formatMoney, preferredCurrency } = useCurrencyDisplay();
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "Sparkles",
    color: "bg-red-500",
    budget: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToUserCategories(
      user.uid,
      (data) => setCategories(data),
      (err) => setError(err.message),
    );

    return unsubscribe;
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

  const iconByName = useMemo(
    () =>
      Object.fromEntries(
        availableIcons.map((icon) => [icon.name, icon.component]),
      ) as Record<
        string,
        ComponentType<{ className?: string }>
      >,
    [],
  );

  const stats = useMemo(() => {
    const aggregate = new Map<string, { subscriptions: number; monthlySpend: number }>();
    for (const sub of subscriptions) {
      const current = aggregate.get(sub.category) || { subscriptions: 0, monthlySpend: 0 };
      aggregate.set(sub.category, {
        subscriptions: current.subscriptions + 1,
        monthlySpend: current.monthlySpend + sub.amount,
      });
    }
    return aggregate;
  }, [subscriptions]);

  const categoriesWithStats = useMemo(
    () =>
      categories.map((cat) => {
        const data = stats.get(cat.name) || { subscriptions: 0, monthlySpend: 0 };
        return {
          ...cat,
          subscriptions: data.subscriptions,
          monthlySpend: data.monthlySpend,
        };
      }),
    [categories, stats],
  );

  const totalSpend = categoriesWithStats.reduce((sum, cat) => sum + cat.monthlySpend, 0);
  const totalBudget = categoriesWithStats.reduce((sum, cat) => sum + cat.budget, 0);
  const activeCategories = categoriesWithStats.filter((cat) => cat.subscriptions > 0).length;

  const resetModal = () => {
    setEditingId(null);
    setNewCategory({
      name: "",
      icon: "Sparkles",
      color: "bg-red-500",
      budget: "",
    });
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setError(null);
    setEditingId(null);
    setNewCategory({
      name: "",
      icon: "Sparkles",
      color: "bg-red-500",
      budget: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: UserCategory) => {
    setError(null);
    setEditingId(category.id);
    setNewCategory({
      name: category.name,
      icon: category.icon || "Sparkles",
      color: category.color || "bg-red-500",
      budget: String(category.budget || 0),
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!user) {
      return;
    }

    if (!newCategory.name.trim() || !newCategory.budget) {
      setError("Nombre y presupuesto son obligatorios.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: newCategory.name.trim(),
        icon: newCategory.icon,
        color: newCategory.color,
        budget: Number(newCategory.budget),
      };

      if (editingId) {
        await updateUserCategory(user.uid, editingId, payload);
      } else {
        await createUserCategory(user.uid, payload);
      }
      resetModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar la categoría.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: UserCategory) => {
    if (!user) {
      return;
    }

    if (category.isDefault) {
      setError("No puedes eliminar la categoría por defecto.");
      return;
    }

    const inUse = subscriptions.some((sub) => sub.category === category.name);
    if (inUse) {
      setError("Esta categoría está en uso por suscripciones activas.");
      return;
    }

    try {
      await deleteUserCategory(user.uid, category.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar la categoría.";
      setError(message);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Categorías</h1>
          <p className="text-gray-500">Organiza tus suscripciones por categorías</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Categorías Activas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeCategories}</p>
          <p className="text-gray-400 text-xs mt-1">de {categoriesWithStats.length} totales</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Gasto Total</p>
          <p className="text-3xl font-bold text-emerald-600">{formatMoney(totalSpend, "COP")}</p>
          <p className="text-gray-400 text-xs mt-1">por mes</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Presupuesto Total</p>
          <p className="text-3xl font-bold text-blue-600">{formatMoney(totalBudget, "COP")}</p>
          <p className="text-gray-400 text-xs mt-1">asignado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {categoriesWithStats.map((category) => {
          const IconComponent = iconByName[category.icon] || Tag;
          const percentage =
            category.budget > 0 ? (category.monthlySpend / category.budget) * 100 : 0;
          const isNearLimit = percentage >= 80;

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg dark:text-white">{category.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {category.subscriptions} suscripciones
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(category)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Gasto mensual</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatMoney(category.monthlySpend, "COP")}
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isNearLimit ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(0)}% del presupuesto
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatMoney(category.budget, "COP")}
                      </span>
                    </div>
                  </div>

                  <div className="w-full py-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-center">
                    {category.subscriptions > 0
                      ? `${category.subscriptions} suscripciones activas`
                      : "Sin suscripciones"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-emerald-100 dark:border-slate-600">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Insights de Categorías</h3>
        <div className="space-y-2">
          {categoriesWithStats.length === 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-200">
              • Crea tu primera categoría para comenzar a analizar tus gastos.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                • Tu gasto mensual en categorías es de{" "}
                <span className="font-semibold">{formatMoney(totalSpend, "COP")}</span>.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                • Presupuesto total configurado:{" "}
                <span className="font-semibold">{formatMoney(totalBudget, "COP")}</span>.
              </p>
            </>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-200">
            • Considera reorganizar categorías para un mejor seguimiento.
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-5 md:p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingId ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <button
                onClick={resetModal}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Deportes, Gaming, etc."
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableIcons.map((iconOption) => {
                    const IconComp = iconOption.component;
                    return (
                      <button
                        key={iconOption.name}
                        type="button"
                        onClick={() => setNewCategory({ ...newCategory, icon: iconOption.name })}
                        className={`p-3 border-2 rounded-lg transition-colors ${
                          newCategory.icon === iconOption.name
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <IconComp className="w-6 h-6 mx-auto text-gray-700 dark:text-gray-200" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, color: colorOption.value })}
                      className={`h-10 rounded-lg ${colorOption.value} transition-transform ${
                        newCategory.color === colorOption.value
                          ? "ring-4 ring-emerald-500 ring-offset-2 scale-110"
                          : "hover:scale-105"
                      }`}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Presupuesto mensual *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300">
                    {preferredCurrency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newCategory.budget}
                    onChange={(e) => setNewCategory({ ...newCategory, budget: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!newCategory.name || !newCategory.budget || saving}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear Categoría"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
