import { Archive, RotateCcw, Trash2, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const archivedSubscriptions = [
  {
    id: 1,
    name: "HBO Max",
    category: "Entretenimiento",
    amount: 14.99,
    icon: "H",
    color: "bg-purple-600",
    archivedDate: new Date("2026-01-15"),
    reason: "Ya no lo uso",
  },
  {
    id: 2,
    name: "LinkedIn Premium",
    category: "Productividad",
    amount: 29.99,
    icon: "L",
    color: "bg-blue-700",
    archivedDate: new Date("2025-12-20"),
    reason: "Muy caro",
  },
  {
    id: 3,
    name: "Apple Music",
    category: "Música",
    amount: 10.99,
    icon: "A",
    color: "bg-pink-500",
    archivedDate: new Date("2025-11-10"),
    reason: "Cambié a Spotify",
  },
  {
    id: 4,
    name: "Paramount+",
    category: "Entretenimiento",
    amount: 9.99,
    icon: "P",
    color: "bg-blue-500",
    archivedDate: new Date("2025-10-05"),
    reason: "Poco contenido",
  },
  {
    id: 5,
    name: "Duolingo Plus",
    category: "Educación",
    amount: 12.99,
    icon: "D",
    color: "bg-green-600",
    archivedDate: new Date("2025-09-18"),
    reason: "Terminé mi curso",
  },
];

export default function Archived() {
  const totalSaved = archivedSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Suscripciones Archivadas</h1>
        <p className="text-gray-500">Revisa las suscripciones que has cancelado</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar suscripciones archivadas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Todas las categorías</option>
          <option>Entretenimiento</option>
          <option>Productividad</option>
          <option>Música</option>
          <option>Educación</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Archive className="w-8 h-8" />
            <p className="text-emerald-100 text-sm">Ahorro Mensual</p>
          </div>
          <p className="text-4xl font-bold">${totalSaved.toFixed(2)}</p>
          <p className="text-emerald-100 text-sm mt-2">
            Por cancelar {archivedSubscriptions.length} suscripciones
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm mb-1">Total Archivadas</p>
          <p className="text-3xl font-bold text-gray-900">{archivedSubscriptions.length}</p>
          <p className="text-gray-400 text-xs mt-2">suscripciones canceladas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm mb-1">Última Cancelación</p>
          <p className="text-3xl font-bold text-gray-900">
            {format(archivedSubscriptions[0].archivedDate, "d MMM", { locale: es })}
          </p>
          <p className="text-gray-400 text-xs mt-2">{archivedSubscriptions[0].name}</p>
        </div>
      </div>

      {/* Archived List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Lista de Archivadas</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {archivedSubscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 ${subscription.color} rounded-xl flex items-center justify-center text-white text-xl font-bold opacity-60`}
                  >
                    {subscription.icon}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {subscription.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">{subscription.category}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Archivada el{" "}
                        {format(subscription.archivedDate, "d 'de' MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                      <span>• {subscription.reason}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-gray-400 text-sm line-through mb-1">
                      ${subscription.amount}/mes
                    </p>
                    <p className="text-emerald-600 text-sm font-medium">
                      Ahorras ${subscription.amount}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Restaurar
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {archivedSubscriptions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay suscripciones archivadas
          </h3>
          <p className="text-gray-500">
            Las suscripciones que canceles aparecerán aquí
          </p>
        </div>
      )}

      {/* Insight */}
      <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-100">
        <h3 className="font-semibold text-gray-900 mb-2">💰 ¡Excelente trabajo!</h3>
        <p className="text-gray-700 text-sm">
          Al cancelar estas suscripciones, estás ahorrando <span className="font-bold">${totalSaved.toFixed(2)} por mes</span>, lo
          que equivale a <span className="font-bold">${(totalSaved * 12).toFixed(2)} al año</span>.
          Sigue optimizando tus gastos.
        </p>
      </div>
    </div>
  );
}
