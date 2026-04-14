export interface HelpStep {
  title: string;
  description: string;
  selector?: string;
}

export interface HelpGuide {
  route: string;
  title: string;
  summary: string;
  steps: HelpStep[];
}

export interface HelpFaqCategory {
  category: string;
  questions: Array<{ q: string; a: string }>;
}

export const HELP_GUIDES: HelpGuide[] = [
  {
    route: "/dashboard",
    title: "Dashboard",
    summary: "Resumen rápido de tus suscripciones, métricas y accesos directos.",
    steps: [
      {
        title: "Encabezado principal",
        description: "Desde aquí puedes crear una nueva suscripción en un clic.",
        selector: "[data-tour='dashboard-header']",
      },
      {
        title: "Tarjetas de estadísticas",
        description: "Visualiza gasto mensual, suscripciones activas y olvidadas.",
        selector: "[data-tour='dashboard-stats']",
      },
      {
        title: "Suscripciones recientes",
        description: "Muestra las próximas suscripciones con pago cercano.",
        selector: "[data-tour='dashboard-recent']",
      },
      {
        title: "Acciones rápidas",
        description: "Atajos hacia Calendario y Analíticas para seguir profundizando.",
        selector: "[data-tour='dashboard-actions']",
      },
    ],
  },
  {
    route: "/subscriptions",
    title: "Suscripciones",
    summary: "Administra, filtra y edita todas tus suscripciones desde un solo lugar.",
    steps: [
      {
        title: "Indicadores clave",
        description: "Consulta tu gasto total y el estado de tus suscripciones.",
        selector: "[data-tour='subscriptions-stats']",
      },
      {
        title: "Buscador y filtros",
        description: "Filtra por estado y encuentra suscripciones por nombre.",
        selector: "[data-tour='subscriptions-filters']",
      },
      {
        title: "Grid de suscripciones",
        description: "Haz clic en cualquier tarjeta para editar o revisar detalles.",
        selector: "[data-tour='subscriptions-grid']",
      },
    ],
  },
  {
    route: "/calendar",
    title: "Calendario",
    summary: "Visualiza pagos por fecha con detalle diario y resumen mensual.",
    steps: [
      {
        title: "Vista del mes",
        description: "Navega entre meses y detecta rápidamente días con pagos.",
        selector: "[data-tour='calendar-main']",
      },
      {
        title: "Detalle de fecha",
        description: "Selecciona un día para ver qué suscripciones cobran ese día.",
        selector: "[data-tour='calendar-day-detail']",
      },
      {
        title: "Resumen del mes",
        description: "Consolida el total de cobros programados del mes.",
        selector: "[data-tour='calendar-summary']",
      },
    ],
  },
  {
    route: "/payments",
    title: "Pagos",
    summary: "Registra pagos y revisa la cronología de pagos realizados y próximos.",
    steps: [
      {
        title: "Registrar pago",
        description: "Agrega manualmente pagos asociados a una suscripción.",
        selector: "[data-tour='payments-register']",
      },
      {
        title: "Resumen financiero",
        description: "Compara total pagado, próximos pagos y próximo vencimiento.",
        selector: "[data-tour='payments-stats']",
      },
      {
        title: "Filtros de estado",
        description: "Alterna entre todos, pagados y programados.",
        selector: "[data-tour='payments-filters']",
      },
      {
        title: "Cronología",
        description: "Revisa cada movimiento en orden con fecha, monto y estado.",
        selector: "[data-tour='payments-timeline']",
      },
    ],
  },
  {
    route: "/budget",
    title: "Presupuesto",
    summary: "Configura límites globales y por categoría con alertas visuales.",
    steps: [
      {
        title: "Presupuesto total",
        description: "Define el monto mensual objetivo y guarda tus cambios.",
        selector: "[data-tour='budget-overview']",
      },
      {
        title: "Categorías",
        description: "Crea categorías y ajusta sus límites de gasto.",
        selector: "[data-tour='budget-categories']",
      },
      {
        title: "Consejos automáticos",
        description: "Lee recomendaciones según tu comportamiento actual.",
        selector: "[data-tour='budget-insights']",
      },
    ],
  },
  {
    route: "/analytics",
    title: "Estadísticas",
    summary: "Métricas avanzadas para entender tendencias de gasto.",
    steps: [
      { title: "Métricas generales", description: "Resumen de consumo por periodo." },
      { title: "Distribución por categoría", description: "Identifica dónde gastas más." },
    ],
  },
  {
    route: "/trends",
    title: "Tendencias",
    summary: "Detecta patrones y cambios de gasto en el tiempo.",
    steps: [
      { title: "Tendencia mensual", description: "Evolución de gasto mes a mes." },
      { title: "Alertas de crecimiento", description: "Identifica incrementos relevantes." },
    ],
  },
  {
    route: "/reports",
    title: "Reportes",
    summary: "Genera y exporta reportes consolidados.",
    steps: [
      { title: "Reportes disponibles", description: "Selecciona el tipo de reporte." },
      { title: "Exportación", description: "Descarga la información para análisis externo." },
    ],
  },
  {
    route: "/categories",
    title: "Categorías",
    summary: "Organiza tus suscripciones en grupos personalizados.",
    steps: [
      { title: "Crear categoría", description: "Agrega categorías para ordenar tus gastos." },
      { title: "Asignación", description: "Asocia suscripciones a categorías relevantes." },
    ],
  },
  {
    route: "/reminders",
    title: "Recordatorios",
    summary: "Configura alertas para evitar cobros inesperados.",
    steps: [
      { title: "Listado", description: "Consulta recordatorios activos y su estado." },
      { title: "Preferencias", description: "Ajusta cuándo y cómo recibir avisos." },
    ],
  },
  {
    route: "/recommendations",
    title: "Recomendaciones",
    summary: "Sugerencias para optimizar gastos según tus suscripciones.",
    steps: [
      { title: "Sugerencias activas", description: "Recomendaciones de ahorro y optimización." },
      { title: "Comparación", description: "Analiza alternativas para pagar menos." },
    ],
  },
  {
    route: "/profile",
    title: "Perfil",
    summary: "Administra tus datos personales y seguridad.",
    steps: [
      { title: "Información de cuenta", description: "Actualiza nombre, foto y datos personales." },
      { title: "Seguridad", description: "Cambia tu contraseña desde el perfil." },
    ],
  },
  {
    route: "/settings",
    title: "Configuración",
    summary: "Personaliza comportamiento y preferencias de la aplicación.",
    steps: [
      { title: "Preferencias", description: "Ajusta parámetros generales de la app." },
      { title: "Integraciones", description: "Configura opciones de sincronización y alertas." },
    ],
  },
  {
    route: "/notifications",
    title: "Notificaciones",
    summary: "Controla avisos y actividad importante de tu cuenta.",
    steps: [
      { title: "Centro de notificaciones", description: "Revisa los eventos recientes." },
      { title: "Gestión", description: "Marca, limpia o prioriza notificaciones." },
    ],
  },
];

export const HELP_FAQS: HelpFaqCategory[] = [
  {
    category: "General",
    questions: [
      {
        q: "¿Cómo agrego una nueva suscripción?",
        a: "En Dashboard o Suscripciones, usa el botón “Nueva Suscripción” y completa nombre, monto, categoría y fecha de pago.",
      },
      {
        q: "¿Puedo importar suscripciones automáticamente?",
        a: "Sí, usando el flujo de Gmail para detectar pagos recurrentes y luego confirmarlos antes de guardarlos.",
      },
    ],
  },
  {
    category: "Pagos",
    questions: [
      {
        q: "¿Cómo funcionan los recordatorios de pago?",
        a: "Se generan según la configuración de recordatorios y te alertan antes del vencimiento.",
      },
      {
        q: "¿Puedo exportar mi historial de pagos?",
        a: "Sí, desde Reportes puedes descargar datos consolidados y usarlos en otras herramientas.",
      },
    ],
  },
  {
    category: "Presupuesto",
    questions: [
      {
        q: "¿Cómo establezco un presupuesto mensual?",
        a: "En Presupuesto define el monto global mensual, añade categorías y guarda los cambios.",
      },
      {
        q: "¿Qué pasa si excedo el presupuesto?",
        a: "La app muestra alertas visuales por categoría y en el resumen para que ajustes tus gastos.",
      },
    ],
  },
];

export function getGuideForPath(pathname: string): HelpGuide | null {
  const exact = HELP_GUIDES.find((guide) => pathname === guide.route);
  if (exact) {
    return exact;
  }

  const partial = HELP_GUIDES.find(
    (guide) => pathname.startsWith(`${guide.route}/`) && guide.route !== "/",
  );
  return partial || null;
}
