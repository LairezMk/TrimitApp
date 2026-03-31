import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, PieChart } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const monthlyData = [
  { month: "Ene", gasto: 140 },
  { month: "Feb", gasto: 165 },
  { month: "Mar", gasto: 152 },
  { month: "Abr", gasto: 178 },
  { month: "May", gasto: 141 },
  { month: "Jun", gasto: 172 },
];

const categoryData = [
  { name: "Entretenimiento", value: 66.55, color: "#ef4444" },
  { name: "Productividad", value: 64.99, color: "#3b82f6" },
  { name: "Salud", value: 10.4, color: "#f97316" },
  { name: "Música", value: 9.99, color: "#22c55e" },
];

export default function Analytics() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Análisis y Estadísticas</h1>
        <p className="text-gray-500">Visualiza tus gastos y patrones de suscripción</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-emerald-100 text-sm">Gasto Total</p>
          <p className="text-3xl font-bold">$172.93</p>
          <p className="text-emerald-100 text-xs mt-2">+12% vs mes anterior</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-500 text-sm">Promedio Mensual</p>
          <p className="text-3xl font-bold text-gray-900">$158.00</p>
          <p className="text-gray-500 text-xs mt-2">Últimos 6 meses</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-500 text-sm">Suscripciones Activas</p>
          <p className="text-3xl font-bold text-gray-900">8</p>
          <p className="text-gray-500 text-xs mt-2">2 pendientes de renovación</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <PieChart className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-gray-500 text-sm">Mayor Gasto</p>
          <p className="text-3xl font-bold text-gray-900">$66.55</p>
          <p className="text-gray-500 text-xs mt-2">Entretenimiento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Tendencia Mensual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="gasto" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Distribución por Categoría</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Comparación de Gastos</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="gasto" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
