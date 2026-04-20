import { Mail, MessageSquareText, Phone, Send, Timer } from "lucide-react";
import MarketingPageLayout from "../components/public/MarketingPageLayout";
import { Button } from "../components/ui/button";

const channels = [
  {
    title: "Correo",
    detail: "soporte@trimit.app",
    description: "Ideal para consultas generales y soporte tecnico.",
    icon: Mail,
  },
  {
    title: "WhatsApp",
    detail: "+57 300 000 0000",
    description: "Atencion rapida para dudas de uso y activacion.",
    icon: Phone,
  },
  {
    title: "Tiempo de respuesta",
    detail: "Menos de 24h habiles",
    description: "Respondemos con contexto y seguimiento.",
    icon: Timer,
  },
];

export default function ContactPage() {
  return (
    <MarketingPageLayout
      title="Contacto"
      subtitle="Estamos disponibles para ayudarte con dudas, soporte o alianzas."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <article className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-7 shadow-sm motion-stagger-item">
          <h2 className="text-2xl font-semibold dark:text-white">Envianos un mensaje</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Cuentanos que necesitas y te contactamos lo mas pronto posible.
          </p>
          <form className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-700 dark:text-gray-200">
                Nombre
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                  placeholder="Tu nombre"
                />
              </label>
              <label className="text-sm text-gray-700 dark:text-gray-200">
                Correo
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                  placeholder="tu@email.com"
                />
              </label>
            </div>
            <label className="text-sm text-gray-700 dark:text-gray-200 block">
              Mensaje
              <textarea
                rows={5}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                placeholder="Escribe tu consulta"
              />
            </label>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              Enviar mensaje
            </Button>
          </form>
        </article>

        <aside className="space-y-4">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <article
                key={channel.title}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-5 shadow-sm hover:shadow-lg transition-all motion-stagger-item"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold dark:text-white">{channel.title}</h3>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1">{channel.detail}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{channel.description}</p>
              </article>
            );
          })}

          <article className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/70 dark:bg-cyan-900/20 p-5 motion-stagger-item [animation-delay:280ms]">
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-semibold">
              <MessageSquareText className="w-4 h-4" />
              ¿Eres una empresa?
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
              Escríbenos para planes de equipo, integraciones y soporte dedicado.
            </p>
          </article>
        </aside>
      </div>
    </MarketingPageLayout>
  );
}
