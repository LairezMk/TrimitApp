import { BarChart3, BellRing, Calendar, Mail, ShieldCheck, Wallet } from "lucide-react";
import MarketingPageLayout from "../components/public/MarketingPageLayout";

const features = [
  {
    title: "Deteccion automatica",
    description:
      "Conecta tu correo y detectamos cobros recurrentes para crear tus suscripciones en segundos.",
    icon: Mail,
  },
  {
    title: "Alertas inteligentes",
    description:
      "Recibe recordatorios antes de cada renovacion y evita cargos sorpresa en tu tarjeta.",
    icon: BellRing,
  },
  {
    title: "Calendario financiero",
    description:
      "Visualiza proximos pagos por semana y mes para anticiparte y planificar mejor.",
    icon: Calendar,
  },
  {
    title: "Analitica clara",
    description:
      "Identifica tendencias de gasto por categoria, servicio y metodo de pago en tiempo real.",
    icon: BarChart3,
  },
  {
    title: "Control de presupuesto",
    description:
      "Define limites, sigue progreso y recibe avisos cuando te acerques a tu tope mensual.",
    icon: Wallet,
  },
  {
    title: "Seguridad de nivel alto",
    description:
      "Cifrado de datos y buenas practicas de autenticacion para proteger tu informacion.",
    icon: ShieldCheck,
  },
];

export default function FeaturesPage() {
  return (
    <MarketingPageLayout
      title="Caracteristicas de Trimit"
      subtitle="Todo lo necesario para controlar suscripciones, prevenir cobros innecesarios y mantener tus finanzas en orden."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all motion-stagger-item"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
            </article>
          );
        })}
      </div>
    </MarketingPageLayout>
  );
}
