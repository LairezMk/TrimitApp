import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, DollarSign, Calendar, Tag, RefreshCw, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createUserSubscription } from "../services/subscriptions";
import { subscribeToUserCategories, type UserCategory } from "../services/categories";
import { SubscriptionColorPicker } from "../components/SubscriptionColorPicker";
import { applyColorIntensity, normalizeHexColor, subscriptionTextColorStyle } from "../utils/subscriptionColor";
import {
  convertFromUsdPrice,
  formatAmountInput,
  formatCurrencyAmount,
  normalizeCurrencyCode,
  parseAmountInput,
} from "../utils/currency";
import { dateFromInputValue } from "../utils/date";

type QuickTemplate = {
  category: string;
  baseUsd: number;
  icon: string;
  color: string;
};

const QUICK_TEMPLATES: Record<string, QuickTemplate> = {
  Netflix: { category: "Entretenimiento", baseUsd: 15.49, icon: "N", color: "#ef4444" },
  Spotify: { category: "Música", baseUsd: 10.99, icon: "S", color: "#10b981" },
  "Disney+": { category: "Entretenimiento", baseUsd: 13.99, icon: "D", color: "#3b82f6" },
  "YouTube Premium": { category: "Entretenimiento", baseUsd: 13.99, icon: "Y", color: "#ef4444" },
  "Amazon Prime": { category: "Entretenimiento", baseUsd: 8.99, icon: "A", color: "#06b6d4" },
  "HBO Max": { category: "Entretenimiento", baseUsd: 9.99, icon: "H", color: "#6366f1" },
  "Apple Music": { category: "Música", baseUsd: 10.99, icon: "A", color: "#111827" },
  "Microsoft 365": { category: "Productividad", baseUsd: 9.99, icon: "M", color: "#2563eb" },
  "Adobe Creative Cloud": { category: "Productividad", baseUsd: 20.99, icon: "A", color: "#dc2626" },
  "Google One": { category: "Productividad", baseUsd: 2.99, icon: "G", color: "#0ea5e9" },
  Notion: { category: "Productividad", baseUsd: 10, icon: "N", color: "#111827" },
  Canva: { category: "Productividad", baseUsd: 14.99, icon: "C", color: "#06b6d4" },
};

const DEFAULT_CATEGORIES = [
  "Entretenimiento",
  "Música",
  "Productividad",
  "Telefonía",
  "Internet",
  "Educación",
  "Salud",
  "Finanzas",
  "Compras",
  "Transporte",
  "Seguridad",
  "Noticias",
  "Servicios públicos",
  "Hogar",
  "General",
];

export default function AddSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    currency: "USD",
    status: "active",
    billingCycle: "monthly",
    nextPaymentDate: "",
    isRecurring: true,
    reminderDays: "3",
    icon: "S",
    color: "#10b981",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorShade, setColorShade] = useState(500);

  useEffect(() => {
    if (!user) {
      return;
    }
    return subscribeToUserCategories(
      user.uid,
      (data) => setCategories(data),
      () => undefined,
    );
  }, [user]);

  const fieldClassName =
    "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const finalCardColor = useMemo(
    () => applyColorIntensity(normalizeHexColor(formData.color), colorShade),
    [formData.color, colorShade],
  );
  const categoryOptions = useMemo(() => {
    const names = [...DEFAULT_CATEGORIES, ...categories.map((category) => category.name)];
    if (formData.category) {
      names.push(formData.category);
    }
    return Array.from(new Set(names.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "es"),
    );
  }, [categories, formData.category]);

  const parsedAmount = parseAmountInput(formData.amount, formData.currency);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError("Debes iniciar sesión para guardar suscripciones.");
      return;
    }

    if (!formData.name || !formData.category || !formData.amount || !formData.nextPaymentDate) {
      setError("Completa los campos obligatorios.");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Ingresa un monto válido mayor a cero.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createUserSubscription(user.uid, {
        name: formData.name.trim(),
        category: formData.category,
        amount: parsedAmount,
        currency: normalizeCurrencyCode(formData.currency),
        status: "active",
        isRecurring: formData.isRecurring,
        nextPaymentDate: dateFromInputValue(formData.nextPaymentDate),
        icon: formData.icon.trim() ? formData.icon.trim().charAt(0).toUpperCase() : formData.name.trim().charAt(0).toUpperCase(),
        color: finalCardColor,
        notes: formData.notes,
      });

      navigate("/subscriptions");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar la suscripción.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (service: keyof typeof QUICK_TEMPLATES) => {
    const template = QUICK_TEMPLATES[service];
    const normalizedCurrency = normalizeCurrencyCode(formData.currency);
    const converted = convertFromUsdPrice(template.baseUsd, normalizedCurrency);
    setFormData((prev) => ({
      ...prev,
      name: service,
      category: template.category,
      amount: formatAmountInput(converted, normalizedCurrency),
      icon: template.icon,
      color: normalizeHexColor(template.color),
    }));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <button
        onClick={() => navigate("/subscriptions")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Suscripciones
      </button>

      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Nueva Suscripción</h1>
        <p className="text-gray-500 dark:text-gray-400">Agrega una nueva suscripción a tu lista</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 lg:p-8">
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Nombre de la suscripción *
              </label>
              <input
                type="text"
                placeholder="Ej: Netflix, Spotify, Adobe..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={fieldClassName}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={fieldClassName}
              >
                <option value="">Seleccionar categoría</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Monto y Moneda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monto *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: e.target.value.replace(/[^\d,.\s]/g, ""),
                    }))
                  }
                  onBlur={() =>
                    setFormData((prev) => {
                      const parsed = parseAmountInput(prev.amount, prev.currency);
                      return {
                        ...prev,
                        amount:
                          parsed === null ? prev.amount : formatAmountInput(parsed, prev.currency),
                      };
                    })
                  }
                  className={fieldClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Moneda</label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const nextCurrency = e.target.value;
                      const matchedTemplate = QUICK_TEMPLATES[prev.name];
                      if (matchedTemplate) {
                        const nextAmount = convertFromUsdPrice(
                          matchedTemplate.baseUsd,
                          nextCurrency,
                        );
                        return {
                          ...prev,
                          currency: nextCurrency,
                          amount: formatAmountInput(nextAmount, nextCurrency),
                        };
                      }
                      const parsed = parseAmountInput(prev.amount, prev.currency);
                      return {
                        ...prev,
                        currency: nextCurrency,
                        amount:
                          parsed === null
                            ? prev.amount
                            : formatAmountInput(parsed, nextCurrency),
                      };
                    })
                  }
                  className={fieldClassName}
                >
                  <option value="USD">USD - Dólar estadounidense</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            {/* Ciclo de Facturación */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Ciclo de facturación *
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className={fieldClassName}
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            {/* Fecha de Próximo Pago */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Próximo pago *
              </label>
              <input
                type="date"
                value={formData.nextPaymentDate}
                onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                className={fieldClassName}
              />
            </div>

            {/* Recordatorio */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Recordarme con anticipación
              </label>
              <select
                value={formData.reminderDays}
                onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                className={fieldClassName}
              >
                <option value="1">1 día antes</option>
                <option value="3">3 días antes</option>
                <option value="7">7 días antes</option>
                <option value="14">14 días antes</option>
              </select>
            </div>

            {/* Icono y color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Ícono (1 letra)
                </label>
                <input
                  type="text"
                  maxLength={1}
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className={fieldClassName}
                />
              </div>
              <SubscriptionColorPicker
                value={formData.color}
                shade={colorShade}
                onColorChange={(color) =>
                  setFormData({ ...formData, color: normalizeHexColor(color) })
                }
                onShadeChange={setColorShade}
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={fieldClassName}
                rows={3}
                placeholder="Notas opcionales"
              />
            </div>

            {/* Renovación Automática */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Renovación automática</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta suscripción se renueva automáticamente
                </p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="peer sr-only"
                />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/subscriptions")}
                className="md:w-40 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors"
              >
                {saving ? "Guardando..." : "Guardar Suscripción"}
              </button>
            </div>

            {error && (
              <p className="text-sm rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Quick Templates */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-emerald-100 dark:border-slate-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Plantillas rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {Object.keys(QUICK_TEMPLATES).map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => handleApplyTemplate(service as keyof typeof QUICK_TEMPLATES)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-500 transition-colors"
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Vista previa rápida
            </h3>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: finalCardColor, ...subscriptionTextColorStyle(finalCardColor) }}
                >
                  {(formData.icon.trim() || formData.name.trim().charAt(0) || "S")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formData.name || "Sin nombre"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.category || "Sin categoría"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formatCurrencyAmount(parsedAmount || 0, formData.currency)} / ciclo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
