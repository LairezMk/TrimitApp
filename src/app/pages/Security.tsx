import { CheckCircle2, LockKeyhole, ServerCog, Shield, UserCheck } from "lucide-react";
import MarketingPageLayout from "../components/public/MarketingPageLayout";

const controls = [
  {
    title: "Autenticacion segura",
    description: "Usamos proveedores de autenticacion confiables y manejo seguro de sesiones.",
    icon: UserCheck,
  },
  {
    title: "Cifrado de datos",
    description: "La informacion sensible se protege en transito y en almacenamiento.",
    icon: LockKeyhole,
  },
  {
    title: "Infraestructura monitoreada",
    description: "Contamos con monitoreo continuo para detectar incidentes rapidamente.",
    icon: ServerCog,
  },
  {
    title: "Control de acceso",
    description: "Aplicamos principios de minimo privilegio para proteger la plataforma.",
    icon: Shield,
  },
];

export default function SecurityPage() {
  return (
    <MarketingPageLayout
      title="Seguridad en Trimit"
      subtitle="La proteccion de tus datos es una prioridad operativa y de producto."
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {controls.map((control, index) => {
            const Icon = control.icon;
            return (
              <article
                key={control.title}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-lg transition-all motion-stagger-item"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white">{control.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{control.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 p-6 motion-stagger-item [animation-delay:300ms]">
          <h3 className="text-lg font-semibold dark:text-white">Buenas practicas recomendadas</h3>
          <ul className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
              Usa contrasenas largas y unicas.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
              Actualiza tu correo de recuperacion.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500" />
              Revisa alertas para detectar cargos no esperados.
            </li>
          </ul>
        </aside>
      </div>
    </MarketingPageLayout>
  );
}
