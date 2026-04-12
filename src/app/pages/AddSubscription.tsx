import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, DollarSign, Calendar, Tag, RefreshCw, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createUserSubscription } from "../services/subscriptions";

const COLOR_OPTIONS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-gray-700",
];

const QUICK_TEMPLATES = {
  Netflix: {
    category: "Entretenimiento",
    amount: "19.99",
    icon: "N",
    color: "bg-red-500",
  },
  Spotify: {
    category: "Música",
    amount: "9.99",
    icon: "S",
    color: "bg-emerald-500",
  },
  "Disney+": {
    category: "Entretenimiento",
    amount: "13.99",
    icon: "D",
    color: "bg-blue-500",
  },
  "YouTube Premium": {
    category: "Entretenimiento",
    amount: "11.99",
    icon: "Y",
    color: "bg-red-500",
  },
} as const;

export default function AddSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    currency: "$",
    status: "active",
    billingCycle: "monthly",
    nextPaymentDate: "",
    isRecurring: true,
    reminderDays: "3",
    icon: "S",
    color: "bg-emerald-500",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldClassName =
    "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";

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

    setSaving(true);
    setError(null);

    try {
      await createUserSubscription(user.uid, {
        name: formData.name.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        currency: formData.currency,
        status: formData.status as "active" | "suspended" | "forgotten",
        isRecurring: formData.isRecurring,
        nextPaymentDate: new Date(formData.nextPaymentDate),
        icon: formData.icon.trim() ? formData.icon.trim().charAt(0).toUpperCase() : formData.name.trim().charAt(0).toUpperCase(),
        color: formData.color,
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
    setFormData((prev) => ({
      ...prev,
      name: service,
      category: template.category,
      amount: template.amount,
      icon: template.icon,
      color: template.color,
    }));
  };

  return (
    <div className="p-6 md:p-8 text-gray-900 dark:text-gray-100">
      <button
        onClick={() => navigate("/subscriptions")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Suscripciones
      </button>

      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Nueva Suscripción</h1>
        <p className="text-gray-500 dark:text-gray-400">Agrega una nueva suscripción a tu lista</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Productividad">Productividad</option>
                <option value="Salud">Salud</option>
                <option value="Música">Música</option>
                <option value="Educación">Educación</option>
                <option value="Noticias">Noticias</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            {/* Monto y Moneda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Moneda</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className={fieldClassName}
                >
                  <option value="$">$ - Dólar</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={fieldClassName}
              >
                <option value="active">Activa</option>
                <option value="suspended">Suspendida</option>
                <option value="forgotten">Olvidada</option>
              </select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={fieldClassName}
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
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
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-emerald-100 dark:border-slate-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Plantillas rápidas</h3>
            <div className="grid grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
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
                  className={`w-12 h-12 ${formData.color} rounded-xl flex items-center justify-center text-white text-lg`}
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
                {formData.currency}
                {Number(formData.amount || 0).toFixed(2)} / ciclo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
