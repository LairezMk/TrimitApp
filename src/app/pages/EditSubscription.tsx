import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Tag,
  Bell,
  Save,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteUserSubscription,
  getUserSubscription,
  updateUserSubscription,
} from "../services/subscriptions";

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

type FormData = {
  name: string;
  category: string;
  amount: string;
  currency: string;
  status: "active" | "suspended" | "forgotten";
  nextPaymentDate: string;
  isRecurring: boolean;
  icon: string;
  color: string;
  notes: string;
};

export default function EditSubscription() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldClassName =
    "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user || !id) {
        setLoading(false);
        setError("No se encontró la suscripción.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const subscription = await getUserSubscription(user.uid, id);
        if (!subscription) {
          setError("La suscripción no existe o fue eliminada.");
          setFormData(null);
          return;
        }

        setFormData({
          name: subscription.name,
          category: subscription.category,
          amount: subscription.amount.toString(),
          currency: subscription.currency,
          status: subscription.status,
          nextPaymentDate: subscription.nextPaymentDate.toISOString().split("T")[0],
          isRecurring: subscription.isRecurring,
          icon: subscription.icon,
          color: subscription.color,
          notes: subscription.notes || "",
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo cargar la suscripción.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadSubscription();
  }, [user, id]);

  const previewIcon = useMemo(() => {
    if (!formData) {
      return "S";
    }

    if (formData.icon.trim()) {
      return formData.icon.trim().charAt(0).toUpperCase();
    }

    return formData.name.trim().charAt(0).toUpperCase() || "S";
  }, [formData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !id || !formData) {
      setError("No se pudo identificar la suscripción.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.amount ||
      !formData.nextPaymentDate
    ) {
      setError("Completa los campos obligatorios.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateUserSubscription(user.uid, id, {
        name: formData.name.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        currency: formData.currency,
        status: formData.status,
        isRecurring: formData.isRecurring,
        nextPaymentDate: new Date(formData.nextPaymentDate),
        icon: previewIcon,
        color: formData.color,
        notes: formData.notes,
      });

      navigate("/subscriptions");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar la suscripción.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !id) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteUserSubscription(user.uid, id);
      navigate("/subscriptions");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar la suscripción.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-600 dark:text-gray-300">
        Cargando suscripción...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-8 text-gray-900 dark:text-gray-100">
        <button
          onClick={() => navigate("/subscriptions")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Suscripciones
        </button>
        <div className="max-w-3xl rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-5 text-red-700 dark:text-red-300">
          {error || "No se pudo cargar la suscripción."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 text-gray-900 dark:text-gray-100">
      <button
        onClick={() => navigate("/subscriptions")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Suscripciones
      </button>

      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Editar Suscripción</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Actualiza tus datos, estado y configuración de cobro.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nombre de la suscripción *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={fieldClassName}
                  placeholder="Ej: Netflix, Spotify, Adobe..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={fieldClassName}
                >
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Productividad">Productividad</option>
                  <option value="Salud">Salud</option>
                  <option value="Música">Música</option>
                  <option value="Educación">Educación</option>
                  <option value="Noticias">Noticias</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Moneda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className={fieldClassName}
                >
                  <option value="$">$ - Dólar</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Monto mensual *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className={fieldClassName}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Próximo pago *
                </label>
                <input
                  type="date"
                  value={formData.nextPaymentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, nextPaymentDate: e.target.value })
                  }
                  className={fieldClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as FormData["status"],
                    })
                  }
                  className={fieldClassName}
                >
                  <option value="active">Activa</option>
                  <option value="forgotten">Olvidada</option>
                  <option value="suspended">Suspendida</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Renovación automática
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Se renueva automáticamente cada ciclo
                    </p>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) =>
                        setFormData({ ...formData, isRecurring: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500"></span>
                    <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
                  </label>
                </div>
              </div>

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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Color de tarjeta
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className={fieldClassName}
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={fieldClassName}
                  rows={4}
                  placeholder="Notas opcionales"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="md:w-40 px-6 py-3 border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Vista previa
            </p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 ${formData.color} rounded-xl flex items-center justify-center text-white text-lg`}
                >
                  {previewIcon}
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
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">Monto:</span>{" "}
                  {formData.currency}
                  {Number(formData.amount || 0).toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">Estado:</span>{" "}
                  {formData.status === "active"
                    ? "Activa"
                    : formData.status === "forgotten"
                    ? "Olvidada"
                    : "Suspendida"}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
