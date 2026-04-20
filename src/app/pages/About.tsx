import MarketingPageLayout from "../components/public/MarketingPageLayout";

const values = [
  {
    title: "Transparencia",
    description:
      "Mostramos informacion clara sobre pagos, renovaciones y gastos acumulados sin ocultar detalles.",
  },
  {
    title: "Simplicidad",
    description:
      "Disenamos experiencias directas para que cualquier persona pueda controlar sus finanzas sin friccion.",
  },
  {
    title: "Impacto real",
    description:
      "Nos enfocamos en reducir cobros innecesarios y mejorar decisiones financieras en el dia a dia.",
  },
];

export default function AboutPage() {
  return (
    <MarketingPageLayout
      title="Acerca de Trimit"
      subtitle="Nacimos para resolver un problema comun: pagar suscripciones que ya no usas sin darte cuenta."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-7 shadow-sm motion-stagger-item">
          <h2 className="text-2xl font-semibold dark:text-white">Nuestra historia</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            Trimit surge de una necesidad real: tener visibilidad sobre los pagos automaticos
            que se acumulan cada mes. Lo que comenzo como una herramienta interna hoy es una
            plataforma enfocada en usuarios de Latinoamerica que buscan control, ahorro y claridad.
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            Nuestro equipo combina experiencia en producto, desarrollo y estrategia para construir
            una experiencia util y moderna, con foco en seguridad y simplicidad.
          </p>
        </article>

        <aside className="rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 p-7 motion-stagger-item [animation-delay:120ms]">
          <h3 className="text-xl font-semibold dark:text-white">Mision</h3>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">
            Ayudar a personas y equipos a recuperar control sobre sus gastos recurrentes.
          </p>
          <h3 className="text-xl font-semibold dark:text-white mt-6">Vision</h3>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">
            Convertirnos en la plataforma de referencia para gestionar suscripciones en la region.
          </p>
        </aside>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {values.map((value, index) => (
          <article
            key={value.title}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all motion-stagger-item"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <h3 className="text-lg font-semibold dark:text-white">{value.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{value.description}</p>
          </article>
        ))}
      </section>
    </MarketingPageLayout>
  );
}
