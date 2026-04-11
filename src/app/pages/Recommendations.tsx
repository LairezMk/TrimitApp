import { Lightbulb, TrendingDown, Users, Calendar, Star, Check, X } from "lucide-react";

const recommendations = [
  {
    id: 1,
    title: "Cambia a plan anual de Netflix",
    description: "Ahorra $39.20/año pagando anualmente en lugar de mensualmente",
    savings: 39.2,
    effort: "Fácil",
    impact: "Alto",
    category: "Optimización",
    icon: TrendingDown,
    color: "emerald",
  },
  {
    id: 2,
    title: "Comparte Spotify con familia",
    description: "El plan familiar cuesta $15.99 y permite hasta 6 usuarios",
    savings: 28.0,
    effort: "Medio",
    impact: "Alto",
    category: "Compartir",
    icon: Users,
    color: "blue",
  },
  {
    id: 3,
    title: "Cancela Disney+ durante el verano",
    description: "No has usado esta app en 3 meses según tus patrones",
    savings: 65.88,
    effort: "Fácil",
    impact: "Medio",
    category: "Cancelación",
    icon: X,
    color: "red",
  },
  {
    id: 4,
    title: "Aprovecha ofertas de Black Friday",
    description: "Espera hasta noviembre para renovar Adobe Creative Cloud",
    savings: 120.0,
    effort: "Fácil",
    impact: "Alto",
    category: "Timing",
    icon: Calendar,
    color: "purple",
  },
];

const alternativeServices = [
  {
    current: "Adobe Creative Cloud",
    alternative: "Affinity Suite",
    savings: 44.99,
    features: ["Pago único", "Sin suscripción", "Similar funcionalidad"],
  },
  {
    current: "Microsoft 365",
    alternative: "Google Workspace",
    savings: 10.0,
    features: ["Más almacenamiento", "Mejor colaboración", "Integración"],
  },
];

export default function Recommendations() {
  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.savings, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Recomendaciones</h1>
        <p className="text-gray-500">Optimiza tus suscripciones con consejos personalizados</p>
      </div>

      {/* Savings Potential */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-10 h-10" />
              <h2 className="text-2xl font-bold">Ahorro Potencial</h2>
            </div>
            <p className="text-emerald-100 text-lg mb-4">
              Implementando todas nuestras recomendaciones
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">${totalPotentialSavings.toFixed(0)}</span>
              <span className="text-emerald-100">/año</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm mb-1">Recomendaciones activas</p>
            <p className="text-4xl font-bold">{recommendations.length}</p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Recomendaciones Personalizadas</h2>

        <div className="space-y-4">
          {recommendations.map((rec) => {
            const IconComponent = rec.icon;
            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 bg-${rec.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <IconComponent className={`w-7 h-7 text-${rec.color}-600`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg dark:text-white">{rec.title}</h3>
                          <span
                            className={`px-2 py-1 bg-${rec.color}-100 text-${rec.color}-700 rounded-full text-xs font-medium`}
                          >
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{rec.description}</p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Esfuerzo:</span>
                            <span
                              className={`font-medium ${
                                rec.effort === "Fácil"
                                  ? "text-emerald-600"
                                  : rec.effort === "Medio"
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {rec.effort}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Impacto:</span>
                            <div className="flex gap-1">
                              {[...Array(rec.impact === "Alto" ? 3 : 2)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 fill-amber-400 text-amber-400"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ahorro anual</p>
                        <p className={`text-3xl font-bold text-${rec.color}-600`}>
                          ${rec.savings.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Aplicar recomendación
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                        Recordar después
                      </button>
                      <button className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">
                        Descartar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternative Services */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Servicios Alternativos</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alternativeServices.map((alt, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Actualmente usas</p>
                <p className="font-semibold text-lg text-gray-900 dark:text-white">{alt.current}</p>
              </div>

              <div className="flex items-center gap-3 my-4">
                <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Considera cambiar a</span>
                <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-lg text-emerald-600 mb-2">
                  {alt.alternative}
                </p>
                <p className="text-sm text-emerald-600 font-medium mb-3">
                  Ahorra ${alt.savings.toFixed(2)}/mes
                </p>

                <ul className="space-y-2">
                  {alt.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium">
                Ver más detalles
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-slate-600">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Consejos para Maximizar Ahorros
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-100">
          <li>• Revisa estas recomendaciones mensualmente para nuevas oportunidades</li>
          <li>• Aprovecha períodos de prueba antes de comprometerte a largo plazo</li>
          <li>• Configura recordatorios antes de que terminen tus pruebas gratuitas</li>
          <li>• Compara precios entre diferentes proveedores regularmente</li>
          <li>• Considera paquetes o bundles para múltiples servicios</li>
        </ul>
      </div>
    </div>
  );
}
