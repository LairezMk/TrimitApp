import {
  Bell,
  Calendar,
  Target,
  BarChart3,
  Lightbulb,
  Eye
} from "lucide-react";

export const pages = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Suscripciones", path: "/subscriptions" },
  { name: "Agregar Suscripción", path: "/subscriptions/add" },
  { name: "Calendario", path: "/calendar" },
  { name: "Analíticas", path: "/analytics" },
  { name: "Presupuesto", path: "/budget" },
  { name: "Categorías", path: "/categories" },
  { name: "Métodos de Pago", path: "/payment-methods" },
  { name: "Pagos", path: "/payments" },
  { name: "Reportes", path: "/reports" },
  { name: "Tendencias", path: "/trends" },
  { name: "Recomendaciones", path: "/recommendations" },
  { name: "Recordatorios", path: "/reminders" },
  { name: "Notificaciones", path: "/notifications" },
  { name: "Calculadora", path: "/calculator" },
  { name: "Archivados", path: "/archived" },
  { name: "Compartir", path: "/sharing" },
  { name: "Perfil", path: "/profile" },
  { name: "Configuración", path: "/settings" },
  { name: "Ayuda", path: "/help" },
];

export const features = [
  {
    icon: Eye,
    title: "Visibilidad Total",
    description: "Ve todas tus suscripciones en un solo lugar. Netflix, Spotify, gimnasios... todo junto, sin sorpresas."
  },
  {
    icon: Bell,
    title: "Alertas Antes de Cada Cobro",
    description: "Te avisamos 3 días antes de cada renovación. Así puedes cancelar a tiempo y no perder más dinero."
  },
  {
    icon: BarChart3,
    title: "Reportes Visuales",
    description: "Gráficos simples que te muestran dónde se va tu plata cada mes y qué puedes recortar."
  },
  {
    icon: Calendar,
    title: "Calendario de Cobros",
    description: "Mira en un calendario cuándo y cuánto te van a cobrar. Planea tu mes sin sustos."
  },
  {
    icon: Target,
    title: "Metas de Ahorro",
    description: "Define cuánto quieres gastar al mes en suscripciones y recibe alertas si te pasas del límite."
  },
  {
    icon: Lightbulb,
    title: "Recomendaciones Inteligentes",
    description: "Te sugerimos qué suscripciones cancelar según lo que realmente usas. Ahorro automático."
  }
];

export const stats = [
  { number: "$280.000", label: "Ahorro promedio anual" },
  { number: "4-5", label: "Suscripciones promedio por persona" }
];

export const steps = [
  {
    number: "01",
    title: "Agrega tus suscripciones",
    description: "Manual o automático. Solo toma 2 minutos."
  },
  {
    number: "02",
    title: "Trimit las organiza",
    description: "Detectamos cobros duplicados y servicios que no usas."
  },
  {
    number: "03",
    title: "Empieza a ahorrar",
    description: "Cancela lo que no necesitas y recupera tu dinero."
  }
];
