import { User, Mail, Phone, MapPin, Calendar, Edit2, Camera, Shield } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Profile() {
  const user = {
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+52 555 123 4567",
    location: "Ciudad de México, México",
    memberSince: new Date("2023-06-15"),
    avatar: "MG",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Mi Perfil</h1>
        <p className="text-gray-500">Gestiona tu información personal</p>
      </div>

      <div className="max-w-4xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 text-white mb-6 shadow-lg">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                {user.avatar}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                <Camera className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-emerald-100 mb-4">{user.email}</p>
              <div className="flex items-center gap-2 text-emerald-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  Miembro desde {format(user.memberSince, "MMMM yyyy", { locale: es })}
                </span>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors">
              <Edit2 className="w-4 h-4" />
              Editar perfil
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Información Personal</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <button className="text-emerald-600 hover:text-emerald-700 text-sm">
                Editar
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <button className="text-emerald-600 hover:text-emerald-700 text-sm">
                Editar
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              <button className="text-emerald-600 hover:text-emerald-700 text-sm">
                Editar
              </button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-medium">{user.location}</p>
                </div>
              </div>
              <button className="text-emerald-600 hover:text-emerald-700 text-sm">
                Editar
              </button>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <p className="text-3xl font-bold text-emerald-600 mb-1">8</p>
            <p className="text-sm text-gray-500">Suscripciones activas</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <p className="text-3xl font-bold text-blue-600 mb-1">$172.93</p>
            <p className="text-sm text-gray-500">Gasto mensual</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <p className="text-3xl font-bold text-purple-600 mb-1">33</p>
            <p className="text-sm text-gray-500">Meses como miembro</p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-semibold">Seguridad</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <p className="font-medium">Contraseña</p>
                <p className="text-sm text-gray-500">Última actualización hace 3 meses</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                Cambiar contraseña
              </button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <p className="font-medium">Autenticación de dos factores</p>
                <p className="text-sm text-gray-500">Protege tu cuenta con 2FA</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="peer sr-only" />
                <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-emerald-500"></span>
                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-6"></span>
              </label>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">Sesiones activas</p>
                <p className="text-sm text-gray-500">Gestiona tus dispositivos conectados</p>
              </div>
              <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                Ver detalles →
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="font-semibold text-red-900 mb-2">Zona de peligro</h3>
          <p className="text-sm text-red-700 mb-4">
            Estas acciones son irreversibles. Por favor, procede con precaución.
          </p>
          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium">
            Eliminar cuenta permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}
