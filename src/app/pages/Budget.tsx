import { DollarSign, TrendingDown, AlertCircle, PlusCircle, Edit2 } from "lucide-react";

const budgetCategories = [
  { name: "Entretenimiento", limit: 80, spent: 66.55, color: "emerald" },
  { name: "Productividad", limit: 70, spent: 64.99, color: "blue" },
  { name: "Salud", limit: 30, spent: 10.4, color: "orange" },
  { name: "Música", limit: 15, spent: 9.99, color: "green" },
];

export default function Budget() {
  const totalBudget = 250;
  const totalSpent = 151.93;
  const remaining = totalBudget - totalSpent;
  const percentageUsed = (totalSpent / totalBudget) * 100;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Presupuesto</h1>
          <p className="text-gray-500">Gestiona tus límites de gasto mensuales</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors">
          <Edit2 className="w-5 h-5" />
          Ajustar Presupuesto
        </button>
      </div>

      {/* Overall Budget */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Presupuesto Mensual</p>
            <p className="text-5xl font-bold">${totalBudget.toFixed(2)}</p>
          </div>
          <DollarSign className="w-16 h-16 text-emerald-200" />
        </div>

        <div className="bg-emerald-400/30 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Gastado</p>
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Restante</p>
            <p className="text-2xl font-bold">${remaining.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold dark:text-white">Presupuesto por Categoría</h2>
          <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm font-medium">
            <PlusCircle className="w-4 h-4" />
            Agregar Categoría
          </button>
        </div>

        <div className="space-y-6">
          {budgetCategories.map((category) => {
            const percentage = (category.spent / category.limit) * 100;
            const isNearLimit = percentage >= 80;
            const isOverLimit = percentage >= 100;

            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium dark:text-white">{category.name}</h3>
                    {isNearLimit && (
                      <AlertCircle
                        className={`w-4 h-4 ${
                          isOverLimit ? "text-red-500" : "text-amber-500"
                        }`}
                      />
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold dark:text-white">${category.spent.toFixed(2)}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm"> / ${category.limit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverLimit
                        ? "bg-red-500"
                        : isNearLimit
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between mt-1">
                  <span
                    className={`text-xs ${
                      isOverLimit
                        ? "text-red-600 font-medium"
                        : isNearLimit
                        ? "text-amber-600"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {percentage.toFixed(0)}% utilizado
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ${(category.limit - category.spent).toFixed(2)} restante
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 dark:bg-slate-800 rounded-xl p-6 border border-blue-200 dark:border-slate-600">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Consejo de Ahorro</h3>
            <p className="text-blue-800 dark:text-blue-100 text-sm mb-3">
              Estás gastando bien dentro de tu presupuesto este mes. Considera reducir el límite
              de "Entretenimiento" si notas que nunca alcanzas el máximo.
            </p>
            <button className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 text-sm font-medium">
              Ver más consejos →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
