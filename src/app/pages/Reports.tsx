import { FileText, Download, Calendar, TrendingUp, Filter, Share2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const monthlyComparison = [
  { month: "Ago", actual: 152, previous: 145 },
  { month: "Sep", actual: 165, previous: 152 },
  { month: "Oct", actual: 158, previous: 165 },
  { month: "Nov", actual: 172, previous: 158 },
  { month: "Dic", actual: 141, previous: 172 },
  { month: "Ene", actual: 168, previous: 141 },
];

export default function Reports() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Reportes</h1>
          <p className="text-gray-500">Análisis detallados de tus gastos</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold">Reporte Mensual</h3>
              <p className="text-sm text-gray-500">Febrero 2026</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">$172.93</p>
          <p className="text-sm text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +12% vs mes anterior
          </p>
          <button className="mt-4 w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
            Ver detalles
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Reporte Trimestral</h3>
              <p className="text-sm text-gray-500">Q1 2026</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">$481.00</p>
          <p className="text-sm text-blue-600">3 meses</p>
          <button className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
            Ver detalles
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Reporte Anual</h3>
              <p className="text-sm text-gray-500">2025</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">$1,896.00</p>
          <p className="text-sm text-purple-600">12 meses</p>
          <button className="mt-4 w-full py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
            Ver detalles
          </button>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Comparación Mes a Mes</h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Últimos 6 meses</option>
            <option>Últimos 12 meses</option>
            <option>Este año</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" fill="#10b981" name="Mes Actual" />
            <Bar dataKey="previous" fill="#93c5fd" name="Mes Anterior" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-6">Desglose por Categoría</h2>

        <div className="space-y-4">
          {[
            { name: "Entretenimiento", amount: 66.55, percentage: 38.5, color: "bg-red-500" },
            { name: "Productividad", amount: 64.99, percentage: 37.6, color: "bg-blue-500" },
            { name: "Salud", amount: 10.4, percentage: 6.0, color: "bg-orange-500" },
            { name: "Música", amount: 9.99, percentage: 5.8, color: "bg-green-500" },
            { name: "Otros", amount: 21.0, percentage: 12.1, color: "bg-gray-500" },
          ].map((category) => (
            <div key={category.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">${category.amount.toFixed(2)}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={`${category.color} h-full rounded-full`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <h3 className="font-semibold text-emerald-900 mb-2">Exportar como PDF</h3>
          <p className="text-emerald-700 text-sm mb-4">
            Descarga un reporte completo con gráficos y detalles
          </p>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Exportar como Excel</h3>
          <p className="text-blue-700 text-sm mb-4">
            Descarga todos los datos en formato CSV/Excel
          </p>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
