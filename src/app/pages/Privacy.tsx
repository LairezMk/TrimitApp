import MarketingPageLayout from "../components/public/MarketingPageLayout";

const sections = [
  {
    title: "1. Informacion que recopilamos",
    text: "Recopilamos datos de cuenta, preferencias de uso y metadatos operativos necesarios para prestar el servicio y mejorar la experiencia.",
  },
  {
    title: "2. Uso de la informacion",
    text: "Usamos los datos para administrar tu cuenta, mostrar recordatorios, mejorar recomendaciones y brindar soporte.",
  },
  {
    title: "3. Conservacion de datos",
    text: "Conservamos informacion mientras tu cuenta este activa o segun lo requieran obligaciones legales aplicables.",
  },
  {
    title: "4. Comparticion limitada",
    text: "No vendemos datos personales. Solo compartimos informacion con proveedores esenciales bajo acuerdos de confidencialidad.",
  },
  {
    title: "5. Derechos del usuario",
    text: "Puedes solicitar acceso, correccion o eliminacion de tus datos enviando una solicitud a soporte@trimit.app.",
  },
];

export default function PrivacyPage() {
  return (
    <MarketingPageLayout
      title="Politica de Privacidad"
      subtitle="Este resumen explica como tratamos tu informacion dentro de Trimit."
    >
      <div className="space-y-4">
        {sections.map((section, index) => (
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
