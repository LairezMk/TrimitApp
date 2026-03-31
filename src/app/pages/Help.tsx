import { Search, Book, MessageCircle, Mail, Phone, HelpCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "¿Cómo agrego una nueva suscripción?",
        a: "Puedes agregar una suscripción desde el dashboard principal haciendo clic en el botón 'Agregar Suscripción'. Completa los detalles como nombre, monto y fecha de pago.",
      },
      {
        q: "¿Puedo importar mis suscripciones automáticamente?",
        a: "Actualmente estamos trabajando en la integración automática con bancos y servicios. Por ahora, debes agregar tus suscripciones manualmente.",
      },
    ],
  },
  {
    category: "Pagos",
    questions: [
      {
        q: "¿Cómo funcionan los recordatorios de pago?",
        a: "Los recordatorios se envían 3 días antes de cada fecha de pago por email y notificaciones push. Puedes configurar el tiempo de anticipación en Configuración.",
      },
      {
        q: "¿Puedo exportar mi historial de pagos?",
        a: "Sí, desde la sección de Configuración > Datos y Almacenamiento puedes exportar toda tu información en formato CSV.",
      },
    ],
  },
  {
    category: "Presupuesto",
    questions: [
      {
        q: "¿Cómo establezco un presupuesto mensual?",
        a: "Ve a la sección de Presupuesto y haz clic en 'Ajustar Presupuesto'. Puedes establecer límites generales y por categoría.",
      },
      {
        q: "¿Qué pasa si excedo mi presupuesto?",
        a: "Recibirás una notificación cuando alcances el 80% de tu presupuesto y otra cuando lo excedas. No se bloquean pagos, solo te alertamos.",
      },
    ],
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Centro de Ayuda</h1>
        <p className="text-gray-500">Encuentra respuestas y obtén soporte</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Busca tu pregunta aquí..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <Book className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg mb-2">Guías y Tutoriales</h3>
          <p className="text-emerald-100 text-sm mb-3">
            Aprende a usar todas las funciones de Trimit
          </p>
          <span className="text-sm font-medium flex items-center gap-1">
            Ver guías <ChevronRight className="w-4 h-4" />
          </span>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <MessageCircle className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg mb-2">Chat en Vivo</h3>
          <p className="text-blue-100 text-sm mb-3">
            Habla con nuestro equipo de soporte
          </p>
          <span className="text-sm font-medium flex items-center gap-1">
            Iniciar chat <ChevronRight className="w-4 h-4" />
          </span>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <Mail className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg mb-2">Enviar Ticket</h3>
          <p className="text-purple-100 text-sm mb-3">
            Reporta un problema o envía sugerencias
          </p>
          <span className="text-sm font-medium flex items-center gap-1">
            Crear ticket <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Preguntas Frecuentes</h2>
        </div>

        <div className="p-6">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6 last:mb-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                {category.category}
              </h3>

              <div className="space-y-3">
                {category.questions.map((faq, qIndex) => {
                  const questionId = categoryIndex * 100 + qIndex;
                  const isExpanded = expandedQuestion === questionId;

                  return (
                    <div
                      key={qIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedQuestion(isExpanded ? null : questionId)
                        }
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">{faq.q}</span>
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-600 text-sm">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-8 border border-emerald-100">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">
          ¿No encontraste lo que buscabas?
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Nuestro equipo está listo para ayudarte
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors font-medium flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Email
          </button>
          <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Llamar Soporte
          </button>
        </div>
      </div>
    </div>
  );
}
