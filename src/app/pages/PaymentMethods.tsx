import { CreditCard, PlusCircle, Trash2, Shield, CheckCircle } from "lucide-react";

const paymentMethods = [
  {
    id: 1,
    type: "Visa",
    last4: "4242",
    expiry: "12/26",
    isDefault: true,
    subscriptions: 5,
  },
  {
    id: 2,
    type: "Mastercard",
    last4: "8888",
    expiry: "08/27",
    isDefault: false,
    subscriptions: 2,
  },
  {
    id: 3,
    type: "American Express",
    last4: "1234",
    expiry: "03/25",
    isDefault: false,
    subscriptions: 1,
  },
];

export default function PaymentMethods() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Métodos de Pago</h1>
          <p className="text-gray-500">Gestiona tus tarjetas y métodos de pago</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors">
          <PlusCircle className="w-5 h-5" />
          Agregar Método
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8 flex items-start gap-4">
        <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Tus datos están seguros</h3>
          <p className="text-blue-800 text-sm">
            Utilizamos encriptación de nivel bancario para proteger tu información de pago.
            Nunca almacenamos datos completos de tarjetas.
          </p>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <CreditCard className="w-8 h-8" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{method.type}</h3>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-1">
                    •••• •••• •••• {method.last4}
                  </p>
                  <p className="text-gray-400 text-xs">Vence: {method.expiry}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Suscripciones</p>
                  <p className="text-2xl font-bold text-gray-900">{method.subscriptions}</p>
                </div>

                <div className="flex gap-2">
                  {!method.isDefault && (
                    <button className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium">
                      Hacer predeterminada
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Editar
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

      {/* Add New Card Prompt */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-8 border border-emerald-100 text-center">
        <CreditCard className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas agregar otra tarjeta?</h3>
        <p className="text-gray-600 text-sm mb-4">
          Puedes agregar múltiples métodos de pago para diferentes suscripciones
        </p>
        <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors font-medium">
          Agregar nuevo método de pago
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-emerald-600 mb-1">{paymentMethods.length}</p>
          <p className="text-sm text-gray-500">Métodos guardados</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-blue-600 mb-1">
            {paymentMethods.reduce((sum, m) => sum + m.subscriptions, 0)}
          </p>
          <p className="text-sm text-gray-500">Suscripciones totales</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-purple-600 mb-1">$172.93</p>
          <p className="text-sm text-gray-500">Cargo mensual</p>
        </div>
      </div>
    </div>
  );
}
