import { TrendingUp, TrendingDown, Activity, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyTrends = [
  { month: "Jul", gasto: 142, subscriptions: 7 },
  { month: "Ago", gasto: 152, subscriptions: 8 },
  { month: "Sep", gasto: 165, subscriptions: 9 },
  { month: "Oct", gasto: 158, subscriptions: 8 },
  { month: "Nov", gasto: 172, subscriptions: 9 },
  { month: "Dic", gasto: 141, subscriptions: 7 },
  { month: "Ene", gasto: 168, subscriptions: 8 },
  { month: "Feb", gasto: 173, subscriptions: 8 },
];

const insights = [
  {
    type: "increase",
    title: "Aumento en Entretenimiento",
    description: "Tus gastos en streaming aumentaron 25% este mes",
    impact: "+$12.50",
    color: "red",
  },
  {
    type: "decrease",
    title: "Ahorro en Productividad",
    description: "Cancelaste 2 suscripciones innecesarias",
    impact: "-$44.98",
    color: "emerald",
  },
  {
    type: "neutral",
    title: "Patrón estable en Salud",
    description: "Tus gastos de fitness se mantienen constantes",
    impact: "$10.40",
    color: "blue",
  },
];

export default function Trends() {
  const currentMonth = 173;
  const previousMonth = 168;
  const percentageChange = ((currentMonth - previousMonth) / previousMonth) * 100;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 dark:text-white">Tendencias y Análisis</h1>
        <p className="text-gray-500">Patrones de gasto y comportamiento</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <Activity className="w-8 h-8 mb-2" />
          <p className="text-emerald-100 text-sm">Gasto este mes</p>
          <p className="text-3xl font-bold">${currentMonth}</p>
          <div className="flex items-center gap-1 text-emerald-100 text-sm mt-1">
            <ArrowUpRight className="w-4 h-4" />
            +{percentageChange.toFixed(1)}% vs anterior
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Promedio 6 meses</p>
          <p className="text-3xl font-bold text-gray-900">$158.17</p>
          <p className="text-gray-400 text-xs mt-1">por mes</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Mes más bajo</p>
          <p className="text-3xl font-bold text-emerald-600">$141</p>
          <p className="text-gray-400 text-xs mt-1">Diciembre 2025</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Mes más alto</p>
          <p className="text-3xl font-bold text-red-600">$173</p>
          <p className="text-gray-400 text-xs mt-1">Febrero 2026</p>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold dark:text-white">Evolución de Gastos</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium">
              6 meses
            </button>
            <button className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm">
              1 año
            </button>
            <button className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm">
              Todo
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="gasto"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Insights del Mes</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                {insight.type === "increase" ? (
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  </div>
                ) : insight.type === "decrease" ? (
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 dark:text-white">{insight.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{insight.description}</p>
                  <p
                    className={`text-lg font-bold text-${insight.color}-600`}
                  >
                    {insight.impact}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Count Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Número de Suscripciones</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="subscriptions"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Predictions */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-purple-200 dark:border-slate-600">
        <div className="flex items-start gap-4">
          <Calendar className="w-8 h-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Predicción para Marzo</h3>
            <p className="text-purple-800 dark:text-purple-100 text-sm mb-3">
              Basado en tus patrones de gasto, estimamos que gastarás aproximadamente{" "}
              <span className="font-bold">$175.00</span> el próximo mes.
              Esto representa un aumento del 1.2% respecto a febrero.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Alta confianza
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Basado en 8 meses
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
