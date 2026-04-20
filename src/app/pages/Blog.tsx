import { ArrowRight } from "lucide-react";
import MarketingPageLayout from "../components/public/MarketingPageLayout";

const posts = [
  {
    title: "Como detectar gastos fantasma en tus suscripciones",
    category: "Finanzas personales",
    date: "14 abril 2026",
    excerpt:
      "Senales practicas para identificar cobros que pasan desapercibidos y como eliminarlos a tiempo.",
    readTime: "5 min",
  },
  {
    title: "Checklist mensual para mantener tus pagos bajo control",
    category: "Productividad",
    date: "02 abril 2026",
    excerpt:
      "Una rutina simple de 15 minutos para revisar renovaciones, ajustar presupuesto y ahorrar.",
    readTime: "4 min",
  },
  {
    title: "Suscripciones compartidas: buenas practicas para equipos y familias",
    category: "Colaboracion",
    date: "27 marzo 2026",
    excerpt:
      "Como repartir gastos recurrentes sin perder visibilidad ni claridad en los montos.",
    readTime: "6 min",
  },
];

export default function BlogPage() {
  return (
    <MarketingPageLayout
      title="Blog de Trimit"
      subtitle="Ideas, guias y tendencias para tomar mejores decisiones con tus gastos recurrentes."
    >
      <div className="grid gap-5">
        {posts.map((post, index) => (
          <article
            key={post.title}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all motion-stagger-item"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
                {post.category}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{post.date}</span>
              <span className="text-gray-500 dark:text-gray-400">{post.readTime}</span>
            </div>
            <h2 className="text-xl font-semibold dark:text-white">{post.title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{post.excerpt}</p>
            <button className="mt-4 inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:gap-3 transition-all text-sm font-medium">
              Leer articulo
              <ArrowRight className="w-4 h-4" />
            </button>
          </article>
        ))}
      </div>
    </MarketingPageLayout>
  );
}
