import MarketingPageLayout from "../components/public/MarketingPageLayout";

const terms = [
  {
    title: "1. Aceptacion de terminos",
    text: "Al usar Trimit aceptas estas condiciones y te comprometes a utilizar la plataforma de forma responsable y legal.",
  },
  {
    title: "2. Cuenta y seguridad",
    text: "Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada en tu cuenta.",
  },
  {
    title: "3. Uso permitido",
    text: "No esta permitido utilizar el servicio para actividades fraudulentas, abusivas o que afecten la estabilidad de la plataforma.",
  },
  {
    title: "4. Disponibilidad del servicio",
    text: "Trabajamos para garantizar alta disponibilidad, pero podran existir mantenimientos planificados o incidentes no previstos.",
  },
  {
    title: "5. Actualizaciones",
    text: "Podemos actualizar estos terminos cuando sea necesario. Los cambios relevantes se comunicaran dentro del producto.",
  },
];

export default function TermsPage() {
  return (
    <MarketingPageLayout
      title="Terminos y condiciones"
      subtitle="Condiciones de uso aplicables a la plataforma Trimit."
    >
      <div className="space-y-4">
        {terms.map((section, index) => (
          <article
            key={section.title}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm motion-stagger-item"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <h2 className="text-lg font-semibold dark:text-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{section.text}</p>
          </article>
        ))}
      </div>
    </MarketingPageLayout>
  );
}
