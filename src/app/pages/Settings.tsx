import { useEffect, useState, type ReactNode } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  Bell,
  DollarSign,
  Eye,
  Globe,
  Moon,
  Palette,
  RotateCcw,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import {
  DEFAULT_VISUAL_THEME,
  type VisualThemeId,
  useTheme,
} from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";

interface AppPreferences {
  language: string;
  currency: string;
  reminderDays: number;
  hideAmounts: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  monthlySummary: boolean;
  autoGmailScan: boolean;
  visualTheme: VisualThemeId;
}

export default function Settings() {
  const {
    isDark,
    toggleTheme,
    visualThemeOptions,
    visualTheme,
    setVisualTheme,
    resetVisualTheme,
    setThemeMode,
  } = useTheme();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<AppPreferences>({
    language: "es",
    currency: "COP",
    reminderDays: 3,
    hideAmounts: false,
    pushEnabled: true,
    emailEnabled: true,
    monthlySummary: true,
    autoGmailScan: true,
    visualTheme,
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data() as Record<string, unknown> | undefined;
      const pref = (data?.preferences || {}) as Partial<AppPreferences>;
      setPreferences((prev) => ({ ...prev, ...pref }));
      if (pref.visualTheme) {
        setVisualTheme(pref.visualTheme);
      }
    };

    void loadPreferences();
  }, [user, setVisualTheme]);

  useEffect(() => {
    setPreferences((prev) => ({ ...prev, visualTheme }));
  }, [visualTheme]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          preferences,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setMessage("Configuración guardada correctamente.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo guardar.";
      setMessage(text);
    } finally {
      setSaving(false);
    }
  };

  const handleResetAppearance = () => {
    setThemeMode("light");
    resetVisualTheme();
    setPreferences((prev) => ({ ...prev, visualTheme: DEFAULT_VISUAL_THEME }));
    setMessage("Apariencia restablecida al estilo predeterminado.");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Configuración</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Personaliza tu experiencia en Trimit
        </p>
      </div>

      <div className="max-w-5xl space-y-4 md:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium dark:text-white">Notificaciones</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gestiona cómo y cuándo recibir notificaciones
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <ToggleRow
              title="Notificaciones push"
              description="Recibe alertas en tu dispositivo"
              checked={preferences.pushEnabled}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, pushEnabled: value }))
              }
            />
            <ToggleRow
              title="Notificaciones por correo"
              description="Recibe recordatorios por email"
              checked={preferences.emailEnabled}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, emailEnabled: value }))
              }
            />
            <ToggleRow
              title="Resumen mensual"
              description="Enviar consolidado mensual de gastos"
              checked={preferences.monthlySummary}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, monthlySummary: value }))
              }
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium dark:text-white">Apariencia</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura tema y privacidad visual
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <ToggleRow
              title="Modo oscuro"
              description="Reduce la fatiga visual en entornos con poca luz"
              checked={isDark}
              onChange={() => toggleTheme()}
            />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Visualización Trimit</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cambia paleta, tipografía, efectos de cursor y transiciones globales.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visualThemeOptions.map((option) => {
                  const selected = preferences.visualTheme === option.id;
                  const [colorA = "#22c55e", colorB = "#06b6d4"] = option.gradient.split(",").map((color) => color.trim());
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setVisualTheme(option.id);
                        setPreferences((prev) => ({ ...prev, visualTheme: option.id }));
                      }}
                      className={`text-left rounded-xl border px-4 py-4 transition ${
                        selected
                          ? "border-emerald-400 bg-emerald-50/70 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-medium dark:text-white">{option.name}</span>
                        <span
                          className="inline-flex h-3 w-16 rounded-full"
                          style={{ background: `linear-gradient(90deg, ${colorA}, ${colorB})` }}
                          aria-hidden
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleResetAppearance}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Volver a lo predeterminado
                </button>
              </div>
            </div>
            <ToggleRow
              title="Ocultar montos"
              description="Oculta importes al compartir pantalla"
              checked={preferences.hideAmounts}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, hideAmounts: value }))
              }
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium dark:text-white">Preferencias</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura idioma, moneda y reglas por defecto
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <SelectRow
              icon={<Globe className="w-5 h-5 text-gray-400" />}
              title="Idioma"
              description="Selecciona tu idioma preferido"
              value={preferences.language}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, language: value }))
              }
              options={[
                { value: "es", label: "Español" },
                { value: "en", label: "English" },
                { value: "fr", label: "Français" },
                { value: "de", label: "Deutsch" },
                { value: "pt", label: "Português" },
              ]}
            />
            <SelectRow
              icon={<DollarSign className="w-5 h-5 text-gray-400" />}
              title="Moneda predeterminada"
              description="Moneda para visualizar tus gastos"
              value={preferences.currency}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, currency: value }))
              }
              options={[
                { value: "USD", label: "USD - Dólar estadounidense" },
                { value: "EUR", label: "EUR - Euro" },
                { value: "GBP", label: "GBP - Libra esterlina" },
                { value: "MXN", label: "MXN - Peso mexicano" },
                { value: "ARS", label: "ARS - Peso argentino" },
                { value: "COP", label: "COP - Peso colombiano" },
              ]}
            />
            <SelectRow
              icon={<SlidersHorizontal className="w-5 h-5 text-gray-400" />}
              title="Recordatorio por defecto"
              description="Días antes del cobro para alertar"
              value={String(preferences.reminderDays)}
              onChange={(value) =>
                setPreferences((prev) => ({
                  ...prev,
                  reminderDays: Number(value),
                }))
              }
              options={[
                { value: "1", label: "1 día antes" },
                { value: "3", label: "3 días antes" },
                { value: "7", label: "7 días antes" },
                { value: "14", label: "14 días antes" },
              ]}
            />
            <ToggleRow
              title="Escaneo automático de Gmail"
              description="Intentar detectar nuevas suscripciones periódicamente"
              checked={preferences.autoGmailScan}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, autoGmailScan: value }))
              }
              icon={<Eye className="w-5 h-5 text-gray-400" />}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-emerald-100 dark:border-emerald-800 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Trimit v1.0.0 • Tus preferencias se sincronizan con tu cuenta.
          </p>
          <div className="flex items-center gap-3">
            {message && (
              <span className="text-sm text-gray-600 dark:text-gray-300">{message}</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar configuración"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  icon,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: ReactNode;
}) {
  return (
    <div className="p-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon || <Bell className="w-5 h-5 text-gray-400" />}
        <div>
          <p className="font-medium dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <label className="relative inline-block w-12 h-6">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition peer-checked:bg-emerald-500"></span>
        <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
      </label>
    </div>
  );
}

function SelectRow({
  icon,
  title,
  description,
  value,
  onChange,
  options,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <div>
          <p className="font-medium dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <select
        className="ml-8 w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
