import { Users, Plus, DollarSign, CheckCircle, Mail, Copy, UserPlus } from "lucide-react";

const sharedSubscriptions = [
  {
    id: 1,
    name: "Netflix",
    totalCost: 19.61,
    sharedWith: 3,
    yourShare: 4.90,
    members: ["Ana García", "Carlos López", "María Fernández"],
    icon: "N",
    color: "bg-red-500",
  },
  {
    id: 2,
    name: "Spotify Family",
    totalCost: 15.99,
    sharedWith: 5,
    yourShare: 2.67,
    members: ["Pedro Sánchez", "Laura Martín", "José Rodríguez", "Isabel Torres"],
    icon: "S",
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Disney+",
    totalCost: 21.96,
    sharedWith: 2,
    yourShare: 7.32,
    members: ["Roberto Díaz", "Carmen Ruiz"],
    icon: "D",
    color: "bg-blue-600",
  },
];

export default function Sharing() {
  const totalSavings = sharedSubscriptions.reduce(
    (sum, sub) => sum + (sub.totalCost - sub.yourShare),
    0
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl mb-2 dark:text-white">Suscripciones Compartidas</h1>
          <p className="text-gray-500">Gestiona tus suscripciones compartidas con otros</p>
        </div>
          <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors">
          <Plus className="w-5 h-5" />
          Agregar Compartida
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-emerald-100 text-sm">Ahorro Total</p>
          <p className="text-3xl font-bold">${totalSavings.toFixed(2)}</p>
          <p className="text-emerald-100 text-xs mt-1">por mes</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Suscripciones</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{sharedSubscriptions.length}</p>
          <p className="text-gray-400 text-xs mt-1">compartidas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Miembros</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {sharedSubscriptions.reduce((sum, sub) => sum + sub.sharedWith, 0)}
          </p>
          <p className="text-gray-400 text-xs mt-1">personas en total</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm mb-1">Tu Parte</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${sharedSubscriptions.reduce((sum, sub) => sum + sub.yourShare, 0).toFixed(2)}
          </p>
          <p className="text-gray-400 text-xs mt-1">pago mensual</p>
        </div>
      </div>

      {/* Shared Subscriptions List */}
      <div className="space-y-6 mb-8">
        {sharedSubscriptions.map((subscription) => (
          <div
            key={subscription.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 ${subscription.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                  >
                    {subscription.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1 dark:text-white">{subscription.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Compartido con {subscription.sharedWith} personas
                    </p>
                  </div>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tu parte</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${subscription.yourShare.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    de ${subscription.totalCost} total
                  </p>
                </div>
              </div>

              {/* Members */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Miembros ({subscription.members.length})
                  </h4>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                    <UserPlus className="w-4 h-4" />
                    Invitar
                  </button>
                </div>

                <div className="space-y-2">
                  {subscription.members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                          {member.split(" ")[0][0]}
                          {member.split(" ")[1][0]}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {member}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Pagado</span>
                      </div>
                    </div>
                  ))}

                  {/* You */}
                  <div className="flex items-center justify-between py-2 px-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        TÚ
                      </div>
                      <span className="text-sm font-medium text-emerald-700">
                        Tú (Administrador)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-600 font-medium">
                        ${subscription.yourShare.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Enviar recordatorio
                </button>
                <button className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" />
                  Compartir enlace
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8 border border-emerald-100 dark:border-slate-600 text-center">
        <Users className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-xl">
          Ahorra más compartiendo
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Divide los costos de tus suscripciones con amigos y familia.
          ¡Actualmente estás ahorrando ${totalSavings.toFixed(2)} al mes!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors font-medium w-full sm:w-auto">
            Agregar nueva compartida
          </button>
          <button className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium w-full sm:w-auto">
            Ver todas las invitaciones
          </button>
        </div>
      </div>
    </div>
  );
}
