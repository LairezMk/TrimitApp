import {
  Bell,
  Moon,
  Globe,
  DollarSign,
  Lock,
  Mail,
  Smartphone,
  Download,
  Trash2,
  Shield,
  Eye,
  Calendar,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Configuración</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Personaliza tu experiencia en Trimit
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Notificaciones */}
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
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Notificaciones push</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recibe alertas en tu dispositivo
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Notificaciones por correo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recibe recordatorios por email
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Recordatorios de pago</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Te avisamos 3 días antes del pago
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium dark:text-white">Apariencia</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Personaliza el aspecto de la aplicación
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Modo oscuro</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reduce la fatiga visual en entornos con poca luz
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={isDark}
                  onChange={toggleTheme}
                />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Tema de color</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Elige el color principal de la app
                  </p>
                </div>
              </div>
              <div className="flex gap-3 ml-8">
                <button className="w-10 h-10 bg-emerald-500 rounded-lg border-2 border-emerald-600 shadow-sm"></button>
                <button className="w-10 h-10 bg-blue-500 rounded-lg border-2 border-transparent hover:border-blue-600 shadow-sm"></button>
                <button className="w-10 h-10 bg-purple-500 rounded-lg border-2 border-transparent hover:border-purple-600 shadow-sm"></button>
                <button className="w-10 h-10 bg-pink-500 rounded-lg border-2 border-transparent hover:border-pink-600 shadow-sm"></button>
                <button className="w-10 h-10 bg-orange-500 rounded-lg border-2 border-transparent hover:border-orange-600 shadow-sm"></button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium dark:text-white">Preferencias</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura idioma, moneda y más
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Idioma</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selecciona tu idioma preferido
                  </p>
                </div>
              </div>
              <select className="ml-8 w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Español</option>
                <option>English</option>
                <option>Français</option>
                <option>Deutsch</option>
                <option>Português</option>
              </select>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Moneda predeterminada</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Elige la moneda para mostrar tus gastos
                  </p>
                </div>
              </div>
              <select className="ml-8 w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>USD - Dólar estadounidense</option>
                <option>EUR - Euro</option>
                <option>GBP - Libra esterlina</option>
                <option>MXN - Peso mexicano</option>
                <option>ARS - Peso argentino</option>
                <option>COP - Peso colombiano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacidad y Seguridad */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium dark:text-white">Privacidad y Seguridad</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Protege tu información personal
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Autenticación de dos factores</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Agrega una capa extra de seguridad
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium dark:text-white">Mostrar montos</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Oculta los montos de tus suscripciones
                  </p>
                </div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            <div className="p-6">
              <button className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Lock className="w-5 h-5" />
                <span className="font-medium">Cambiar contraseña</span>
              </button>
            </div>
          </div>
        </div>

        {/* Datos y Almacenamiento */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium dark:text-white">Datos y Almacenamiento</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gestiona tus datos y exportaciones
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="p-6">
              <button className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Exportar datos</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Descarga toda tu información en formato CSV
                  </p>
                </div>
              </button>
            </div>

            <div className="p-6">
              <button className="flex items-center gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                <Trash2 className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Eliminar cuenta</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Borra permanentemente tu cuenta y todos tus datos
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-emerald-100 dark:border-emerald-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Trimit v1.0.0 • © 2026 • Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}