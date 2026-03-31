import { Calculator as CalcIcon, DollarSign, TrendingDown, Zap } from "lucide-react";
import { useState } from "react";

export default function Calculator() {
  const [monthlyAmount, setMonthlyAmount] = useState("19.99");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const amount = parseFloat(monthlyAmount) || 0;

  const calculations = {
    weekly: amount / 4.33,
    monthly: amount,
    quarterly: amount * 3,
    yearly: amount * 12,
    fiveYears: amount * 60,
    tenYears: amount * 120,
  };

  const savingsScenarios = [
    {
      name: "Cancelas ahora",
      description: "Ahorras inmediatamente",
      yearly: calculations.yearly,
      fiveYears: calculations.fiveYears,
      color: "emerald",
    },
    {
      name: "Cambias a plan anual",
      description: "Típicamente ahorras 20%",
      yearly: calculations.yearly * 0.2,
      fiveYears: calculations.fiveYears * 0.2,
      color: "blue",
    },
    {
      name: "Compartes con 3 personas",
      description: "Divides el costo",
      yearly: calculations.yearly * 0.75,
      fiveYears: calculations.fiveYears * 0.75,
      color: "purple",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Calculadora de Ahorro</h1>
        <p className="text-gray-500">
          Descubre cuánto puedes ahorrar optimizando tus suscripciones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CalcIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Ingresa tu suscripción</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-emerald-100 text-sm mb-2">
                  Costo mensual
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-emerald-100 text-sm mb-2">
                  Ciclo de facturación
                </label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                  <option value="quarterly">Trimestral</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-4">Ejemplos populares</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Netflix", amount: "19.99" },
                { name: "Spotify", amount: "9.99" },
                { name: "Disney+", amount: "10.99" },
                { name: "Adobe", amount: "54.99" },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setMonthlyAmount(preset.amount)}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors border border-gray-200"
                >
                  {preset.name} - ${preset.amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {/* Time Projections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Proyección de Gastos</h2>
            </div>

            <div className="p-6 space-y-4">
              {[
                { label: "Semanal", value: calculations.weekly, period: "/semana" },
                { label: "Mensual", value: calculations.monthly, period: "/mes" },
                { label: "Trimestral", value: calculations.quarterly, period: "/trimestre" },
                { label: "Anual", value: calculations.yearly, period: "/año" },
                { label: "5 años", value: calculations.fiveYears, period: "total" },
                { label: "10 años", value: calculations.tenYears, period: "total" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      ${item.value.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">{item.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Big Impact Number */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-8 text-white shadow-lg text-center">
            <Zap className="w-12 h-12 mx-auto mb-3" />
            <p className="text-red-100 text-sm mb-2">En 10 años gastarás</p>
            <p className="text-5xl font-bold mb-2">${calculations.tenYears.toFixed(0)}</p>
            <p className="text-red-100 text-sm">
              en esta suscripción si no la cancelas
            </p>
          </div>
        </div>
      </div>

      {/* Savings Scenarios */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Escenarios de Ahorro</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savingsScenarios.map((scenario) => (
            <div
              key={scenario.name}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <TrendingDown className={`w-6 h-6 text-${scenario.color}-600 flex-shrink-0`} />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{scenario.name}</h3>
                  <p className="text-sm text-gray-500">{scenario.description}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ahorro anual</p>
                  <p className={`text-2xl font-bold text-${scenario.color}-600`}>
                    ${scenario.yearly.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Ahorro en 5 años</p>
                  <p className={`text-xl font-bold text-${scenario.color}-600`}>
                    ${scenario.fiveYears.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-100">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Recomendación</h3>
        <p className="text-gray-700 text-sm">
          Si esta suscripción te cuesta ${calculations.monthly.toFixed(2)} al mes,
          considera si realmente la usas lo suficiente para justificar los{" "}
          <span className="font-bold">${calculations.yearly.toFixed(2)}</span> al año.
          Cancelándola podrías ahorrar{" "}
          <span className="font-bold">${calculations.fiveYears.toFixed(2)}</span> en 5 años.
        </p>
      </div>
    </div>
  );
}
