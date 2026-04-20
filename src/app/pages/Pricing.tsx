import { CheckCircle2 } from "lucide-react";
import MarketingPageLayout from "../components/public/MarketingPageLayout";
import { Button } from "../components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Para comenzar a organizar tus suscripciones personales.",
    items: ["Hasta 12 suscripciones", "Alertas basicas", "Vista de calendario"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$4.99 USD / mes",
    description: "Ideal para usuarios que quieren optimizar su gasto mensual.",
    items: [
      "Suscripciones ilimitadas",
      "Analitica avanzada",
      "Alertas inteligentes y recomendaciones",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$12.99 USD / mes",
    description: "Para equipos o familias que gestionan gastos compartidos.",
    items: [
      "Todo lo de Pro",
      "Roles y permisos",
      "Tablero compartido",
      "Reportes colaborativos",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <MarketingPageLayout
      title="Precios claros y sin sorpresas"
      subtitle="Empieza gratis y escala solo si realmente lo necesitas. Sin contratos forzados."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <article
            key={plan.name}
            className={`rounded-2xl border p-7 transition-all motion-stagger-item ${
              plan.highlighted
                ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white border-transparent shadow-xl shadow-emerald-500/30 scale-[1.02]"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1"
            }`}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <h3 className="text-2xl font-semibold">{plan.name}</h3>
            <p className={`mt-2 text-3xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {plan.price}
            </p>
            <p className={`mt-3 text-sm ${plan.highlighted ? "text-emerald-50" : "text-gray-600 dark:text-gray-300"}`}>
              {plan.description}
            </p>
            <ul className="mt-6 space-y-3">
              {plan.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 ${plan.highlighted ? "text-white" : "text-emerald-500"}`} />
                  <span className={plan.highlighted ? "text-white" : "text-gray-700 dark:text-gray-200"}>{item}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`mt-7 w-full ${
                plan.highlighted
                  ? "bg-white text-emerald-600 hover:bg-emerald-50"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              Comenzar con {plan.name}
            </Button>
          </article>
        ))}
      </div>
    </MarketingPageLayout>
  );
}
