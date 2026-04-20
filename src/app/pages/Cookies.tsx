import MarketingPageLayout from "../components/public/MarketingPageLayout";

const cookieTypes = [
  {
    title: "Cookies esenciales",
    text: "Necesarias para autenticacion, seguridad y funcionamiento basico de la aplicacion.",
  },
  {
    title: "Cookies de rendimiento",
    text: "Nos ayudan a entender uso de funcionalidades para mejorar tiempos y estabilidad.",
  },
  {
    title: "Cookies de preferencias",
    text: "Guardan configuraciones como modo oscuro y opciones de interfaz.",
  },
];

export default function CookiesPage() {
  return (
    <MarketingPageLayout
      title="Politica de Cookies"
      subtitle="Usamos cookies para mejorar tu experiencia y asegurar el funcionamiento del servicio."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {cookieTypes.map((item, index) => (
          <article
            key={item.title}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-lg transition-all motion-stagger-item"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <h2 className="text-lg font-semibold dark:text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/70 dark:bg-cyan-900/20 p-5">
        <p className="text-sm text-gray-700 dark:text-gray-200">
          Puedes gestionar cookies desde tu navegador. Algunas cookies esenciales no pueden
          desactivarse porque afectan el funcionamiento de la plataforma.
        </p>
      </div>
    </MarketingPageLayout>
  );
}
